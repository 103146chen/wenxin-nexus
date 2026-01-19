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
  type: 'logic-map' | 'reflection'; // 作業類型
  submittedAt: string;
  contentMock: string; // 模擬內容
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
  
  // 🔥 新增：取得所有待批改項目
  getPendingSubmissions: () => PendingItem[];
  // 🔥 新增：批改動作
  gradeSubmission: (item: PendingItem, status: 'verified' | 'rejected', feedback: string) => void;
}

export const useTeacherStore = create<TeacherState>((set, get) => ({
  classes: MOCK_CLASSES,
  selectedClassId: MOCK_CLASSES[0].id,
  activeAssignments: [],

  selectClass: (classId) => set({ selectedClassId: classId }),
  
  addClass: (name, semester) => {
    /* ... 保持不變 ... */
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

  // 🔥 實作：遍歷所有班級與學生，找出待改作業
  getPendingSubmissions: () => {
      const { classes } = get();
      const pendingItems: PendingItem[] = [];

      classes.forEach(cls => {
          cls.students.forEach(stu => {
              Object.entries(cls.progressMatrix[stu.id]).forEach(([lessonId, progress]) => {
                  // 檢查邏輯圖
                  if (progress.logicMapStatus === 'pending') {
                      pendingItems.push({
                          classId: cls.id,
                          className: cls.name,
                          studentId: stu.id,
                          studentName: stu.name,
                          studentAvatar: stu.avatar,
                          lessonId,
                          type: 'logic-map',
                          submittedAt: new Date().toISOString(), // 假裝剛剛交
                          contentMock: '邏輯圖JSON模擬資料...'
                      });
                  }
                  // 這裡也可以擴充檢查 reflection 是否 pending (目前 mock data 沒設 reflection status，先略過)
              });
          });
      });
      return pendingItems;
  },

  // 🔥 實作：更新狀態
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
                          // 更新對應的狀態
                          logicMapStatus: item.type === 'logic-map' ? status : cls.progressMatrix[item.studentId][item.lessonId].logicMapStatus,
                          // 在真實後端這裡會把 feedback 存進去
                      }
                  }
              }
          };
      });
      return { classes: newClasses };
  })
}));