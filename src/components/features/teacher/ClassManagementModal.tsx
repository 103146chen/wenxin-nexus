'use client';

import { useState } from 'react';
import { X, Plus, Trash2, UserPlus, Users } from 'lucide-react';
import { useTeacherStore } from '@/store/teacher-store';

interface ClassManagementModalProps {
  classId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClassManagementModal({ classId, isOpen, onClose }: ClassManagementModalProps) {
  const { classes, addStudent, removeStudent } = useTeacherStore();
  const currentClass = classes.find(c => c.id === classId);

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");

  if (!isOpen || !currentClass) return null;

  const handleAdd = () => {
      if (!newName) return;
      addStudent(classId, newName, newCode);
      setNewName("");
      setNewCode("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600"/> 
                    班級成員管理
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    管理 <span className="font-bold text-indigo-600">{currentClass.name}</span> ({currentClass.code}) 的學生名單
                </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
            
            {/* 1. 新增學生表單 */}
            <div className="p-6 bg-white border-b border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">快速新增學生</label>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <input 
                            type="text" 
                            placeholder="姓名 (必填)" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                    </div>
                    <div className="w-1/3">
                        <input 
                            type="text" 
                            placeholder="學號 (選填)" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                    </div>
                    <button 
                        onClick={handleAdd}
                        disabled={!newName}
                        className="px-6 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                        <UserPlus className="w-5 h-5" /> 新增
                    </button>
                </div>
            </div>

            {/* 2. 學生列表 */}
            <div className="flex-1 overflow-y-auto p-2">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white text-xs font-bold text-slate-400 uppercase tracking-wider z-10 shadow-sm">
                        <tr>
                            <th className="p-4 pl-6">學生資料</th>
                            <th className="p-4">等級</th>
                            <th className="p-4 text-right pr-6">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {currentClass.students.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-12 text-center text-slate-400">
                                    尚無學生資料，請由上方新增。
                                </td>
                            </tr>
                        ) : (
                            currentClass.students.map((stu) => (
                                <tr key={stu.id} className="hover:bg-slate-50 transition group">
                                    <td className="p-3 pl-6 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                            {/* 使用 DiceBear 產生隨機頭像 */}
                                            <img 
                                                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${stu.id}`} 
                                                alt={stu.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700">{stu.name}</div>
                                            <div className="text-xs text-slate-400 font-mono">ID: {stu.id.slice(-6)}</div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                                            Lv. {stu.level}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right pr-6">
                                        <button 
                                            onClick={() => {
                                                if(confirm(`確定要移除 ${stu.name} 嗎？此動作無法復原。`)) {
                                                    removeStudent(classId, stu.id);
                                                }
                                            }}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                            title="移除學生"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-right text-xs text-slate-400">
            共 {currentClass.students.length} 位學生
        </div>

      </div>
    </div>
  );
}