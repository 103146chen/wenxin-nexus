import { create } from 'zustand';
import { ALL_LESSONS, Lesson, getLessonById, getAllQuestions } from '@/lib/data/lessons';
import { useTeacherStore } from '@/store/teacher-store';

// 這裡我們不使用 create(store)，而是直接寫成 Hook，
// 因為它需要整合 TeacherStore 的動態資料與靜態資料
export const useLessons = () => {
  const { customLessons } = useTeacherStore();

  // 1. 合併所有課程 (用於 getLesson 查詢，確保舊 ID 或新 ID 都能找到)
  const allAvailableLessons = [...customLessons, ...ALL_LESSONS];

  // 2. 學生可見課程 (只包含老師建立/複製的自訂課程)
  // 這樣就達成了 "內建課程預設隱藏，老師複製後學生才看得到" 的需求
  const studentLessons = customLessons;

  // 3. 系統內建課程 (僅供老師參考複製)
  const systemLessons = ALL_LESSONS;

  const getLesson = (id: string): Lesson | undefined => {
    return allAvailableLessons.find(l => l.id === id);
  };

  return {
    lessons: allAvailableLessons, // 供內部邏輯查詢用 (包含全部)
    studentLessons,               // 供學生列表頁顯示用 (只含自訂)
    systemLessons,                // 供老師庫存頁顯示用 (只含內建)
    getLesson,
    getAllQuestions
  };
};