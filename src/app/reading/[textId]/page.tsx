import ReadingEditor from "@/components/features/reading-engine/Editor";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, Settings } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ textId: string }>;
}

export default async function ReadingPage({ params }: PageProps) {
  const { textId } = await params;

  // 模擬資料庫：根據 ID 顯示對應標題
  // 未來這裡會換成從 Firebase 讀取整篇文章內容
  const lessonData: Record<string, { title: string; author: string }> = {
    'lesson-1': { title: '赤壁賦', author: '宋 ‧ 蘇軾' },
    'lesson-2': { title: '師說', author: '唐 ‧ 韓愈' },
    'lesson-3': { title: '始得西山宴遊記', author: '唐 ‧ 柳宗元' },
  };

  // 如果找不到 ID，就顯示預設值
  const currentLesson = lessonData[textId] || { title: '未命名篇章', author: '未知作者' };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* 頂部導覽列 */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <Link href="/reading">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5 text-slate-500" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-slate-800">{currentLesson.title}</h1>
            <p className="text-xs text-slate-500">課程 ID: {textId}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            分享註釋
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5 text-slate-500" />
          </Button>
        </div>
      </header>

      {/* 主要內容區 */}
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto">
          {/* 標題區 */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold font-serif text-slate-900 mb-2">{currentLesson.title}</h2>
            <p className="text-xl text-stone-500 font-serif">{currentLesson.author}</p>
          </div>

          {/* 載入編輯器 (這裡的內容會根據 ID 自動存取 LocalStorage) */}
          {/* 注意：我們不需要傳 ID 進去 Editor，因為 Editor 是抓 LocalStorage 的 */}
          {/* 但為了區分不同課文的存檔，我們需要修改 Editor 讓它接收 ID！(見下一步補充) */}
          <ReadingEditor lessonId={textId} /> 
        </div>
      </main>
    </div>
  );
}