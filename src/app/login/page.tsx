'use client';

import { useUserStore } from "@/store/user-store";
import { useRouter } from "next/navigation";
import { User, School, BookOpen } from "lucide-react";

export default function LoginPage() {
  const { login } = useUserStore();
  const router = useRouter();

  const handleLogin = (role: 'student' | 'teacher') => {
    login(role);
    // 登入後導向不同頁面
    if (role === 'teacher') {
        router.push('/dashboard');
    } else {
        router.push('/study'); // 學生直接去書齋，或者去首頁 '/'
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[100px]"></div>
      </div>

      <div className="text-center mb-12 z-10">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-900/50">
            <span className="text-4xl font-serif text-white">文</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white font-serif tracking-wide mb-4">文心共築</h1>
        <p className="text-slate-400 text-lg">重塑古文學習體驗的遊戲化平台</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10">
        {/* 學生入口 */}
        <button 
            onClick={() => handleLogin('student')}
            className="group relative bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500 p-8 rounded-3xl transition-all duration-300 text-left flex flex-col items-center hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20"
        >
            <div className="w-20 h-20 bg-indigo-900/50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <User className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">我是學生</h2>
            <p className="text-slate-400 text-sm text-center">進入虛擬書齋，與 AI 導師對話，完成修練任務。</p>
            <div className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                開始學習
            </div>
        </button>

        {/* 教師入口 */}
        <button 
            onClick={() => handleLogin('teacher')}
            className="group relative bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 p-8 rounded-3xl transition-all duration-300 text-left flex flex-col items-center hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20"
        >
            <div className="w-20 h-20 bg-emerald-900/50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <School className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">我是教師</h2>
            <p className="text-slate-400 text-sm text-center">管理班級進度，批閱作業，查看學習成效儀表板。</p>
            <div className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                進入後台
            </div>
        </button>
      </div>

      <p className="mt-12 text-slate-600 text-xs">Prototype Version 0.8.0</p>
    </div>
  );
}