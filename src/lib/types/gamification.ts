// 🔥 新增 'quiz-short'
export type AssetType = 'annotation' | 'logic-map' | 'reflection' | 'quiz-short';

export type AssetStatus = 'draft' | 'pending' | 'verified' | 'rejected';

export interface StudentAsset {
  id: string;
  type: AssetType;
  title: string;
  contentPreview: string; // 簡答題內容
  authorId: string;
  authorName: string;
  
  targetText?: string; 
  
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