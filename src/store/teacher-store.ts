import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // 🔥 引入 persist
import { ClassRoom } from '@/lib/types/class-management';
import { MOCK_CLASSES } from '@/lib/data/mock-class-data';
import { StudentAsset } from '@/lib/types/gamification';
import { Lesson } from '@/lib/data/lessons';

export type AssignmentLevel = 'A' | 'B' | 'C';

export interface PendingItem {
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  lessonId: string;
  type: 'logic-map' | 'reflection' | 'annotation' | 'quiz-short';
  submittedAt: string;
  contentMock: string;
}

interface Assignment {
  classId: string;
  lessonId: string;
  level: AssignmentLevel;
  deadline?: string;
}

interface TeacherState {
  classes: ClassRoom[];
  selectedClassId: string | null;
  activeAssignments: Assignment[];
  
  // 自訂課程
  customLessons: Lesson[];

  selectClass: (classId: string) => void;
  addClass: (name: string, semester: string) => void;
  assignTask: (assignment: Assignment) => void;
  getAssignment: (classId: string, lessonId: string) => Assignment | undefined;
  // 🔥 新增：取得待批改項目
  getPendingSubmissions: () => PendingItem[];
  gradeSubmission: (item: PendingItem, status: 'verified' | 'rejected', feedback: string) => void;
  getClassById: (id: string) => ClassRoom | undefined;
  
  // 課程操作
  addLesson: (lesson: Lesson) => void;
  deleteLesson: (lessonId: string) => void;
}

const ASSETS_STORAGE_KEY = 'wenxin-assets-repository';

// 輔助函式：讀取學生真實提交的資產
const getRealSubmissions = (): StudentAsset[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ASSETS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

// 🔥 加上 persist 包裹器，確保重整後資料還在
export const useTeacherStore = create<TeacherState>()(
  persist(
    (set, get) => ({
      classes: MOCK_CLASSES,
      selectedClassId: MOCK_CLASSES[0].id,
      activeAssignments: [],
      customLessons: [], 

      selectClass: (classId) => set({ selectedClassId: classId }),
      
      addClass: (name, semester) => {
        const newClass: ClassRoom = {
          id: `class-${Date.now()}`,
          name,
          code: `WEN-${Math.floor(Math.random() * 900) + 100}`,
          semester,
          students: [],
          progressMatrix: {}
        };
        set(state => ({ classes: [...state.classes, newClass] }));
      },

      assignTask: (newAssignment) => set(state => {
        const filtered = state.activeAssignments.filter(
            a => !(a.classId === newAssignment.classId && a.lessonId === newAssignment.lessonId)
        );
        return { activeAssignments: [...filtered, newAssignment] };
      }),

      getAssignment: (classId, lessonId) => {
          return get().activeAssignments.find(a => a.classId === classId && a.lessonId === lessonId);
      },

      // 🔥 核心邏輯：掃描所有學生的資產，找出狀態為 'pending' 的項目
      getPendingSubmissions: () => {
          const { classes } = get();
          const pendingItems: PendingItem[] = [];
          const realAssets = getRealSubmissions();

          classes.forEach(cls => {
              cls.students.forEach(stu => {
                  // 1. 從真實資產庫 (localStorage) 查找
                  const realStudentAssets = realAssets.filter(
                      a => a.authorName === stu.name && a.status === 'pending'
                  );

                  realStudentAssets.forEach(asset => {
                      // 嘗試解析 lessonId
                      let extractedLessonId = 'lesson-1'; 
                      if (asset.targetText) {
                          extractedLessonId = asset.targetText;
                      } else if (asset.id.includes('lesson-')) {
                          const match = asset.id.match(/(lesson-\d+)/);
                          if (match) extractedLessonId = match[1];
                      }

                      pendingItems.push({
                          classId: cls.id,
                          className: cls.name,
                          studentId: stu.id,
                          studentName: stu.name,
                          studentAvatar: stu.avatar,
                          lessonId: extractedLessonId,
                          type: asset.type as any,
                          submittedAt: asset.createdAt,
                          contentMock: asset.contentPreview
                      });
                  });

                  // 2. 從 Mock Progress Matrix 查找 (兼容舊資料)
                  if (realStudentAssets.length === 0) {
                      Object.entries(cls.progressMatrix[stu.id] || {}).forEach(([lessonId, progress]) => {
                          if (progress.logicMapStatus === 'pending') {
                              pendingItems.push({
                                  classId: cls.id,
                                  className: cls.name,
                                  studentId: stu.id,
                                  studentName: stu.name,
                                  studentAvatar: stu.avatar,
                                  lessonId,
                                  type: 'logic-map',
                                  submittedAt: new Date().toISOString(),
                                  contentMock: '（此為系統生成的模擬資料）'
                              });
                          }
                      });
                  }
              });
          });
          // 依時間排序，最新的在前面
          return pendingItems.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      },

      gradeSubmission: (item, status, feedback) => {
          set(state => {
              // 更新記憶體中的班級進度 (Mock Data)
              const newClasses = state.classes.map(cls => {
                  if (cls.id !== item.classId) return cls;
                  return {
                      ...cls,
                      progressMatrix: {
                          ...cls.progressMatrix,
                          [item.studentId]: {
                              ...cls.progressMatrix[item.studentId],
                              [item.lessonId]: {
                                  ...(cls.progressMatrix[item.studentId]?.[item.lessonId] || {}),
                                  logicMapStatus: item.type === 'logic-map' ? status : cls.progressMatrix[item.studentId]?.[item.lessonId]?.logicMapStatus,
                              }
                          }
                      }
                  };
              });
              return { classes: newClasses };
          });

          // 🔥 同步更新真實資產庫 (LocalStorage)
          if (typeof window !== 'undefined') {
              try {
                  const raw = localStorage.getItem(ASSETS_STORAGE_KEY);
                  if (raw) {
                      const assets: StudentAsset[] = JSON.parse(raw);
                      // 找到對應的資產並更新狀態
                      const targetIndex = assets.findIndex(
                          a => a.authorName === item.studentName && 
                               (a.type === item.type) &&
                               a.status === 'pending'
                      );

                      if (targetIndex !== -1) {
                          assets[targetIndex].status = status;
                          assets[targetIndex].feedback = feedback;
                          localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
                      }
                  }
              } catch (e) {
                  console.error('更新真實資料失敗', e);
              }
          }
      },

      getClassById: (id) => get().classes.find(c => c.id === id),

      addLesson: (lesson) => set((state) => ({ 
          customLessons: [...state.customLessons, lesson] 
      })),

      deleteLesson: (id) => set((state) => ({
          customLessons: state.customLessons.filter(l => l.id !== id)
      })),
    }),
    { 
        name: 'wenxin-teacher-storage', // Store Key
    }
  )
);