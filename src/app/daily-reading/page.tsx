'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { useUserStore } from "@/store/user-store";
import { useDailyStore } from "@/store/daily-store";
import Link from "next/link";
import { Calendar, CheckCircle, ChevronRight, Gift, Sun, BookOpen, Flame, Snowflake, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

export default function DailyReadingPage() {
  const { 
      dailyMission, 
      claimDailyMissionReward, 
      streakDays, 
      streakStatus, 
      checkStreakStatus, 
      repairStreak, 
      acceptStreakBreak,
      inventory 
  } = useUserStore();
  
  const { articles } = useDailyStore();
  
  const [todayStr, setTodayStr] = useState('');

  useEffect(() => {
      setTodayStr(new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' }));
      checkStreakStatus();
  }, [checkStreakStatus]);

  // 篩選出今天的文章 (這裡暫時顯示所有文章，但標註日期，或者你可以只顯示 publishDate === today 的文章)
  // 為了 Demo 效果，我們這裡顯示全部，但實際邏輯可能只顯示今天
  const displayArticles = articles; // 您可以在這裡 filter

  const allCompleted = displayArticles.length > 0 && displayArticles.every(article => 
      dailyMission.progress.find(p => p.articleId === article.id)?.isCompleted
  );

  const freezeCount = inventory.find(i => i.itemId === 'streak-freeze')?.count || 0;

  // ... (Repair/Break Handlers 保持不變) ...
  const handleRepair = () => { if (repairStreak()) alert('🛡️ 連勝已修復！'); else alert('❌ 道具不足。'); };
  const handleAcceptBreak = () => { if(confirm('確定要放棄連勝紀錄？')) acceptStreakBreak(); };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-10">
        
        <header className="mb-10 flex justify-between items-end">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Sun className="w-6 h-6"/></div>
                    <h1 className="text-3xl font-bold text-slate-900">每日晨讀</h1>
                </div>
                <p className="text-slate-600">一日之計在於晨。閱讀短文，累積知識，賺取獎勵。</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${streakStatus === 'broken' ? 'bg-slate-200 text-slate-500' : 'bg-orange-100 text-orange-600'}`}>
                <Flame className={`w-4 h-4 ${streakStatus === 'broken' ? 'text-slate-400' : 'fill-orange-600'}`} />
                連勝 {streakDays} 天
            </div>
        </header>

        {/* ... (連勝中斷與 Status Card 區塊保持不變) ... */}
        {/* 請保留原有的 streakStatus === 'broken' 區塊與 Status Card */}
        {streakStatus === 'broken' && (
            <div className="mb-8 bg-white border-2 border-red-100 rounded-3xl p-6 shadow-xl flex gap-6 items-start">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center shrink-0 text-red-500"><AlertTriangle className="w-8 h-8" /></div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">連勝中斷了！</h3>
                    <p className="text-slate-600 mb-4 text-sm">使用 <span className="font-bold text-sky-600">連勝凍結卡</span> 來修復紀錄？</p>
                    <div className="flex gap-3">
                        <button onClick={handleRepair} disabled={freezeCount === 0} className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 ${freezeCount > 0 ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Snowflake className="w-4 h-4"/> 使用凍結卡 (持有: {freezeCount})
                        </button>
                        <button onClick={handleAcceptBreak} className="px-5 py-2.5 rounded-xl font-bold text-sm border border-slate-200 text-slate-500 hover:bg-slate-50">重新開始</button>
                    </div>
                </div>
            </div>
        )}

        <div className="max-w-4xl">
             <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8 flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-2 uppercase tracking-wider"><Calendar className="w-4 h-4"/> {todayStr}</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">今日挑戰進度</h2>
                    <p className="text-slate-500">完成所有任務即可簽到。</p>
                </div>
                <div className="relative z-10">
                    {dailyMission.isRewardClaimed ? (
                        <div className="flex flex-col items-center gap-2 text-green-600"><CheckCircle className="w-6 h-6" /><span className="font-bold text-sm">已簽到</span></div>
                    ) : allCompleted ? (
                        <button onClick={claimDailyMissionReward} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 animate-bounce">
                            <Gift className="w-5 h-5"/> 領取 100 文心幣
                        </button>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400"><Sun className="w-6 h-6" /><span className="font-bold text-sm">進行中...</span></div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {displayArticles.map((article, index) => {
                    const progress = dailyMission.progress.find(p => p.articleId === article.id);
                    const isDone = progress?.isCompleted;
                    return (
                        <Link key={article.id} href={`/daily-reading/${article.id}`} className={`group flex items-center justify-between p-6 rounded-2xl border transition-all ${isDone ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'}`}>
                            <div className="flex items-center gap-6">
                                {/* 🔥 日期顯示 */}
                                <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold border ${isDone ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                    <span className="text-[10px] uppercase opacity-70">{new Date(article.publishDate).toLocaleString('en-US', { month: 'short' })}</span>
                                    <span className="text-xl">{new Date(article.publishDate).getDate()}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700">{article.title}</h3>
                                    <p className="text-sm text-slate-500">{article.author}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {isDone ? <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3"/> 已完成</span> : <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{article.questions.length} 題測驗</span>}
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600"/>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
}