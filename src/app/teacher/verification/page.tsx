'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { GamificationEngine } from "@/lib/engines/GamificationEngine";
import { StudentAsset } from "@/lib/types/gamification";
import { useEffect, useState } from "react";
import { Check, X, FileText, Share2, GitGraph, Eye } from "lucide-react";
// 👇 1. 引入 Modal
import LogicMapModal from "@/components/features/logic-map/LogicMapModal"; 

export default function TeacherVerificationPage() {
  const [pendingAssets, setPendingAssets] = useState<StudentAsset[]>([]);
  
  // 👇 2. 新增狀態：用來記錄現在要看哪一張圖
  const [viewingAsset, setViewingAsset] = useState<StudentAsset | null>(null);

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
      loadData();
    }
  };

  const handleReject = (id: string) => {
    const feedback = prompt("請輸入退回理由或修改建議：", "論點結構不夠完整，建議多補充佐證。");
    if (feedback) {
      GamificationEngine.teacherReview(id, 'reject', feedback);
      loadData();
    }
  };

  const renderLogicMapPreview = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      const rootNode = data.nodes.find((n: any) => n.id === 'root');
      const nodeCount = data.nodes.length;
      const edgeCount = data.edges.length;

      return (
        <div className="space-y-1 group-hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <GitGraph className="w-4 h-4" />
                <span>中心論題：{rootNode?.data?.label || '未命名'}</span>
            </div>
            <div className="flex gap-3 text-xs text-slate-500 mt-1">
                <span className="bg-slate-100 px-2 py-0.5 rounded">節點數：{nodeCount}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">連線數：{edgeCount}</span>
            </div>
            {/* 提示文字 */}
            <div className="pt-2 text-xs text-indigo-500 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-3 h-3"/> 點擊查看完整圖表
            </div>
        </div>
      );
    } catch (e) {
      return <span className="text-red-400 text-xs">資料解析錯誤</span>;
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

        {/* 👇 3. 放入 Modal 元件 */}
        <LogicMapModal 
            isOpen={!!viewingAsset}
            onClose={() => setViewingAsset(null)}
            title={viewingAsset?.title || ''}
            dataString={viewingAsset?.contentPreview || ''}
        />

        {pendingAssets.length === 0 ? (
          /* ... 空狀態 ... */
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-slate-300">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400"><Check className="w-8 h-8" /></div>
             <p className="text-slate-500">目前沒有待審核的學生作業。</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingAssets.map((asset) => (
              <div key={asset.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex gap-6 items-start group"> {/* 加入 group class */}
                
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${asset.type === 'logic-map' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {asset.type === 'logic-map' ? <Share2 className="w-6 h-6"/> : <FileText className="w-6 h-6"/>}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 text-lg">{asset.title}</h3>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">作者：{asset.authorName}</span>
                        <span className="text-xs text-slate-400">提交於 {new Date(asset.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {/* 👇 4. 綁定點擊事件，如果是邏輯圖就打開 Viewer */}
                    <div 
                        onClick={() => asset.type === 'logic-map' && setViewingAsset(asset)}
                        className={`bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-3 border border-slate-100 font-serif leading-relaxed ${asset.type === 'logic-map' ? 'cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition' : ''}`}
                    >
                        {asset.type === 'logic-map' 
                            ? renderLogicMapPreview(asset.contentPreview) 
                            : asset.contentPreview
                        }
                    </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => handleVerify(asset.id, asset.title)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition shadow-sm">
                        <Check className="w-4 h-4" /> 通過
                    </button>
                    <button onClick={() => handleReject(asset.id)} className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-bold rounded-lg hover:bg-red-50 transition">
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