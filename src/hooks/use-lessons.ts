import { create } from 'zustand';
import { ALL_LESSONS, Lesson, getLessonById, getAllQuestions } from '@/lib/data/lessons';
import { useTeacherStore } from '@/store/teacher-store';
import { useUserStore } from '@/store/user-store';

export const useLessons = () => {
  // 🔥 取出 activeAssignments 以判斷指派狀態
  const { customLessons, classes, activeAssignments } = useTeacherStore();
  const { id: userId, role, classId: studentClassId } = useUserStore();

  // 1. 合併所有課程
  const allAvailableLessons = [...customLessons, ...ALL_LESSONS];

  // 2. 學生可見課程 (權限邏輯核心)
  let studentLessons: Lesson[] = [];

  if (role === 'student' && studentClassId) {
      const myClass = classes.find(c => c.id === studentClassId);
      const teacherId = myClass?.ownerId;
      
      if (teacherId) {
          // 規則 A: 該導師建立/複製的自訂課程
          const teacherCustomLessons = customLessons.filter(l => l.ownerId === teacherId);
          
          // 規則 B: 被指派給該班級的「系統內建課程」
          const assignedSystemLessons = ALL_LESSONS.filter(l => 
              activeAssignments.some(a => a.classId === studentClassId && a.lessonId === l.id)
          );

          // 合併並去重
          const combined = [...teacherCustomLessons, ...assignedSystemLessons];
          const map = new Map();
          combined.forEach(l => map.set(l.id, l));
          studentLessons = Array.from(map.values());
          
      } else {
          studentLessons = [];
      }
  } else {
      // 若非學生 (或未登入)，暫時不回傳
      studentLessons = [];
  }

  // 3. 系統內建課程
  const systemLessons = ALL_LESSONS;

  // 4. 教師自己的課程
  const myCustomLessons = role === 'teacher' 
      ? customLessons.filter(l => l.ownerId === userId)
      : [];

  const getLesson = (id: string): Lesson | undefined => {
    return allAvailableLessons.find(l => l.id === id);
  };

  return {
    lessons: allAvailableLessons,
    studentLessons,
    systemLessons,
    myCustomLessons,
    getLesson,
    getAllQuestions
  };
};