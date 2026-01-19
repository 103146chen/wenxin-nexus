export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  // 🔥 新增 consumable
  category: 'theme' | 'avatar' | 'consumable';
  previewColor?: string;
  image?: string;
}

export const STORE_ITEMS: StoreItem[] = [
  // --- Themes ---
  {
    id: 'theme-sepia',
    name: '護眼羊皮紙',
    description: '溫暖的米黃色調，適合長時間閱讀。',
    price: 150,
    category: 'theme',
    previewColor: '#fdf6e3'
  },
  {
    id: 'theme-dark',
    name: '靜謐深夜',
    description: '深色背景，讓思緒在夜晚更清晰。',
    price: 300,
    category: 'theme',
    previewColor: '#0f172a'
  },
  
  // --- Avatars ---
  {
    id: 'frame-gold',
    name: '金榜題名框',
    description: '閃耀著金色光芒的頭像外框。',
    price: 500,
    category: 'avatar'
  },
  {
    id: 'avatar-libai',
    name: '李白套裝',
    description: '解鎖詩仙李白的預設頭像。',
    price: 800,
    category: 'avatar'
  },

  // --- 🔥 實體道具 (Consumables) ---
  {
    id: 'item-death-medal',
    name: '免死金牌',
    description: '在測驗中答錯一題可不扣分（僅限選擇題）。',
    price: 1000,
    category: 'consumable'
  },
  {
    id: 'item-ration',
    name: '戰鬥口糧',
    description: '恢復連續登入天數 (Streak) 1 天。',
    price: 600,
    category: 'consumable'
  }
];