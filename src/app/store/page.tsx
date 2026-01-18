'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { useUserStore } from "@/store/user-store";
import { STORE_ITEMS } from "@/lib/data/store-items";
import { Coins, ShoppingBag, Gift, Ticket, Palette } from "lucide-react";

export default function StorePage() {
  const { coins, buyItem, inventory, useItem } = useUserStore();

  const handleBuy = (id: string, price: number, name: string) => {
    if (confirm(`確定要花費 ${price} 文心幣購買【${name}】嗎？`)) {
      const success = buyItem(id, price);
      if (success) {
        alert("購買成功！請至背包查看。");
      } else {
        alert("文心幣不足！");
      }
    }
  };

  const handleUse = (id: string, name: string) => {
      // 這裡簡單模擬「使用/出示」給老師看
      if(confirm(`【老師專用】\n請確認是否核銷一張「${name}」？\n(此動作將消耗 1 個物品)`)) {
          useItem(id);
          alert("核銷完成！");
      }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-12">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold font-serif text-slate-900 mb-2">文心福利社</h1>
            <p className="text-lg text-slate-600">用你的努力換取獎勵，包含實體福利喔！</p>
          </div>
          <div className="bg-amber-400 text-amber-900 px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
            <Coins className="w-6 h-6" />
            <div>
                <p className="text-xs opacity-80 font-bold">持有文心幣</p>
                <p className="text-2xl font-bold">{coins}</p>
            </div>
          </div>
        </header>

        {/* 商品列表 */}
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" /> 熱門商品
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {STORE_ITEMS.map(item => (
                <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition group">
                    <div className={`h-32 ${item.imageColor} flex items-center justify-center text-white/50`}>
                        {item.category === 'theme' && <Palette className="w-12 h-12" />}
                        {item.category === 'teacher' && <Ticket className="w-12 h-12" />}
                        {item.category === 'avatar' && <Gift className="w-12 h-12" />}
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-slate-800">{item.name}</h3>
                             <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                 item.type === 'physical' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'
                             }`}>
                                 {item.type === 'physical' ? '實體' : '虛擬'}
                             </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4 h-10 leading-snug">{item.description}</p>
                        <button 
                            onClick={() => handleBuy(item.id, item.price, item.name)}
                            disabled={coins < item.price}
                            className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
                                coins >= item.price 
                                ? 'bg-slate-900 text-white hover:bg-indigo-600' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <Coins className="w-4 h-4" /> {item.price}
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* 我的背包區塊 */}
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-t pt-8 border-slate-200">
            <Gift className="w-6 h-6" /> 我的背包
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inventory.length === 0 ? (
                <div className="col-span-3 text-center py-10 text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl">
                    背包空空如也，快去買點東西吧！
                </div>
            ) : (
                inventory.map(slot => {
                    const item = STORE_ITEMS.find(i => i.id === slot.itemId);
                    if (!item) return null;
                    return (
                        <div key={slot.itemId} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg ${item.imageColor} shrink-0 flex items-center justify-center text-white`}>
                                <Ticket className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800">{item.name}</h4>
                                <p className="text-xs text-slate-500">持有數量：<span className="font-bold text-indigo-600 text-lg">{slot.count}</span></p>
                            </div>
                            {item.type === 'physical' && (
                                <button 
                                    onClick={() => handleUse(item.id, item.name)}
                                    className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg hover:bg-orange-200"
                                >
                                    使用/核銷
                                </button>
                            )}
                        </div>
                    );
                })
            )}
        </div>
      </div>
    </div>
  );
}