'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BookOpen, 
  BrainCircuit, 
  GitGraph, 
  Home, 
  Trophy, 
  User, 
  School, 
  ArrowRight, 
  CheckCircle, 
  BarChart2, 
  ShoppingBag, // 🔥 新增：商店 Icon
  LogOut 
} from "lucide-react";
import { useState } from "react";
import { useUserStore } from "@/store/user-store";
import { useTeacherStore } from "@/store/teacher-store";
import { UserProfileCard } from "../gamification/UserProfileCard";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const { classId, joinClass, role, logout } = useUserStore();
  const { classes } = useTeacherStore(); 
  
  const [classCode, setClassCode] = useState("");

  // 查出學生當前的班級名稱 (如果有)
  const myClass = classId ? classes.find(c => c.id === classId) : null;

  const handleJoin = () => {
      if (!classCode) return;
      if (joinClass(classCode)) {
          setClassCode("");
      }
  };

  const handleLogout = () => {
      if(confirm('確定要登出嗎？')) {
          logout();
          router.push('/login');
      }
  };

  // 學生端選單
  const studentMenu = [
    { icon: BookOpen, label: '虛擬書齋', href: '/study' },
    { icon: GitGraph, label: '邏輯思辨', href: '/logic-map' },
    { icon: BrainCircuit, label: '測驗中心', href: '/quiz' },
    { icon: Trophy, label: '成果畫廊', href: '/gallery' },
    // 🔥 新增：福利社
    { icon: ShoppingBag, label: '福利社', href: '/store', className: 'text-rose-400 hover:text-rose-300' }, 
    { icon: User, label: '個人檔案', href: '/profile' },
  ];

  // 教師端選單
  const teacherMenu = [
    { icon: BarChart2, label: '指揮中心', href: '/dashboard', className: 'text-yellow-400 hover:text-yellow-300' },
    { icon: CheckCircle, label: '作業批閱', href: '/teacher/verification', className: 'text-yellow-400 hover:text-yellow-300' },
    { icon: BookOpen, label: '課程預覽', href: '/study' }, 
  ];

  // 根據角色決定顯示的選單
  const menuItems = role === 'teacher' ? teacherMenu : studentMenu;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col shadow-xl z-50 border-r border-slate-800">
      
      {/* 1. Logo 區塊 */}
      <div className="p-6 shrink-0">
        <h1 className="text-2xl font-bold font-serif tracking-wider flex items-center gap-2">
          <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">文</span>
          文心共築
        </h1>
        <p className="text-xs text-slate-500 mt-2 ml-10 font-medium">遊戲化國文學習平台</p>
      </div>

      {/* 2. 選單區塊 */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : `text-slate-400 hover:bg-slate-800 hover:text-slate-200 ${item.className || ''}`
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-100' : 'group-hover:text-white transition-colors'}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
        })}

        {/* 登出按鈕 */}
        <div className="pt-4 mt-4 border-t border-slate-800">
            <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors group"
            >
                <LogOut className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                <span className="text-sm font-medium">登出系統</span>
            </button>
        </div>
      </nav>

      {/* 3. 底部固定區塊 */}
      {role === 'student' && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-3 shrink-0">
              
              {/* 加入班級小工具 */}
              {myClass ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-md flex items-center justify-center shrink-0">
                          <School className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="overflow-hidden min-w-0">
                          <div className="text-[10px] text-emerald-500 font-bold uppercase truncate">所屬班級</div>
                          <div className="font-bold text-xs text-emerald-100 truncate">{myClass.name}</div>
                      </div>
                  </div>
              ) : (
                  <div className="bg-slate-800/50 rounded-lg p-2.5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase mb-2 flex items-center gap-1">
                          <School className="w-3 h-3" /> 加入班級
                      </div>
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              placeholder="代碼"
                              value={classCode}
                              onChange={(e) => setClassCode(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-indigo-500 placeholder:text-slate-600"
                          />
                          <button 
                              onClick={handleJoin}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 rounded transition shrink-0 flex items-center justify-center"
                          >
                              <ArrowRight className="w-3 h-3" />
                          </button>
                      </div>
                  </div>
              )}

              {/* 個人儀表板 */}
              <UserProfileCard />
          </div>
      )}

      {/* 教師端底部資訊 */}
      {role === 'teacher' && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center text-emerald-200 font-bold border-2 border-emerald-700">
                  師
              </div>
              <div className="overflow-hidden min-w-0">
                  <div className="text-sm font-bold text-slate-200 truncate">孔丘 老師</div>
                  <div className="text-xs text-emerald-500 truncate">管理員權限</div>
              </div>
          </div>
      )}
    </aside>
  );
}