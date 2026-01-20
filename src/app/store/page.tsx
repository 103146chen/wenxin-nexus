'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { useUserStore } from "@/store/user-store";
import { useTeacherStore } from "@/store/teacher-store"; // 需要用來查導師 ID
import { StoreEngine } from "@/lib/engines/StoreEngine";
import { StoreItem, ICON_MAP } from "@/lib/data/store-items"; // 🔥 修正 Import
import { useState, useEffect } from "react";
import { ShoppingCart, Check, Coins, Layout, User, Package, Ticket, Clock, AlertCircle } from "lucide-react";

export default function StorePage() {
  const { 
    coins, 
    inventory, 
    buyItem, 
    useItem: consumeItem, // UserStore 的扣除數量邏輯
    activeTheme, 
    activeFrame, 
    equipItem, 
    id: studentId, 
    name: studentName, 
    classId 
  } = useUserStore();

  const { classes } = useTeacherStore();

  const [activeTab, setActiveTab] = useState<'buy' | 'inventory'>('buy');
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [teacherName, setTeacherName] = useState('');

  // 🔥 載入混合商店資料
  useEffect(() => {
      if (classId) {
          const myClass = classes.find(c => c.id === classId);
          if (myClass && myClass.ownerId) {
              const items = StoreEngine.getStudentStore(myClass.ownerId);
              setStoreItems(items);
              
              // 取得老師名字 (簡單模擬)
              setTeacherName(myClass.ownerId === 't-001' ? '孔子' : '孟子');
          } else {
              // 沒班級或沒導師，只顯示系統商品
              setStoreItems(StoreEngine.getStudentStore());
          }
      }
  }, [classId, classes]);

  const handleBuy = (item: StoreItem) => {
    if (coins < item.price) {
      alert("文心幣不足！快去完成閱讀任務吧。");
      return;
    }
    
    // 1. 扣庫存 (StoreEngine)
    const stockSuccess = StoreEngine.purchase(studentId, item.id, item.price);
    if (!stockSuccess) {
        alert("來晚一步，商品已售完！");
        return;
    }

    // 2. 扣錢與入庫 (UserStore)
    const success = buyItem(item.id, item.price);
    if (success) {
      alert(`🎉 購買成功！\n已獲得：${item.name}`);
      // Refresh items to update stock display
      const myClass = classes.find(c => c.id === classId);
      if (myClass?.ownerId) {
          setStoreItems(StoreEngine.getStudentStore(myClass.ownerId));
      }
    }
  };

  const handleUse = (item: StoreItem) => {
      // 1. 檢查是否需要核銷
      const myClass = classes.find(c => c.id === classId);
      const teacherId = myClass?.ownerId || 't-001';

      const result = StoreEngine.useItem(studentId, studentName, classId || '', item, teacherId);

      if (result === 'equipped') {
          // 系統道具：直接裝備
          equipItem(item.id, item.type as any);
          alert(`✨ 已套用：${item.name}`);
      } else {
          // 實體獎勵：扣除數量並發送請求
          consumeItem(item.id);
          alert(`📨 已發送兌換請求！\n請等待 ${teacherName} 老師核銷後領取獎勵。`);
      }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">福利社</h1>
                <p className="text-slate-600">
                    揮灑汗水賺取的文心幣，在這裡犒賞自己。
                    {teacherName && <span className="ml-2 text-indigo-600 font-bold">({teacherName}老師的班級)</span>}
                </p>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                    <Coins className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">持有餘額</div>
                    <div className="text-2xl font-bold text-slate-800">{coins}</div>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('buy')}
                className={`px-6 py-3 font-bold text-sm transition border-b-2 ${activeTab === 'buy' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
                商品列表
            </button>
            <button 
                onClick={() => setActiveTab('inventory')}
                className={`px-6 py-3 font-bold text-sm transition border-b-2 ${activeTab === 'inventory' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
                我的背包 ({inventory.reduce((acc, i) => acc + i.count, 0)})
            </button>
        </div>

        {/* Content */}
        {activeTab === 'buy' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {storeItems.map((item) => {
                    const Icon = ICON_MAP[item.iconName] || Package;
                    const isSystem = item.isSystem;
                    
                    // 檢查是否已擁有 (針對不可重複購買的商品)
                    const owned = inventory.some(i => i.itemId === item.id);
                    const canBuy = item.allowMultiple || !owned;
                    const hasStock = item.stock === undefined || item.stock > 0;

                    return (
                        <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition group flex flex-col relative overflow-hidden">
                            {/* 標籤 */}
                            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-xl ${isSystem ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-600'}`}>
                                {isSystem ? '系統' : '班級限定'}
                            </div>

                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition transform group-hover:scale-110 ${isSystem ? 'bg-slate-50 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                <Icon className="w-8 h-8" />
                            </div>
                            
                            <h3 className="font-bold text-slate-800 text-lg mb-1">{item.name}</h3>
                            <p className="text-xs text-slate-500 mb-4 flex-1 leading-relaxed">{item.description}</p>
                            
                            {item.stock !== undefined && (
                                <div className="text-[10px] font-bold text-slate-400 mb-2">
                                    剩餘庫存: <span className={item.stock < 5 ? 'text-red-500' : 'text-slate-600'}>{item.stock}</span>
                                </div>
                            )}

                            <button 
                                onClick={() => handleBuy(item)}
                                disabled={!canBuy || !hasStock}
                                className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                                    !canBuy 
                                    ? 'bg-green-50 text-green-600 cursor-default'
                                    : !hasStock
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-200'
                                }`}
                            >
                                {!canBuy ? (
                                    <><Check className="w-4 h-4"/> 已擁有</>
                                ) : !hasStock ? (
                                    '已售完'
                                ) : (
                                    <><Coins className="w-4 h-4 text-yellow-400"/> ${item.price}</>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {inventory.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-20"/>
                        <p>背包空空如也，去買點東西吧！</p>
                    </div>
                ) : (
                    inventory.map((slot) => {
                        // 因為 inventory 只存 ID，我們需要從 storeItems 找回完整資訊
                        // 注意：如果老師刪除了商品，這裡可能會找不到，要防呆
                        const item = storeItems.find(i => i.id === slot.itemId) || {
                            id: slot.itemId,
                            name: '未知物品',
                            description: '此物品可能已下架',
                            type: 'item',
                            iconName: 'Package',
                            isSystem: true
                        } as StoreItem;

                        const Icon = ICON_MAP[item.iconName] || Package;
                        const isEquipped = activeTheme === item.id || activeFrame === item.id;

                        return (
                            <div key={slot.itemId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 text-slate-500">
                                    <Icon className="w-7 h-7" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-bold text-slate-800 truncate">{item.name}</h4>
                                        <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-full">x{slot.count}</span>
                                    </div>
                                    
                                    {isEquipped ? (
                                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                            <Check className="w-3 h-3"/> 使用中
                                        </span>
                                    ) : (
                                        <button 
                                            onClick={() => handleUse(item)}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                                        >
                                            {item.isSystem ? '立即裝備' : '使用兌換'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        )}
      </div>
    </div>
  );
}