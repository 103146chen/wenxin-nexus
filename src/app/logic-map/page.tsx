import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";
import { GitGraph, ArrowRight } from "lucide-react";
import { ALL_LESSONS } from "@/lib/data/lessons"; // 👈 一樣匯入中央資料

export default function LogicMapMenuPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-12">
        <header className="mb-10">
          <h1 className="text-4xl font-bold font-serif text-slate-900 mb-4">邏輯思辨圖書館</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            進入無限畫布，重構文章邏輯與論證架構。
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_LESSONS.map((lesson) => (
            <Link 
              key={lesson.id} 
              href={`/logic-map/${lesson.id}`}
              className={`group block bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:border-${lesson.colorTheme}-200`}
            >
              <div className={`w-12 h-12 bg-${lesson.colorTheme}-100 text-${lesson.colorTheme}-700 rounded-xl flex items-center justify-center mb-4`}>
                <GitGraph className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold text-slate-800 mb-2 group-hover:text-${lesson.colorTheme}-600 transition-colors`}>
                {lesson.title}
              </h3>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed line-clamp-2">
                繪製{lesson.title}的邏輯架構...
              </p>
              <div className={`flex items-center text-sm font-medium text-slate-400 group-hover:text-${lesson.colorTheme}-500`}>
                開始繪製 <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
          
           {/* 自訂空白畫布按鈕保持不變 */}
           <Link href={`/logic-map/custom-${Math.floor(Math.random() * 1000)}`} className="...">
              {/* ...略... */}
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400"><span className="text-2xl">+</span></div>
              <span className="font-medium text-slate-400">建立空白畫布</span>
           </Link>
        </div>
      </div>
    </div>
  );
}