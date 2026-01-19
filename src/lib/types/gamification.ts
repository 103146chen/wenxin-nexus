// 🔥 新增 'reflection' 與 'annotation'
export type AssetType = 'annotation' | 'logic-map' | 'quiz-short' | 'reflection';

export type AssetStatus = 'draft' | 'pending' | 'verified' | 'rejected';

// 閱讀註解介面
export interface Annotation {
  id: string;
  lessonId: string;
  text: string; // 被選取的原文
  
  // 🔥 新增：精確定位用 (解決一字多義問題)
  startIndex: number;
  
  comment: string; // 註解內容
  color: 'yellow' | 'green' | 'pink' | 'purple'; // 螢光筆顏色
  type: 'teacher' | 'student'; // 區分來源
  createdAt: string;
}

export interface StudentAsset {
  id: string;
  type: AssetType;
  title: string;
  contentPreview: string; 
  authorId: string;
  authorName: string;
  
  targetText?: string; 
  
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