'use client';

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUserStore } from "@/store/user-store";
import { useLessons } from "@/hooks/use-lessons";
import { Search, Filter, Loader2, Image as ImageIcon } from "lucide-react";
import AssetCard from "@/components/features/gallery/AssetCard";
import GalleryViewerModal from "@/components/features/gallery/GalleryViewerModal";
import { StudentAsset } from "@/lib/types/gamification";

export default function GalleryPage() {
  const { id: userId, toggleLike } = useUserStore();
  const { lessons } = useLessons();
  
  const [assets, setAssets] = useState<StudentAsset[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');
  const [viewingAsset, setViewingAsset] = useState<StudentAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 讀取 LocalStorage 中的真實資產
  const loadAssets = () => {
      try {
          const raw = localStorage.getItem('wenxin-assets-repository');
          if (raw) {
              const allAssets: StudentAsset[] = JSON.parse(raw);
              // 篩選條件：狀態為 verified 且類型為 logic-map
              const verified = allAssets.filter(a => 
                  a.status === 'verified' && a.type === 'logic-map'
              );
              setAssets(verified);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
      loadAssets();
      // 這裡可以加入 storage event listener 來實現跨分頁同步，但在 MVP 中手動觸發 state 更新即可
  }, []);

  const handleLike = (assetId: string) => {
      toggleLike(assetId);
      // Optimistic UI update: 本地直接更新狀態，讓使用者覺得很快
      setAssets(prev => prev.map(a => {
          if (a.id !== assetId) return a;
          const hasLiked = a.likedBy.includes(userId);
          return {
              ...a,
              likes: hasLiked ? a.likes - 1 : a.likes + 1,
              likedBy: hasLiked ? a.likedBy.filter(id => id !== userId) : [...a.likedBy, userId]
          };
      }));
  };

  // 篩選邏輯
  const filteredAssets = selectedLessonId === 'all' 
      ? assets 
      : assets.filter(a => {
          // 嘗試從 ID 或 targetText 判斷 lessonId
          const target = a.targetText || (a.id.match(/(lesson-\d+)/)?.[1]);
          return target === selectedLessonId;
      });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">佳作畫廊</h1>
                <p className="text-slate-600">觀摩同學的優秀作品，激發更多靈感。</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <Filter className="w-4 h-4 text-slate-400 ml-2" />
                <select 
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer pr-2"
                >
                    <option value="all">所有課程</option>
                    {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
            </div>
        </div>

        {/* Content */}
        {isLoading ? (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border border-slate-200 border-dashed">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">尚無展示作品</h3>
                <p className="text-slate-400 text-sm">只要作業獲得老師「通過」，就會出現在這裡喔！</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAssets.map(asset => (
                    <AssetCard 
                        key={asset.id} 
                        asset={asset} 
                        currentUserId={userId}
                        onLike={handleLike}
                        onClick={setViewingAsset}
                    />
                ))}
            </div>
        )}

        {/* Modal */}
        <GalleryViewerModal 
            asset={viewingAsset}
            isOpen={!!viewingAsset}
            onClose={() => setViewingAsset(null)}
        />

      </div>
    </div>
  );
}