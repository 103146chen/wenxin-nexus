import { LucideIcon, Palette, User, Coffee, Ticket, Star, Snowflake, Zap } from "lucide-react";

export type ProductType = 'theme' | 'avatar' | 'item' | 'perk';
export type RedemptionStatus = 'pending' | 'approved' | 'rejected' | 'consumed';

export interface StoreItem {
  id: string;
  type: ProductType;
  name: string;
  description: string;
  price: number;
  iconName: string;
  isSystem: boolean;      
  ownerId?: string;       
  stock?: number;         
  allowMultiple?: boolean; 
}

export interface Redemption {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  itemId: string;
  itemName: string;
  teacherId: string;
  status: RedemptionStatus;
  createdAt: string;
  updatedAt?: string;
  note?: string;
}

export const SYSTEM_ITEMS: StoreItem[] = [
  {
    id: 'theme-dark',
    type: 'theme',
    name: '暗夜模式',
    description: '深色主題，保護眼睛，專注閱讀。',
    price: 500,
    iconName: 'Palette',
    isSystem: true,
    allowMultiple: false
  },
  {
    id: 'theme-sepia',
    type: 'theme',
    name: '羊皮紙模式',
    description: '復古風格，彷彿置身古代書齋。',
    price: 300,
    iconName: 'Palette',
    isSystem: true,
    allowMultiple: false
  },
  {
    id: 'streak-freeze',
    type: 'item',
    name: '連勝凍結卡',
    description: '錯過一天簽到？沒關係，這張卡能保住你的連勝紀錄！（自動消耗）',
    price: 200,
    iconName: 'Snowflake',
    isSystem: true,
    allowMultiple: true // 可以買多張囤著
  },
  {
    id: 'xp-boost',
    type: 'item',
    name: '經驗加倍券',
    description: '接下來 24 小時獲得的 XP 加倍。（開發中）',
    price: 150,
    iconName: 'Zap',
    isSystem: true,
    allowMultiple: true
  },
  {
    id: 'avatar-frame-gold',
    type: 'avatar',
    name: '黃金桂冠框',
    description: '象徵最高榮譽的頭像外框。',
    price: 1000,
    iconName: 'User',
    isSystem: true,
    allowMultiple: false
  },
];

export const ICON_MAP: Record<string, any> = {
    Palette, User, Coffee, Ticket, Star, Snowflake, Zap
};