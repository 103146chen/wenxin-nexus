'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { useUserStore } from "@/store/user-store";
import { STORE_ITEMS } from "@/lib/data/store-items";
import { useState } from "react";
import { ShoppingCart, Check, Coins, Layout, User, Package } from "lucide-react";

export default function StorePage() {
  const { coins, inventory, activeTheme, activeFrame, buyItem, equipItem } = useUserStore();
  const [activeTab, setActiveTab] = useState<'theme' | 'avatar' | 'consumable'>('theme');

  const items = STORE_ITEMS.filter(item => item.category === activeTab);

  const handleBuy = (item: typeof STORE_ITEMS[0]) => {
      if (buyItem(item.id, item.price)) {
          alert(`🎉 購買成功！已將 ${item.name} 加入背包。`);
      } else {
          alert("❌ 文心幣不足，快去完成任務賺錢吧！");
      }
  };

  const handleEquip = (item: typeof STORE_ITEMS[0]) => {
      if (item.category === 'consumable') return; // 消耗品無法裝備，只能持有
      // @ts-ignore
      equipItem(item.id, item.category);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-12">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold font-serif text-slate-900 mb-4">文心福利社</h1>
            <p className="text-lg text-slate-600">
                用學習成果兌換專屬獎勵，打造你的個人風格。
            </p>
          </div>
          <div className="bg-yellow-100 text-yellow-700 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 border-2 border-yellow-200">
              <Coins className="w-6 h-6 fill-current"/>
              <span className="text-2xl">{coins}</span> 文心幣
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
            <button 
                onClick={() => setActiveTab('theme')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${activeTab === 'theme' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
            >
                <Layout className="w-5 h-5" /> 介面主題
            </button>
            <button 
                onClick={() => setActiveTab('avatar')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${activeTab === 'avatar' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
            >
                <User className="w-5 h-5" /> 頭像風格
            </button>
            <button 
                onClick={() => setActiveTab('consumable')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${activeTab === 'consumable' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
            >
                <Package className="w-5 h-5" /> 實體道具
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map(item => {
                const inventoryItem = inventory.find(i => i.itemId === item.id);
                const isOwned = !!inventoryItem;
                const isEquipped = item.category === 'theme' ? activeTheme === item.id : activeFrame === item.id;
                
                // 消耗品顯示持有數量
                const count = inventoryItem?.count || 0;

                return (
                    <div key={item.id} className={`bg-white rounded-2xl overflow-hidden border-2 transition-all hover:shadow-xl group ${isEquipped ? 'border-green-500 shadow-md' : 'border-slate-200 hover:border-indigo-200'}`}>
                        {/* 預覽圖區域 */}
                        <div className={`h-40 flex items-center justify-center relative ${
                            item.category === 'theme' 
                                ? (item.id === 'theme-sepia' ? 'bg-[#fdf6e3]' : item.id === 'theme-dark' ? 'bg-slate-900' : 'bg-slate-100')
                                : 'bg-slate-50'
                        }`}>
                            {item.category === 'avatar' ? (
                                <div className={`w-20 h-20 rounded-full bg-slate-200 border-4 border-white shadow-lg flex items-center justify-center text-3xl font-serif font-bold text-slate-400 ${item.id === 'frame-gold' ? 'ring-4 ring-yellow-400' : ''}`}>
                                    李
                                </div>
                            ) : item.category === 'consumable' ? (
                                <div className="text-6xl">{item.id === 'item-death-medal' ? '🏅' : '🍞'}</div>
                            ) : (
                                <div className="text-slate-400 font-mono text-xs opacity-50">Preview</div>
                            )}
                            
                            {isEquipped && (
                                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    <Check className="w-3 h-3" /> 使用中
                                </div>
                            )}
                            
                            {item.category === 'consumable' && isOwned && (
                                <div className="absolute top-4 right-4 bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    持有: {count}
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-1">{item.name}</h3>
                                    <p className="text-sm text-slate-500 h-10 line-clamp-2">{item.description}</p>
                                </div>
                            </div>

                            <div className="mt-4">
                                {isOwned && item.category !== 'consumable' ? (
                                    isEquipped ? (
                                        <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed">
                                            目前使用中
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleEquip(item)}
                                            className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition"
                                        >
                                            立即裝備
                                        </button>
                                    )
                                ) : (
                                    <button 
                                        onClick={() => handleBuy(item)}
                                        className="w-full py-3 bg-yellow-400 text-yellow-900 rounded-xl font-bold hover:bg-yellow-500 transition flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        {item.price} 文心幣
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}