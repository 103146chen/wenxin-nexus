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
  const { id: userId, toggleLike, voteForAsset } = useUserStore();
  const { lessons } = useLessons();
  
  const [assets, setAssets] = useState<StudentAsset[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');
  const [viewingAsset, setViewingAsset] = useState<StudentAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAssets = () => {
      try {
          const raw = localStorage.getItem('wenxin-assets-repository');
          if (raw) {
              const allAssets: StudentAsset[] = JSON.parse(raw);
              const verified = allAssets.filter(a => 
                  a && a.status === 'verified' && a.type === 'logic-map'
              );
              setAssets(verified);
          }
      } catch (e) { console.error(e); } 
      finally { setIsLoading(false); }
  };

  useEffect(() => { loadAssets(); }, []);

  const handleLike = (assetId: string) => {
      toggleLike(assetId);
      setAssets(prev => prev.map(a => {
          if (!a || a.id !== assetId) return a;
          const likedBy = a.likedBy || [];
          const hasLiked = likedBy.includes(userId);
          return {
              ...a,
              likes: hasLiked ? (a.likes || 0) - 1 : (a.likes || 0) + 1,
              likedBy: hasLiked ? likedBy.filter(id => id !== userId) : [...likedBy, userId]
          };
      }));
  };

  const handleVote = (assetId: string) => {
      if (confirm("✨ 確定要將您的票投給這個作品嗎？\n投票後無法取消，且會給予作者實質獎勵喔！")) {
          const success = voteForAsset(assetId);
          if (success) {
              setAssets(prev => prev.map(a => {
                  if (!a || a.id !== assetId) return a;
                  return {
                      ...a,
                      votes: (a.votes || 0) + 1,
                      votedBy: [...(a.votedBy || []), userId]
                  };
              }));
              alert("🎉 投票成功！");
          } else {
              alert("您已經投過票囉！");
          }
      }
  };

  const filteredAssets = (selectedLessonId === 'all' 
      ? assets 
      : assets.filter(a => {
          if (!a) return false;
          const target = a.targetText || (a.id.match(/(lesson-\d+)/)?.[1]);
          return target === selectedLessonId;
      })).filter(Boolean); // 🔥 最後一道防線：濾除所有 undefined/null

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">佳作畫廊</h1>
                <p className="text-slate-600">觀摩同學作品，投下神聖一票給予獎勵。</p>
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
                        onVote={handleVote}
                        onClick={setViewingAsset}
                    />
                ))}
            </div>
        )}

        <GalleryViewerModal 
            asset={viewingAsset}
            isOpen={!!viewingAsset}
            onClose={() => setViewingAsset(null)}
        />
      </div>
    </div>
  );
}