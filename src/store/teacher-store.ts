import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClassRoom, LessonProgress, StudentSummary } from '@/lib/types/class-management'; // 確保引用正確
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
  customLessons: Lesson[];

  selectClass: (classId: string) => void;
  addClass: (name: string, semester: string) => void;
  // 🔥 新增：班級成員管理動作
  addStudent: (classId: string, name: string, studentCode: string) => void;
  removeStudent: (classId: string, studentId: string) => void;
  
  assignTask: (assignment: Assignment) => void;
  getAssignment: (classId: string, lessonId: string) => Assignment | undefined;
  getPendingSubmissions: () => PendingItem[];
  gradeSubmission: (item: PendingItem, status: 'verified' | 'rejected', feedback: string) => void;
  getClassById: (id: string) => ClassRoom | undefined;
  addLesson: (lesson: Lesson) => void;
  deleteLesson: (lessonId: string) => void;
}

const ASSETS_STORAGE_KEY = 'wenxin-assets-repository';

const getRealSubmissions = (): StudentAsset[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ASSETS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

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

      // 🔥 實作：新增學生
      addStudent: (classId, name, studentCode) => set(state => {
          const newStudentId = `student-${Date.now()}`;
          const newStudent: StudentSummary = {
              id: newStudentId,
              name: name,
              // 如果有 studentCode 可以當作頭像生成的種子，這裡簡化處理
              avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + newStudentId,
              level: 1,
              xp: 0,
              streak: 0
          };

          return {
              classes: state.classes.map(cls => {
                  if (cls.id !== classId) return cls;
                  
                  // 初始化該學生的進度矩陣 (重要！否則讀取儀表板會報錯)
                  // 這裡我們預設初始化 'lesson-1' 到 'lesson-3'
                  const initialProgress: Record<string, LessonProgress> = {};
                  ['lesson-1', 'lesson-2', 'lesson-3'].forEach(lid => {
                      initialProgress[lid] = {
                          lessonId: lid,
                          status: 'not-started',
                          quizWrongIds: [],
                          hasReflection: false,
                          hasLogicMap: false,
                          annotationCount: 0
                      };
                  });

                  return {
                      ...cls,
                      students: [...cls.students, newStudent],
                      progressMatrix: {
                          ...cls.progressMatrix,
                          [newStudentId]: initialProgress
                      }
                  };
              })
          };
      }),

      // 🔥 實作：移除學生
      removeStudent: (classId, studentId) => set(state => ({
          classes: state.classes.map(cls => {
              if (cls.id !== classId) return cls;
              
              // 移除學生名單
              const newStudents = cls.students.filter(s => s.id !== studentId);
              
              // 移除進度資料 (清理垃圾)
              const newMatrix = { ...cls.progressMatrix };
              delete newMatrix[studentId];

              return {
                  ...cls,
                  students: newStudents,
                  progressMatrix: newMatrix
              };
          })
      })),

      assignTask: (newAssignment) => set(state => {
        const filtered = state.activeAssignments.filter(
            a => !(a.classId === newAssignment.classId && a.lessonId === newAssignment.lessonId)
        );
        return { activeAssignments: [...filtered, newAssignment] };
      }),

      getAssignment: (classId, lessonId) => {
          return get().activeAssignments.find(a => a.classId === classId && a.lessonId === lessonId);
      },

      getPendingSubmissions: () => {
          const { classes } = get();
          const pendingItems: PendingItem[] = [];
          const realAssets = getRealSubmissions();

          classes.forEach(cls => {
              cls.students.forEach(stu => {
                  const realStudentAssets = realAssets.filter(
                      a => a.authorName === stu.name && a.status === 'pending'
                  );

                  realStudentAssets.forEach(asset => {
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

                  if (realStudentAssets.length === 0 && cls.progressMatrix && cls.progressMatrix[stu.id]) {
                      Object.entries(cls.progressMatrix[stu.id]).forEach(([lessonId, progress]) => {
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
          return pendingItems.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      },

      gradeSubmission: (item, status, feedback) => {
          set(state => {
              const newClasses = state.classes.map(cls => {
                  if (cls.id !== item.classId) return cls;
                  // 安全存取 progressMatrix
                  const studentProgress = cls.progressMatrix?.[item.studentId]?.[item.lessonId];
                  if (!studentProgress) return cls;

                  return {
                      ...cls,
                      progressMatrix: {
                          ...cls.progressMatrix,
                          [item.studentId]: {
                              ...cls.progressMatrix[item.studentId],
                              [item.lessonId]: {
                                  ...studentProgress,
                                  logicMapStatus: item.type === 'logic-map' ? status : studentProgress.logicMapStatus,
                              }
                          }
                      }
                  };
              });
              return { classes: newClasses };
          });

          if (typeof window !== 'undefined') {
              try {
                  const raw = localStorage.getItem(ASSETS_STORAGE_KEY);
                  if (raw) {
                      const assets: StudentAsset[] = JSON.parse(raw);
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
      addLesson: (lesson) => set((state) => ({ customLessons: [...state.customLessons, lesson] })),
      deleteLesson: (id) => set((state) => ({ customLessons: state.customLessons.filter(l => l.id !== id) })),
    }),
    { name: 'wenxin-teacher-storage' }
  )
);