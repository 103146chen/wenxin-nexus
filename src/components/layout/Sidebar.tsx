'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // 🔥 加入 useRouter
import { useUserStore } from "@/store/user-store";
import { 
  BookOpen, 
  LayoutDashboard, 
  GraduationCap, 
  Store, 
  LogOut, 
  UserCircle,
  GalleryVerticalEnd,
  CheckCircle,
  Library
} from "lucide-react";
import { UserProfileCard } from "@/components/gamification/UserProfileCard";
import { useEffect } from "react";
import { Sun, Calendar } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter(); // 🔥 初始化 router
  const { role, logout, checkAndClaimRewards } = useUserStore();

  useEffect(() => {
      if (role === 'student' && checkAndClaimRewards) {
          const result = checkAndClaimRewards();
          if (result.totalCoins > 0 || result.totalXp > 0) {
              const msgParts = [];
              if (result.verificationCount > 0) msgParts.push(`${result.verificationCount} 份作業通過審核`);
              if (result.voteCount > 0) msgParts.push(`獲得 ${result.voteCount} 張同學投票`);
              
              alert(`🎁 恭喜！您有新的學習獎勵！\n\n原因：${msgParts.join('、')}\n獲得：+${result.totalCoins} 文心幣、+${result.totalXp} XP`);
          }
      }
  }, [role, pathname, checkAndClaimRewards]);

  // 🔥 新增：登出處理函式
  const handleLogout = () => {
      logout();
      router.push('/login'); // 強制跳轉回登入頁
  };

  const navItems = role === 'teacher' ? [
    { name: '指揮中心', href: '/dashboard', icon: LayoutDashboard },
    { name: '課程管理', href: '/teacher/lessons', icon: Library }, 
    { name: '作業批閱', href: '/teacher/verification', icon: CheckCircle }, 
    { name: '每日閱讀管理', href: '/teacher/daily-manager', icon: Calendar },
  ] : [
    { name: '虛擬書齋', href: '/study', icon: BookOpen },
    { name: '技能樹', href: '/skills', icon: GraduationCap },
    { name: '佳作畫廊', href: '/gallery', icon: GalleryVerticalEnd },
    { name: '福利社', href: '/store', icon: Store },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white fixed left-0 top-0 flex flex-col shadow-xl z-50">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl">
            文
          </div>
          <span className="font-bold text-lg tracking-wide">文心共築</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 px-1">
            {role === 'teacher' ? '教師端 v1.0' : '學生端 v1.0'}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 bg-slate-950 border-t border-slate-800">
        {role === 'student' ? (
            <UserProfileCard />
        ) : (
            <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-slate-400"/>
                </div>
                <div>
                    <div className="text-sm font-bold">孔子老師</div>
                    <div className="text-xs text-slate-500">管理員</div>
                </div>
            </div>
        )}
        
        {/* 🔥 修改：綁定 handleLogout */}
        <button 
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-rose-400 transition py-2"
        >
            <LogOut className="w-3 h-3" /> 登出切換身分
        </button>
      </div>
    </aside>
  );
}