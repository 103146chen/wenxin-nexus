import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_CLASSES } from '@/lib/data/mock-class-data';
import { Annotation } from '@/lib/types/gamification';
import { DAILY_ARTICLES } from '@/lib/data/daily-articles';

export type UserRole = 'student' | 'teacher' | 'guest';

export interface DailyProgress {
    articleId: string;
    isCompleted: boolean;
    hasError: boolean; // 是否曾經答錯 (影響 Bonus)
}

interface UserState {
  // ... (原有欄位)
  id: string;
  name: string;
  title: string;
  avatar: string;
  level: number;
  xp: number;
  maxXp: number;
  coins: number;
  sp: number;
  unlockedSkills: string[];
  inventory: { itemId: string; count: number }[];
  skillCooldowns: Record<string, number>;
  activeTheme: string;
  activeFrame: string;
  
  // 連勝相關
  streakDays: number;
  lastCompletedDate: string; // 上次「完成全套任務」的日期
  streakStatus: 'active' | 'broken' | 'repaired'; // 狀態機

  // 每日任務
  dailyMission: {
      date: string;
      progress: DailyProgress[];
      isRewardClaimed: boolean;
  };

  aiDailyUsage: number;
  aiMaxDailyFree: number;
  quizRecords: Record<string, any>;
  annotations: Record<string, Annotation[]>;
  classId: string | null;
  isLoggedIn: boolean;
  role: UserRole;

  // Actions
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  updateProfile: (name: string) => void;
  unlockSkill: (skillId: string, cost: number) => boolean;
  buyItem: (itemId: string, price: number) => boolean;
  useItem: (itemId: string) => boolean;
  equipItem: (itemId: string, category: 'theme' | 'avatar') => void;
  activateSkill: (skillId: string, cooldownHours: number) => boolean;
  updateQuizRecord: (lessonId: string, score: number, wrongIds: string[], isFirstTime: boolean) => void;
  correctMistake: (lessonId: string, questionId: string) => void;
  addAnnotation: (lessonId: string, annotation: Omit<Annotation, 'id' | 'createdAt' | 'type'>) => void;
  removeAnnotation: (lessonId: string, id: string) => void;
  joinClass: (code: string) => boolean;
  login: (role: UserRole, username?: string, userId?: string) => void;
  logout: () => void;
  toggleLike: (assetId: string) => void;
  voteForAsset: (assetId: string) => boolean; 
  checkAndClaimRewards: () => any;
  consumeAiQuota: () => 'success' | 'limit_reached' | 'paid_success';

  // 🔥 每日任務與連勝 Actions
  checkStreakStatus: () => void; // 檢查是否斷簽
  repairStreak: () => boolean;   // 使用道具補簽
  acceptStreakBreak: () => void; // 接受斷簽 (歸零)
  
  markArticleError: (articleId: string) => void;
  completeDailyArticle: (articleId: string, isPerfect: boolean) => void;
  claimDailyMissionReward: () => void;
}

const calculateLevelFromXp = (xp: number) => Math.floor(0.1 * Math.sqrt(xp)) || 1;
const calculateXpForNextLevel = (currentLevel: number) => Math.pow((currentLevel + 1) * 10, 2);

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Init
      id: 's-0',
      isLoggedIn: true, 
      role: 'student', 
      name: '李白',
      title: '詩仙',
      avatar: 'scholar_m',
      classId: 'class-101', 
      level: 5,
      xp: 2500,
      maxXp: 3600,
      coins: 800,
      sp: 2, 
      unlockedSkills: [],
      inventory: [{ itemId: 'streak-freeze', count: 1 }], // 預設給一張補簽卡測試
      skillCooldowns: {}, 
      activeTheme: 'default',
      activeFrame: 'default',
      
      streakDays: 5, // 預設 5 天連勝
      lastCompletedDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 故意設為前天，模擬斷簽
      streakStatus: 'active',

      dailyMission: {
          date: new Date().toISOString().split('T')[0],
          progress: [],
          isRewardClaimed: false
      },
      aiDailyUsage: 0,
      aiMaxDailyFree: 10,
      quizRecords: {},
      annotations: {}, 
      lifetimeVotesClaimed: 0,
      lastLoginDate: new Date().toISOString().split('T')[0],

      // ... (Standard Actions) ...
      addXp: (amount) => { 
          const { xp, level, coins, sp } = get();
          const newXp = xp + amount;
          const newLevel = calculateLevelFromXp(newXp);
          let newCoins = coins;
          let newSp = sp;
          if (newLevel > level) {
            newCoins += 100;
            newSp += 1; 
            alert(`🎉 恭喜升級 Lv.${newLevel}！\n獲得 100 文心幣 與 1 技能點 (SP)`);
          }
          set({ xp: newXp, level: newLevel, maxXp: calculateXpForNextLevel(newLevel), coins: newCoins, sp: newSp });
      },
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      updateProfile: (name) => set({ name }),
      unlockSkill: (skillId, cost) => {
        const { sp, unlockedSkills } = get();
        if (sp >= cost && !unlockedSkills.includes(skillId)) {
          set({ sp: sp - cost, unlockedSkills: [...unlockedSkills, skillId] });
          return true;
        }
        return false;
      },
      buyItem: (itemId, price) => {
        const { coins, inventory } = get();
        if (coins >= price) {
          const idx = inventory.findIndex(i => i.itemId === itemId);
          let newInv = [...inventory];
          if (idx >= 0) newInv[idx].count += 1;
          else newInv.push({ itemId, count: 1 });
          set({ coins: coins - price, inventory: newInv });
          return true;
        }
        return false;
      },
      useItem: (itemId) => {
        const { inventory } = get();
        const idx = inventory.findIndex(i => i.itemId === itemId);
        if (idx >= 0 && inventory[idx].count > 0) {
            const newInv = [...inventory];
            newInv[idx].count -= 1;
            if (newInv[idx].count === 0) newInv.splice(idx, 1);
            set({ inventory: newInv });
            return true;
        }
        return false;
      },
      equipItem: (itemId, category) => {
          if (category === 'theme') set({ activeTheme: itemId });
          else if (category === 'avatar') set({ activeFrame: itemId });
      },
      activateSkill: (skillId, cooldownHours) => {
          const { skillCooldowns } = get();
          const lastUsed = skillCooldowns[skillId] || 0;
          const now = Date.now();
          if (now - lastUsed >= cooldownHours * 3600000) {
              set({ skillCooldowns: { ...skillCooldowns, [skillId]: now } });
              return true;
          }
          return false;
      },
      updateQuizRecord: (lessonId, score, wrongIds, isFirstTime) => { /*...*/ },
      correctMistake: (lessonId, questionId) => { /*...*/ },
      addAnnotation: (lessonId, ann) => { /*...*/ },
      removeAnnotation: (lessonId, id) => { /*...*/ },
      joinClass: (code) => { /*...*/ return true; },
      logout: () => { set({ isLoggedIn: false, role: 'guest', classId: null, id: '' }); },
      toggleLike: (assetId) => { /*...*/ },
      voteForAsset: (assetId) => { /*...*/ return false; }, 
      checkAndClaimRewards: () => { /*...*/ return { verificationCount: 0, voteCount: 0, totalCoins: 0, totalXp: 0 }; },
      consumeAiQuota: () => { /*...*/ return 'success'; },

      login: (role, username, userId) => {
          const today = new Date().toISOString().split('T')[0];
          const { dailyMission } = get();
          const isNewDay = dailyMission.date !== today;
          
          // Login logic
          const isTeacher = role === 'teacher';
          let targetId = userId || (isTeacher ? 't-001' : 's-0');
          let targetName = username || (isTeacher ? '孔丘' : '李白');
          let targetClassId = isTeacher ? null : 'class-101';
          let targetAvatar = isTeacher ? (targetId === 't-001' ? 'scholar_m' : 'scholar_f') : 'scholar_f';
          let targetLevel = 1;

          if (!isTeacher && userId) {
              const foundClass = MOCK_CLASSES.find(c => c.students.some(s => s.id === userId));
              const foundStudent = foundClass?.students.find(s => s.id === userId);
              if (foundClass && foundStudent) {
                  targetClassId = foundClass.id;
                  targetAvatar = foundStudent.avatar;
                  targetLevel = foundStudent.level;
                  targetName = foundStudent.name;
              }
          }

          set({ 
              isLoggedIn: true, 
              role: role,
              id: targetId,
              name: targetName,
              avatar: targetAvatar,
              title: isTeacher ? '至聖先師' : '詩仙',
              classId: targetClassId,
              level: targetLevel,
              // 若跨日，初始化新任務
              dailyMission: isNewDay ? { 
                  date: today, 
                  progress: DAILY_ARTICLES.map(a => ({ articleId: a.id, isCompleted: false, hasError: false })),
                  isRewardClaimed: false 
              } : dailyMission,
              // 重置 AI 配額
              aiDailyUsage: isNewDay ? 0 : get().aiDailyUsage
          });
          
          // 登入時不檢查連勝，改由頁面觸發 checkStreakStatus，以免登入流程太卡
      },

      // 🔥 連勝邏輯：檢查是否斷簽
      checkStreakStatus: () => {
          const { lastCompletedDate, streakDays, dailyMission } = get();
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const todayStr = today.toISOString().split('T')[0];

          // 如果上次完成日是昨天，或者今天(已完成)，則連勝安全
          if (lastCompletedDate === yesterdayStr || lastCompletedDate === todayStr) {
              set({ streakStatus: 'active' });
              return;
          }

          // 如果上次完成日更早，且 streakDays > 0，則斷簽
          if (lastCompletedDate < yesterdayStr && streakDays > 0) {
              set({ streakStatus: 'broken' });
          }
      },

      // 🔥 連勝邏輯：補簽
      repairStreak: () => {
          const { inventory } = get();
          const freezeCardIdx = inventory.findIndex(i => i.itemId === 'streak-freeze');
          
          if (freezeCardIdx >= 0 && inventory[freezeCardIdx].count > 0) {
              // 消耗道具
              const newInv = [...inventory];
              newInv[freezeCardIdx].count -= 1;
              if (newInv[freezeCardIdx].count === 0) newInv.splice(freezeCardIdx, 1);
              
              // 修復連勝 (將上次完成日強行改為昨天，這樣今天完成後就會 +1)
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              
              set({ 
                  inventory: newInv,
                  lastCompletedDate: yesterday.toISOString().split('T')[0],
                  streakStatus: 'repaired'
              });
              return true;
          }
          return false;
      },

      // 🔥 連勝邏輯：接受斷簽
      acceptStreakBreak: () => {
          set({ streakDays: 0, streakStatus: 'active' });
      },

      markArticleError: (articleId) => {
          const { dailyMission } = get();
          const newProgress = dailyMission.progress.map(p => 
              p.articleId === articleId ? { ...p, hasError: true } : p
          );
          if (!dailyMission.progress.find(p => p.articleId === articleId)) {
              newProgress.push({ articleId, isCompleted: false, hasError: true });
          }
          set({ dailyMission: { ...dailyMission, progress: newProgress } });
      },

      completeDailyArticle: (articleId, isPerfect) => {
          const { dailyMission, addCoins, addXp } = get();
          const progressItem = dailyMission.progress.find(p => p.articleId === articleId) || { articleId, isCompleted: false, hasError: false };
          
          if (!progressItem.isCompleted) {
              const baseXp = 50;
              const bonus = isPerfect && !progressItem.hasError; 
              const finalXp = bonus ? Math.floor(baseXp * 1.2) : baseXp;
              
              addXp(finalXp);
              if (bonus) addCoins(20);

              const newProgress = dailyMission.progress.map(p => 
                  p.articleId === articleId ? { ...p, isCompleted: true } : p
              );
              if (!dailyMission.progress.find(p => p.articleId === articleId)) {
                  newProgress.push({ articleId, isCompleted: true, hasError: false });
              }

              set({ dailyMission: { ...dailyMission, progress: newProgress } });
              
              if (bonus) alert('🎉 完美通關！獲得 1.2倍 經驗值加成與 20 金幣！');
              else alert('👍 完成閱讀！獲得 50 XP。');
          }
      },

      claimDailyMissionReward: () => {
          const { dailyMission, addCoins, streakDays } = get();
          const today = new Date().toISOString().split('T')[0];
          
          const allCompleted = DAILY_ARTICLES.every(a => 
              dailyMission.progress.find(p => p.articleId === a.id)?.isCompleted
          );

          if (allCompleted && !dailyMission.isRewardClaimed) {
              addCoins(100);
              set({ 
                  dailyMission: { ...dailyMission, isRewardClaimed: true },
                  streakDays: streakDays + 1,
                  lastCompletedDate: today, // 更新最後完成日
                  streakStatus: 'active'
              });
              alert(`🔥 簽到成功！連勝天數：${streakDays + 1} 天\n獲得 100 文心幣大紅包！`);
          }
      }
    }),
    { name: 'wenxin-user-storage' }
  )
);