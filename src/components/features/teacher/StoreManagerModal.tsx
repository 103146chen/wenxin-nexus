'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Ticket, Coffee, Star, Gift, Package } from 'lucide-react';
import { StoreItem } from '@/lib/data/store-items';
import { StoreEngine } from '@/lib/engines/StoreEngine';
import { useUserStore } from '@/store/user-store';

interface StoreManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 可用的圖示選項
const ICON_OPTIONS = [
    { name: 'Ticket', icon: Ticket, label: '票券' },
    { name: 'Coffee', icon: Coffee, label: '飲料/食物' },
    { name: 'Star', icon: Star, label: '特權' },
    { name: 'Gift', icon: Gift, label: '禮物' },
    { name: 'Package', icon: Package, label: '實體物品' },
];

export default function StoreManagerModal({ isOpen, onClose }: StoreManagerModalProps) {
  const { id: teacherId } = useUserStore();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<StoreItem> | null>(null);

  // 載入商品
  useEffect(() => {
      if (isOpen && teacherId) {
          // 只載入這位老師的自訂商品
          const allItems = StoreEngine.getStudentStore(teacherId);
          setItems(allItems.filter(i => !i.isSystem));
      }
  }, [isOpen, teacherId]);

  if (!isOpen) return null;

  const handleSave = () => {
      if (!editingItem?.name || !editingItem?.price) {
          alert('請填寫商品名稱與價格');
          return;
      }

      const newItem: StoreItem = {
          id: editingItem.id || `item-${Date.now()}`,
          type: 'perk', // 自訂商品預設為特權/道具
          name: editingItem.name,
          description: editingItem.description || '',
          price: Number(editingItem.price),
          iconName: editingItem.iconName || 'Ticket',
          isSystem: false,
          ownerId: teacherId,
          stock: editingItem.stock, // undefined 代表無限
          allowMultiple: true
      };

      StoreEngine.upsertItem(newItem);
      
      // Refresh list
      const allItems = StoreEngine.getStudentStore(teacherId);
      setItems(allItems.filter(i => !i.isSystem));
      setEditingItem(null);
  };

  const handleDelete = (id: string) => {
      if (confirm('確定要下架此商品嗎？學生將無法再購買。')) {
          StoreEngine.deleteItem(id);
          setItems(prev => prev.filter(i => i.id !== id));
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <StoreItemIcon name="Store" className="w-6 h-6 text-indigo-600"/> 
                    班級福利社管理
                </h2>
                <p className="text-sm text-slate-500 mt-1">上架獎勵，激勵學生學習。</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition"><X className="w-5 h-5 text-slate-400"/></button>
        </div>

        <div className="flex-1 overflow-hidden flex">
            {/* 左側：商品列表 */}
            <div className="w-1/2 border-r border-slate-200 p-4 overflow-y-auto bg-slate-50">
                <button 
                    onClick={() => setEditingItem({ iconName: 'Ticket', price: 100 })}
                    className="w-full py-3 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 font-bold text-sm hover:bg-indigo-50 hover:border-indigo-300 transition mb-4 flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4"/> 新增商品
                </button>

                <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-indigo-300 transition cursor-pointer" onClick={() => setEditingItem(item)}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                    <StoreItemIcon name={item.iconName} className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">{item.name}</div>
                                    <div className="text-xs text-slate-500 font-mono">
                                        ${item.price} • {item.stock !== undefined ? `剩 ${item.stock}` : '無限'}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                            >
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="text-center text-slate-400 text-sm py-8">目前沒有自訂商品</div>
                    )}
                </div>
            </div>

            {/* 右側：編輯表單 */}
            <div className="w-1/2 p-6 overflow-y-auto bg-white">
                {editingItem ? (
                    <div className="space-y-6 animate-in slide-in-from-right-2">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                            {editingItem.id ? '編輯商品' : '新增商品'}
                        </h3>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">商品名稱</label>
                            <input 
                                value={editingItem.name || ''} 
                                onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                                className="w-full p-2 border rounded-lg outline-none focus:border-indigo-500 font-bold" 
                                placeholder="例如：免死金牌"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">價格 (文心幣)</label>
                            <input 
                                type="number"
                                value={editingItem.price || ''} 
                                onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})}
                                className="w-full p-2 border rounded-lg outline-none focus:border-indigo-500 font-mono" 
                                placeholder="100"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">圖示</label>
                            <div className="flex gap-2">
                                {ICON_OPTIONS.map(opt => (
                                    <button
                                        key={opt.name}
                                        onClick={() => setEditingItem({...editingItem, iconName: opt.name})}
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center border transition ${editingItem.iconName === opt.name ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300'}`}
                                        title={opt.label}
                                    >
                                        <opt.icon className="w-5 h-5"/>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">描述</label>
                            <textarea 
                                value={editingItem.description || ''} 
                                onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                                className="w-full p-2 border rounded-lg outline-none focus:border-indigo-500 text-sm h-20" 
                                placeholder="說明此獎勵的用途..."
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">庫存 (留空代表無限)</label>
                            <input 
                                type="number"
                                value={editingItem.stock ?? ''} 
                                onChange={e => setEditingItem({...editingItem, stock: e.target.value ? Number(e.target.value) : undefined})}
                                className="w-full p-2 border rounded-lg outline-none focus:border-indigo-500 font-mono" 
                                placeholder="無限"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-2">
                            <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold">取消</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
                                <Save className="w-4 h-4"/> 儲存商品
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Package className="w-12 h-12 mb-2 opacity-20"/>
                        <p className="text-sm">請從左側選擇商品或新增</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

// Helper component to render icon dynamically
function StoreItemIcon({ name, className }: { name: string, className?: string }) {
    const Icon = ICON_OPTIONS.find(i => i.name === name)?.icon || Ticket;
    return <Icon className={className} />;
}