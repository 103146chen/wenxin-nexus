import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { ALL_LESSONS } from "@/lib/data/lessons"; // 👈 匯入中央資料

export default function ReadingMenuPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-12">
        <header className="mb-10">
          <h1 className="text-4xl font-bold font-serif text-slate-900 mb-4">沉浸式閱讀圖書館</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            精選高中核心古文，提供沉浸式閱讀體驗與互動式註釋功能。
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_LESSONS.map((lesson) => ( // 👈 直接使用 ALL_LESSONS
            <Link 
              key={lesson.id} 
              href={`/reading/${lesson.id}`}
              className={`group block bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:border-${lesson.colorTheme}-200`}
            >
              <div className={`w-12 h-12 bg-${lesson.colorTheme}-100 text-${lesson.colorTheme}-700 rounded-xl flex items-center justify-center mb-4`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold text-slate-800 mb-1 group-hover:text-${lesson.colorTheme}-600 transition-colors`}>
                {lesson.title}
              </h3>
              <p className="text-sm font-medium text-slate-400 mb-3">{lesson.author}</p>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed line-clamp-3">
                {lesson.description}
              </p>
              <div className={`flex items-center text-sm font-medium text-slate-400 group-hover:text-${lesson.colorTheme}-500`}>
                開始閱讀 <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}