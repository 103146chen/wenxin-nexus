import LogicCanvas from "@/components/features/logic-map/LogicCanvas";
import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getLessonById } from "@/lib/data/lessons"; // 👈 匯入查表工具

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonLogicMapPage({ params }: PageProps) {
  const { lessonId } = await params;
  
  const lesson = getLessonById(lessonId);
  
  // 處理標題：如果是已定義的課程就顯示課名，否則是自訂 ID
  const title = lesson ? `${lesson.title} - 論證架構` : `自訂邏輯圖 (${lessonId})`;

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
           <LogicCanvas lessonId={lessonId} />
        </div>
      </div>
    </div>
  );
}