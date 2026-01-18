'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { GamificationEngine } from "@/lib/engines/GamificationEngine";
import { StudentAsset } from "@/lib/types/gamification";
import { useEffect, useState } from "react";
import { Check, X, MessageSquare, FileText, Share2 } from "lucide-react";

export default function TeacherVerificationPage() {
  const [pendingAssets, setPendingAssets] = useState<StudentAsset[]>([]);

  // 載入待審核清單
  const loadData = () => {
    const assets = GamificationEngine.getAllAssets('pending');
    setPendingAssets(assets);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = (id: string, title: string) => {
    if (confirm(`確定要通過「${title}」嗎？\n(學生將獲得 XP 獎勵)`)) {
      GamificationEngine.teacherReview(id, 'verify');
      loadData(); // 重新整理清單
    }
  };

  const handleReject = (id: string) => {
    const feedback = prompt("請輸入退回理由或修改建議：", "內容不夠完整，請補充細節。");
    if (feedback) {
      GamificationEngine.teacherReview(id, 'reject', feedback);
      loadData();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold font-serif text-slate-900">教師審核中心</h1>
          <p className="text-slate-500 mt-2">
            待審批項目：<span className="font-bold text-indigo-600">{pendingAssets.length}</span> 件
          </p>
        </header>

        {pendingAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <Check className="w-8 h-8" />
            </div>
            <p className="text-slate-500">目前沒有待審核的學生作業。</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingAssets.map((asset) => (
              <div key={asset.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex gap-6 items-start">
                
                {/* 左側：類型圖示 */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                    asset.type === 'logic-map' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'
                }`}>
                    {asset.type === 'logic-map' ? <Share2 className="w-6 h-6"/> : <FileText className="w-6 h-6"/>}
                </div>

                {/* 中間：內容預覽 */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 text-lg">{asset.title}</h3>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            作者：{asset.authorName}
                        </span>
                        <span className="text-xs text-slate-400">
                            提交於 {new Date(asset.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-3 border border-slate-100 font-serif leading-relaxed">
                        {/* 如果是邏輯圖，可能是一串 JSON，我們簡單顯示摘要；如果是註釋，顯示文字 */}
                        {asset.type === 'logic-map' ? '邏輯圖結構資料 (Logic Map Data)' : asset.contentPreview}
                    </div>
                </div>

                {/* 右側：操作按鈕 */}
                <div className="flex flex-col gap-2 shrink-0">
                    <button 
                        onClick={() => handleVerify(asset.id, asset.title)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition shadow-sm"
                    >
                        <Check className="w-4 h-4" /> 通過
                    </button>
                    <button 
                        onClick={() => handleReject(asset.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-bold rounded-lg hover:bg-red-50 transition"
                    >
                        <X className="w-4 h-4" /> 退回
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}