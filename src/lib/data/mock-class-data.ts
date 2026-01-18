import { ClassRoom, LessonProgress } from "@/lib/types/class-management";
import { ALL_LESSONS } from "./lessons";

const STUDENT_NAMES = [
  "李白", "杜甫", "王維", "白居易", "蘇軾", "歐陽修", "韓愈", "柳宗元", 
  "李清照", "辛棄疾", "陸游", "范仲淹", "王安石", "曾鞏", "蘇洵", "蘇轍",
  "陶淵明", "孟浩然", "杜牧", "李商隱", "曹操", "曹植", "屈原", "司馬遷",
  "張愛玲", "魯迅", "徐志摩", "林徽因", "余光中", "鄭愁予"
];

// 🔥 優化：根據真實課程產生進度
const generateProgress = (lessonId: string): LessonProgress => {
  const lesson = ALL_LESSONS.find(l => l.id === lessonId);
  const quizIds = lesson?.quizzes.map(q => q.id) || [];
  
  const rand = Math.random();
  
  // 20% 未開始
  if (rand < 0.2) {
    return { lessonId, status: 'not-started', hasReflection: false, hasLogicMap: false, quizWrongIds: [] };
  }
  
  // 20% 進行中
  if (rand < 0.4) {
    return { lessonId, status: 'in-progress', hasReflection: false, hasLogicMap: false, quizWrongIds: [] };
  }

  // 60% 已完成
  // 模擬錯題：隨機從題庫中挑選 0~3 題作為錯題
  const wrongCount = Math.floor(Math.random() * 3); // 0, 1, 2
  const shuffled = [...quizIds].sort(() => 0.5 - Math.random());
  const wrongIds = shuffled.slice(0, wrongCount);
  
  const score = quizIds.length - wrongIds.length;

  return {
    lessonId,
    status: 'completed',
    quizScore: score,
    quizWrongIds: wrongIds,
    hasReflection: Math.random() > 0.3, 
    hasLogicMap: Math.random() > 0.5,   
    logicMapStatus: Math.random() > 0.8 ? 'verified' : Math.random() > 0.5 ? 'pending' : 'draft'
  };
};

export const MOCK_CLASSES: ClassRoom[] = [
  {
    id: 'class-101',
    name: '高一仁班 (國文)',
    code: 'WEN-101',
    semester: '113-1',
    students: STUDENT_NAMES.slice(0, 15).map((name, i) => ({
      id: `s-${i}`,
      name,
      avatar: 'scholar_m',
      level: Math.floor(Math.random() * 10) + 1,
      xp: Math.floor(Math.random() * 5000),
      streak: Math.floor(Math.random() * 30),
    })),
    progressMatrix: {}
  },
  {
    id: 'class-102',
    name: '高一智班 (國文)',
    code: 'WEN-102',
    semester: '113-1',
    students: STUDENT_NAMES.slice(15, 30).map((name, i) => ({
      id: `s-${i+15}`,
      name,
      avatar: 'scholar_f',
      level: Math.floor(Math.random() * 10) + 1,
      xp: Math.floor(Math.random() * 5000),
      streak: Math.floor(Math.random() * 30),
    })),
    progressMatrix: {}
  }
];

// 填充進度矩陣
MOCK_CLASSES.forEach(cls => {
  cls.students.forEach(stu => {
    cls.progressMatrix[stu.id] = {};
    ALL_LESSONS.forEach(lesson => {
      cls.progressMatrix[stu.id][lesson.id] = generateProgress(lesson.id);
    });
  });
});