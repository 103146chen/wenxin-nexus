'use client';

import { useState, useEffect } from 'react';
import { X, Target, Users, Check, ChevronDown, Award } from 'lucide-react';
import { AssignmentLevel, useTeacherStore } from '@/store/teacher-store';
import { useLessons } from '@/hooks/use-lessons';

interface DifferentiationModalProps {
  classId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DifferentiationModal({ classId, isOpen, onClose }: DifferentiationModalProps) {
  const { classes, assignTask, activeAssignments } = useTeacherStore();
  const { lessons } = useLessons();
  const currentClass = classes.find(c => c.id === classId);

  // 本地狀態
  const [selectedLessonId, setSelectedLessonId] = useState('lesson-1');
  const [defaultLevel, setDefaultLevel] = useState<AssignmentLevel>('B');
  
  // 🔥 個別調整狀態 { studentId: Level }
  const [studentOverrides, setStudentOverrides] = useState<Record<string, AssignmentLevel>>({});

  // 當開啟或切換課程時，載入既有的設定
  useEffect(() => {
      if (isOpen) {
          const existingAssignment = activeAssignments.find(
              a => a.classId === classId && a.lessonId === selectedLessonId
          );
          if (existingAssignment) {
              setDefaultLevel(existingAssignment.level);
              setStudentOverrides(existingAssignment.overrides || {});
          } else {
              // 預設值
              setDefaultLevel('B');
              setStudentOverrides({});
          }
      }
  }, [isOpen, selectedLessonId, activeAssignments, classId]);

  if (!isOpen || !currentClass) return null;

  const handleAssign = () => {
      assignTask({
          classId,
          lessonId: selectedLessonId,
          level: defaultLevel,
          overrides: studentOverrides // 🔥 儲存個別設定
      });
      alert(`✅ 任務指派成功！\n全班預設：${defaultLevel} 級\n個別調整：${Object.keys(studentOverrides).length} 人`);
      onClose();
  };

  const setOverride = (studentId: string, level: AssignmentLevel) => {
      if (level === defaultLevel) {
          // 如果調回預設值，就移除覆寫
          const newOverrides = { ...studentOverrides };
          delete newOverrides[studentId];
          setStudentOverrides(newOverrides);
      } else {
          setStudentOverrides({ ...studentOverrides, [studentId]: level });
      }
  };

  const getBadgeColor = (level: string) => {
      switch(level) {
          case 'A': return 'bg-purple-100 text-purple-700 border-purple-200';
          case 'B': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'C': return 'bg-green-100 text-green-700 border-green-200';
          default: return 'bg-slate-100 text-slate-700';
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Target className="w-6 h-6 text-indigo-600"/> 
                    差異化任務指派
                </h2>
                <p className="text-sm text-slate-500 mt-1">針對不同程度學生，設定合適的學習挑戰。</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition"><X className="w-5 h-5 text-slate-400"/></button>
        </div>

        <div className="flex-1 overflow-hidden flex">
            
            {/* 左側：設定面板 */}
            <div className="w-1/3 bg-slate-50 p-6 border-r border-slate-200 overflow-y-auto">
                
                {/* 1. 選擇課程 */}
                <div className="mb-8">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">選擇課程</label>
                    <select 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                        value={selectedLessonId}
                        onChange={(e) => setSelectedLessonId(e.target.value)}
                    >
                        {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                    </select>
                </div>

                {/* 2. 全班預設等級 */}
                <div className="mb-8">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">全班預設等級</label>
                    <div className="space-y-3">
                        {[
                            { id: 'C', name: '基礎 (Basic)', desc: '只開放閱讀與筆記，建立信心。' },
                            { id: 'B', name: '標準 (Standard)', desc: '開放測驗挑戰，檢核理解。' },
                            { id: 'A', name: '進階 (Advanced)', desc: '解鎖邏輯圖與高階任務。' }
                        ].map(lvl => (
                            <button
                                key={lvl.id}
                                onClick={() => setDefaultLevel(lvl.id as AssignmentLevel)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all relative ${defaultLevel === lvl.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-bold ${defaultLevel === lvl.id ? 'text-indigo-700' : 'text-slate-700'}`}>{lvl.name}</span>
                                    {defaultLevel === lvl.id && <Check className="w-4 h-4 text-indigo-600" />}
                                </div>
                                <p className="text-xs text-slate-500">{lvl.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2 flex items-center gap-2"><Award className="w-3 h-3"/> 適性化建議</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        建議先將全班設為 <span className="font-bold">B 級</span>，再針對需要補救的學生調整為 <span className="font-bold">C 級</span>，資優生調整為 <span className="font-bold">A 級</span>。
                    </p>
                </div>
            </div>

            {/* 右側：學生名單 (個別調整) */}
            <div className="w-2/3 p-6 overflow-y-auto bg-white flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-slate-400"/>
                        個別差異化調整
                    </h3>
                    <span className="text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-full text-slate-500">
                        目前全班預設：<span className="text-indigo-600 text-lg mx-1">{defaultLevel}</span> 級
                    </span>
                </div>

                <div className="space-y-2">
                    {currentClass.students.map(student => {
                        // 計算該學生當前的有效等級 (Override or Default)
                        const currentLevel = studentOverrides[student.id] || defaultLevel;
                        const isOverridden = !!studentOverrides[student.id];

                        return (
                            <div key={student.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isOverridden ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover"/>
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-700">{student.name}</div>
                                        <div className="text-xs text-slate-400">Lv.{student.level}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isOverridden && <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">個別設定</span>}
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        {(['C', 'B', 'A'] as AssignmentLevel[]).map(lvl => (
                                            <button
                                                key={lvl}
                                                onClick={() => setOverride(student.id, lvl)}
                                                className={`w-8 h-8 rounded-md text-xs font-bold transition-all ${currentLevel === lvl ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition">取消</button>
            <button onClick={handleAssign} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2">
                <Check className="w-4 h-4" /> 確認派發任務
            </button>
        </div>

      </div>
    </div>
  );
}