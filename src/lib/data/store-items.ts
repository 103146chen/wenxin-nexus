export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number; // 消耗 Coins
  type: 'virtual' | 'physical'; // 虛擬還是實體
  category: 'theme' | 'avatar' | 'teacher';
  imageColor: string;
}

export const STORE_ITEMS: StoreItem[] = [
  // --- 虛擬商品 ---
  {
    id: 'theme-night',
    name: '佈景：夜遊赤壁',
    description: '將虛擬書齋的背景換成靜謐的赤壁夜景。',
    price: 200,
    type: 'virtual',
    category: 'theme',
    imageColor: 'bg-indigo-900'
  },
  {
    id: 'frame-gold',
    name: '頭像框：金榜題名',
    description: '在排行榜和畫廊中顯示閃亮的金色頭像框。',
    price: 500,
    type: 'virtual',
    category: 'avatar',
    imageColor: 'bg-yellow-400'
  },
  
  // --- 實體商品 (找老師兌換) ---
  {
    id: 'reward-snack',
    name: '兌換券：午後時光',
    description: '憑此券可找老師兌換一份小點心或飲料。',
    price: 800,
    type: 'physical',
    category: 'teacher',
    imageColor: 'bg-orange-400'
  },
  {
    id: 'reward-pass',
    name: '免死金牌',
    description: '可抵免一次小作業或週記 (需經老師核可)。',
    price: 1500,
    type: 'physical',
    category: 'teacher',
    imageColor: 'bg-red-500'
  }
];