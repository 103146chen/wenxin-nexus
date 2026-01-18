import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";
import { GitGraph, ArrowRight } from "lucide-react";

const lessons = [
  { id: 'lesson-1', title: '赤壁賦', desc: '探討變與不變的哲學思辨', color: 'bg-orange-100 text-orange-700' },
  { id: 'lesson-2', title: '師說', desc: '從師問學的重要性與正反論證', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'lesson-3', title: '始得西山宴遊記', desc: '心境轉折與物我合一的過程', color: 'bg-emerald-100 text-emerald-700' },
];

export default function LogicMapMenuPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-12">
        <header className="mb-10">
          <h1 className="text-4xl font-bold font-serif text-slate-900 mb-4">邏輯思辨圖書館</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            選擇一篇古文，進入無限畫布，透過視覺化的方式重構文章邏輯與論證架構。
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Link 
              key={lesson.id} 
              href={`/logic-map/${lesson.id}`}
              className="group block bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className={`w-12 h-12 ${lesson.color} rounded-xl flex items-center justify-center mb-4`}>
                <GitGraph className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                {lesson.title}
              </h3>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                {lesson.desc}
              </p>
              <div className="flex items-center text-sm font-medium text-slate-400 group-hover:text-indigo-500">
                開始繪製 <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
          
          {/* 新增自定義按鈕 */}
          <Link 
              href={`/logic-map/custom-${Math.floor(Math.random() * 1000)}`}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-100/50 transition-all text-slate-400 cursor-pointer"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">+</span>
              </div>
              <span className="font-medium">建立空白畫布</span>
          </Link>
        </div>
      </div>
    </div>
  );
}