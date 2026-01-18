'use client';

import { forwardRef } from 'react';
import { Lesson } from '@/lib/data/lessons';
import { UserProfileCard } from '@/components/gamification/UserProfileCard'; // 借用頭像邏輯，或自己寫簡單版
import { BookOpen, BrainCircuit, GitGraph, PenTool, Award, Quote } from 'lucide-react';

interface PortfolioReportProps {
  user: {
    name: string;
    title: string;
    level: number;
  };
  lesson: Lesson;
  reflection?: {
    mood: string;
    content: string;
  };
  quizRecord?: {
    score: number;
    highestScore: number;
  };
  // 邏輯圖我們會直接截取畫布的圖片，所以這裡接收圖片字串
  logicMapImage?: string; 
}

export const PortfolioReport = forwardRef<HTMLDivElement, PortfolioReportProps>(
  ({ user, lesson, reflection, quizRecord, logicMapImage }, ref) => {
    
    return (
      <div ref={ref} className="bg-white text-slate-900 font-serif w-[794px] min-h-[1123px] p-12 mx-auto relative hidden-print-layout">
        {/* 為了讓 html2canvas 抓得到，我們通常會暫時顯示它，或者設為 absolute top-[-9999px] */}
        
        {/* --- 頁眉 --- */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">文心共築 ‧ 學習歷程檔案</h1>
                <p className="text-slate-500 text-sm">Wenxin Nexus Learning Portfolio</p>
            </div>
            <div className="text-right">
                <p className="font-bold text-lg">{user.name}</p>
                <p className="text-slate-500 text-sm">{user.title} | Lv.{user.level}</p>
                <p className="text-slate-400 text-xs mt-1">{new Date().toLocaleDateString()}</p>
            </div>
        </div>

        {/* --- 課程資訊 --- */}
        <section className="mb-10 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-800">{lesson.title}</h2>
            </div>
            <p className="text-slate-600 ml-8">作者：{lesson.author}</p>
        </section>

        {/* --- 1. 邏輯思辨成果 --- */}
        <section className="mb-10">
            <div className="flex items-center gap-2 mb-4 border-l-4 border-orange-500 pl-3">
                <GitGraph className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-slate-800">思辨結構圖</h3>
            </div>
            <div className="w-full h-64 border border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden">
                {logicMapImage ? (
                    <img src={logicMapImage} alt="Logic Map" className="max-w-full max-h-full object-contain" />
                ) : (
                    <p className="text-slate-400 text-sm italic">未提交邏輯圖</p>
                )}
            </div>
        </section>

        {/* --- 2. 課後反思 --- */}
        <section className="mb-10">
            <div className="flex items-center gap-2 mb-4 border-l-4 border-rose-500 pl-3">
                <PenTool className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-bold text-slate-800">讀後反思</h3>
            </div>
            
            {reflection ? (
                <div className="bg-rose-50/50 p-6 rounded-xl border border-rose-100">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-rose-600 border border-rose-200 shadow-sm">
                            心情：{reflection.mood}
                        </span>
                    </div>
                    <p className="leading-loose text-slate-700 whitespace-pre-wrap">
                        {reflection.content}
                    </p>
                </div>
            ) : (
                <p className="text-slate-400 text-sm italic ml-4">未填寫心得</p>
            )}
        </section>

        {/* --- 3. 測驗表現 --- */}
        <section className="mb-10">
            <div className="flex items-center gap-2 mb-4 border-l-4 border-indigo-500 pl-3">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">學習成效驗收</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <span className="text-slate-500 text-sm">最高分紀錄</span>
                    <span className="text-2xl font-bold text-indigo-600">{quizRecord?.highestScore || 0}</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <span className="text-slate-500 text-sm">完成狀態</span>
                    {quizRecord ? (
                        <span className="text-green-600 font-bold flex items-center gap-1"><BrainCircuit className="w-4 h-4"/> 已完成</span>
                    ) : (
                        <span className="text-slate-400">未完成</span>
                    )}
                </div>
            </div>
        </section>

        {/* --- 頁尾 --- */}
        <div className="absolute bottom-8 left-0 w-full text-center text-slate-400 text-xs">
            <p>本文件由 文心共築 (Wenxin Nexus) 平台自動生成</p>
        </div>
      </div>
    );
  }
);

PortfolioReport.displayName = 'PortfolioReport';