import LogicCanvas from "@/components/features/logic-map/LogicCanvas";
import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonLogicMapPage({ params }: PageProps) {
  const { lessonId } = await params;

  // 簡單的標題對照表 (模擬資料庫)
  const titles: Record<string, string> = {
    'lesson-1': '赤壁賦 - 論辯證架構',
    'lesson-2': '師說 - 正反對比邏輯',
    'lesson-3': '始得西山宴遊記 - 心境轉折',
  };

  const title = titles[lessonId] || `自訂課程邏輯圖 (${lessonId})`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 flex flex-col h-screen">
        
        {/* 頂部導覽 */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/logic-map" className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
            <p className="text-sm text-slate-500">ID: {lessonId}</p>
          </div>
        </div>

        {/* 畫布區域 (佔滿剩餘高度) */}
        <div className="flex-1 min-h-0">
           {/* 把 lessonId 傳進去，讓畫布知道要讀哪一個存檔 */}
           <LogicCanvas lessonId={lessonId} />
        </div>
      </div>
    </div>
  );
}