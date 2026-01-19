'use client';

import { useUserStore } from "@/store/user-store";
import { Zap, Hexagon } from "lucide-react";

export function UserProfileCard() {
  const { name, title, level, xp, maxXp, avatar, activeFrame } = useUserStore();

  // 計算進度百分比
  const progress = Math.min(100, Math.max(0, (xp / maxXp) * 100));

  return (
    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 w-full">
      <div className="flex items-center gap-3 mb-3">
        {/* 頭像區域 (固定大小，防止被擠壓) */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600">
             {/* 這裡使用假圖或 public 資料夾的圖 */}
             <img 
               src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatar}`} 
               alt="Avatar" 
               className="w-full h-full object-cover"
             />
          </div>
          {/* 等級標籤 (絕對定位) */}
          <div className="absolute -bottom-1 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-900 flex items-center shadow-sm">
            Lv.{level}
          </div>
        </div>

        {/* 文字資訊 (使用 truncate 防止超出) */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-slate-100 truncate">{name}</div>
          <div className="text-xs text-slate-400 truncate">{title}</div>
        </div>
      </div>

      {/* 經驗值條 */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500"/> XP</span>
          <span>{xp} / {maxXp}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}