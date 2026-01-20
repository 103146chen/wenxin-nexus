'use client';

import { useLessons } from "@/hooks/use-lessons";
import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";
import { BrainCircuit, ChevronRight, Lock, RotateCcw, CheckCircle, Clock } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { getAllQuestions } from "@/lib/data/lessons"; // 🔥 引入 Helper

export default function QuizMenuPage() {
  const { lessons } = useLessons();
  const { quizRecords, level } = useUserStore();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">測驗大廳</h1>
          <p className="text-slate-600">選擇課程進行挑戰，賺取 XP 與文心幣。</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => {
            const record = quizRecords[lesson.id];
            const hasWrongs = record?.wrongQuestionIds?.length > 0;
            
            // 🔥 修正：使用 Helper 計算該課程所有試卷的題目總數
            const totalQuestions = getAllQuestions(lesson).length;

            return (
              <Link 
                key={lesson.id} 
                href={`/quiz/${lesson.id}`}
                className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-300 transition flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
                    <BrainCircuit className="w-24 h-24 text-indigo-600" />
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2">{lesson.title}</h3>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">
                        {/* 🔥 使用修正後的變數 */}
                        {totalQuestions} 題測驗
                    </span>
                    {hasWrongs ? (
                        <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded flex items-center gap-1 animate-pulse">
                            <RotateCcw className="w-3 h-3" /> 需訂正
                        </span>
                    ) : record?.isFinished ? (
                        <span className="text-xs font-bold bg-green-50 text-green-600 px-2 py-1 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> 已完成
                        </span>
                    ) : (
                        <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 待挑戰
                        </span>
                    )}
                </div>

                <div className="mt-auto flex items-center text-sm font-bold text-indigo-600 group-hover:translate-x-2 transition">
                    立即開始 <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}