'use client';

import { useMemo } from 'react';
import { ALL_LESSONS, Lesson } from '@/lib/data/lessons';
import { useTeacherStore } from '@/store/teacher-store';

export function useLessons() {
  const { customLessons } = useTeacherStore();

  const lessons = useMemo(() => {
    // 將靜態課程與老師新增的課程合併
    // 確保 customLessons 存在 (防呆)
    return [...ALL_LESSONS, ...(customLessons || [])];
  }, [customLessons]);

  // 輔助函式：根據 ID 找課程
  const getLesson = (id: string) => lessons.find(l => l.id === id);

  // 輔助函式：根據作者找課程
  const getLessonsByAuthor = (author: string) => lessons.filter(l => l.author === author);

  return {
    lessons,
    getLesson,
    getLessonsByAuthor
  };
}