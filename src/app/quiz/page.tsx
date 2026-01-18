'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";
import { BrainCircuit, ArrowRight, Star } from "lucide-react";
import { ALL_LESSONS } from "@/lib/data/lessons";

export default function QuizMenuPage() {
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
          {ALL_LESSONS.map((lesson) => (
            <Link 
              key={lesson.id} 
              href={`/quiz/${lesson.id}`}
              className="group block bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:border-indigo-200"
            >
              <div className={`w-12 h-12 ${lesson.colorTheme === 'orange' ? 'bg-orange-100 text-orange-700' : lesson.colorTheme === 'indigo' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'} rounded-xl flex items-center justify-center mb-4`}>
                <BrainCircuit className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                {lesson.title}
              </h3>
              
              <div className="flex items-center gap-2 mb-4">
                 <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">
                    {lesson.quizzes.length} 題測驗
                 </span>
                 <span className="text-xs font-bold bg-yellow-50 text-yellow-600 px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current"/> 獎勵豐厚
                 </span>
              </div>

              <div className="flex items-center text-sm font-medium text-slate-400 group-hover:text-indigo-500">
                開始挑戰 <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}