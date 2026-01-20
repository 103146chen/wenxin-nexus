import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_CLASSES } from '@/lib/data/mock-class-data';
import { Annotation, StudentAsset } from '@/lib/types/gamification';

// 定義角色型別
export type UserRole = 'student' | 'teacher' | 'guest';

// 定義測驗紀錄結構
interface QuizRecord {
  lessonId: string;
  highestScore: number;
  isFinished: boolean; 
  wrongQuestionIds: string[]; 
  correctionCount: Record<string, number>; 
}

interface UserState {
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
  streakDays: number;
  lastLoginDate: string;

  quizRecords: Record<string, QuizRecord>;
  annotations: Record<string, Annotation[]>;
  classId: string | null;
  isLoggedIn: boolean;
  role: UserRole;

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
  login: (role: UserRole, username?: string) => void;
  logout: () => void;
  
  // 🔥 新增：按讚功能
  toggleLike: (assetId: string) => void;
}

const calculateLevelFromXp = (xp: number) => Math.floor(0.1 * Math.sqrt(xp)) || 1;
const calculateXpForNextLevel = (currentLevel: number) => Math.pow((currentLevel + 1) * 10, 2);
const ASSETS_STORAGE_KEY = 'wenxin-assets-repository';

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
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
      inventory: [],
      skillCooldowns: {}, 
      activeTheme: 'default',
      activeFrame: 'default',
      streakDays: 12,
      lastLoginDate: new Date().toISOString().split('T')[0],
      quizRecords: {},
      annotations: {}, 
      
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
                          isFinished: true,
                          wrongQuestionIds: wrongIds,
                      }
                  }
              };
          });
      },

      correctMistake: (lessonId, questionId) => {
          set(state => {
              const record = state.quizRecords[lessonId];
              if (!record) return {};

              const newWrongIds = record.wrongQuestionIds.filter(id => id !== questionId);
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
      },

      addAnnotation: (lessonId, ann) => {
          set(state => {
              const current = state.annotations[lessonId] || [];
              const newAnn: Annotation = {
                  ...ann,
                  id: `ann-${Date.now()}`,
                  type: 'student',
                  createdAt: new Date().toISOString()
              };
              return {
                  annotations: {
                      ...state.annotations,
                      [lessonId]: [...current, newAnn]
                  }
              };
          });
      },

      removeAnnotation: (lessonId, id) => {
          set(state => {
              const current = state.annotations[lessonId] || [];
              return {
                  annotations: {
                      ...state.annotations,
                      [lessonId]: current.filter(a => a.id !== id)
                  }
              };
          });
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
      
      login: (role, username) => {
          const isTeacher = role === 'teacher';
          set({ 
              isLoggedIn: true, 
              role: role,
              id: isTeacher ? 't-001' : 's-0', 
              name: username || (isTeacher ? '孔丘' : '李白'),
              avatar: isTeacher ? 'scholar_m' : 'scholar_f',
              title: isTeacher ? '至聖先師' : '詩仙',
              classId: isTeacher ? null : 'class-101' 
          });
      },

      logout: () => {
          set({ isLoggedIn: false, role: 'guest', classId: null, id: '' });
      },

      // 🔥 實作 toggleLike
      toggleLike: (assetId) => {
          const { id } = get();
          if (typeof window === 'undefined') return;
          try {
              const raw = localStorage.getItem(ASSETS_STORAGE_KEY);
              if (raw) {
                  const assets: StudentAsset[] = JSON.parse(raw);
                  const targetIndex = assets.findIndex(a => a.id === assetId);
                  
                  if (targetIndex !== -1) {
                      const asset = assets[targetIndex];
                      const hasLiked = asset.likedBy.includes(id);
                      
                      if (hasLiked) {
                          asset.likedBy = asset.likedBy.filter(uid => uid !== id);
                          asset.likes = Math.max(0, asset.likes - 1);
                      } else {
                          asset.likedBy.push(id);
                          asset.likes += 1;
                      }
                      
                      assets[targetIndex] = asset;
                      localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
                  }
              }
          } catch (e) {
              console.error(e);
          }
      }
    }),
    { name: 'wenxin-user-storage' }
  )
);