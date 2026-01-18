import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 定義測驗紀錄結構
interface QuizRecord {
  lessonId: string;
  highestScore: number;
  isFinished: boolean; // 是否已完成過(領過首通獎勵)
  wrongQuestionIds: string[]; // 錯題 ID 列表 (用於訂正模式)
  correctionCount: Record<string, number>; // 每個錯題訂正過的次數
}

interface UserState {
  // ... (保留原有欄位)
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
  streakDays: number;
  lastLoginDate: string;

  // 🔥 新增：測驗紀錄
  quizRecords: Record<string, QuizRecord>;

  // ... (保留原有 Actions)
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  updateProfile: (name: string) => void;
  unlockSkill: (skillId: string, cost: number) => boolean;
  buyItem: (itemId: string, price: number) => boolean;
  useItem: (itemId: string) => boolean;
  equipItem: (itemId: string, category: 'theme' | 'avatar') => void;
  activateSkill: (skillId: string, cooldownHours: number) => boolean;

  // 🔥 新增：更新測驗紀錄
  updateQuizRecord: (lessonId: string, score: number, wrongIds: string[], isFirstTime: boolean) => void;
  // 🔥 新增：紀錄訂正成功
  correctMistake: (lessonId: string, questionId: string) => void;
}

const calculateLevelFromXp = (xp: number) => Math.floor(0.1 * Math.sqrt(xp)) || 1;
const calculateXpForNextLevel = (currentLevel: number) => Math.pow((currentLevel + 1) * 10, 2);

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // ... (保留原有初始值)
      name: '陌生的旅人',
      title: '初入文壇',
      avatar: 'scholar_m',
      level: 1,
      xp: 0,
      maxXp: 100,
      coins: 0,
      sp: 0, 
      unlockedSkills: [],
      inventory: [],
      skillCooldowns: {}, 
      activeTheme: 'default',
      activeFrame: 'default',
      streakDays: 1,
      lastLoginDate: new Date().toISOString().split('T')[0],
      quizRecords: {}, // 初始化

      // ... (保留原有函數)
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

      // 🔥 實作：更新測驗紀錄
      updateQuizRecord: (lessonId, score, wrongIds, isFirstTime) => {
          set(state => {
              const prev = state.quizRecords[lessonId] || { 
                  lessonId, highestScore: 0, isFinished: false, wrongQuestionIds: [], correctionCount: {} 
              };
              
              return {
                  quizRecords: {
                      ...state.quizRecords,
                      [lessonId]: {
                          ...prev,
                          highestScore: Math.max(prev.highestScore, score),
                          isFinished: true, // 標記為已完成
                          wrongQuestionIds: wrongIds, // 更新錯題庫
                      }
                  }
              };
          });
      },

      // 🔥 實作：訂正成功
      correctMistake: (lessonId, questionId) => {
          set(state => {
              const record = state.quizRecords[lessonId];
              if (!record) return {};

              // 從錯題列表中移除
              const newWrongIds = record.wrongQuestionIds.filter(id => id !== questionId);
              // 增加訂正次數紀錄 (可選，用來限制獎勵)
              const newCount = (record.correctionCount[questionId] || 0) + 1;

              return {
                  quizRecords: {
                      ...state.quizRecords,
                      [lessonId]: {
                          ...record,
                          wrongQuestionIds: newWrongIds,
                          correctionCount: {
                              ...record.correctionCount,
                              [questionId]: newCount
                          }
                      }
                  }
              };
          });
      }
    }),
    { name: 'wenxin-user-storage' }
  )
);