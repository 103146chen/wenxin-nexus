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
  
  // 🔥 新增欄位
  sp: number; // 技能點 (Skill Points)
  unlockedSkills: string[]; // 已解鎖的技能 ID
  inventory: { itemId: string; count: number }[]; // 背包

  streakDays: number;
  lastLoginDate: string;

  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  updateProfile: (name: string) => void;
  
  // 🔥 新增動作
  unlockSkill: (skillId: string, cost: number) => boolean;
  buyItem: (itemId: string, price: number) => boolean;
  useItem: (itemId: string) => boolean; // 使用/消耗物品
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
      
      // 初始化新欄位
      sp: 0, 
      unlockedSkills: [],
      inventory: [],
      
      streakDays: 1,
      lastLoginDate: new Date().toISOString().split('T')[0],

      addXp: (amount) => {
        const { xp, level, coins, sp } = get();
        const newXp = xp + amount;
        const newLevel = calculateLevelFromXp(newXp);
        
        let newCoins = coins;
        let newSp = sp;

        if (newLevel > level) {
          // 升級獎勵：100 Coins + 1 SP
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

      // 解鎖技能
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

      // 購買物品
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
      
      // 使用物品 (例如找老師兌換後扣除)
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
      }
    }),
    { name: 'wenxin-user-storage' }
  )
);