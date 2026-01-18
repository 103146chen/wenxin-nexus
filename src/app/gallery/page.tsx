'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { GamificationEngine } from "@/lib/engines/GamificationEngine";
import { StudentAsset } from "@/lib/types/gamification";
import { useEffect, useState } from "react";
import { Heart, GitGraph, Quote, ZoomIn } from "lucide-react";
import { useUserStore } from "@/store/user-store";
// 👇 1. 引入 Modal
import LogicMapModal from "@/components/features/logic-map/LogicMapModal";

export default function GalleryPage() {
  const { name } = useUserStore();
  const [assets, setAssets] = useState<StudentAsset[]>([]);
  
  // 👇 2. 新增狀態
  const [viewingAsset, setViewingAsset] = useState<StudentAsset | null>(null);

  const loadData = () => {
    const galleryItems = GamificationEngine.getGalleryAssets();
    setAssets(galleryItems.reverse());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLike = (id: string) => {
    GamificationEngine.toggleLike(id, name);
    loadData();
  };

  const renderLogicMapPreview = (jsonString: string) => {
     // (這部分保持不變)
     try {
       const data = JSON.parse(jsonString);
       const rootNode = data.nodes.find((n: any) => n.id === 'root');
       const nodeCount = data.nodes.length;
       return (
         <div className="flex flex-col gap-2 h-full justify-center items-center text-center opacity-80 group-hover:opacity-100 transition-opacity">
             <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-400 mb-1">
                 <GitGraph className="w-6 h-6" />
             </div>
             <div className="font-bold text-slate-700 text-sm">{rootNode?.data?.label || '未命名論題'}</div>
             <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                 共 {nodeCount} 個觀點節點
             </div>
         </div>
       );
     } catch (e) {
       return <span className="text-slate-400 text-xs italic">點擊查看完整邏輯圖...</span>;
     }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold font-serif text-slate-900 mb-4">文心藝廊</h1>
          {/* ...標題敘述... */}
        </header>

        {/* 👇 3. 放入 Modal 元件 */}
        <LogicMapModal 
            isOpen={!!viewingAsset}
            onClose={() => setViewingAsset(null)}
            title={viewingAsset?.title || ''}
            dataString={viewingAsset?.contentPreview || ''}
        />

        {/* ...資產列表... */}
        {assets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => {
              const isLikedByMe = asset.likedBy?.includes(name);

              return (
                <div key={asset.id} className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                  
                  {/* ...卡片上半部... */}
                  <div className={`h-2 ${asset.type === 'logic-map' ? 'bg-orange-500' : 'bg-indigo-500'}`}></div>
                  <div className="p-6 flex-1 flex flex-col">
                      {/* ...標題區... */}
                      <div className="flex items-center gap-2 mb-4 shrink-0">
                         {/* ... */}
                         <h3 className="font-bold text-slate-800 line-clamp-1">{asset.title}</h3>
                         {/* ... */}
                      </div>

                      {/* 👇 4. 點擊預覽區也可以觸發 Modal */}
                      <div 
                          onClick={() => asset.type === 'logic-map' && setViewingAsset(asset)}
                          className={`bg-slate-50 p-4 rounded-xl text-sm text-slate-600 font-serif leading-relaxed mb-4 flex-1 min-h-[120px] flex items-center justify-center ${asset.type === 'logic-map' ? 'cursor-pointer hover:bg-orange-50/50 transition' : ''}`}
                      >
                          {asset.type === 'logic-map' 
                              ? renderLogicMapPreview(asset.contentPreview) 
                              : <div className="line-clamp-4 w-full text-left">{asset.contentPreview}</div>
                          }
                      </div>
                  </div>

                  {/* 底部互動區 */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                      <div className="flex gap-2 text-xs font-medium text-slate-500">
                          {/* 👇 5. 綁定按鈕點擊事件 */}
                          {asset.type === 'logic-map' && (
                              <span 
                                onClick={() => setViewingAsset(asset)}
                                className="flex items-center gap-1 hover:text-indigo-600 cursor-pointer p-1 -ml-1"
                              >
                                <ZoomIn className="w-3 h-3"/> 查看詳情
                              </span>
                          )}
                      </div>
                      
                      {/* ...愛心按鈕... */}
                      <button onClick={() => handleLike(asset.id)} className="...">
                         {/* ... */}
                      </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}