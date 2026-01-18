export type AssetType = 'annotation' | 'logic-map' | 'reflection';

export type AssetStatus = 'draft' | 'pending' | 'verified' | 'rejected';

export interface StudentAsset {
  id: string;
  type: AssetType;
  title: string;
  contentPreview: string;
  authorId: string;
  authorName: string;
  
  // 🔥 新增：針對的原文 (用來讓大家在同一個詞看到彼此的註釋)
  targetText?: string; 
  
  status: AssetStatus;
  feedback?: string;
  
  likes: number;
  // 🔥 新增：記錄按讚的人 (Array of authorId)，用來防止重複按讚
  likedBy: string[]; 

  stickers: {
    insightful: number;
    logical: number;
    creative: number;
  };
  
  createdAt: string;
}