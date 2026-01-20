import { Heart, Eye, GitGraph, Star } from 'lucide-react';
import { StudentAsset } from '@/lib/types/gamification';

interface AssetCardProps {
  asset: StudentAsset;
  currentUserId: string;
  onLike: (id: string) => void;
  onVote: (id: string) => void;
  onClick: (asset: StudentAsset) => void;
}

export default function AssetCard({ asset, currentUserId, onLike, onVote, onClick }: AssetCardProps) {
  // 🔥 防呆 1：如果 asset 資料損毀，直接不渲染，防止整個頁面崩潰
  if (!asset) return null;

  // 🔥 防呆 2：給予預設值，防止舊資料缺少陣列欄位
  const likedBy = asset.likedBy || [];
  const votedBy = asset.votedBy || [];
  const likesCount = asset.likes || 0;
  const votesCount = asset.votes || 0;

  const isLiked = likedBy.includes(currentUserId);
  const isVoted = votedBy.includes(currentUserId);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition group cursor-pointer flex flex-col h-full relative">
      <div 
        className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center"
        onClick={() => onClick(asset)}
      >
        <div className="text-slate-300 transform group-hover:scale-110 transition duration-500">
            <GitGraph className="w-16 h-16 opacity-50" />
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
            <span className="bg-white/90 text-slate-800 px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition">
                <Eye className="w-3 h-3 inline mr-1"/> 查看作品
            </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{asset.title}</h3>
        
        <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600">
                {asset.authorName ? asset.authorName[0] : '?'}
            </div>
            <span className="text-xs text-slate-500">{asset.authorName || '未知作者'}</span>
        </div>

        <div className="mt-auto flex justify-between items-center border-t border-slate-100 pt-3 gap-2">
            <button 
                onClick={(e) => { e.stopPropagation(); onLike(asset.id); }}
                className={`flex-1 flex items-center justify-center gap-1 text-xs font-bold px-2 py-1.5 rounded-lg transition ${
                    isLiked ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
            >
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                {likesCount}
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); !isVoted && onVote(asset.id); }}
                disabled={isVoted}
                className={`flex-1 flex items-center justify-center gap-1 text-xs font-bold px-2 py-1.5 rounded-lg transition ${
                    isVoted ? 'bg-amber-100 text-amber-600 cursor-default' : 'bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600'
                }`}
                title={isVoted ? "已投過票" : "投下神聖一票 (不可取消)"}
            >
                <Star className={`w-3 h-3 ${isVoted ? 'fill-current' : ''}`} />
                {votesCount}
            </button>
        </div>
      </div>
    </div>
  );
}