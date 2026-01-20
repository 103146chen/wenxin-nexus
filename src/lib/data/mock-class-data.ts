import { ClassRoom, LessonProgress, StudentSummary } from "@/lib/types/class-management";
import { ALL_LESSONS, getAllQuestions } from "./lessons"; // 🔥 引入 getAllQuestions

// 隨機生成學生名單
const NAMES = [
  "李白", "杜甫", "王維", "白居易", "蘇軾", 
  "李清照", "辛棄疾", "歐陽脩", "韓愈", "柳宗元",
  "范仲淹", "王安石", "司馬光", "周敦頤", "朱熹"
];

// 生成隨機進度
const generateProgress = (lessonId: string): LessonProgress => {
  const lesson = ALL_LESSONS.find(l => l.id === lessonId);
  // 🔥 修正：使用 Helper 取得所有題目，避免存取不存在的 .quizzes
  const allQuestions = lesson ? getAllQuestions(lesson) : [];
  const quizIds = allQuestions.map(q => q.id);
  
  const rand = Math.random();
  
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
      quizScore: Math.floor(Math.random() * 3), // 0-2 分
      quizWrongIds: quizIds.slice(0, 2), // 隨機錯題
      hasReflection: Math.random() > 0.5,
      hasLogicMap: false,
      logicMapStatus: 'pending',
      annotationCount: Math.floor(Math.random() * 5)
    };
  }

  // 50% 已完成
  const score = Math.floor(Math.random() * 3) + 3; // 3-5 分
  // 隨機產生錯題 ID
  const wrongCount = 5 - score;
  const wrongIds = quizIds.sort(() => 0.5 - Math.random()).slice(0, wrongCount);

  return {
    lessonId,
    status: 'completed',
    quizScore: score,
    quizWrongIds: wrongIds,
    hasReflection: true,
    hasLogicMap: true,
    logicMapStatus: Math.random() > 0.8 ? 'verified' : 'pending',
    annotationCount: Math.floor(Math.random() * 10) + 5
  };
};

export const MOCK_CLASSES: ClassRoom[] = [
  {
    id: 'class-101',
    name: '高一仁班',
    code: 'WEN-101',
    semester: '113-1',
    ownerId: 't-001', // 預設導師 ID
    students: NAMES.map((name, idx) => ({
      id: `s-${idx}`,
      name,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${idx}`,
      level: Math.floor(Math.random() * 10) + 1,
      xp: Math.floor(Math.random() * 5000),
      streak: Math.floor(Math.random() * 30)
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
      level: Math.floor(Math.random() * 5) + 1,
      xp: Math.floor(Math.random() * 2000),
      streak: Math.floor(Math.random() * 10)
    })),
    progressMatrix: {}
  }
];

// 初始化 Progress Matrix
MOCK_CLASSES.forEach(cls => {
  cls.students.forEach(student => {
    cls.progressMatrix[student.id] = {};
    ALL_LESSONS.forEach(lesson => {
      cls.progressMatrix[student.id][lesson.id] = generateProgress(lesson.id);
    });
  });
});