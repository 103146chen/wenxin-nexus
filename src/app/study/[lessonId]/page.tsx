import ChatInterface from "@/components/features/virtual-study/ChatInterface";
import { Sidebar } from "@/components/layout/Sidebar";
import { getLessonById } from "@/lib/data/lessons";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function StudyRoomPage({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);

  // 如果找不到課程，或 lesson 資料有誤，給個預設值
  const authorFull = lesson?.author || "未知 ‧ 賢者";
  const authorName = authorFull.split('‧')[1]?.trim() || authorFull;
  
  // 根據不同作者設定不同的開場白
  const getInitialMessage = (name: string) => {
    if (name.includes('蘇軾')) return "吾乃蘇子瞻。客官今日來訪赤壁，可是為了探究水月之變？";
    if (name.includes('韓愈')) return "古之學者必有師。汝有何疑惑，儘管問來，吾當為汝解惑。";
    if (name.includes('柳宗元')) return "自余為僇人，居是州，恆惴慄。幸得今日與汝相會，聊以慰藉。";
    return `吾乃${name}。閣下有何指教？`;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 flex flex-col h-screen">
        {/* 頂部導覽 */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/study" className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">與 {authorName} 對話中</h1>
            <p className="text-sm text-slate-500">虛擬書齋</p>
          </div>
        </div>

        {/* 聊天介面容器 (限制最大寬度讓閱讀更舒服) */}
        <div className="flex-1 max-w-4xl mx-auto w-full">
            <ChatInterface 
                tutorName={authorName} 
                initialMessage={getInitialMessage(authorName)}
            />
        </div>
      </div>
    </div>
  );
}