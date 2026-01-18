export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">學生儀表板</h2>
      <div className="grid gap-6 md:grid-cols-2">
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
    </div>
  );
}