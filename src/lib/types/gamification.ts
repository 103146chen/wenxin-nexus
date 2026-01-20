// 🔥 新增 'reflection' 與 'annotation'
export type AssetType = 'annotation' | 'logic-map' | 'quiz-short' | 'reflection';

export type AssetStatus = 'draft' | 'pending' | 'verified' | 'rejected';

// 閱讀註解介面
export interface Annotation {
  id: string;
  lessonId: string;
  text: string; // 被選取的原文
  
  // 精確定位用
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
  
  // 教師核可獎勵是否已領取
  isRewardClaimed?: boolean; 
  
  // 社交互動
  likes: number;
  likedBy: string[]; 

  // 🔥 新增：投票機制 (與獎勵掛鉤)
  votes: number;
  votedBy: string[]; // 記錄誰投過票，防止重複/取消

  stickers: {
    insightful: number;
    logical: number;
    creative: number;
  };
  
  createdAt: string;
}