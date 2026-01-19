// 🔥 新增 'reflection' 與 'annotation'
export type AssetType = 'annotation' | 'logic-map' | 'quiz-short' | 'reflection';

export type AssetStatus = 'draft' | 'pending' | 'verified' | 'rejected';

// 🔥 新增：閱讀註解介面 (用於互動式閱讀引擎)
export interface Annotation {
  id: string;
  lessonId: string;
  text: string; // 被選取的原文
  comment: string; // 註解內容 (如果是單純劃線可為空)
  color: 'yellow' | 'green' | 'pink' | 'purple'; // 螢光筆顏色
  type: 'teacher' | 'student'; // 區分來源
  createdAt: string;
}

export interface StudentAsset {
  id: string;
  type: AssetType;
  title: string;
  contentPreview: string; // 對於邏輯圖是 JSON string，對於反思是文字
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