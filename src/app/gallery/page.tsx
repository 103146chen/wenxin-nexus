'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { GamificationEngine } from "@/lib/engines/GamificationEngine";
import { StudentAsset } from "@/lib/types/gamification";
import { useEffect, useState } from "react";
import { Heart, GitGraph, Quote } from "lucide-react";
import { useUserStore } from "@/store/user-store"; // 👈 1. 引入 Store

export default function GalleryPage() {
  const { name } = useUserStore(); // 👈 2. 取得目前使用者名稱 (作為 ID)
  const [assets, setAssets] = useState<StudentAsset[]>([]);

  // 載入資料 (只顯示已認證且非註釋的作品，或者是全部已認證作品，視你的需求而定)
  // 這裡假設畫廊主要展示「邏輯圖」和「創作」，如果是註釋通常在閱讀器內看
  // 但如果你想在畫廊也秀出精彩註釋，也可以拿掉 filter
  const loadData = () => {
    const galleryItems = GamificationEngine.getGalleryAssets();
    setAssets(galleryItems.reverse());
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔥 3. 修改按讚邏輯：改用 toggleLike 並傳入使用者 ID
  const handleLike = (id: string) => {
    GamificationEngine.toggleLike(id, name);
    loadData(); // 重新載入以更新 UI (愛心變色、數字變動)
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold font-serif text-slate-900 mb-4">文心藝廊</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            欣賞同學們的精彩創作，互相觀摩學習。每一個讚，都是對創作者的鼓勵。
          </p>
        </header>

        {assets.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
             <p>目前還沒有作品被展出，趕快去提交你的第一份作業吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => {
              // 🔥 4. 判斷我是否按過讚
              const isLikedByMe = asset.likedBy?.includes(name);

              return (
                <div key={asset.id} className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  
                  {/* 卡片頂部裝飾 */}
                  <div className={`h-2 ${asset.type === 'logic-map' ? 'bg-orange-500' : 'bg-indigo-500'}`}></div>
                  
                  <div className="p-6 flex-1">
                      <div className="flex items-center gap-2 mb-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${asset.type === 'logic-map' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                              {asset.type === 'logic-map' ? <GitGraph className="w-4 h-4"/> : <Quote className="w-4 h-4"/>}
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-800 line-clamp-1">{asset.title}</h3>
                              <p className="text-xs text-slate-500">作者：{asset.authorName}</p>
                          </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 font-serif leading-relaxed mb-4 min-h-[80px] line-clamp-3">
                          {asset.type === 'logic-map' 
                              ? <span className="text-slate-400 italic">點擊查看完整邏輯圖結構...</span> 
                              : asset.contentPreview
                          }
                      </div>
                  </div>

                  {/* 底部互動區 */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex gap-2 text-xs font-medium text-slate-500">
                          {/* 這裡未來可以放貼紙統計 */}
                      </div>
                      
                      {/* 🔥 5. 根據按讚狀態改變按鈕樣式 */}
                      <button 
                          onClick={() => handleLike(asset.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full transition active:scale-95 ${
                            isLikedByMe 
                              ? 'bg-rose-50 border-rose-200 text-rose-600' 
                              : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
                          }`}
                      >
                          <Heart className={`w-4 h-4 ${isLikedByMe ? 'fill-current' : ''}`} />
                          <span className="font-bold">{asset.likes}</span>
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