'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { useTeacherStore } from "@/store/teacher-store";
import { useLessons } from "@/hooks/use-lessons";
import Link from "next/link";
import { 
  Users, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Plus,
  ChevronRight,
  GraduationCap,
  Target,
  BarChart2,
  Loader2,
  Settings,
  BookOpen,
  Store, // 🔥 Import Store icon
  Ticket
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import DifferentiationModal from "@/components/features/teacher/DifferentiationModal";
import ClassManagementModal from "@/components/features/teacher/ClassManagementModal";
import StoreManagerModal from "@/components/features/teacher/StoreManagerModal"; // 🔥 Import
import RedemptionModal from "@/components/features/teacher/RedemptionModal"; // 🔥 Import
import { getAllQuestions } from "@/lib/data/lessons";
import { StoreEngine } from "@/lib/engines/StoreEngine"; // 🔥 Import
import { useUserStore } from "@/store/user-store"; // 🔥 Import

export default function TeacherDashboard() {
  const { classes, selectedClassId, selectClass, getPendingSubmissions, activeAssignments } = useTeacherStore();
  const { lessons } = useLessons();
  const { id: teacherId } = useUserStore();

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const pendingItems = getPendingSubmissions(); 

  const [selectedLessonId, setSelectedLessonId] = useState('lesson-1'); 
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  // 🔥 新增 Modal 狀態
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);
  const [pendingRedemptionsCount, setPendingRedemptionsCount] = useState(0);
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // 🔥 檢查待核銷數量 (每 5 秒或當 modal 關閉時更新)
  useEffect(() => {
      const checkRedemptions = () => {
          if (teacherId) {
              const count = StoreEngine.getPendingRedemptions(teacherId).length;
              setPendingRedemptionsCount(count);
          }
      };
      
      checkRedemptions();
      const interval = setInterval(checkRedemptions, 5000);
      return () => clearInterval(interval);
  }, [teacherId, isRedemptionModalOpen]);

  const classActiveAssignments = activeAssignments.filter(a => a.classId === currentClass.id);

  useEffect(() => {
      if (classActiveAssignments.length > 0 && selectedLessonId === 'lesson-1') {
          setSelectedLessonId(classActiveAssignments[0].lessonId);
      }
  }, [classActiveAssignments, selectedLessonId]);

  const dashboardData = useMemo(() => {
      let totalStudents = 0;
      let totalQuizScore = 0;
      let quizCount = 0;
      let completedTasks = 0;
      let totalAssignedTasks = 0;
      let lessonCompleted = 0;
      let lessonPending = 0;
      let lessonLowScore = 0;
      const wrongCounts: Record<string, number> = {};

      const targetClasses = selectedClassId ? [currentClass] : classes;

      targetClasses.forEach(cls => {
          totalStudents += cls.students.length;
          if (cls.progressMatrix) {
              Object.values(cls.progressMatrix).forEach(studentProgress => {
                  Object.values(studentProgress).forEach(p => {
                      if (p.quizScore !== undefined && p.quizScore > 0) {
                          totalQuizScore += p.quizScore;
                          quizCount++;
                      }
                      if (p.quizScore !== undefined || p.logicMapStatus === 'verified' || (p as any).annotationCount > 0) {
                          completedTasks++;
                      }
                      totalAssignedTasks++;
                  });

                  const p = studentProgress[selectedLessonId];
                  if (p) {
                      if (p.status === 'completed' || p.quizScore !== undefined) lessonCompleted++;
                      if (p.logicMapStatus === 'pending') lessonPending++;
                      if (p.quizScore && p.quizScore < 3) lessonLowScore++;
                      if (p.quizWrongIds) {
                          p.quizWrongIds.forEach(qid => {
                              wrongCounts[qid] = (wrongCounts[qid] || 0) + 1;
                          });
                      }
                  }
              });
          }
      });

      const avgScore = quizCount > 0 ? (totalQuizScore / quizCount).toFixed(1) : "0.0";
      const completionRate = totalAssignedTasks > 0 ? Math.round((completedTasks / totalAssignedTasks) * 100) : 0;
      const lesson = lessons.find(l => l.id === selectedLessonId);
      const allQuestions = lesson ? getAllQuestions(lesson) : [];
      const wrongStats = Object.entries(wrongCounts)
          .map(([qid, count]) => {
              const question = allQuestions.find(q => q.id === qid);
              const shortText = question ? (question.question.substring(0, 10) + '...') : qid;
              return { name: shortText, count, fullQuestion: question?.question };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

      return {
          totalStudents, avgScore, completionRate,
          pendingCount: pendingItems.length,
          lessonStats: { completed: lessonCompleted, pending: lessonPending, lowScore: lessonLowScore },
          wrongStats
      };
  }, [classes, selectedClassId, currentClass, pendingItems, selectedLessonId, lessons]);

  const completionChartData = [
    { name: '已完成', value: dashboardData.lessonStats.completed, color: '#10b981' },
    { name: '未完成', value: dashboardData.totalStudents - dashboardData.lessonStats.completed, color: '#e2e8f0' },
  ];

  if (!isMounted) {
      return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="ml-64 flex-1 p-10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
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
                <p className="text-slate-500 mt-1">
                    歡迎回來，老師。目前有 <span className="font-bold text-indigo-600">{dashboardData.pendingCount}</span> 項作業等待批改。
                </p>
            </div>
            
            <div className="flex gap-3">
                {/* 🔥 新增：福利社管理按鈕 */}
                <button 
                    onClick={() => setIsStoreModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-bold"
                >
                    <Store className="w-4 h-4" /> 商店管理
                </button>

                {/* 🔥 新增：核銷中心按鈕 (有紅點) */}
                <button 
                    onClick={() => setIsRedemptionModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-bold relative"
                >
                    <Ticket className="w-4 h-4" /> 獎勵核銷
                    {pendingRedemptionsCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-slate-50">
                            {pendingRedemptionsCount}
                        </span>
                    )}
                </button>

                <div className="w-px h-10 bg-slate-200 mx-1"></div>

                <Link href="/teacher/lessons/new" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow hover:bg-slate-800 transition font-bold">
                    <Plus className="w-4 h-4" /> 建立新課程
                </Link>

                <div className="flex items-center gap-3 bg-white p-1 pr-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                        <Users className="w-4 h-4" />
                    </div>
                    <select 
                        value={selectedClassId || ''} 
                        onChange={(e) => selectClass(e.target.value)}
                        className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
                    >
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        {/* 1. 數據概覽卡片 */}
        <div className="grid grid-cols-4 gap-6 mb-10">
            {/* ... (保持原樣) ... */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">班級總人數</p>
                    <h3 className="text-3xl font-bold text-slate-800">{dashboardData.totalStudents}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">待批改作業</p>
                    <h3 className="text-3xl font-bold text-slate-800 flex items-end gap-2">
                        {dashboardData.pendingCount}
                        {dashboardData.pendingCount > 0 && <span className="flex h-3 w-3 relative mb-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span></span>}
                    </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">測驗平均分</p>
                    <h3 className="text-3xl font-bold text-slate-800">{dashboardData.avgScore} <span className="text-sm text-slate-400 font-medium">/ 5.0</span></h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">任務參與率</p>
                    <h3 className="text-3xl font-bold text-slate-800">{dashboardData.completionRate}%</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                </div>
            </div>
        </div>

        {/* 主內容區 */}
        <div className="grid grid-cols-12 gap-8 mb-10">
            {/* 左側：待辦事項清單 (保持原樣) */}
            <div className="col-span-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-600" />
                            待辦事項
                        </h3>
                        <Link href="/teacher/verification" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            查看全部 <ChevronRight className="w-4 h-4"/>
                        </Link>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[300px]">
                        {pendingItems.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>太棒了！所有作業都已批改完成。</p>
                            </div>
                        ) : (
                            pendingItems.slice(0, 10).map((item, idx) => {
                                const relatedLesson = lessons.find(l => l.id === item.lessonId);
                                const lessonTitle = relatedLesson?.title || item.lessonId;
                                const displayType = item.type === 'logic-map' ? '邏輯圖' : item.type === 'annotation' ? '閱讀筆記' : item.type === 'quiz-short' ? '簡答題' : '作業';

                                return (
                                    <div key={idx} className="p-4 hover:bg-slate-50 transition flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                {item.studentName[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">
                                                    {item.studentName} <span className="text-slate-400 font-normal">提交了</span> {displayType}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {lessonTitle} • {new Date(item.submittedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <Link href="/teacher/verification" className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition shadow-sm">
                                            立即批改
                                        </Link>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* 右側：進行中課程列表 (保持原樣) */}
            <div className="col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-indigo-600" />
                            {currentClass.name}
                        </h3>
                        <button onClick={() => setIsClassModalOpen(true)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition"><Settings className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">班級代碼</span>
                            <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded">{currentClass.code}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <button onClick={() => setIsAssignModalOpen(true)} className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-sm">
                                <Target className="w-4 h-4" /> 指派新任務
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-600"/> 進行中課程 ({classActiveAssignments.length})
                        </h3>
                    </div>
                    
                    <div className="max-h-[200px] overflow-y-auto">
                        {classActiveAssignments.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs">
                                尚未指派任何任務
                            </div>
                        ) : (
                            classActiveAssignments.map(assignment => {
                                const lesson = lessons.find(l => l.id === assignment.lessonId);
                                const isSelected = selectedLessonId === assignment.lessonId;
                                return (
                                    <button
                                        key={assignment.lessonId}
                                        onClick={() => setSelectedLessonId(assignment.lessonId)}
                                        className={`w-full text-left p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition flex justify-between items-center ${isSelected ? 'bg-indigo-50 border-indigo-100' : ''}`}
                                    >
                                        <div>
                                            <div className={`font-bold text-sm ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                {lesson?.title || '未知課程'}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                預設等級: <span className="font-mono font-bold bg-white border px-1 rounded">{assignment.level}</span>
                                            </div>
                                        </div>
                                        {isSelected && <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* 課程詳細分析 */}
        <div className="mb-8">
            {/* ... (保持原樣) ... */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-lg">
                    {lessons.find(l => l.id === selectedLessonId)?.title} - 學習分析
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 w-full text-left">學習進度分佈</h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={completionChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {completionChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex gap-6 mt-4">
                        {completionChartData.map(entry => (
                            <div key={entry.name} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                {entry.name}: {entry.value}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[300px]">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">錯題熱點分析 (Top 5)</h4>
                        <span className="text-xs text-rose-500 bg-rose-50 px-2 py-1 rounded font-bold">需加強觀念</span>
                    </div>
                    
                    {dashboardData.wrongStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData.wrongStats} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}} 
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    labelStyle={{fontWeight: 'bold', color: '#334155'}}
                                />
                                <Bar dataKey="count" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={20} name="錯誤次數" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                            尚無錯題數據，表現優異！
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* 學生名單 */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">學生名單 ({dashboardData.totalStudents})</h3>
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
                            const p = currentClass.progressMatrix[student.id]?.[selectedLessonId] || {};
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
                                        <Link href={`/teacher/verification`} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded transition inline-block">
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
        
        {/* Modals */}
        <DifferentiationModal 
            classId={currentClass.id}
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
        />
        
        <ClassManagementModal 
            classId={currentClass.id}
            isOpen={isClassModalOpen}
            onClose={() => setIsClassModalOpen(false)}
        />

        {/* 🔥 新增：掛載商店相關 Modal */}
        <StoreManagerModal
            isOpen={isStoreModalOpen}
            onClose={() => setIsStoreModalOpen(false)}
        />

        <RedemptionModal
            isOpen={isRedemptionModalOpen}
            onClose={() => setIsRedemptionModalOpen(false)}
        />

      </div>
    </div>
  );
}