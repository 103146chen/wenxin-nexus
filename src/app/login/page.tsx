'use client';

import { useUserStore } from "@/store/user-store";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MOCK_CLASSES } from "@/lib/data/mock-class-data"; // 直接讀取模擬資料
import { 
  GraduationCap, 
  School, 
  User, 
  ChevronRight, 
  LogIn, 
  RefreshCcw, 
  Trash2,
  AlertTriangle
} from "lucide-react";

export default function LoginPage() {
  const { login, isLoggedIn, role } = useUserStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [isResetting, setIsResetting] = useState(false);

  // 如果已登入，自動轉導
  useEffect(() => {
    if (isLoggedIn) {
      if (role === 'teacher') router.push('/dashboard');
      else router.push('/study');
    }
  }, [isLoggedIn, role, router]);

  const handleLogin = (role: 'student' | 'teacher', username: string, userId?: string) => {
    // 這裡我們稍微 hack 一下 user-store 的 login，
    // 因為目前 store 的 login 還沒完全支援傳入 id (它是自動判斷)。
    // 為了 MVP 演示，我們主要依賴 store 內部的判斷，
    // 但在下一階段我們會正式修改 store 來接收 userId。
    
    // 目前：先呼叫標準登入
    login(role, username);
    
    // 如果是學生，我們需要讓系統知道是哪位學生
    // 這部分在目前的 user-store 是寫死的 (預設李白)，
    // 但為了讓您可以測試不同人，我們手動覆寫 localStorage (Hack for MVP)
    if (role === 'student' && userId) {
        const currentUserState = JSON.parse(localStorage.getItem('wenxin-user-storage') || '{}');
        if (currentUserState.state) {
            const targetStudent = MOCK_CLASSES.flatMap(c => c.students).find(s => s.id === userId);
            const targetClass = MOCK_CLASSES.find(c => c.students.some(s => s.id === userId));
            
            if (targetStudent && targetClass) {
                currentUserState.state.id = targetStudent.id;
                currentUserState.state.name = targetStudent.name;
                currentUserState.state.avatar = targetStudent.avatar;
                currentUserState.state.level = targetStudent.level;
                currentUserState.state.classId = targetClass.id;
                
                localStorage.setItem('wenxin-user-storage', JSON.stringify(currentUserState));
            }
        }
    }

    // 如果是老師 (為了下一階段的多教師準備)
    if (role === 'teacher' && userId) {
         const currentUserState = JSON.parse(localStorage.getItem('wenxin-user-storage') || '{}');
         if (currentUserState.state) {
             currentUserState.state.id = userId;
             currentUserState.state.name = username;
             // 簡單區分一下頭像
             currentUserState.state.avatar = userId === 't-001' ? 'scholar_m' : 'scholar_f'; 
             localStorage.setItem('wenxin-user-storage', JSON.stringify(currentUserState));
         }
    }
  };

  const handleGlobalReset = () => {
      if (confirm('⚠️ 警告：這將清除所有進度、作業與自訂課程，還原到初始狀態。\n\n確定要重置系統嗎？')) {
          setIsResetting(true);
          localStorage.clear();
          // 給一點延遲讓使用者感覺有在運作
          setTimeout(() => {
              window.location.reload();
          }, 1000);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row relative z-10 min-h-[600px]">
        
        {/* Left: Brand Area */}
        <div className="md:w-5/12 bg-slate-900 p-10 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="relative z-10">
                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 shadow-lg shadow-indigo-900/50">
                    文
                </div>
                <h1 className="text-4xl font-bold mb-4">文心共築</h1>
                <p className="text-indigo-200 text-lg leading-relaxed">
                    結合 AI 對話與遊戲化學習的<br/>新世代國文教學平台。
                </p>
            </div>
            
            <div className="relative z-10">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">MVP Build v1.0</div>
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> 系統運作正常
                </div>
            </div>

            {/* Decor Circles */}
            <div className="absolute right-[-50px] bottom-[-50px] w-64 h-64 bg-indigo-600 rounded-full opacity-20 blur-3xl"></div>
        </div>

        {/* Right: Login Form */}
        <div className="md:w-7/12 p-10 flex flex-col">
            
            <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                <button 
                    onClick={() => setActiveTab('student')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <GraduationCap className="w-4 h-4"/> 我是學生
                </button>
                <button 
                    onClick={() => setActiveTab('teacher')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'teacher' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <School className="w-4 h-4"/> 我是老師
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                {activeTab === 'student' ? (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">選擇班級與學生登入</h3>
                            <div className="space-y-6">
                                {MOCK_CLASSES.map(cls => (
                                    <div key={cls.id}>
                                        <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg inline-block mb-3 border border-slate-200">
                                            {cls.name} ({cls.code})
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {cls.students.slice(0, 4).map(student => (
                                                <button
                                                    key={student.id}
                                                    onClick={() => handleLogin('student', student.name, student.id)}
                                                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md transition text-left group"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                                                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover"/>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-700 group-hover:text-indigo-700">{student.name}</div>
                                                        <div className="text-[10px] text-slate-400">Lv.{student.level}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-left-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">選擇教師身分登入</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Teacher 1: Confucius */}
                            <button
                                onClick={() => handleLogin('teacher', '孔丘', 't-001')}
                                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md transition text-left group"
                            >
                                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                                    <User className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-lg text-slate-800 group-hover:text-indigo-700">孔丘 (Confucius)</div>
                                    <div className="text-xs text-slate-500">ID: t-001 • 管理員權限</div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
                            </button>

                            {/* Teacher 2: Mencius (Simulated) */}
                            <button
                                onClick={() => handleLogin('teacher', '孟軻', 't-002')}
                                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md transition text-left group"
                            >
                                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
                                    <User className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-lg text-slate-800 group-hover:text-emerald-700">孟軻 (Mencius)</div>
                                    <div className="text-xs text-slate-500">ID: t-002 • 測試教師</div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500" />
                            </button>
                        </div>
                        
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 leading-relaxed flex gap-3">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500"/>
                            <div>
                                <span className="font-bold">多教師測試說明：</span><br/>
                                系統目前已預備好多租戶架構。您可以分別使用不同老師登入，驗證班級與課程是否已進行權限隔離。
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Global Reset Button */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                <button 
                    onClick={handleGlobalReset}
                    disabled={isResetting}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 transition px-4 py-2 hover:bg-red-50 rounded-full"
                >
                    {isResetting ? <RefreshCcw className="w-3 h-3 animate-spin"/> : <Trash2 className="w-3 h-3"/>}
                    {isResetting ? '系統重置中...' : '重置所有系統資料 (Demo Only)'}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}