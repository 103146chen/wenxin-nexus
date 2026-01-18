'use client'; // 記得改成 client component，因為有 store

import { UserProfileCard } from "@/components/gamification/UserProfileCard"; // 路徑請根據你剛剛建的位置調整
// 如果你放在 components/gamification/UserProfileCard.tsx，上面的 import 就要對應

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* 1. 個人檔案卡片 (新增) */}
      <section>
        <UserProfileCard />
      </section>

      {/* 2. 原本的內容 (稍微調整版面) */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">學習概況</h2>
        <div className="grid gap-6 md:grid-cols-2">
            {/* ... 原本的卡片內容保持不變 ... */}
             <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-lg mb-2 text-slate-900">最近閱讀</h3>
                <p className="text-slate-500">赤壁賦 - 宋 蘇軾</p>
                <div className="mt-4 text-sm text-indigo-600 font-medium">進度 45%</div>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-lg mb-2 text-slate-900">待辦事項</h3>
                <ul className="space-y-2 text-slate-500">
                    <li>• 完成〈師說〉邏輯圖</li>
                    <li>• 複習第二章註釋</li>
                </ul>
            </div>
        </div>
      </section>
    </div>
  );
}