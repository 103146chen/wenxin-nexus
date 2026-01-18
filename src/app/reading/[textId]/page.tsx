import ReadingEditor from "@/components/features/reading-engine/Editor";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, Settings } from "lucide-react";
import Link from "next/link";
import { getLessonById } from "@/lib/data/lessons"; // 👈 匯入查表工具

interface PageProps {
  params: Promise<{ textId: string }>;
}

export default async function ReadingPage({ params }: PageProps) {
  const { textId } = await params;
  
  // 👇 使用工具函數查找，不再手動寫死資料
  const lesson = getLessonById(textId);

  // 如果找不到 ID (例如使用者亂打網址)，顯示錯誤
  if (!lesson) {
    return <div className="p-10 text-center">找不到此課程</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <Link href="/reading">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5 text-slate-500" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-slate-800">{lesson.title}</h1>
            <p className="text-xs text-slate-500">ID: {textId}</p>
          </div>
        </div>
        {/* ... 右側按鈕保持不變 ... */}
        <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-2" />分享</Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold font-serif text-slate-900 mb-2">{lesson.title}</h2>
            <p className="text-xl text-stone-500 font-serif">{lesson.author}</p>
          </div>
          {/* 傳遞 ID 給編輯器 */}
          <ReadingEditor lessonId={textId} /> 
        </div>
      </main>
    </div>
  );
}