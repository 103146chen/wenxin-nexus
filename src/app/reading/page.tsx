import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

// ⚠️ 關鍵：這裡的 ID 必須跟邏輯圖那邊完全一樣！
const lessons = [
  { 
    id: 'lesson-1', // 對應赤壁賦
    title: '赤壁賦', 
    author: '宋 ‧ 蘇軾',
    desc: '壬戌之秋，七月既望，蘇子與客泛舟遊於赤壁之下...', 
    color: 'bg-orange-100 text-orange-700' 
  },
  { 
    id: 'lesson-2', // 對應師說
    title: '師說', 
    author: '唐 ‧ 韓愈',
    desc: '古之學者必有師。師者，所以傳道、受業、解惑也...', 
    color: 'bg-indigo-100 text-indigo-700' 
  },
  { 
    id: 'lesson-3', // 對應始得西山宴遊記
    title: '始得西山宴遊記', 
    author: '唐 ‧ 柳宗元',
    desc: '自余為僇人，居是州，恆惴慄。其隙也，則施施而行...', 
    color: 'bg-emerald-100 text-emerald-700' 
  },
];

export default function ReadingMenuPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-12">
        <header className="mb-10">
          <h1 className="text-4xl font-bold font-serif text-slate-900 mb-4">沉浸式閱讀圖書館</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            精選高中核心古文，提供沉浸式閱讀體驗與互動式註釋功能，讓經典文字躍然紙上。
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Link 
              key={lesson.id} 
              href={`/reading/${lesson.id}`} // 連動到對應的 ID
              className="group block bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-200 transition-all"
            >
              <div className={`w-12 h-12 ${lesson.color} rounded-xl flex items-center justify-center mb-4`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-orange-600 transition-colors">
                {lesson.title}
              </h3>
              <p className="text-sm font-medium text-slate-400 mb-3">{lesson.author}</p>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed line-clamp-3">
                {lesson.desc}
              </p>
              <div className="flex items-center text-sm font-medium text-slate-400 group-hover:text-orange-500">
                開始閱讀 <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}