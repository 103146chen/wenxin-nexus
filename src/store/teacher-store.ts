import { create } from 'zustand';
import { ClassRoom } from '@/lib/types/class-management';
import { MOCK_CLASSES } from '@/lib/data/mock-class-data';
import { StudentAsset } from '@/lib/types/gamification';

export type AssignmentLevel = 'A' | 'B' | 'C';

// 定義待批改項目的結構
export interface PendingItem {
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  lessonId: string;
  type: 'logic-map' | 'reflection' | 'annotation';
  submittedAt: string;
  contentMock: string; // 這裡是 JSON string
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
  
  selectClass: (classId: string) => void;
  addClass: (name: string, semester: string) => void;
  assignTask: (assignment: Assignment) => void;
  getAssignment: (classId: string, lessonId: string) => Assignment | undefined;
  getPendingSubmissions: () => PendingItem[];
  gradeSubmission: (item: PendingItem, status: 'verified' | 'rejected', feedback: string) => void;
  getClassById: (id: string) => ClassRoom | undefined;
}

// 🔥 修復：Key 必須與 GamificationEngine 一致
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

export const useTeacherStore = create<TeacherState>((set, get) => ({
  classes: MOCK_CLASSES,
  selectedClassId: MOCK_CLASSES[0].id,
  activeAssignments: [],

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

  // 🔥 整合真實提交與 Mock Data
  getPendingSubmissions: () => {
      const { classes } = get();
      const pendingItems: PendingItem[] = [];
      const realAssets = getRealSubmissions();

      classes.forEach(cls => {
          cls.students.forEach(stu => {
              // 1. 優先檢查真實資料庫
              const realStudentAssets = realAssets.filter(
                  a => a.authorName === stu.name && a.status === 'pending'
              );

              if (realStudentAssets.length > 0) {
                  realStudentAssets.forEach(asset => {
                      // 解析 lessonId
                      let extractedLessonId = 'lesson-1'; 
                      // 嘗試解析 id (例如: annotation-lesson-1)
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
              } else {
                  // 2. 如果沒有真實資料，才使用 Mock Data (避免 Demo 時列表空白)
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
      return pendingItems;
  },

  gradeSubmission: (item, status, feedback) => {
      // 1. 更新 TeacherStore 本地狀態
      set(state => {
          const newClasses = state.classes.map(cls => {
              if (cls.id !== item.classId) return cls;
              return {
                  ...cls,
                  progressMatrix: {
                      ...cls.progressMatrix,
                      [item.studentId]: {
                          ...cls.progressMatrix[item.studentId],
                          [item.lessonId]: {
                              ...cls.progressMatrix[item.studentId][item.lessonId],
                              logicMapStatus: item.type === 'logic-map' ? status : cls.progressMatrix[item.studentId][item.lessonId].logicMapStatus,
                          }
                      }
                  }
              };
          });
          return { classes: newClasses };
      });

      // 2. 🔥 更新 真實資料庫 (LocalStorage)
      if (typeof window !== 'undefined') {
          try {
              const raw = localStorage.getItem(ASSETS_STORAGE_KEY);
              if (raw) {
                  const assets: StudentAsset[] = JSON.parse(raw);
                  // 尋找對應的 Asset (最精確的方式是比對 author + type + status)
                  const targetIndex = assets.findIndex(
                      a => a.authorName === item.studentName && 
                           (a.type === item.type) &&
                           a.status === 'pending'
                  );

                  if (targetIndex !== -1) {
                      assets[targetIndex].status = status;
                      assets[targetIndex].feedback = feedback;
                      localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
                      console.log('✅ 已同步更新真實資料庫');
                  }
              }
          } catch (e) {
              console.error('更新真實資料失敗', e);
          }
      }
  },

  getClassById: (id) => get().classes.find(c => c.id === id),
}));