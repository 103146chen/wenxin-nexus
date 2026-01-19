'use client';

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, GitGraph, BrainCircuit, PenTool, MessageSquare, Book, ChevronRight, Download, Loader2, Target, AlertCircle, CheckCircle } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import ChatInterface from "@/components/features/virtual-study/ChatInterface";
import ReflectionEditor from "@/components/features/reflection/ReflectionEditor";
import { Lesson, getLessonsByAuthor } from "@/lib/data/lessons";
import { useUserStore } from "@/store/user-store";
import { useTeacherStore } from "@/store/teacher-store"; 
import { GamificationEngine } from "@/lib/engines/GamificationEngine";
import { PortfolioReport } from "@/components/features/portfolio/PortfolioReport";
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface StudyRoomClientProps {
  initialLesson: Lesson;
}

type TabType = 'chat' | 'reflection';

const MOOD_MAP: Record<string, string> = {
    'inspired': '受到啟發',
    'happy': '心情愉悅',
    'moved': '深受感動',
    'confused': '感到困惑',
    'sad': '有些感傷',
    'calm': '平靜自在'
};

const levelBadgeColor: Record<string, string> = {
    'A': 'bg-purple-100 text-purple-700 border-purple-200',
    'B': 'bg-blue-100 text-blue-700 border-blue-200',
    'C': 'bg-green-100 text-green-700 border-green-200'
};

export default function StudyRoomClient({ initialLesson }: StudyRoomClientProps) {
  const { name, title, level, quizRecords, classId } = useUserStore();
  const { getAssignment, getClassById } = useTeacherStore();
  const authorLessons = getLessonsByAuthor(initialLesson.author);
  
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(initialLesson);
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [isExporting, setIsExporting] = useState(false);
  const [logicMapImage, setLogicMapImage] = useState<string | undefined>(undefined);

  const reportRef = useRef<HTMLDivElement>(null);

  const teacherFeedback = useMemo(() => {
    if (!classId) return null;
    const classData = getClassById(classId);
    if (!classData) return null;

    // 🔥 修復：加上 (s: any)
    const studentRecord = classData.students.find((s: any) => s.name === name);
    if (!studentRecord) return null;

    const progress = classData.progressMatrix[studentRecord.id]?.[selectedLesson.id];
    return progress;
  }, [classId, name, selectedLesson.id, getClassById]);

  const assignment = classId ? getAssignment(classId, selectedLesson.id) : undefined;

  useEffect(() => {
      const snapshot = localStorage.getItem(`logic-map-img-${selectedLesson.id}`);
      setLogicMapImage(snapshot || undefined);
  }, [selectedLesson.id]);

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); 
      const dataUrl = await toPng(reportRef.current, {
        backgroundColor: '#ffffff',
        cacheBust: true, 
        pixelRatio: 2,
        width: 794,
        height: 1123,
        style: {
           visibility: 'visible',
           display: 'block',
           opacity: '1',
           transform: 'none',
        }
      });
      if (dataUrl.length < 5000) throw new Error(`截圖失敗`);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`學習歷程_${selectedLesson.title}_${name}.pdf`);
    } catch (error) {
      console.error(error);
      alert('匯出失敗，請重試。');
    } finally {
      setIsExporting(false);
    }
  };

  const getReportData = () => {
      const reflectionId = `reflection-${selectedLesson.id}`;
      const remoteRef = GamificationEngine.getMyAssets(name).find(a => a.id === reflectionId);
      let reflectionData = undefined;
      
      if (remoteRef) {
          reflectionData = {
              mood: MOOD_MAP[remoteRef.metadata?.mood || ''] || '未紀錄',
              content: remoteRef.contentPreview
          };
      } else {
          const localDraft = localStorage.getItem(`reflection-draft-${selectedLesson.id}`);
          if (localDraft) {
              const parsed = JSON.parse(localDraft);
              reflectionData = {
                  mood: MOOD_MAP[parsed.mood] || '草稿中',
                  content: parsed.content
              };
          }
      }
      const quizData = quizRecords[selectedLesson.id];
      return {
          user: { name, title, level },
          lesson: selectedLesson,
          reflection: reflectionData,
          quizRecord: quizData ? { score: 0, highestScore: quizData.highestScore } : undefined,
          logicMapImage: logicMapImage
      };
  };

  const reportData = getReportData();

  return (
    <div className="flex min-h-screen bg-slate-50 relative z-0">
      
      <div style={{ position: 'fixed', top: 0, left: '-10000px', width: '794px', height: '1123px', zIndex: 100, opacity: 1, background: 'white', pointerEvents: 'none', overflow: 'hidden' }}>
          <PortfolioReport ref={reportRef} {...reportData} />
      </div>

      <Sidebar />
      <div className="ml-64 flex-1 p-8 lg:p-12 z-10 bg-slate-50">
        <Link href="/study" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition">
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回書齋列表
        </Link>

        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold font-serif text-slate-900 mb-2">{initialLesson.author} 的書齋</h1>
            <p className="text-lg text-slate-600">與文豪跨時空對話，探討文學奧秘。</p>
          </div>
          
          <button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-wait">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
            {isExporting ? '生成中...' : '匯出學習歷程 PDF'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[650px] flex flex-col relative">
                <div className="flex border-b border-slate-100 bg-slate-50/50">
                    <button onClick={() => setActiveTab('chat')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'chat' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                        <MessageSquare className="w-4 h-4" /> 導師對話
                    </button>
                    <button onClick={() => setActiveTab('reflection')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'reflection' ? 'bg-white text-rose-600 border-b-2 border-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                        <PenTool className="w-4 h-4" /> 讀後反思
                    </button>
                </div>

                <div className="flex-1 relative bg-slate-50/30">
                    <div className={`absolute inset-0 flex flex-col ${activeTab === 'chat' ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'}`}>
                        <div className="px-6 py-3 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between text-indigo-900 text-xs font-bold">
                            <span>與 {initialLesson.author} 連線中...</span>
                            <span className="bg-white px-2 py-0.5 rounded border border-indigo-100">當前討論：{selectedLesson.title}</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ChatInterface key={selectedLesson.id} tutorName={initialLesson.author} initialMessage={`吾乃${initialLesson.author}。關於《${selectedLesson.title}》，閣下有何心得或疑問，不妨直言。`} />
                        </div>
                    </div>

                    <div className={`absolute inset-0 p-6 overflow-y-auto ${activeTab === 'reflection' ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'}`}>
                        <div className="max-w-2xl mx-auto">
                            <div className="mb-6 text-center">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">《{selectedLesson.title}》讀後反思</h2>
                                <p className="text-sm text-slate-500">沈澱一下思緒，寫下你的感動與啟發。</p>
                            </div>
                            <ReflectionEditor key={`reflection-${selectedLesson.id}`} lessonId={selectedLesson.id} lessonTitle={selectedLesson.title} />
                        </div>
                    </div>
                </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-4 flex items-center gap-2"><Book className="w-4 h-4" /> 收錄著作</h3>
                <div className="space-y-2">
                    {authorLessons.map(lesson => (
                        <button key={lesson.id} onClick={() => setSelectedLesson(lesson)} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${selectedLesson.id === lesson.id ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                            <span className="font-bold">{lesson.title}</span>
                            {selectedLesson.id === lesson.id && <ChevronRight className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500" key={`tasks-${selectedLesson.id}`}>
                
                <div className="flex justify-between items-end mb-2">
                    <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">《{selectedLesson.title}》修習任務</h3>
                    {assignment && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1 ${levelBadgeColor[assignment.level]}`}>
                            <Target className="w-3 h-3" /> 教師指派：{assignment.level} 級
                        </span>
                    )}
                </div>

                <Link href={`/reading/${selectedLesson.id}`} className="group block bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition">
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
                       <div><h3 className="font-bold text-slate-800 text-sm">沉浸式閱讀</h3><p className="text-[10px] text-slate-500">原文閱讀、重點標註</p></div>
                   </div>
                </Link>
                
                <Link href={`/logic-map/${selectedLesson.id}`} className={`group block bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition relative overflow-hidden ${
                    teacherFeedback?.logicMapStatus === 'rejected' ? 'border-red-300 bg-red-50/50' : 
                    teacherFeedback?.logicMapStatus === 'verified' ? 'border-green-300 bg-green-50/50' : 
                    'border-slate-200 hover:border-orange-300'
                }`}>
                   <div className="flex items-center gap-3 relative z-10">
                       <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center"><GitGraph className="w-5 h-5" /></div>
                       <div className="flex-1">
                           <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 text-sm">邏輯思辨</h3>
                                {assignment?.level === 'A' && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded font-bold">必做</span>}
                           </div>
                           
                           {teacherFeedback?.logicMapStatus === 'rejected' ? (
                               <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold mt-1">
                                   <AlertCircle className="w-3 h-3"/> 老師已退回，請訂正
                               </div>
                           ) : teacherFeedback?.logicMapStatus === 'verified' ? (
                               <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold mt-1">
                                   <CheckCircle className="w-3 h-3"/> 作業已通過
                               </div>
                           ) : (
                               <p className="text-[10px] text-slate-500">繪製結構、分析論點</p>
                           )}
                       </div>
                   </div>
                </Link>
                
                <Link href={`/quiz/${selectedLesson.id}`} className="group block bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition">
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center"><BrainCircuit className="w-5 h-5" /></div>
                       <div><h3 className="font-bold text-slate-800 text-sm">測驗挑戰</h3><p className="text-[10px] text-slate-500">驗收成果、賺取獎勵</p></div>
                   </div>
                </Link>
            </div>
            
            <div className="bg-slate-100 p-5 rounded-xl text-slate-500 italic font-serif leading-relaxed text-xs border border-slate-200">
                ❝ 文章千古事，得失寸心知。透過不同篇章，你能看見 {initialLesson.author} 在不同人生階段的心境轉折。 ❞
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}