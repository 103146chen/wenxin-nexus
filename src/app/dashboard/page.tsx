'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { useTeacherStore } from "@/store/teacher-store";
import { useLessons } from "@/hooks/use-lessons";
import Link from "next/link";
import { 
  Users, 
  BookOpen, 
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
  Settings 
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import DifferentiationModal from "@/components/features/teacher/DifferentiationModal";
import ClassManagementModal from "@/components/features/teacher/ClassManagementModal";

export default function TeacherDashboard() {
  const { classes, selectedClassId, selectClass, getPendingSubmissions, activeAssignments } = useTeacherStore();
  const { lessons } = useLessons();

  // 1. 取得當前選中的班級資料
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const pendingItems = getPendingSubmissions(); // 真實的待批改項目

  // 狀態
  const [selectedLessonId, setSelectedLessonId] = useState('lesson-1'); // 預設赤壁賦
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  // 控制班級管理 Modal
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  
  // 防止 Hydration Error
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // 2. 計算關鍵指標 (KPIs) 與 圖表數據
  const dashboardData = useMemo(() => {
      let totalStudents = 0;
      let totalQuizScore = 0;
      let quizCount = 0;
      let completedTasks = 0;
      let totalAssignedTasks = 0;
      
      // 針對當前課程的統計
      let lessonCompleted = 0;
      let lessonPending = 0;
      let lessonLowScore = 0;
      
      // 錯題計數
      const wrongCounts: Record<string, number> = {};

      const targetClasses = selectedClassId ? [currentClass] : classes;

      targetClasses.forEach(cls => {
          totalStudents += cls.students.length;
          
          if (cls.progressMatrix) {
              Object.values(cls.progressMatrix).forEach(studentProgress => {
                  
                  // 全域統計
                  Object.values(studentProgress).forEach(p => {
                      if (p.quizScore !== undefined && p.quizScore > 0) {
                          totalQuizScore += p.quizScore;
                          quizCount++;
                      }
                      // 注意：這裡使用了 annotationCount，請確保型別定義已更新
                      if (p.quizScore !== undefined || p.logicMapStatus === 'verified' || (p.annotationCount && p.annotationCount > 0)) {
                          completedTasks++;
                      }
                      totalAssignedTasks++;
                  });

                  // 當前選擇課程統計
                  const p = studentProgress[selectedLessonId];
                  if (p) {
                      if (p.status === 'completed' || p.quizScore !== undefined) lessonCompleted++;
                      if (p.logicMapStatus === 'pending') lessonPending++;
                      if (p.quizScore && p.quizScore < 3) lessonLowScore++;
                      
                      // 錯題收集
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

      // 準備錯題圖表資料
      const lesson = lessons.find(l => l.id === selectedLessonId);
      const wrongStats = Object.entries(wrongCounts)
          .map(([qid, count]) => {
              const question = lesson?.quizzes.find(q => q.id === qid);
              // 截斷題目文字以免圖表擠壓
              const shortText = question ? (question.question.substring(0, 10) + '...') : qid;
              return { name: shortText, count, fullQuestion: question?.question };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

      return {
          totalStudents,
          avgScore,
          completionRate,
          pendingCount: pendingItems.length,
          lessonStats: { completed: lessonCompleted, pending: lessonPending, lowScore: lessonLowScore },
          wrongStats
      };
  }, [classes, selectedClassId, currentClass, pendingItems, selectedLessonId, lessons]);

  // 圖表資料
  const completionChartData = [
    { name: '已完成', value: dashboardData.lessonStats.completed, color: '#10b981' },
    { name: '未完成', value: dashboardData.totalStudents - dashboardData.lessonStats.completed, color: '#e2e8f0' },
  ];

  const currentAssignment = activeAssignments.find(a => a.classId === currentClass.id && a.lessonId === selectedLessonId);

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

        {/* 1. 數據概覽卡片 (KPI Cards) */}
        <div className="grid grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between group hover:border-indigo-300 transition">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">班級總人數</p>
                    <h3 className="text-3xl font-bold text-slate-800">{dashboardData.totalStudents}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                    <Users className="w-6 h-6" />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between group hover:border-indigo-300 transition">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">待批改作業</p>
                    <h3 className="text-3xl font-bold text-slate-800 flex items-end gap-2">
                        {dashboardData.pendingCount}
                        {dashboardData.pendingCount > 0 && <span className="flex h-3 w-3 relative mb-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span></span>}
                    </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
                    <AlertCircle className="w-6 h-6" />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between group hover:border-indigo-300 transition">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">測驗平均分</p>
                    <h3 className="text-3xl font-bold text-slate-800">{dashboardData.avgScore} <span className="text-sm text-slate-400 font-medium">/ 5.0</span></h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
                    <TrendingUp className="w-6 h-6" />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between group hover:border-indigo-300 transition">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">任務參與率</p>
                    <h3 className="text-3xl font-bold text-slate-800">{dashboardData.completionRate}%</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
                    <CheckCircle className="w-6 h-6" />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-12 gap-8 mb-10">
            
            {/* 左側：待辦事項清單 */}
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
                                const displayType = item.type === 'logic-map' ? '邏輯圖' 
                                                  : item.type === 'annotation' ? '閱讀筆記' 
                                                  : item.type === 'quiz-short' ? '簡答題' 
                                                  : '作業';

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

            {/* 右側：班級概況與快速入口 */}
            <div className="col-span-4 space-y-6">
                
                {/* 班級成員概況 (整合管理按鈕) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-indigo-600" />
                            {currentClass.name}
                        </h3>
                        {/* 啟用管理按鈕 */}
                        <button 
                            onClick={() => setIsClassModalOpen(true)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition" 
                            title="管理成員"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">班級代碼</span>
                            <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded">{currentClass.code}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">學生人數</span>
                            <span className="font-bold">{currentClass.students.length} 人</span>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            {/* 啟用按鈕 */}
                            <button 
                                onClick={() => setIsClassModalOpen(true)}
                                className="w-full py-2 bg-slate-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-50 transition border border-slate-200 hover:border-indigo-200"
                            >
                                管理班級成員
                            </button>
                        </div>
                    </div>
                </div>

                {/* 派題狀態 */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8 rounded-3xl shadow-lg shadow-indigo-200 flex flex-col justify-between relative overflow-hidden group h-[220px]">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                    <div>
                        <h3 className="text-indigo-200 font-bold text-xs uppercase tracking-wider mb-4">當前課程：{lessons.find(l=>l.id===selectedLessonId)?.title}</h3>
                        {currentAssignment ? (
                            <>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-5xl font-bold">{currentAssignment.level}</div>
                                    <div className="text-xl font-medium opacity-80">級任務</div>
                                </div>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold inline-block mt-2">進行中</span>
                            </>
                        ) : (
                            <>
                                <div className="text-3xl font-bold mb-1">尚未派題</div>
                                <p className="text-indigo-200 text-sm">設定分級任務，引導學生學習。</p>
                            </>
                        )}
                    </div>
                    <button onClick={() => setIsAssignModalOpen(true)} className="mt-4 w-full py-3 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm">
                        <Target className="w-4 h-4" /> {currentAssignment ? '調整任務' : '立即派題'}
                    </button>
                </div>
            </div>
        </div>

        {/* 課程詳細分析 (Lesson Analytics) */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-lg">課程詳細分析</h3>
                <div className="flex gap-2">
                    {lessons.map(lesson => (
                        <button
                            key={lesson.id}
                            onClick={() => setSelectedLessonId(lesson.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. 完成率圓餅圖 */}
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

                {/* 2. 錯題熱點分析 (Bar Chart) */}
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

        {/* 學生列表 */}
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
        
        {/* ClassManagementModal - 班級管理 */}
        <ClassManagementModal 
            classId={currentClass.id}
            isOpen={isClassModalOpen}
            onClose={() => setIsClassModalOpen(false)}
        />

      </div>
    </div>
  );
}