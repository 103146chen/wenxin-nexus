import { LucideIcon, Palette, User, Coffee, Ticket, Star } from "lucide-react";

export type ProductType = 'theme' | 'avatar' | 'item' | 'perk';
export type RedemptionStatus = 'pending' | 'approved' | 'rejected' | 'consumed';

export interface StoreItem {
  id: string;
  type: ProductType;
  name: string;
  description: string;
  price: number;
  iconName: string; // 儲存 Icon 的字串名稱，因為無法將元件存入 LocalStorage
  
  // 🔥 新增：福利社 2.0 欄位
  isSystem: boolean;      // true=系統全域商品, false=老師自訂商品
  ownerId?: string;       // 賣家 ID (老師 ID)
  stock?: number;         // 庫存 (undefined = 無限)
  allowMultiple?: boolean; // 是否允許重複購買
}

export interface Redemption {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  itemId: string;
  itemName: string;
  teacherId: string; // 負責審核的老師
  status: RedemptionStatus;
  createdAt: string;
  updatedAt?: string;
  note?: string; // 學生留言或老師回饋
}

// 預設系統商品 (系統全域)
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
    id: 'avatar-frame-gold',
    type: 'avatar',
    name: '黃金桂冠框',
    description: '象徵最高榮譽的頭像外框。',
    price: 1000,
    iconName: 'User',
    isSystem: true,
    allowMultiple: false
  },
  {
    id: 'avatar-frame-leaves',
    type: 'avatar',
    name: '文青竹葉框',
    description: '淡泊名利，寧靜致遠。',
    price: 200,
    iconName: 'User',
    isSystem: true,
    allowMultiple: false
  }
];

// 用於 UI 顯示的 Icon 對照表
export const ICON_MAP: Record<string, any> = {
    Palette, User, Coffee, Ticket, Star
};