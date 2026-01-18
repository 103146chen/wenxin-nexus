// 🔥 新增 'reflection'
export type AssetType = 'annotation' | 'logic-map' | 'quiz-short' | 'reflection';

export type AssetStatus = 'draft' | 'pending' | 'verified' | 'rejected';

export interface StudentAsset {
  id: string;
  type: AssetType;
  title: string;
  contentPreview: string; // 反思內容
  authorId: string;
  authorName: string;
  
  targetText?: string; // 對應的課程 ID
  
  // 🔥 新增：擴充資料欄位 (用於存心情貼紙等 metadata)
  metadata?: {
    mood?: string;
    prompt?: string;
  };

  status: AssetStatus;
  feedback?: string;
  
  likes: number;
  likedBy: string[]; 

  stickers: {
    insightful: number;
    logical: number;
    creative: number;
  };
  
  createdAt: string;
}