import { ClassRoom, LessonProgress, StudentSummary } from "@/lib/types/class-management";
import { ALL_LESSONS, getAllQuestions } from "./lessons";

const NAMES = [
  "李白", "杜甫", "王維", "白居易", "蘇軾", 
  "李清照", "辛棄疾", "歐陽脩", "韓愈", "柳宗元",
  "范仲淹", "王安石", "司馬光", "周敦頤", "朱熹"
];

// Seeded Random Helper
const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const generateProgress = (lessonId: string, seed: number): LessonProgress => {
  const lesson = ALL_LESSONS.find(l => l.id === lessonId);
  const allQuestions = lesson ? getAllQuestions(lesson) : [];
  const quizIds = allQuestions.map(q => q.id);
  
  const rand = seededRandom(seed);
  
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
  
  if (rand < 0.5) {
    return {
      lessonId,
      status: 'in-progress',
      quizScore: Math.floor(seededRandom(seed + 1) * 3), 
      quizWrongIds: quizIds.slice(0, 2), 
      hasReflection: seededRandom(seed + 2) > 0.5,
      hasLogicMap: false,
      logicMapStatus: 'pending',
      annotationCount: Math.floor(seededRandom(seed + 3) * 5)
    };
  }

  const score = Math.floor(seededRandom(seed + 4) * 3) + 3; 
  const wrongCount = 5 - score;
  const wrongIds = quizIds.slice(0, wrongCount);

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
  // Teacher 1: 孔子 (t-001)
  {
    id: 'class-101',
    name: '高一仁班',
    code: 'WEN-101',
    semester: '113-1',
    ownerId: 't-001', 
    students: NAMES.slice(0, 10).map((name, idx) => ({
      id: `s-${idx}`,
      name,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${idx}`,
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
    students: NAMES.slice(10, 15).map((name, idx) => ({
      id: `s2-${idx}`,
      name: name + " (愛)",
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=love-${idx}`,
      level: Math.floor(seededRandom(idx * 400) * 5) + 1,
      xp: Math.floor(seededRandom(idx * 500) * 2000),
      streak: Math.floor(seededRandom(idx * 600) * 10)
    })),
    progressMatrix: {}
  },
  
  // 🔥 新增 Teacher 2: 孟子 (t-002) 的班級
  {
    id: 'class-201',
    name: '高二信班 (孟)',
    code: 'MEN-201',
    semester: '113-1',
    ownerId: 't-002',
    students: [
        { id: 's-m-1', name: '墨子', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=mo', level: 8, xp: 4500, streak: 20 },
        { id: 's-m-2', name: '荀子', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=xun', level: 7, xp: 3200, streak: 15 },
        { id: 's-m-3', name: '韓非', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=han', level: 9, xp: 5100, streak: 25 },
        { id: 's-m-4', name: '莊周', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=zhuang', level: 6, xp: 2800, streak: 5 },
    ],
    progressMatrix: {}
  }
];

// 初始化 Progress Matrix
MOCK_CLASSES.forEach((cls, clsIdx) => {
  cls.students.forEach((student, stuIdx) => {
    cls.progressMatrix[student.id] = {};
    ALL_LESSONS.forEach((lesson, lessonIdx) => {
      const seed = clsIdx * 10000 + stuIdx * 100 + lessonIdx;
      cls.progressMatrix[student.id][lesson.id] = generateProgress(lesson.id, seed);
    });
  });
});