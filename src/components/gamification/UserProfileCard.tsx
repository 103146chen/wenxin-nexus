'use client';

import { useUserStore } from '@/store/user-store';
import { Trophy, Coins, Flame } from 'lucide-react';

export function UserProfileCard() {
  const { name, title, level, xp, maxXp, coins, streakDays } = useUserStore();

  // 計算當前等級的進度百分比
  // 邏輯：(目前XP - 上一級總XP) / (下一級總XP - 上一級總XP)
  // 簡化版：直接用當前 XP / maxXp 示意 (若是累進制) 或區間制
  // 這裡為了簡單，我們顯示相對於下一級的進度
  const currentLevelBaseXp = Math.pow(level * 10, 2);
  const progress = Math.min(100, Math.max(0, ((xp - currentLevelBaseXp) / (maxXp - currentLevelBaseXp)) * 100)) || 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[80px] -mr-4 -mt-4"></div>

      <div className="relative z-10 flex gap-6 items-center">
        {/* 頭像區 */}
        <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center text-3xl">
                🎓
            </div>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                Lv.{level}
            </span>
        </div>

        {/* 數值區 */}
        <div className="flex-1 space-y-3">
            <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {name}
                    <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        {title}
                    </span>
                </h3>
            </div>

            {/* 經驗條 */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>EXP</span>
                    <span>{xp} / {maxXp}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* 資產數據 */}
            <div className="flex gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-sm font-bold">
                    <Coins className="w-4 h-4" />
                    <span>{coins}</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1 rounded-lg text-sm font-bold">
                    <Flame className="w-4 h-4" />
                    <span>{streakDays} 天</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-sm font-bold">
                    <Trophy className="w-4 h-4" />
                    <span>0 成就</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}