'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";
import { useLessons } from "@/hooks/use-lessons"; // 🔥 改用 Hook

export default function StudyLobbyPage() {
  const { lessons } = useLessons(); // 🔥 獲取動態列表

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold font-serif text-slate-900 mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            虛擬書齋 Virtual Study
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            運用生成式 AI 技術，讓古聖先賢重現於世。請選擇一位導師，開始你們的跨時空對話。
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {lessons.map((lesson) => {
            // 從 "宋 ‧ 蘇軾" 提取出 "蘇軾"
            const authorName = lesson.author.split('‧')[1]?.trim() || lesson.author;
            
            return (
                <Link 
                  key={lesson.id} 
                  href={`/study/${lesson.id}`}
                  className="group relative bg-white overflow-hidden rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-${lesson.colorTheme}-100 rounded-bl-[100px] -mr-10 -mt-10 transition-transform group-hover:scale-110 opacity-50`}></div>
                  
                  <div className="p-8 relative z-10 flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-full bg-slate-100 border-4 border-white shadow-md mb-4 flex items-center justify-center text-2xl font-serif font-bold text-slate-700 group-hover:bg-${lesson.colorTheme}-50 group-hover:text-${lesson.colorTheme}-600 transition-colors`}>
                        {authorName[0]}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">{authorName}</h3>
                    <p className="text-sm text-slate-500 mb-6 bg-slate-100 px-3 py-1 rounded-full">
                        {lesson.title} 作者
                    </p>
                    
                    <button className={`flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium group-hover:bg-${lesson.colorTheme}-600 transition-colors`}>
                        <MessageCircle className="w-4 h-4" />
                        開始對話
                    </button>
                  </div>
                </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}