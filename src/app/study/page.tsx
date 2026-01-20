'use client';

import { useLessons } from "@/hooks/use-lessons";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { BookOpen, ChevronRight, Clock, Star, Layout } from "lucide-react";
import { useUserStore } from "@/store/user-store";

export default function StudyPage() {
  const { studentLessons } = useLessons(); // 🔥 改用 studentLessons
  const { quizRecords } = useUserStore();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">虛擬書齋</h1>
          <p className="text-slate-600">進入課文世界，與 AI 導師進行深度對話。</p>
        </header>

        {studentLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Clock className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">尚無課程</h3>
                <p className="text-slate-500 text-center max-w-md">
                    老師尚未發布任何課程。<br/>請等待老師複製或建立教材後，這裡就會出現內容囉！
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentLessons.map((lesson) => {
                const record = quizRecords[lesson.id];
                const isStarted = record !== undefined;

                return (
                  <Link 
                    key={lesson.id} 
                    href={`/study/${lesson.id}`}
                    className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-300 transition flex flex-col relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
                        <BookOpen className="w-24 h-24 text-indigo-600" />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${lesson.author.includes('改編') || lesson.author.includes('我') ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {lesson.author}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{lesson.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">{lesson.description}</p>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2">
                            {isStarted ? (
                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3"/> 學習中
                                </span>
                            ) : (
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <Layout className="w-3 h-3"/> 未開始
                                </span>
                            )}
                        </div>
                        <div className="flex items-center text-sm font-bold text-indigo-600 group-hover:translate-x-2 transition">
                            進入書齋 <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                  </Link>
                );
              })}
            </div>
        )}
      </div>
    </div>
  );
}