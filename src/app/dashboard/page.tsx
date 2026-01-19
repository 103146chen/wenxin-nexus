'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { useTeacherStore } from "@/store/teacher-store";
import { Users, BookOpen, TrendingUp, AlertCircle, Plus, ChevronRight, BarChart2, Target, Loader2 } from "lucide-react"; // 加入 Loader2
import Link from "next/link";
import { useState, useMemo, useEffect } from "react"; // 加入 useEffect
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ALL_LESSONS } from "@/lib/data/lessons";
import DifferentiationModal from "@/components/features/teacher/DifferentiationModal";

export default function TeacherDashboard() {
  const { classes, selectedClassId, selectClass, activeAssignments } = useTeacherStore();
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // 狀態
  const [selectedLessonId, setSelectedLessonId] = useState('lesson-1');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // 🔥 修復 Hydration Error 的關鍵：
  // 我們先設定 mounted 為 false，等到 useEffect 執行(代表在瀏覽器端了)才設為 true
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. 計算全班概況 (移到下方，確保 mounted 後才運算，避免 SSR/CSR 不一致)
  const totalStudents = currentClass.students.length;
  
  // 這些運算依賴 Math.random 產生的假資料，所以必須確保只在 Client 端渲染
  const stats = useMemo(() => {
      let completed = 0;
      let pending = 0;
      let lowScore = 0;
      
      Object.values(currentClass.progressMatrix).forEach(progress => {
          const p = progress[selectedLessonId];
          if (p?.status === 'completed') completed++;
          if (p?.logicMapStatus === 'pending') pending++;
          if (p?.quizScore && p.quizScore < 3) lowScore++;
      });
      return { completed, pending, lowScore };
  }, [currentClass, selectedLessonId]);

  const completionData = [
    { name: '已完成', value: stats.completed, color: '#10b981' },
    { name: '進行中', value: totalStudents - stats.completed, color: '#e2e8f0' },
  ];

  // 2. 計算錯題熱點
  const wrongStats = useMemo(() => {
      const counts: Record<string, number> = {};
      Object.values(currentClass.progressMatrix).forEach(progress => {
          const p = progress[selectedLessonId];
          if (p && p.quizWrongIds) {
              p.quizWrongIds.forEach(qid => {
                  counts[qid] = (counts[qid] || 0) + 1;
              });
          }
      });
      const lesson = ALL_LESSONS.find(l => l.id === selectedLessonId);
      return Object.entries(counts)
          .map(([qid, count]) => {
              const question = lesson?.quizzes.find(q => q.id === qid);
              const shortText = question ? (question.question.substring(0, 12) + '...') : qid;
              return { name: shortText, count, fullQuestion: question?.question };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
  }, [currentClass, selectedLessonId]);

  const currentAssignment = activeAssignments.find(a => a.classId === currentClass.id && a.lessonId === selectedLessonId);

  // 🔥 防止 SSR 渲染不一致：
  // 如果還沒 Mount (還在伺服器端或剛載入)，只顯示 Loading 或空殼
  if (!isMounted) {
      return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="ml-64 flex-1 p-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p>正在讀取班級數據...</p>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">教師指揮中心</h1>
                <p className="text-slate-500">歡迎回來，老師。這是您今天的班級概況。</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase ml-2">當前班級</span>
                <select 
                    value={selectedClassId || ''}
                    onChange={(e) => selectClass(e.target.value)}
                    className="bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg outline-none cursor-pointer hover:bg-slate-200 transition"
                >
                    {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <button className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition" title="新增班級">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* 課程過濾器 */}
        <div className="mb-8 flex items-center gap-4">
            <span className="font-bold text-slate-700">數據分析範圍：</span>
            <div className="flex gap-2 overflow-x-auto pb-2">
                {ALL_LESSONS.map(lesson => (
                    <button
                        key={lesson.id}
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${
                            selectedLessonId === lesson.id 
                                ? 'bg-slate-800 text-white shadow-md' 
                                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        {lesson.title}
                    </button>
                ))}
            </div>
        </div>

        {/* 概況卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Users className="w-6 h-6" /></div>
                <div><div className="text-3xl font-bold text-slate-800">{totalStudents}</div><div className="text-xs text-slate-500 font-bold uppercase">學生總數</div></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><BookOpen className="w-6 h-6" /></div>
                <div>
                    {/* 這裡原本會報錯，現在因為有 isMounted 保護，只會在 Client 端渲染 */}
                    <div className="text-3xl font-bold text-slate-800">{Math.round((stats.completed/totalStudents)*100)}%</div>
                    <div className="text-xs text-slate-500 font-bold uppercase">完成率</div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center"><AlertCircle className="w-6 h-6" /></div>
                <div><div className="text-3xl font-bold text-slate-800">{stats.pending}</div><div className="text-xs text-slate-500 font-bold uppercase">待批改</div></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6" /></div>
                <div><div className="text-3xl font-bold text-slate-800">{stats.lowScore}</div><div className="text-xs text-slate-500 font-bold uppercase">需補救</div></div>
            </div>
        </div>

        {/* 圖表區 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            
            {/* 1. 任務派發卡片 */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8 rounded-3xl shadow-lg shadow-indigo-200 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                <div>
                    <h3 className="text-indigo-200 font-bold text-xs uppercase tracking-wider mb-2">當前任務狀態</h3>
                    {currentAssignment ? (
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="text-4xl font-bold">{currentAssignment.level} 級</div>
                                <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">進行中</span>
                            </div>
                            <p className="text-indigo-100 text-sm opacity-80">
                                針對《{ALL_LESSONS.find(l=>l.id===currentAssignment.lessonId)?.title}》的差異化任務
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="text-3xl font-bold mb-1">尚未派題</div>
                            <p className="text-indigo-200 text-sm">設定分級任務，引導學生學習。</p>
                        </>
                    )}
                </div>
                
                <button 
                    onClick={() => setIsAssignModalOpen(true)}
                    className="mt-6 w-full py-3 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                    <Target className="w-4 h-4" /> {currentAssignment ? '調整任務' : '立即派題'}
                </button>
            </div>

            {/* 2. 錯題熱點分析 */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-rose-500" /> 
                        錯題熱點分析
                    </h3>
                    <span className="text-xs text-slate-400">Top 5 錯誤率最高題目</span>
                </div>
                
                {wrongStats.length > 0 ? (
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={wrongStats} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="count" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                        尚無錯題數據 (或是太厲害了都答對！)
                    </div>
                )}
            </div>
        </div>

        {/* 學生列表 */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">學生名單 ({totalStudents})</h3>
                <div className="text-xs text-slate-500">依學號排序</div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4 pl-6">學生</th>
                            <th className="p-4">等級</th>
                            <th className="p-4">進度狀態</th>
                            <th className="p-4">測驗分</th>
                            <th className="p-4">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentClass.students.map(student => {
                            const p = currentClass.progressMatrix[student.id][selectedLessonId];
                            return (
                                <tr key={student.id} className="hover:bg-slate-50/50 transition">
                                    <td className="p-4 pl-6 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                            {student.name[0]}
                                        </div>
                                        <span className="font-bold text-slate-700">{student.name}</span>
                                    </td>
                                    <td className="p-4 text-slate-500 font-mono">Lv.{student.level}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${p.status === 'completed' ? 'bg-green-500' : p.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                            <span className="text-sm text-slate-600">
                                                {p.status === 'completed' ? '已完成' : p.status === 'in-progress' ? '進行中' : '未開始'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-slate-700">
                                        {p.quizScore ? (
                                            <span className={p.quizScore < 3 ? 'text-red-500' : 'text-green-600'}>{p.quizScore} / 5</span>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4">
                                        <Link href={`/teacher/verification?studentId=${student.id}`} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded transition inline-block">
                                            批閱作業
                                        </Link>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {/* 派題 Modal */}
        <DifferentiationModal 
            classId={currentClass.id}
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
        />

      </div>
    </div>
  );
}