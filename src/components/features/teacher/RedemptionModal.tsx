'use client';

import { useState, useEffect } from 'react';
import { X, Check, XCircle, Clock, History } from 'lucide-react';
import { Redemption } from '@/lib/data/store-items';
import { StoreEngine } from '@/lib/engines/StoreEngine';
import { useUserStore } from '@/store/user-store';

interface RedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RedemptionModal({ isOpen, onClose }: RedemptionModalProps) {
  const { id: teacherId } = useUserStore();
  const [pendingList, setPendingList] = useState<Redemption[]>([]);

  const loadData = () => {
      if (teacherId) {
          setPendingList(StoreEngine.getPendingRedemptions(teacherId));
      }
  };

  useEffect(() => {
      if (isOpen) loadData();
  }, [isOpen, teacherId]);

  const handleReview = (id: string, status: 'approved' | 'rejected') => {
      const success = StoreEngine.reviewRedemption(id, status);
      if (success) {
          // 樂觀更新 UI
          setPendingList(prev => prev.filter(r => r.id !== id));
          if (status === 'approved') alert('✅ 已核銷，請交付獎勵給學生。');
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Check className="w-6 h-6 text-emerald-600"/> 
                    獎勵核銷中心
                </h2>
                <p className="text-sm text-slate-500 mt-1">確認學生的兌換請求，並交付實體獎勵。</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition"><X className="w-5 h-5 text-slate-400"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            {pendingList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <Check className="w-8 h-8 text-slate-200" />
                    </div>
                    <p>目前沒有待核銷的請求。</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingList.map(request => (
                        <div key={request.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                                    <Clock className="w-6 h-6"/>
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 text-lg">
                                        {request.studentName} <span className="text-slate-400 font-normal text-sm">兌換</span> {request.itemName}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        申請時間：{new Date(request.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleReview(request.id, 'rejected')}
                                    className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition flex items-center gap-1"
                                >
                                    <XCircle className="w-4 h-4"/> 拒絕
                                </button>
                                <button 
                                    onClick={() => handleReview(request.id, 'approved')}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition flex items-center gap-1"
                                >
                                    <Check className="w-4 h-4"/> 確認核銷
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}