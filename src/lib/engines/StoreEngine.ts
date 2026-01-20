import { StoreItem, Redemption, SYSTEM_ITEMS } from '@/lib/data/store-items';
import { useUserStore } from '@/store/user-store';

const STORE_STORAGE_KEY = 'wenxin-store-repository';
const REDEMPTION_STORAGE_KEY = 'wenxin-redemptions';

// Helper: 讀取所有自訂商品
const loadCustomItems = (): StoreItem[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORE_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper: 儲存自訂商品
const saveCustomItems = (items: StoreItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(items));
};

// Helper: 讀取核銷單
const loadRedemptions = (): Redemption[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(REDEMPTION_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper: 儲存核銷單
const saveRedemptions = (redemptions: Redemption[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REDEMPTION_STORAGE_KEY, JSON.stringify(redemptions));
};

export const StoreEngine = {
  
  // 1. 獲取學生可見的所有商品 (系統 + 該班導師自訂)
  getStudentStore: (teacherId?: string) => {
    const customItems = loadCustomItems();
    // 只回傳系統商品 + 該導師的商品
    const teacherItems = teacherId ? customItems.filter(i => i.ownerId === teacherId) : [];
    return [...SYSTEM_ITEMS, ...teacherItems];
  },

  // 2. 老師上架/編輯商品
  upsertItem: (item: StoreItem) => {
    const items = loadCustomItems();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) {
        items[idx] = item;
    } else {
        items.push(item);
    }
    saveCustomItems(items);
  },

  // 3. 老師刪除商品
  deleteItem: (itemId: string) => {
    const items = loadCustomItems().filter(i => i.id !== itemId);
    saveCustomItems(items);
  },

  // 4. 學生購買商品
  purchase: (studentId: string, itemId: string, cost: number) => {
    // 扣款邏輯 (由 UserStore 處理，這裡處理庫存)
    const items = loadCustomItems();
    const itemIdx = items.findIndex(i => i.id === itemId);
    
    // 如果是自訂商品且有庫存限制
    if (itemIdx >= 0) {
        const item = items[itemIdx];
        if (item.stock !== undefined) {
            if (item.stock <= 0) return false; // 沒貨了
            item.stock -= 1;
            items[itemIdx] = item;
            saveCustomItems(items);
        }
    }
    return true;
  },

  // 5. 學生使用道具 (發起核銷)
  useItem: (studentId: string, studentName: string, classId: string, item: StoreItem, teacherId: string) => {
      // 只有非系統商品 (Perk) 需要核銷
      if (item.isSystem) return 'equipped'; // 系統商品直接裝備

      const redemptions = loadRedemptions();
      const newRedemption: Redemption = {
          id: `redemp-${Date.now()}`,
          studentId,
          studentName,
          classId,
          itemId: item.id,
          itemName: item.name,
          teacherId,
          status: 'pending',
          createdAt: new Date().toISOString()
      };
      
      redemptions.push(newRedemption);
      saveRedemptions(redemptions);
      return 'pending'; // 等待核銷
  },

  // 6. 老師獲取待核銷列表
  getPendingRedemptions: (teacherId: string) => {
      const all = loadRedemptions();
      return all.filter(r => r.teacherId === teacherId && r.status === 'pending');
  },

  // 7. 老師審核核銷單
  reviewRedemption: (redemptionId: string, status: 'approved' | 'rejected') => {
      const redemptions = loadRedemptions();
      const idx = redemptions.findIndex(r => r.id === redemptionId);
      if (idx >= 0) {
          redemptions[idx].status = status;
          redemptions[idx].updatedAt = new Date().toISOString();
          saveRedemptions(redemptions);
          return true;
      }
      return false;
  }
};