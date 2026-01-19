import { create } from 'zustand';
import { ClassRoom } from '@/lib/types/class-management';
import { MOCK_CLASSES } from '@/lib/data/mock-class-data';

export type AssignmentLevel = 'A' | 'B' | 'C';

// 定義待批改項目的結構
export interface PendingItem {
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  lessonId: string;
  type: 'logic-map' | 'reflection';
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
  
  selectClass: (classId: string) => void;
  addClass: (name: string, semester: string) => void;
  assignTask: (assignment: Assignment) => void;
  getAssignment: (classId: string, lessonId: string) => Assignment | undefined;
  
  getPendingSubmissions: () => PendingItem[];
  gradeSubmission: (item: PendingItem, status: 'verified' | 'rejected', feedback: string) => void;
  
  // 🔥 修復：補回遺漏的函數定義
  getClassById: (id: string) => ClassRoom | undefined;
}

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

  getPendingSubmissions: () => {
      const { classes } = get();
      const pendingItems: PendingItem[] = [];

      classes.forEach(cls => {
          cls.students.forEach(stu => {
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
                          contentMock: '邏輯圖JSON模擬資料...'
                      });
                  }
              });
          });
      });
      return pendingItems;
  },

  gradeSubmission: (item, status, feedback) => set(state => {
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
  }),

  // 🔥 修復：實作該函數
  getClassById: (id) => get().classes.find(c => c.id === id),
}));