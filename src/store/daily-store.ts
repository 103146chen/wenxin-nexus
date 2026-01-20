import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DAILY_ARTICLES as INITIAL_DATA, DailyArticle } from '@/lib/data/daily-articles';

interface DailyStoreState {
  articles: DailyArticle[];
  
  // Actions
  addArticle: (article: DailyArticle) => void;
  updateArticle: (id: string, updates: Partial<DailyArticle>) => void;
  deleteArticle: (id: string) => void;
  getArticleById: (id: string) => DailyArticle | undefined;
  getArticlesByDate: (date?: string) => DailyArticle[]; // 若無日期則回傳全部
}

export const useDailyStore = create<DailyStoreState>()(
  persist(
    (set, get) => ({
      articles: INITIAL_DATA, // 初始載入預設資料

      addArticle: (article) => set((state) => ({ 
        articles: [article, ...state.articles] 
      })),

      updateArticle: (id, updates) => set((state) => ({
        articles: state.articles.map(a => a.id === id ? { ...a, ...updates } : a)
      })),

      deleteArticle: (id) => set((state) => ({
        articles: state.articles.filter(a => a.id !== id)
      })),

      getArticleById: (id) => get().articles.find(a => a.id === id),

      // 這裡暫時簡單實作：目前系統尚無 date 欄位，未來可擴充
      // 現在回傳所有文章，讓學生端顯示
      getArticlesByDate: () => get().articles,
    }),
    { name: 'wenxin-daily-store' }
  )
);