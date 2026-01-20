import { AssetStatus } from "./gamification";

export interface StudentSummary {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number; // 連續登入天數
}

export interface LessonProgress {
  lessonId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  quizScore?: number; // 測驗分數
  quizWrongIds: string[]; // 錯題 ID 列表 (用於熱點分析)
  hasReflection: boolean; // 是否寫了反思
  hasLogicMap: boolean; // 是否畫了邏輯圖
  logicMapStatus?: AssetStatus; // 邏輯圖審核狀態
  annotationCount: number; // 筆記數量
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "高一仁班"
  code: string; // e.g. "WEN-101"
  semester: string; // e.g. "113-1"
  
  // 🔥 新增：班級擁有者 (導師) ID
  // 這讓我們可以區分不同老師的班級
  ownerId: string;

  students: StudentSummary[];
  // 記錄每個學生對每一課的進度：Record<StudentId, Record<LessonId, Progress>>
  progressMatrix: Record<string, Record<string, LessonProgress>>;
}