'use client';

import { useParams, useRouter } from "next/navigation";
import { useLessons } from "@/hooks/use-lessons";
import { Sidebar } from "@/components/layout/Sidebar";
import QuizRunner from "@/components/features/quiz/QuizRunner";
import { Loader2, ArrowLeft, BookOpen, Star, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { QuizSet } from "@/lib/data/lessons";

export default function QuizPage() {
  const { lessonId } = useParams();
  const { getLesson } = useLessons();
  const lesson = getLesson(lessonId as string);
  const router = useRouter();

  const [selectedSet, setSelectedSet] = useState<QuizSet | null>(null);

  if (!lesson) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500"/></div>;

  // 如果只有一份卷子，直接進入
  if (lesson.quizSets.length === 1 && !selectedSet) {
      return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <QuizRunner lesson={lesson} quizSet={lesson.quizSets[0]} />
        </div>
      );
  }

  // 測驗進行中
  if (selectedSet) {
      return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            {/* 🔥 增加返回按鈕，允許重選試卷 */}
            <div className="fixed top-6 left-72 z-50">
                <button onClick={() => setSelectedSet(null)} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition">
                    <ArrowLeft className="w-4 h-4"/> 重選試卷
                </button>
            </div>
            <QuizRunner lesson={lesson} quizSet={selectedSet} />
        </div>
      );
  }

  // 選擇測驗卷介面
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-10 flex flex-col">
        <Link href="/quiz" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回測驗大廳
        </Link>

        <header className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">《{lesson.title}》測驗挑戰</h1>
            <p className="text-slate-600">請選擇一份試卷開始挑戰。</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lesson.quizSets.map((set) => (
                <button 
                    key={set.id}
                    onClick={() => setSelectedSet(set)}
                    className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition text-left relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <BookOpen className="w-24 h-24 text-indigo-600" />
                    </div>
                    
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition">
                        <Star className="w-6 h-6" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{set.title}</h3>
                    <p className="text-sm text-slate-500 mb-4">{set.questions.length} 道題目</p>
                    
                    <div className="flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-2 transition">
                        開始測驗 <ChevronRight className="w-4 h-4" />
                    </div>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}