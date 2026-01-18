'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  GitGraph, 
  Library,
  LogOut,
  GalleryHorizontalEnd, 
  CheckSquare,
  Settings,
  Brain,        // 👈 新增
  ShoppingBag   // 👈 新增
} from 'lucide-react';

const menuItems = [
  { name: "儀表板", icon: LayoutDashboard, href: "/dashboard" },
  { name: "沉浸式閱讀", icon: BookOpen, href: "/reading" },
  { name: "邏輯思辨", icon: GitGraph, href: "/logic-map" },
  { name: "虛擬書齋", icon: Library, href: "/study" },
  { name: "成果畫廊", icon: GalleryHorizontalEnd, href: "/gallery" },
  { name: "教師審核", icon: CheckSquare, href: "/teacher/verification" },
  { name: "素養技能樹", icon: Brain, href: "/skills" },       // 👈 新增頁面連結
  { name: "文心福利社", icon: ShoppingBag, href: "/store" },  // 👈 新增頁面連結
];

export function Sidebar() {
  const pathname = usePathname(); // 取得當前路徑用來做高亮顯示 (可選)

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 border-r border-slate-800 z-50">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold">文心匯 <span className="text-xs block opacity-70 font-normal mt-1">Wenxin Nexus</span></h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === item.href 
                ? 'bg-indigo-600 text-white' 
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      {/* 底部登出按鈕 */}
      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
            <span>登出系統</span>
        </button>
      </div>
    </aside>
  );
}