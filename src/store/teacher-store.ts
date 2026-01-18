import { create } from 'zustand';
import { ClassRoom } from '@/lib/types/class-management';
import { MOCK_CLASSES } from '@/lib/data/mock-class-data';

// 定義任務難度
export type AssignmentLevel = 'A' | 'B' | 'C';

interface Assignment {
  classId: string;
  lessonId: string;
  level: AssignmentLevel;
  deadline?: string;
}

interface TeacherState {
  classes: ClassRoom[];
  selectedClassId: string | null;
  activeAssignments: Assignment[]; // 🔥 新增：目前的派題紀錄
  
  // Actions
  selectClass: (classId: string) => void;
  addClass: (name: string, semester: string) => void;
  assignTask: (assignment: Assignment) => void; // 🔥 新增：派題動作
  getAssignment: (classId: string, lessonId: string) => Assignment | undefined;
}

export const useTeacherStore = create<TeacherState>((set, get) => ({
  classes: MOCK_CLASSES,
  selectedClassId: MOCK_CLASSES[0].id,
  activeAssignments: [], // 初始為空

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

  // 🔥 實作派題
  assignTask: (newAssignment) => set(state => {
    // 移除舊的同課派題，加入新的
    const filtered = state.activeAssignments.filter(
        a => !(a.classId === newAssignment.classId && a.lessonId === newAssignment.lessonId)
    );
    return { activeAssignments: [...filtered, newAssignment] };
  }),

  getAssignment: (classId, lessonId) => {
      return get().activeAssignments.find(a => a.classId === classId && a.lessonId === lessonId);
  }
}));