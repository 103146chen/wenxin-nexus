'use client';

import LogicCanvas from "@/components/features/logic-map/LogicCanvas";
import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useLessons } from "@/hooks/use-lessons";

export default function LessonLogicMapPage() {
  const { lessonId } = useParams();
  const { getLesson } = useLessons();
  
  const lesson = getLesson(lessonId as string);
  
  // 如果找不到 lesson (可能是純粹的自訂空白 ID)，就只顯示 ID
  const title = lesson ? `${lesson.title} - 論證架構` : `自訂邏輯圖 (${lessonId})`;

  // 這裡不一定要擋掉 !lesson，因為邏輯圖支援空白 ID
  
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 flex flex-col h-screen">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/logic-map" className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
            <p className="text-sm text-slate-500">ID: {lessonId}</p>
          </div>
        </div>
        <div className="flex-1 min-h-0">
           <LogicCanvas lessonId={lessonId as string} />
        </div>
      </div>
    </div>
  );
}