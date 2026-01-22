import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_CLASSES } from '@/lib/data/mock-class-data';
import { Annotation } from '@/lib/types/gamification';
import { DAILY_ARTICLES } from '@/lib/data/daily-articles';

export type UserRole = 'student' | 'teacher' | 'guest';

export interface DailyProgress {
    articleId: string;
    isCompleted: boolean;
    hasError: boolean;
}

// 定義需要隨使用者切換的資料欄位
interface UserSpecificData {
    level: number;
    xp: number;
    coins: number;
    sp: number;
    unlockedSkills: string[];
    inventory: { itemId: string; count: number }[];
    skillCooldowns: Record<string, number>;
    activeTheme: string;
    activeFrame: string;
    streakDays: number;
    lastCompletedDate: string;
    streakStatus: 'active' | 'broken' | 'repaired';
    dailyMission: {
        date: string;
        progress: DailyProgress[];
        isRewardClaimed: boolean;
    };
    aiDailyUsage: number;
    quizRecords: Record<string, any>;
    annotations: Record<string, Annotation[]>;
    lifetimeVotesClaimed: number;
    lastLoginDate: string;
}

// 預設值產生器
const getDefaultUserData = (): UserSpecificData => ({
    level: 1,
    xp: 0,
    coins: 0,
    sp: 0,
    unlockedSkills: [],
    inventory: [],
    skillCooldowns: {},
    activeTheme: 'default',
    activeFrame: 'default',
    streakDays: 0,
    lastCompletedDate: '',
    streakStatus: 'active',
    dailyMission: {
        date: new Date().toISOString().split('T')[0],
        progress: [],
        isRewardClaimed: false
    },
    aiDailyUsage: 0,
    quizRecords: {},
    annotations: {},
    lifetimeVotesClaimed: 0,
    lastLoginDate: new Date().toISOString().split('T')[0],
});

interface UserState extends UserSpecificData {
  // Global State (Current Session)
  id: string;
  name: string;
  title: string;
  avatar: string;
  classId: string | null;
  isLoggedIn: boolean;
  role: UserRole;
  
  // 資料庫：儲存所有使用者的資料
  usersData: Record<string, UserSpecificData>; 
  aiMaxDailyFree: number;

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

  checkStreakStatus: () => void;
  repairStreak: () => boolean;
  acceptStreakBreak: () => void;
  markArticleError: (articleId: string) => void;
  completeDailyArticle: (articleId: string, isPerfect: boolean) => void;
  claimDailyMissionReward: () => void;
}

const calculateLevelFromXp = (xp: number) => Math.floor(0.1 * Math.sqrt(xp)) || 1;
const calculateXpForNextLevel = (currentLevel: number) => Math.pow((currentLevel + 1) * 10, 2);

// 🔥 核心修復：從 State 中乾淨地提取 UserData，避免將 Function 存入 DB
const extractUserData = (state: UserState): UserSpecificData => ({
    level: state.level,
    xp: state.xp,
    coins: state.coins,
    sp: state.sp,
    unlockedSkills: state.unlockedSkills,
    inventory: state.inventory,
    skillCooldowns: state.skillCooldowns,
    activeTheme: state.activeTheme,
    activeFrame: state.activeFrame,
    streakDays: state.streakDays,
    lastCompletedDate: state.lastCompletedDate,
    streakStatus: state.streakStatus,
    dailyMission: state.dailyMission,
    aiDailyUsage: state.aiDailyUsage,
    quizRecords: state.quizRecords,
    annotations: state.annotations,
    lifetimeVotesClaimed: state.lifetimeVotesClaimed,
    lastLoginDate: state.lastLoginDate,
});

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // ... 展開預設值 ...
      ...getDefaultUserData(),
      
      id: 's-0',
      isLoggedIn: false, 
      role: 'guest', 
      name: '訪客',
      title: '',
      avatar: '',
      classId: null, 
      
      usersData: {}, 
      aiMaxDailyFree: 10,

      // --- Actions ---
      
      addXp: (amount) => { 
          const state = get();
          const newXp = state.xp + amount;
          const newLevel = calculateLevelFromXp(newXp);
          let newCoins = state.coins;
          let newSp = state.sp;
          
          if (newLevel > state.level) {
            newCoins += 100;
            newSp += 1; 
            alert(`🎉 恭喜升級 Lv.${newLevel}！\n獲得 100 文心幣 與 1 技能點 (SP)`);
          }
          
          const updates = { xp: newXp, level: newLevel, maxXp: calculateXpForNextLevel(newLevel), coins: newCoins, sp: newSp };
          set(updates);
          
          // Sync using extractor
          set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
      },

      addCoins: (amount) => {
          set(state => ({ coins: state.coins + amount }));
          set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
      },

      updateProfile: (name) => set({ name }),
      
      unlockSkill: (skillId, cost) => {
        const { sp, unlockedSkills } = get();
        if (sp >= cost && !unlockedSkills.includes(skillId)) {
          set({ sp: sp - cost, unlockedSkills: [...unlockedSkills, skillId] });
          set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
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
          set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
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
            set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
            return true;
        }
        return false;
      },

      equipItem: (itemId, category) => {
          if (category === 'theme') set({ activeTheme: itemId });
          else if (category === 'avatar') set({ activeFrame: itemId });
          set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
      },

      activateSkill: (skillId, cooldownHours) => {
          const { skillCooldowns } = get();
          const lastUsed = skillCooldowns[skillId] || 0;
          const now = Date.now();
          if (now - lastUsed >= cooldownHours * 3600000) {
              set({ skillCooldowns: { ...skillCooldowns, [skillId]: now } });
              set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
              return true;
          }
          return false;
      },

      updateQuizRecord: (lessonId, score, wrongIds, isFirstTime) => {
          set(state => {
              const prev = state.quizRecords[lessonId] || { 
                  lessonId, highestScore: 0, isFinished: false, wrongQuestionIds: [], correctionCount: {} 
              };
              const newRecords = {
                  ...state.quizRecords,
                  [lessonId]: {
                      ...prev,
                      highestScore: Math.max(prev.highestScore, score),
                      isFinished: true,
                      wrongQuestionIds: wrongIds,
                  }
              };
              return { quizRecords: newRecords };
          });
          set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
      },

      correctMistake: (lessonId, questionId) => {
          set(state => {
              const record = state.quizRecords[lessonId];
              if (!record) return {};
              const newWrongIds = record.wrongQuestionIds.filter((id: string) => id !== questionId);
              const newCount = (record.correctionCount[questionId] || 0) + 1;
              const newRecords = {
                  ...state.quizRecords,
                  [lessonId]: {
                      ...record,
                      wrongQuestionIds: newWrongIds,
                      correctionCount: { ...record.correctionCount, [questionId]: newCount }
                  }
              };
              return { quizRecords: newRecords };
          });
          set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
      },

      addAnnotation: (lessonId, ann) => {
          set(state => {
              const current = state.annotations[lessonId] || [];
              const newAnn: Annotation = { ...ann, id: `ann-${Date.now()}`, type: 'student', createdAt: new Date().toISOString() };
              return { annotations: { ...state.annotations, [lessonId]: [...current, newAnn] } };
          });
          set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
      },

      removeAnnotation: (lessonId, id) => {
          set(state => {
              const current = state.annotations[lessonId] || [];
              return { annotations: { ...state.annotations, [lessonId]: current.filter(a => a.id !== id) } };
          });
          set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
      },

      joinClass: (code) => {
          const targetClass = MOCK_CLASSES.find(c => c.code === code);
          if (targetClass) {
              set({ classId: targetClass.id });
              alert(`🎉 成功加入班級：${targetClass.name}`);
              return true;
          } else {
              alert('❌ 找不到此班級代碼，請重新確認。');
              return false;
          }
      },
      
      // 🔥 Login Logic
      login: (role, username, userId) => {
          const state = get();
          const { id: currentId, usersData } = state;
          
          // 1. Save current user data before switching
          let newUsersData = { ...usersData };
          if (state.isLoggedIn && currentId) {
              newUsersData[currentId] = extractUserData(state);
          }

          // 2. Prepare new user info
          const isTeacher = role === 'teacher';
          let targetId = userId || (isTeacher ? 't-001' : 's-0');
          let targetName = username || (isTeacher ? '孔丘' : '李白');
          let targetClassId = isTeacher ? null : 'class-101';
          let targetAvatar = isTeacher ? (targetId === 't-001' ? 'scholar_m' : 'scholar_f') : 'scholar_f';

          // Mock Data Lookup
          if (!isTeacher && userId) {
              const foundClass = MOCK_CLASSES.find(c => c.students.some(s => s.id === userId));
              const foundStudent = foundClass?.students.find(s => s.id === userId);
              if (foundClass && foundStudent) {
                  targetClassId = foundClass.id;
                  targetAvatar = foundStudent.avatar;
                  targetName = foundStudent.name;
              }
          }

          // 3. Load or Initialize Data
          const savedData = newUsersData[targetId] || getDefaultUserData();

          // 4. Daily Reset Logic
          const today = new Date().toISOString().split('T')[0];
          const isNewDay = savedData.lastLoginDate !== today;
          
          const finalData: UserSpecificData = {
              ...savedData,
              lastLoginDate: today,
              aiDailyUsage: isNewDay ? 0 : savedData.aiDailyUsage,
              dailyMission: isNewDay ? { 
                  date: today, 
                  progress: [], 
                  isRewardClaimed: false 
              } : savedData.dailyMission
          };

          // 5. Update State
          set({
              isLoggedIn: true,
              role: role,
              id: targetId,
              name: targetName,
              avatar: targetAvatar,
              title: isTeacher ? '至聖先師' : '詩仙',
              classId: targetClassId,
              usersData: { ...newUsersData, [targetId]: finalData }, // Update DB immediately
              ...finalData // Load user data into current state
          });
      },

      logout: () => { 
          const state = get();
          set({ 
              isLoggedIn: false, 
              role: 'guest', 
              classId: null, 
              id: '',
              // Save current user on logout
              usersData: { ...state.usersData, [state.id]: extractUserData(state) }
          }); 
      },

      toggleLike: (assetId) => { /*...*/ },
      voteForAsset: (assetId) => { /*...*/ return false; }, 
      checkAndClaimRewards: () => { /*...*/ return { verificationCount: 0, voteCount: 0, totalCoins: 0, totalXp: 0 }; },
      
      consumeAiQuota: () => {
          const { aiDailyUsage, aiMaxDailyFree, coins } = get();
          const COST_PER_MSG = 10;
          if (aiDailyUsage < aiMaxDailyFree) {
              set({ aiDailyUsage: aiDailyUsage + 1 });
              set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
              return 'success';
          }
          if (coins >= COST_PER_MSG) {
              set({ coins: coins - COST_PER_MSG, aiDailyUsage: aiDailyUsage + 1 });
              set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
              return 'paid_success';
          }
          return 'limit_reached';
      },

      // 🔥 Fixed Streak Logic with Type Safety
      checkStreakStatus: () => {
          const { lastCompletedDate, streakDays } = get();
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const todayStr = today.toISOString().split('T')[0];

          if (lastCompletedDate === yesterdayStr || lastCompletedDate === todayStr) {
              const status: 'active' | 'broken' | 'repaired' = 'active';
              set({ streakStatus: status });
              return;
          }

          if (lastCompletedDate < yesterdayStr && streakDays > 0) {
              const status: 'active' | 'broken' | 'repaired' = 'broken';
              set({ streakStatus: status });
              set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
          }
      },

      repairStreak: () => {
          const { inventory } = get();
          const freezeCardIdx = inventory.findIndex(i => i.itemId === 'streak-freeze');
          
          if (freezeCardIdx >= 0 && inventory[freezeCardIdx].count > 0) {
              const newInv = [...inventory];
              newInv[freezeCardIdx].count -= 1;
              if (newInv[freezeCardIdx].count === 0) newInv.splice(freezeCardIdx, 1);
              
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              
              const updates = { 
                  inventory: newInv,
                  lastCompletedDate: yesterday.toISOString().split('T')[0],
                  streakStatus: 'repaired' as const // 🔥 Fix Type Mismatch
              };
              set(updates);
              set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
              return true;
          }
          return false;
      },

      acceptStreakBreak: () => {
          const updates = { streakDays: 0, streakStatus: 'active' as const };
          set(updates);
          set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
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
          set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
      },

      completeDailyArticle: (articleId, isPerfect) => {
          const { dailyMission, addCoins, addXp } = get();
          const progressItem = dailyMission.progress.find(p => p.articleId === articleId) || { articleId, isCompleted: false, hasError: false };
          
          if (!progressItem.isCompleted) {
              const baseXp = 50;
              const bonus = isPerfect && !progressItem.hasError; 
              const finalXp = bonus ? Math.floor(baseXp * 1.2) : baseXp;
              
              // Note: Manually update coins/xp here to group updates
              const state = get();
              const newXp = state.xp + finalXp;
              const newCoins = state.coins + (bonus ? 20 : 0);
              const newLevel = calculateLevelFromXp(newXp);

              const newProgress = dailyMission.progress.map(p => 
                  p.articleId === articleId ? { ...p, isCompleted: true } : p
              );
              if (!dailyMission.progress.find(p => p.articleId === articleId)) {
                  newProgress.push({ articleId, isCompleted: true, hasError: false });
              }

              const updates = { 
                  xp: newXp,
                  level: newLevel,
                  coins: newCoins,
                  dailyMission: { ...dailyMission, progress: newProgress } 
              };
              
              set(updates);
              set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
              
              if (bonus) alert('🎉 完美通關！獲得 1.2倍 經驗值加成與 20 金幣！');
              else alert('👍 完成閱讀！獲得 50 XP。');
          }
      },

      claimDailyMissionReward: () => {
          const { dailyMission, streakDays } = get();
          const today = new Date().toISOString().split('T')[0];
          
          if (!dailyMission.isRewardClaimed) {
              const newCoins = get().coins + 100;
              const updates = { 
                  coins: newCoins,
                  dailyMission: { ...dailyMission, isRewardClaimed: true },
                  streakDays: streakDays + 1,
                  lastCompletedDate: today, 
                  streakStatus: 'active' as const
              };
              set(updates);
              set(s => ({ usersData: { ...s.usersData, [s.id]: extractUserData(s) } }));
              alert(`🔥 簽到成功！連勝天數：${streakDays + 1} 天\n獲得 100 文心幣大紅包！`);
          }
      }
    }),
    { name: 'wenxin-user-storage' }
  )
);