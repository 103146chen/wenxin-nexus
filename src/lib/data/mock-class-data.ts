import { ClassRoom, LessonProgress, StudentSummary } from "@/lib/types/class-management";
import { ALL_LESSONS, getAllQuestions } from "./lessons";

// 隨機生成學生名單
const NAMES = [
  "李白", "杜甫", "王維", "白居易", "蘇軾", 
  "李清照", "辛棄疾", "歐陽脩", "韓愈", "柳宗元",
  "范仲淹", "王安石", "司馬光", "周敦頤", "朱熹"
];

// 🔥 新增：偽隨機函式 (Deterministic Random)
// 只要輸入相同的 seed，就會產生相同的 0~1 小數
const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

// 生成隨機進度 (使用 seed 確保一致性)
const generateProgress = (lessonId: string, seed: number): LessonProgress => {
  const lesson = ALL_LESSONS.find(l => l.id === lessonId);
  const allQuestions = lesson ? getAllQuestions(lesson) : [];
  const quizIds = allQuestions.map(q => q.id);
  
  const rand = seededRandom(seed); // 使用偽隨機
  
  // 30% 未開始
  if (rand < 0.3) {
    return {
      lessonId,
      status: 'not-started',
      quizWrongIds: [],
      hasReflection: false,
      hasLogicMap: false,
      annotationCount: 0
    };
  }
  
  // 20% 進行中
  if (rand < 0.5) {
    return {
      lessonId,
      status: 'in-progress',
      quizScore: Math.floor(seededRandom(seed + 1) * 3), // 0-2 分
      quizWrongIds: quizIds.slice(0, 2), // 隨機錯題
      hasReflection: seededRandom(seed + 2) > 0.5,
      hasLogicMap: false,
      logicMapStatus: 'pending',
      annotationCount: Math.floor(seededRandom(seed + 3) * 5)
    };
  }

  // 50% 已完成
  const score = Math.floor(seededRandom(seed + 4) * 3) + 3; // 3-5 分
  const wrongCount = 5 - score;
  const wrongIds = quizIds.slice(0, wrongCount); // 簡化錯題選取以保持穩定

  return {
    lessonId,
    status: 'completed',
    quizScore: score,
    quizWrongIds: wrongIds,
    hasReflection: true,
    hasLogicMap: true,
    logicMapStatus: seededRandom(seed + 5) > 0.8 ? 'verified' : 'pending',
    annotationCount: Math.floor(seededRandom(seed + 6) * 10) + 5
  };
};

export const MOCK_CLASSES: ClassRoom[] = [
  {
    id: 'class-101',
    name: '高一仁班',
    code: 'WEN-101',
    semester: '113-1',
    ownerId: 't-001',
    students: NAMES.map((name, idx) => ({
      id: `s-${idx}`,
      name,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${idx}`,
      // 🔥 修正：使用 idx 作為種子，確保數值固定
      level: Math.floor(seededRandom(idx * 100) * 10) + 1,
      xp: Math.floor(seededRandom(idx * 200) * 5000),
      streak: Math.floor(seededRandom(idx * 300) * 30)
    })),
    progressMatrix: {}
  },
  {
    id: 'class-102',
    name: '高一愛班',
    code: 'WEN-102',
    semester: '113-1',
    ownerId: 't-001',
    students: NAMES.slice(0, 10).map((name, idx) => ({
      id: `s2-${idx}`,
      name: name + " (愛)",
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=love-${idx}`,
      level: Math.floor(seededRandom(idx * 400) * 5) + 1,
      xp: Math.floor(seededRandom(idx * 500) * 2000),
      streak: Math.floor(seededRandom(idx * 600) * 10)
    })),
    progressMatrix: {}
  }
];

// 初始化 Progress Matrix
MOCK_CLASSES.forEach((cls, clsIdx) => {
  cls.students.forEach((student, stuIdx) => {
    cls.progressMatrix[student.id] = {};
    ALL_LESSONS.forEach((lesson, lessonIdx) => {
      // 組合唯一的種子
      const seed = clsIdx * 10000 + stuIdx * 100 + lessonIdx;
      cls.progressMatrix[student.id][lesson.id] = generateProgress(lesson.id, seed);
    });
  });
});