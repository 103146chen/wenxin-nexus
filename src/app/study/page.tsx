'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";
import { MessageCircle, Sparkles, Book } from "lucide-react";
import { useLessons } from "@/hooks/use-lessons";
import { useMemo } from "react";

export default function StudyLobbyPage() {
  const { lessons } = useLessons();

  const authorsData = useMemo(() => {
    const groups: Record<string, typeof lessons> = {};
    
    // 1. 智慧分組邏輯
    lessons.forEach(lesson => {
        // 正規化作者名稱：
        // 如果包含 "‧"，取後半段並去除空白 -> "宋 ‧ 蘇軾" 變成 "蘇軾"
        // 如果不包含，直接去除空白 -> "蘇軾" 變成 "蘇軾"
        let normalizedName = lesson.author;
        if (lesson.author.includes('‧')) {
            const parts = lesson.author.split('‧');
            if (parts.length > 1) normalizedName = parts[1].trim();
        } else {
            normalizedName = lesson.author.trim();
        }

        if (!groups[normalizedName]) {
            groups[normalizedName] = [];
        }
        groups[normalizedName].push(lesson);
    });

    // 2. 轉換為陣列
    return Object.entries(groups).map(([shortName, works]) => {
        // 嘗試從作品集中找一個包含朝代的完整名稱來顯示 (如果有)
        // 例如作品集有 ["蘇軾", "宋 ‧ 蘇軾"]，我們優先抓出 "宋" 當朝代
        let dynasty = null;
        const workWithDynasty = works.find(w => w.author.includes('‧'));
        if (workWithDynasty) {
            const parts = workWithDynasty.author.split('‧');
            if (parts.length > 1) dynasty = parts[0].trim();
        }

        return {
            displayName: shortName, // 統一顯示簡稱 "蘇軾"
            dynasty,               // 顯示朝代 "宋"
            works,
            entryLessonId: works[0].id,
            colorTheme: works[0].colorTheme
        };
    });
  }, [lessons]);

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
          {authorsData.map((author) => (
            <Link 
              key={author.displayName} 
              href={`/study/${author.entryLessonId}`}
              className="group relative bg-white overflow-hidden rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${author.colorTheme}-100 rounded-bl-[100px] -mr-10 -mt-10 transition-transform group-hover:scale-110 opacity-50`}></div>
              
              <div className="p-8 relative z-10 flex flex-col items-center text-center flex-1">
                <div className={`w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md mb-4 flex items-center justify-center text-3xl font-serif font-bold text-slate-700 group-hover:bg-${author.colorTheme}-50 group-hover:text-${author.colorTheme}-600 transition-colors relative`}>
                    {author.displayName[0]}
                    {author.dynasty && (
                        <div className="absolute -bottom-2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-full font-sans border-2 border-white">
                            {author.dynasty}
                        </div>
                    )}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{author.displayName}</h3>
                
                <div className="flex items-center gap-2 mb-6 bg-slate-50 px-3 py-1.5 rounded-full text-slate-500 text-xs font-bold">
                    <Book className="w-3 h-3" />
                    收錄 {author.works.length} 篇作品
                </div>

                <div className="w-full space-y-2 mb-6 text-left">
                    {author.works.slice(0, 3).map(work => (
                        <div key={work.id} className="text-sm text-slate-600 border-b border-slate-100 pb-1 last:border-0 truncate flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full bg-${author.colorTheme}-400`}></span>
                            {work.title}
                        </div>
                    ))}
                    {author.works.length > 3 && (
                        <div className="text-xs text-slate-400 text-center pt-1">
                            以及其他 {author.works.length - 3} 篇...
                        </div>
                    )}
                </div>
                
                <div className="mt-auto">
                    <button className={`flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium group-hover:bg-${author.colorTheme}-600 transition-colors shadow-lg shadow-slate-200`}>
                        <MessageCircle className="w-4 h-4" />
                        進入{author.displayName}的書齋
                    </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}