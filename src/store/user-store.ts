import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
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
  
  // 🔥 新增：技能冷卻紀錄 (skillId -> timestamp)
  skillCooldowns: Record<string, number>;

  activeTheme: string;
  activeFrame: string;

  streakDays: number;
  lastLoginDate: string;

  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  updateProfile: (name: string) => void;
  
  unlockSkill: (skillId: string, cost: number) => boolean;
  buyItem: (itemId: string, price: number) => boolean;
  useItem: (itemId: string) => boolean;
  equipItem: (itemId: string, category: 'theme' | 'avatar') => void;
  
  // 🔥 新增：發動技能
  activateSkill: (skillId: string, cooldownHours: number) => boolean;
}

const calculateLevelFromXp = (xp: number) => Math.floor(0.1 * Math.sqrt(xp)) || 1;
const calculateXpForNextLevel = (currentLevel: number) => Math.pow((currentLevel + 1) * 10, 2);

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
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
      skillCooldowns: {}, // 初始化
      
      activeTheme: 'default',
      activeFrame: 'default',
      
      streakDays: 1,
      lastLoginDate: new Date().toISOString().split('T')[0],

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

        set({
          xp: newXp,
          level: newLevel,
          maxXp: calculateXpForNextLevel(newLevel),
          coins: newCoins,
          sp: newSp
        });
      },

      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      updateProfile: (name) => set({ name }),

      unlockSkill: (skillId, cost) => {
        const { sp, unlockedSkills } = get();
        if (sp >= cost && !unlockedSkills.includes(skillId)) {
          set({ 
            sp: sp - cost, 
            unlockedSkills: [...unlockedSkills, skillId] 
          });
          return true;
        }
        return false;
      },

      buyItem: (itemId, price) => {
        const { coins, inventory } = get();
        if (coins >= price) {
          const existingItemIndex = inventory.findIndex(i => i.itemId === itemId);
          let newInventory = [...inventory];
          
          if (existingItemIndex >= 0) {
            newInventory[existingItemIndex].count += 1;
          } else {
            newInventory.push({ itemId, count: 1 });
          }

          set({ 
            coins: coins - price, 
            inventory: newInventory 
          });
          return true;
        }
        return false;
      },
      
      useItem: (itemId) => {
        const { inventory } = get();
        const index = inventory.findIndex(i => i.itemId === itemId);
        if (index >= 0 && inventory[index].count > 0) {
            const newInventory = [...inventory];
            newInventory[index].count -= 1;
            if (newInventory[index].count === 0) {
                newInventory.splice(index, 1);
            }
            set({ inventory: newInventory });
            return true;
        }
        return false;
      },

      equipItem: (itemId, category) => {
          if (category === 'theme') {
              set({ activeTheme: itemId });
          } else if (category === 'avatar') {
              set({ activeFrame: itemId });
          }
      },

      // 🔥 實作技能發動檢查
      activateSkill: (skillId, cooldownHours) => {
          const { skillCooldowns } = get();
          const lastUsed = skillCooldowns[skillId] || 0;
          const now = Date.now();
          const cooldownMs = cooldownHours * 60 * 60 * 1000;

          if (now - lastUsed >= cooldownMs) {
              // CD 已轉好，發動成功，記錄現在時間
              set({
                  skillCooldowns: {
                      ...skillCooldowns,
                      [skillId]: now
                  }
              });
              return true;
          }
          return false; // 還在 CD 中
      }
    }),
    { name: 'wenxin-user-storage' }
  )
);