'use client';

import { useState } from 'react';
import { X, Check, Target, BookOpen, BrainCircuit, GitGraph } from 'lucide-react';
import { useTeacherStore, AssignmentLevel } from '@/store/teacher-store';
import { ALL_LESSONS } from '@/lib/data/lessons';

interface DifferentiationModalProps {
  classId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DifferentiationModal({ classId, isOpen, onClose }: DifferentiationModalProps) {
  const { assignTask, classes } = useTeacherStore();
  const currentClass = classes.find(c => c.id === classId);
  
  const [selectedLessonId, setSelectedLessonId] = useState(ALL_LESSONS[0].id);
  const [level, setLevel] = useState<AssignmentLevel>('B');

  if (!isOpen || !currentClass) return null;

  const handleAssign = () => {
      assignTask({
          classId,
          lessonId: selectedLessonId,
          level,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 預設 7 天後
      });
      alert(`已將任務派發給 ${currentClass.name}！`);
      onClose();
  };

  const levels = [
      { id: 'C', title: 'C 級任務：基礎檢核', xp: '1.0x', items: ['測驗挑戰'], color: 'bg-green-50 border-green-200 text-green-700' },
      { id: 'B', title: 'B 級任務：閱讀深化', xp: '1.2x', items: ['測驗挑戰', '重點標註 (3個)'], color: 'bg-blue-50 border-blue-200 text-blue-700' },
      { id: 'A', title: 'A 級任務：思辨整合', xp: '1.5x', items: ['測驗挑戰', '重點標註', '邏輯思辨圖'], color: 'bg-purple-50 border-purple-200 text-purple-700' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
                <h2 className="text-xl font-bold text-slate-800">差異化任務派發</h2>
                <p className="text-sm text-slate-500">為 {currentClass.name} 設定本週學習目標</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition"><X className="w-5 h-5 text-slate-500"/></button>
        </div>

        <div className="p-8">
            {/* 1. 選擇課程 */}
            <div className="mb-8">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">目標課程</label>
                <select 
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="w-full p-3 bg-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
                >
                    {ALL_LESSONS.map(l => (
                        <option key={l.id} value={l.id}>{l.title} - {l.author}</option>
                    ))}
                </select>
            </div>

            {/* 2. 選擇難度 */}
            <div className="mb-8">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">設定難度分級</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {levels.map((lvl) => (
                        <button
                            key={lvl.id}
                            onClick={() => setLevel(lvl.id as AssignmentLevel)}
                            className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                                level === lvl.id ? lvl.color + ' ring-2 ring-offset-2 ring-indigo-100' : 'bg-white border-slate-100 hover:border-slate-300 text-slate-500'
                            }`}
                        >
                            {level === lvl.id && <div className="absolute top-2 right-2"><Check className="w-4 h-4"/></div>}
                            <div className="font-bold text-lg mb-1">{lvl.id} 級</div>
                            <div className="text-xs opacity-80 mb-3">{lvl.title}</div>
                            <div className="space-y-1">
                                {lvl.items.map(item => (
                                    <div key={item} className="flex items-center text-xs font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-black/10 text-xs font-bold flex justify-between items-center">
                                <span>XP 加成</span>
                                <span className="bg-white/50 px-2 py-0.5 rounded">{lvl.xp}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={handleAssign}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
                <Target className="w-5 h-5" /> 確認派發任務
            </button>
        </div>
      </div>
    </div>
  );
}