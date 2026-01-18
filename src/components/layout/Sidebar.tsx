'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  GitGraph, 
  Library,
  LogOut,
  GalleryHorizontalEnd, // 新增
  CheckSquare, // 新增
  Settings
} from 'lucide-react';

const menuItems = [
  { name: "儀表板", icon: LayoutDashboard, href: "/dashboard" },
  { name: "沉浸式閱讀", icon: BookOpen, href: "/reading" },
  { name: "邏輯思辨", icon: GitGraph, href: "/logic-map" },
  { name: "虛擬書齋", icon: Library, href: "/study" },
  { name: "成果畫廊", icon: GalleryHorizontalEnd, href: "/gallery" }, // 新增
  { name: "教師審核", icon: CheckSquare, href: "/teacher/verification" }, // 新增 (模擬老師後台)
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold">文心匯 <span className="text-xs block opacity-70 font-normal mt-1">Wenxin Nexus</span></h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}