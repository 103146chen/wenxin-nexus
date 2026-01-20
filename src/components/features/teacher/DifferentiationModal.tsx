'use client';

import { useState, useEffect } from 'react';
import { X, Target, Users, Check, ChevronDown, Award, AlertCircle } from 'lucide-react';
import { AssignmentLevel, useTeacherStore } from '@/store/teacher-store';
import { useLessons } from '@/hooks/use-lessons';

interface DifferentiationModalProps {
  classId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DifferentiationModal({ classId, isOpen, onClose }: DifferentiationModalProps) {
  const { classes, assignTask, activeAssignments } = useTeacherStore();
  // 🔥 改用 myCustomLessons，只顯示老師自己的課程
  const { myCustomLessons } = useLessons();
  const currentClass = classes.find(c => c.id === classId);

  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [defaultLevel, setDefaultLevel] = useState<AssignmentLevel>('B');
  const [studentOverrides, setStudentOverrides] = useState<Record<string, AssignmentLevel>>({});

  useEffect(() => {
      if (isOpen && myCustomLessons.length > 0 && !selectedLessonId) {
          setSelectedLessonId(myCustomLessons[0].id);
      }
  }, [isOpen, myCustomLessons, selectedLessonId]);

  useEffect(() => {
      if (isOpen && selectedLessonId) {
          const existingAssignment = activeAssignments.find(
              a => a.classId === classId && a.lessonId === selectedLessonId
          );
          if (existingAssignment) {
              setDefaultLevel(existingAssignment.level);
              setStudentOverrides(existingAssignment.overrides || {});
          } else {
              setDefaultLevel('B');
              setStudentOverrides({});
          }
      }
  }, [isOpen, selectedLessonId, activeAssignments, classId]);

  if (!isOpen || !currentClass) return null;

  const handleAssign = () => {
      if (!selectedLessonId) return;
      
      assignTask({
          classId,
          lessonId: selectedLessonId,
          level: defaultLevel,
          overrides: studentOverrides
      });
      
      alert(`✅ 任務設定已儲存！\n\n您現在可以切換其他課程繼續派題，\n或關閉視窗結束操作。`);
  };

  const setOverride = (studentId: string, level: AssignmentLevel) => {
      if (level === defaultLevel) {
          const newOverrides = { ...studentOverrides };
          delete newOverrides[studentId];
          setStudentOverrides(newOverrides);
      } else {
          setStudentOverrides({ ...studentOverrides, [studentId]: level });
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        
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
            <div className="w-1/3 bg-slate-50 p-6 border-r border-slate-200 overflow-y-auto">
                <div className="mb-8">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">選擇課程</label>
                    {myCustomLessons.length > 0 ? (
                        <select 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700 shadow-sm"
                            value={selectedLessonId}
                            onChange={(e) => setSelectedLessonId(e.target.value)}
                        >
                            {myCustomLessons.map(l => {
                                const isActive = activeAssignments.some(a => a.classId === classId && a.lessonId === l.id);
                                return (
                                    <option key={l.id} value={l.id}>
                                        {l.title} {isActive ? '(進行中)' : ''}
                                    </option>
                                );
                            })}
                        </select>
                    ) : (
                        <div className="p-3 bg-amber-50 text-amber-700 text-xs rounded-xl border border-amber-200 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0"/>
                            尚無自訂課程，請先建立或複製教材。
                        </div>
                    )}
                </div>

                <div className="mb-8">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">全班預設等級</label>
                    <div className="space-y-3">
                        {[
                            { id: 'C', name: '基礎', desc: '閱讀與筆記' },
                            { id: 'B', name: '標準', desc: '開放測驗' },
                            { id: 'A', name: '進階', desc: '邏輯圖與高階任務' }
                        ].map(lvl => (
                            <button
                                key={lvl.id}
                                disabled={!selectedLessonId}
                                onClick={() => setDefaultLevel(lvl.id as AssignmentLevel)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all relative ${
                                    defaultLevel === lvl.id 
                                    ? 'border-indigo-500 bg-indigo-50' 
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                } ${!selectedLessonId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            </div>

            <div className="w-2/3 p-6 overflow-y-auto bg-white flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-slate-400"/>
                        個別差異化調整
                    </h3>
                    <span className="text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-full text-slate-500">
                        {selectedLessonId ? <>目前全班預設：<span className="text-indigo-600 text-lg mx-1">{defaultLevel}</span> 級</> : '請先選擇課程'}
                    </span>
                </div>

                <div className="space-y-2">
                    {currentClass.students.map(student => {
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
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        {(['C', 'B', 'A'] as AssignmentLevel[]).map(lvl => (
                                            <button
                                                key={lvl}
                                                disabled={!selectedLessonId}
                                                onClick={() => setOverride(student.id, lvl)}
                                                className={`w-8 h-8 rounded-md text-xs font-bold transition-all ${
                                                    currentLevel === lvl 
                                                    ? 'bg-white shadow text-indigo-600' 
                                                    : 'text-slate-400 hover:text-slate-600'
                                                } ${!selectedLessonId ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition">關閉</button>
            <button onClick={handleAssign} disabled={!selectedLessonId} className={`px-8 py-2.5 rounded-xl font-bold transition shadow-lg shadow-indigo-200 flex items-center gap-2 ${!selectedLessonId ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                <Check className="w-4 h-4" /> 儲存設定
            </button>
        </div>

      </div>
    </div>
  );
}