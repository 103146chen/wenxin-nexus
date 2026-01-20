import { useUserStore } from '@/store/user-store';
import { StudentAsset } from '@/lib/types/gamification';

const ASSETS_STORAGE_KEY = 'wenxin-assets-repository';

const loadAssets = (): StudentAsset[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(ASSETS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveAssets = (assets: StudentAsset[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
};

export const GamificationEngine = {
  
  // 1. 學生提交資產
  // 🔥 修正：Omit 列表中必須加入 'votes' | 'votedBy'，否則前端呼叫時會報錯
  submitAsset: (asset: Omit<StudentAsset, 'status' | 'likes' | 'stickers' | 'createdAt' | 'likedBy' | 'votes' | 'votedBy' | 'isRewardClaimed'>) => {
    const assets = loadAssets();
    const existingIndex = assets.findIndex(a => a.id === asset.id);
    
    const newAsset: StudentAsset = {
      ...asset,
      status: 'pending',
      likes: 0,
      likedBy: [],
      // 🔥 修正：初始化投票相關欄位
      votes: 0,
      votedBy: [],
      stickers: { insightful: 0, logical: 0, creative: 0 },
      createdAt: new Date().toISOString(),
      isRewardClaimed: false
    };

    if (existingIndex >= 0) {
      const oldAsset = assets[existingIndex];
      // 保留舊的互動數據
      newAsset.likes = oldAsset.likes;
      newAsset.likedBy = oldAsset.likedBy || [];
      newAsset.votes = oldAsset.votes || 0;
      newAsset.votedBy = oldAsset.votedBy || [];
      
      assets[existingIndex] = newAsset;
    } else {
      assets.push(newAsset);
    }
    
    saveAssets(assets);
    useUserStore.getState().addXp(10);
    return newAsset;
  },

  // 2. 老師審核
  teacherReview: (assetId: string, action: 'verify' | 'reject', feedback?: string) => {
    const assets = loadAssets();
    const asset = assets.find(a => a.id === assetId);
    
    if (asset && asset.status === 'pending') {
      if (action === 'verify') {
        asset.status = 'verified';
        // 注意：老師核可時的獎勵現在改由 user-store 的 checkAndClaimRewards 統一發放，這裡只給少量即時回饋或移除
        // useUserStore.getState().addXp(200); 
      } else {
        asset.status = 'rejected';
        asset.feedback = feedback || '請再檢查一下內容喔！';
      }
      saveAssets(assets);
      return true;
    }
    return false;
  },

  // 3. 社交按讚
  toggleLike: (assetId: string, userId: string) => {
    const assets = loadAssets();
    const asset = assets.find(a => a.id === assetId);
    
    if (asset) {
      if (!asset.likedBy) asset.likedBy = [];

      const hasLiked = asset.likedBy.includes(userId);

      if (hasLiked) {
        asset.likedBy = asset.likedBy.filter(id => id !== userId);
        asset.likes = Math.max(0, asset.likes - 1);
      } else {
        asset.likedBy.push(userId);
        asset.likes += 1;
      }
      saveAssets(assets);
      return asset.likes;
    }
    return 0;
  },

  // 4. 取得畫廊資產
  getGalleryAssets: () => {
    const assets = loadAssets();
    return assets.filter(a => a.status === 'verified' && a.type !== 'annotation');
  },
  
  // 5. 社群註釋
  getCommunityAnnotations: (targetText: string) => {
    const assets = loadAssets();
    return assets.filter(a => 
        a.status === 'verified' && 
        a.type === 'annotation' && 
        a.targetText === targetText
    );
  },

  // 6. 取得所有資產
  getAllAssets: (filterStatus?: string) => {
    const assets = loadAssets();
    if (filterStatus) return assets.filter(a => a.status === filterStatus);
    return assets;
  },

  // 7. 取得特定使用者的資產
  getMyAssets: (authorId: string) => {
    return loadAssets().filter(a => a.authorId === authorId);
  }
};