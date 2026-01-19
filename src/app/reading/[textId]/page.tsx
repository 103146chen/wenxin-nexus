'use client';

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useParams } from "next/navigation"; // 🔥 使用 useParams 獲取路由參數
import { useLessons } from "@/hooks/use-lessons"; // 🔥 使用 hook 讀取包含自訂課程的列表
import Link from "next/link";
import { ArrowLeft, MessageSquare, BookOpen, Trash2, User, School, X, Check, Send, Loader2 } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { GamificationEngine } from "@/lib/engines/GamificationEngine";
import { Annotation } from "@/lib/types/gamification";

export default function ReadingPage() {
  const { textId } = useParams(); 
  const { getLesson } = useLessons();
  
  // 根據網址參數取得課程 (支援老師新增的課程)
  const lesson = getLesson(textId as string);
  const { annotations, addAnnotation, removeAnnotation, name } = useUserStore();
  
  // 取得當前課程的學生個人筆記
  const myAnnotations = lesson && annotations[lesson.id] ? annotations[lesson.id] : [];
  
  // 模擬老師的預設註解 (如果是系統預設的赤壁賦才顯示 Demo 註解)
  const teacherAnnotations: Annotation[] = [];
  if (lesson?.id === 'lesson-1') {
      teacherAnnotations.push(
          { id: 't1', lessonId: 'lesson-1', text: '壬戌之秋', comment: '點明時間：宋神宗元豐五年（1082年）', color: 'purple', type: 'teacher', createdAt: '' },
          { id: 't2', lessonId: 'lesson-1', text: '七月既望', comment: '既望：農曆十六日', color: 'purple', type: 'teacher', createdAt: '' }
      );
  }

  const allAnnotations = [...teacherAnnotations, ...myAnnotations];

  // 選取與輸入狀態
  const [selection, setSelection] = useState<{text: string, top: number, left: number} | null>(null);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [draftColor, setDraftColor] = useState<'yellow' | 'green' | 'pink'>('yellow');
  const [draftComment, setDraftComment] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  // 處理選取文字
  const handleMouseUp = () => {
      if (isInputOpen) return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) { setSelection(null); return; }
      
      // 確保選取的是文章內容區域
      if (contentRef.current && !contentRef.current.contains(sel.anchorNode)) {
          return;
      }

      const text = sel.toString().trim();
      if (text.length === 0) return;
      
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // 計算選單顯示位置
      setSelection({ text, top: rect.top - 60 + window.scrollY, left: rect.left + (rect.width / 2) - 100 });
  };

  const initAnnotation = (color: 'yellow' | 'green' | 'pink') => {
      setDraftColor(color);
      setDraftComment("");
      setIsInputOpen(true);
  };

  const saveAnnotation = () => {
      if (!selection || !lesson) return;
      addAnnotation(lesson.id, {
          lessonId: lesson.id,
          text: selection.text,
          comment: draftComment,
          color: draftColor
      });
      closeAnnotation();
  };

  const closeAnnotation = () => {
      setSelection(null);
      setIsInputOpen(false);
      window.getSelection()?.removeAllRanges();
  };

  const handleSubmit = () => {
      if (myAnnotations.length === 0) {
          alert("請先加入一些筆記再提交喔！");
          return;
      }
      if (!lesson) return;
      
      GamificationEngine.submitAsset({
          id: `annotation-${lesson.id}`,
          type: 'annotation',
          title: `閱讀筆記：${lesson?.title}`,
          contentPreview: JSON.stringify(myAnnotations), 
          authorId: name,
          authorName: name,
          targetText: lesson.id
      });

      alert("🚀 閱讀筆記已提交！老師將會看到你的重點標註。");
  };

  // 內文劃線渲染邏輯
  const renderInteractiveContent = () => {
      if (!lesson) return null;
      let content = lesson.content;
      
      // 建立樣式對照表
      const charStyles = new Array(content.length).fill(null);
      
      allAnnotations.forEach(ann => {
          const start = content.indexOf(ann.text);
          if (start !== -1) {
              for (let i = start; i < start + ann.text.length; i++) {
                  if (!charStyles[i]) {
                      charStyles[i] = { color: ann.color, id: ann.id, type: ann.type };
                  }
              }
          }
      });

      const elements = [];
      let currentText = "";
      let currentStyle = null;

      for (let i = 0; i < content.length; i++) {
          const style = charStyles[i];
          if (JSON.stringify(style) !== JSON.stringify(currentStyle)) {
              if (currentText) elements.push(renderSegment(currentText, currentStyle, i));
              currentText = content[i];
              currentStyle = style;
          } else {
              currentText += content[i];
          }
      }
      if (currentText) elements.push(renderSegment(currentText, currentStyle, content.length));

      return <div className="leading-loose whitespace-pre-wrap">{elements}</div>;
  };

  const renderSegment = (text: string, style: any, key: number) => {
      if (!style) return <span key={key}>{text}</span>;
      
      const bgColors: Record<string, string> = {
          'yellow': 'bg-yellow-200/50 border-b-2 border-yellow-300',
          'green': 'bg-green-200/50 border-b-2 border-green-300',
          'pink': 'bg-pink-200/50 border-b-2 border-pink-300',
          'purple': 'bg-purple-200/50 border-b-2 border-purple-300 text-purple-900 font-bold',
      };

      return (
          <span 
            key={key} 
            className={`${bgColors[style.color]} px-0.5 rounded cursor-pointer transition-colors hover:opacity-80 relative group`}
            title={style.type === 'teacher' ? '教師註解' : '我的筆記'}
          >
            {text}
            {/* 懸浮顯示心得 Tooltip */}
            <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs p-2 rounded w-48 z-10 mb-2 shadow-xl pointer-events-none">
                {style.type === 'teacher' && <span className="block text-[10px] text-purple-300 uppercase font-bold mb-1">TEACHER</span>}
                {allAnnotations.find(a => a.id === style.id)?.comment || '(無文字內容)'}
            </span>
          </span>
      );
  };

  // 如果找不到課程 (可能是老師刪除了或 ID 錯誤)
  if (!lesson) return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
          <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin"/>
              <span>載入文章中...</span>
          </div>
      </div>
  );

  return (
    <div className="flex min-h-screen bg-[#fdf6e3]">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 relative" onMouseUp={handleMouseUp}>
        
        <div className="flex justify-between items-center mb-8">
            <Link href="/reading" className="inline-flex items-center text-slate-500 hover:text-indigo-600 transition">
            <ArrowLeft className="w-4 h-4 mr-1" /> 返回書齋
            </Link>
            <div className="flex items-center gap-4">
                <div className="flex gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-200 rounded-full"></div> 教師註解</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-200 rounded-full"></div> 我的筆記</span>
                </div>
                <button 
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition text-sm font-bold"
                >
                    <Send className="w-4 h-4" /> 提交筆記
                </button>
            </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-bold font-serif text-slate-900 mb-4">{lesson.title}</h1>
                    <p className="text-lg text-slate-600 font-serif">{lesson.author}</p>
                </header>

                <article 
                    ref={contentRef}
                    className="prose prose-xl prose-slate max-w-none font-serif text-slate-800 bg-white p-12 rounded-xl shadow-sm border border-[#efe0c6] relative min-h-[600px]"
                >
                    {renderInteractiveContent()}

                    {/* 互動選單 */}
                    {selection && (
                        <div 
                            className="fixed z-50 animate-in fade-in zoom-in duration-200"
                            style={{ top: selection.top, left: selection.left }}
                        >
                            {!isInputOpen ? (
                                <div className="bg-slate-900 text-white p-2 rounded-xl shadow-xl flex gap-2">
                                    <button onClick={() => initAnnotation('yellow')} className="p-2 hover:bg-slate-700 rounded-lg transition group relative">
                                        <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-black px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">重點</span>
                                    </button>
                                    <button onClick={() => initAnnotation('green')} className="p-2 hover:bg-slate-700 rounded-lg transition group relative">
                                        <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-black px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">疑問</span>
                                    </button>
                                    <button onClick={() => initAnnotation('pink')} className="p-2 hover:bg-slate-700 rounded-lg transition group relative">
                                        <div className="w-4 h-4 bg-pink-400 rounded-full"></div>
                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-black px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">佳句</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white text-slate-800 p-3 rounded-xl shadow-2xl border border-indigo-100 w-64 flex flex-col gap-2">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                            新增筆記
                                        </span>
                                        <button onClick={closeAnnotation} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3"/></button>
                                    </div>
                                    <textarea 
                                        autoFocus
                                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-200 resize-none h-20"
                                        placeholder="寫下你的想法..."
                                        value={draftComment}
                                        onChange={(e) => setDraftComment(e.target.value)}
                                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveAnnotation(); }}}
                                    />
                                    <button 
                                        onClick={saveAnnotation}
                                        className="w-full py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-1"
                                    >
                                        <Check className="w-3 h-3" /> 儲存筆記
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </article>
            </div>

            <div className="col-span-4 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-[#efe0c6] p-6 h-[calc(100vh-100px)] sticky top-8 overflow-y-auto">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        閱讀筆記 ({allAnnotations.length})
                    </h3>
                    <div className="space-y-4">
                        {allAnnotations.length === 0 && (
                            <p className="text-slate-400 text-sm text-center py-10">選取左側文字，<br/>加入你的第一條筆記吧！</p>
                        )}
                        {allAnnotations.map((ann) => (
                            <div 
                                key={ann.id} 
                                className={`p-4 rounded-lg border-l-4 text-sm relative group transition-all hover:shadow-md ${
                                    ann.type === 'teacher' ? 'bg-purple-50 border-purple-400' : ann.color === 'yellow' ? 'bg-yellow-50 border-yellow-400' : ann.color === 'green' ? 'bg-green-50 border-green-400' : 'bg-pink-50 border-pink-400'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${ann.type === 'teacher' ? 'bg-purple-200 text-purple-800' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                        {ann.type === 'teacher' ? <School className="w-3 h-3"/> : <User className="w-3 h-3"/>}
                                        {ann.type === 'teacher' ? '教師註解' : '我的筆記'}
                                    </span>
                                    {ann.type === 'student' && (
                                        <button onClick={() => removeAnnotation(lesson.id, ann.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="font-bold text-slate-800 mb-2 border-b border-black/5 pb-2 font-serif">"{ann.text}"</div>
                                <div className="text-slate-600 leading-relaxed break-words">
                                    {ann.comment || <span className="italic text-slate-400 text-xs">（無文字內容）</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}