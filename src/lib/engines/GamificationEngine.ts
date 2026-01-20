import { useUserStore } from '@/store/user-store';
import { StudentAsset } from '@/lib/types/gamification';

const ASSETS_STORAGE_KEY = 'wenxin-assets-repository';

// 輔助函數：讀取資料
const loadAssets = (): StudentAsset[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(ASSETS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// 輔助函數：寫入資料
const saveAssets = (assets: StudentAsset[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
};

export const GamificationEngine = {
  
  // 1. 學生提交資產
  // 🔥 修正：Omit 加入 'votes' | 'votedBy'，避免前端報錯
  submitAsset: (asset: Omit<StudentAsset, 'status' | 'likes' | 'stickers' | 'createdAt' | 'likedBy' | 'votes' | 'votedBy'>) => {
    const assets = loadAssets();
    const existingIndex = assets.findIndex(a => a.id === asset.id);
    
    const newAsset: StudentAsset = {
      ...asset,
      status: 'pending',
      likes: 0,
      likedBy: [],
      // 🔥 修正：初始化投票欄位
      votes: 0,
      votedBy: [],
      stickers: { insightful: 0, logical: 0, creative: 0 },
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const oldAsset = assets[existingIndex];
      // 保留舊的互動數據
      newAsset.likes = oldAsset.likes;
      newAsset.likedBy = oldAsset.likedBy || [];
      // 🔥 修正：保留舊的投票數據
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
        useUserStore.getState().addXp(200);
        useUserStore.getState().addCoins(50);
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

  // 4. 取得畫廊資產 (已認證 + 非註釋)
  getGalleryAssets: () => {
    const assets = loadAssets();
    return assets.filter(a => a.status === 'verified' && a.type !== 'annotation');
  },
  
  // 5. 取得特定詞彙的社群註釋 (已認證 + 是註釋 + 同一個詞)
  getCommunityAnnotations: (targetText: string) => {
    const assets = loadAssets();
    return assets.filter(a => 
        a.status === 'verified' && 
        a.type === 'annotation' && 
        a.targetText === targetText
    );
  },

  // 6. 取得所有資產 (老師後台用)
  getAllAssets: (filterStatus?: string) => {
    const assets = loadAssets();
    if (filterStatus) return assets.filter(a => a.status === filterStatus);
    return assets;
  },

  // 7. 取得特定使用者的資產 (同步用)
  getMyAssets: (authorId: string) => {
    return loadAssets().filter(a => a.authorId === authorId);
  }
};