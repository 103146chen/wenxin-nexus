'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import LessonEditor from "@/components/features/teacher/LessonEditor";
import { useTeacherStore } from "@/store/teacher-store";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Lesson } from "@/lib/data/lessons";

export default function EditLessonPage() {
  const { lessonId } = useParams();
  const { customLessons, updateLesson } = useTeacherStore();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | undefined>(undefined);

  useEffect(() => {
      // 在 Custom Lessons 中尋找
      const found = customLessons.find(l => l.id === lessonId);
      if (found) {
          setLesson(found);
      } else {
          // 如果找不到，可能是 URL 錯誤或還沒載入，這裡簡單處理為跳回
          // 實際專案可以加入查詢 ALL_LESSONS 邏輯
      }
  }, [lessonId, customLessons]);

  const handleUpdate = (data: any) => {
      updateLesson(lessonId as string, data);
      alert('✅ 課程修改已儲存！');
      router.push('/teacher/lessons');
  };

  if (!lesson) {
      return (
          <div className="flex min-h-screen bg-slate-50">
              <Sidebar />
              <div className="ml-64 flex-1 p-10 flex items-center justify-center">
                  <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2"/>
                      <p className="text-slate-500">正在載入課程資料...</p>
                      <Link href="/teacher/lessons" className="text-sm text-indigo-600 hover:underline mt-4 block">返回列表</Link>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex items-center gap-4 mb-6">
            <Link href="/teacher/lessons" className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">編輯課程：{lesson.title}</h1>
        </div>
        <LessonEditor initialData={lesson} onSave={handleUpdate} mode="edit" />
      </div>
    </div>
  );
}