import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 定義使用者資料結構
interface UserState {
  // 基本資料
  name: string;
  title: string; // 稱號，例如 "初入文壇"
  avatar: string; // 頭像代號
  
  // 核心數值
  level: number;
  xp: number;
  maxXp: number; // 下一級需要的 XP
  coins: number; // 文心幣
  
  // 記錄
  streakDays: number; // 連續登入天數
  lastLoginDate: string;

  // 動作 (Actions)
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  updateProfile: (name: string) => void;
}

// 升級公式：Level = 0.1 * sqrt(XP)
// 這裡我們反過來算：升級所需總 XP = (Level / 0.1)^2 = (Level * 10)^2
const calculateLevelFromXp = (xp: number) => Math.floor(0.1 * Math.sqrt(xp)) || 1;
const calculateXpForNextLevel = (currentLevel: number) => Math.pow((currentLevel + 1) * 10, 2);

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 預設初始值
      name: '陌生的旅人',
      title: '初入文壇',
      avatar: 'scholar_m',
      level: 1,
      xp: 0,
      maxXp: 100, // 第一級升第二級需要 100 XP
      coins: 0,
      streakDays: 1,
      lastLoginDate: new Date().toISOString().split('T')[0],

      // 增加經驗值 (核心邏輯)
      addXp: (amount) => {
        const { xp, level } = get();
        const newXp = xp + amount;
        const newLevel = calculateLevelFromXp(newXp);
        
        // 檢查是否升級
        if (newLevel > level) {
          alert(`🎉 恭喜升級！你現在是 ${newLevel} 等了！\n獲得升級獎勵：100 文心幣`);
          set((state) => ({ coins: state.coins + 100 })); // 升級送錢
        }

        set({
          xp: newXp,
          level: newLevel,
          maxXp: calculateXpForNextLevel(newLevel),
        });
      },

      // 增加文心幣
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

      // 更新個人資料
      updateProfile: (name) => set({ name }),
    }),
    {
      name: 'wenxin-user-storage', // 存到 LocalStorage 的 Key
    }
  )
);