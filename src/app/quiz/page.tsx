'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";
import { BrainCircuit, ArrowRight, Star, RotateCcw, CheckCircle } from "lucide-react";
import { ALL_LESSONS } from "@/lib/data/lessons";
import { useUserStore } from "@/store/user-store";

export default function QuizMenuPage() {
  const { quizRecords } = useUserStore();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-12">
        <header className="mb-10">
          <h1 className="text-4xl font-bold font-serif text-slate-900 mb-4">測驗中心</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            驗收你的學習成果。運用你的「慎思系」技能，挑戰滿分！
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_LESSONS.map((lesson) => {
            const record = quizRecords[lesson.id];
            const isFinished = record?.isFinished;
            const wrongCount = record?.wrongQuestionIds?.length || 0;
            const hasWrongs = wrongCount > 0;

            return (
              <Link 
                key={lesson.id} 
                href={`/quiz/${lesson.id}`}
                className={`group block bg-white p-6 rounded-2xl shadow-sm border-2 transition-all hover:shadow-md ${
                    hasWrongs 
                        ? 'border-rose-100 hover:border-rose-300' 
                        : isFinished 
                            ? 'border-green-100 hover:border-green-300' 
                            : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        hasWrongs 
                            ? 'bg-rose-100 text-rose-600' 
                            : isFinished 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-indigo-50 text-indigo-600'
                    }`}>
                        {hasWrongs ? <RotateCcw className="w-6 h-6" /> : isFinished ? <CheckCircle className="w-6 h-6" /> : <BrainCircuit className="w-6 h-6" />}
                    </div>
                    
                    {/* 最高分顯示 */}
                    {isFinished && (
                        <div className="text-right">
                            <div className="text-xs text-slate-400 font-bold uppercase">最高分</div>
                            <div className={`text-xl font-bold ${hasWrongs ? 'text-rose-600' : 'text-green-600'}`}>
                                {record.highestScore}
                            </div>
                        </div>
                    )}
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                  {lesson.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                   <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">
                      {lesson.quizzes.length} 題測驗
                   </span>
                   {hasWrongs ? (
                       <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded flex items-center gap-1 animate-pulse">
                          <RotateCcw className="w-3 h-3"/> 待訂正 ({wrongCount})
                       </span>
                   ) : !isFinished ? (
                       <span className="text-xs font-bold bg-yellow-50 text-yellow-600 px-2 py-1 rounded flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current"/> 獎勵豐厚
                       </span>
                   ) : (
                       <span className="text-xs font-bold bg-green-50 text-green-600 px-2 py-1 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3"/> 已完成
                       </span>
                   )}
                </div>

                <div className={`flex items-center text-sm font-bold transition-transform ${
                    hasWrongs ? 'text-rose-500' : 'text-slate-400 group-hover:text-indigo-500'
                }`}>
                  {hasWrongs ? '前往訂正' : isFinished ? '複習模式' : '開始挑戰'} 
                  <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}