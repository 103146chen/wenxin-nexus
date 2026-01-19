'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { useTeacherStore, PendingItem } from "@/store/teacher-store";
import { CheckCircle, Clock, Filter, Search, GitGraph, FileText, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import GradingModal from "@/components/features/teacher/GradingModal";
import { ALL_LESSONS } from "@/lib/data/lessons";

export default function VerificationPage() {
  const { getPendingSubmissions } = useTeacherStore();
  const [items, setItems] = useState<PendingItem[]>([]);
  
  // 為了避免 Hydration Error，我們在 useEffect 中載入資料
  useEffect(() => {
    setItems(getPendingSubmissions());
  }, [getPendingSubmissions]);

  // Modal 狀態
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);

  // 當 Modal 關閉時，重新抓取資料以更新列表
  const handleCloseModal = () => {
      setSelectedItem(null);
      setItems(getPendingSubmissions());
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-10">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">作業批閱中心</h1>
                <p className="text-slate-500">尚有 <span className="text-indigo-600 font-bold">{items.length}</span> 份作業等待您的檢閱。</p>
            </div>
            
            <div className="flex gap-2">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="搜尋學生..." 
                        className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                </div>
                <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">
                    <Filter className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* 列表區 */}
        {items.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                        <tr>
                            <th className="p-5 pl-6">作業類型</th>
                            <th className="p-5">學生姓名</th>
                            <th className="p-5">課程單元</th>
                            <th className="p-5">繳交時間</th>
                            <th className="p-5 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item, index) => {
                            const lessonTitle = ALL_LESSONS.find(l => l.id === item.lessonId)?.title;
                            
                            return (
                                <tr key={`${item.studentId}-${item.lessonId}-${index}`} className="hover:bg-indigo-50/30 transition group cursor-pointer" onClick={() => setSelectedItem(item)}>
                                    <td className="p-5 pl-6">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold border ${
                                            item.type === 'logic-map' 
                                                ? 'bg-orange-50 text-orange-700 border-orange-200' 
                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                            {item.type === 'logic-map' ? <GitGraph className="w-3 h-3"/> : <FileText className="w-3 h-3"/>}
                                            {item.type === 'logic-map' ? '邏輯思辨' : '讀後反思'}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {item.studentName[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700">{item.studentName}</div>
                                                <div className="text-xs text-slate-500">{item.className}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 font-medium text-slate-700">
                                        《{lessonTitle}》
                                    </td>
                                    <td className="p-5 text-slate-500 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(item.submittedAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-full transition">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
                <CheckCircle className="w-12 h-12 mb-4 text-emerald-200" />
                <p className="text-lg font-bold text-slate-600">太棒了！目前沒有待批改的作業。</p>
                <p className="text-sm">您可以稍作休息，喝杯茶。</p>
            </div>
        )}

        {/* 批改 Modal */}
        <GradingModal 
            item={selectedItem}
            isOpen={!!selectedItem}
            onClose={handleCloseModal}
        />

      </div>
    </div>
  );
}