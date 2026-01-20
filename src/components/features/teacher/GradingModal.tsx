'use client';

import { useState, useMemo } from 'react';
import { X, Check, XCircle, FileText, BrainCircuit, Maximize } from 'lucide-react';
import { PendingItem, useTeacherStore } from '@/store/teacher-store';
import { ALL_LESSONS } from '@/lib/data/lessons';
import { useLessons } from '@/hooks/use-lessons'; 

// 引入 React Flow 相關元件
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';

interface GradingModalProps {
  item: PendingItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GradingModal({ item, isOpen, onClose }: GradingModalProps) {
  const { gradeSubmission } = useTeacherStore();
  const [feedback, setFeedback] = useState("");
  const { getLesson } = useLessons(); 
  
  if (!isOpen || !item) return null;

  const lesson = getLesson(item.lessonId);

  const handleGrade = (status: 'verified' | 'rejected') => {
      gradeSubmission(item, status, feedback);
      alert(status === 'verified' ? '✅ 已通過作業！' : '↩️ 已退回作業請學生修改。');
      setFeedback("");
      onClose();
  };

  const quickComments = [
      "觀點切中要害！",
      "結構清晰，邏輯嚴謹。",
      "請補充更多細節。",
      "請參考課文第三段重新思考。",
      "論證缺乏佐證資料。"
  ];

  // 渲染帶標註的課文 (Annotation)
  const renderAnnotatedText = () => {
      if (!lesson || !item.contentMock) return <p>無法載入內容</p>;
      
      let annotations: any[] = [];
      try {
          annotations = JSON.parse(item.contentMock);
          if (!Array.isArray(annotations)) throw new Error();
      } catch (e) {
          return <div className="text-red-500">無法解析作業內容</div>;
      }

      const content = lesson.content;
      const charStyles = new Array(content.length).fill(null);
      
      annotations.forEach(ann => {
          // 相容新舊資料結構 (startIndex 優先)
          const start = (ann.startIndex !== undefined) ? ann.startIndex : content.indexOf(ann.text);
          if (start !== -1) {
              for (let i = start; i < start + ann.text.length; i++) {
                  if (!charStyles[i]) charStyles[i] = { color: ann.color, comment: ann.comment };
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

      return <div className="leading-loose whitespace-pre-wrap font-serif text-lg text-slate-800">{elements}</div>;
  };

  const renderSegment = (text: string, style: any, key: number) => {
      if (!style) return <span key={key}>{text}</span>;
      
      const bgColors: Record<string, string> = {
          'yellow': 'bg-yellow-200/60 border-b-2 border-yellow-400',
          'green': 'bg-green-200/60 border-b-2 border-green-400',
          'pink': 'bg-pink-200/60 border-b-2 border-pink-400',
          'purple': 'bg-purple-200/60 border-b-2 border-purple-400',
      };

      return (
          <span key={key} className={`${bgColors[style.color]} px-0.5 rounded cursor-help relative group`}>
            {text}
            {style.comment && (
                <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs p-2 rounded w-48 z-10 mb-1 shadow-xl pointer-events-none">
                    {style.comment}
                </span>
            )}
          </span>
      );
  };

  // 渲染真實邏輯圖
  const RenderLogicMap = () => {
      const flowData = useMemo(() => {
          try {
              return JSON.parse(item.contentMock);
          } catch(e) { return null; }
      }, []);

      if (!flowData || !flowData.nodes) {
          return <div className="text-red-500 flex items-center justify-center h-full">無法讀取邏輯圖資料</div>;
      }

      return (
          <div className="w-full h-[500px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative">
              <ReactFlow
                  defaultNodes={flowData.nodes}
                  defaultEdges={flowData.edges}
                  defaultViewport={flowData.viewport}
                  fitView
                  attributionPosition="bottom-right"
                  nodesDraggable={false} 
                  nodesConnectable={false}
                  elementsSelectable={true}
              >
                  <Background color="#94a3b8" gap={20} size={1} />
                  <Controls showInteractive={false} />
                  <MiniMap />
              </ReactFlow>
              <div className="absolute top-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-500 border border-slate-200 pointer-events-none">
                  唯讀預覽模式
              </div>
          </div>
      );
  };

  // 🔥 修正標題顯示邏輯
  const getTypeTitle = () => {
      switch(item.type) {
          case 'logic-map': return '邏輯思辨結構圖';
          case 'annotation': return '閱讀重點筆記';
          case 'quiz-short': return '測驗簡答題';
          case 'reflection': return '讀後反思'; // 明確定義
          default: return '作業'; // 安全的 Fallback
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex overflow-hidden">
        
        {/* 左側內容 */}
        <div className="flex-1 bg-slate-50 p-8 overflow-y-auto border-r border-slate-200 relative">
            <div className="max-w-3xl mx-auto bg-white min-h-full rounded-xl shadow-sm p-10 border border-slate-200">
                <header className="mb-8 border-b border-slate-100 pb-4">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">《{lesson?.title}》{getTypeTitle()}</h2>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <span>作者：{item.studentName}</span>
                        <span>•</span>
                        <span>繳交時間：{new Date(item.submittedAt).toLocaleDateString()}</span>
                    </div>
                </header>

                {item.type === 'annotation' ? (
                    <div>{renderAnnotatedText()}</div>
                ) : item.type === 'logic-map' ? (
                    <RenderLogicMap />
                ) : item.type === 'quiz-short' ? (
                    <div className="space-y-6">
                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                            <h4 className="text-sm font-bold text-indigo-800 mb-2 uppercase tracking-wider flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4"/> 題目
                            </h4>
                            <p className="text-lg font-serif font-bold text-slate-800">
                                {item.contentMock.length < 20 ? "（簡答題內容）" : "請參考詳解進行評分。"}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">學生回答</h4>
                            <div className="p-6 bg-white border-2 border-slate-200 rounded-xl text-lg text-slate-700 leading-relaxed font-serif shadow-sm">
                                {item.contentMock}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-slate max-w-none">
                        <p>{item.contentMock}</p>
                    </div>
                )}
            </div>
        </div>

        {/* 右側評分欄 (保持不變) */}
        <div className="w-96 bg-white flex flex-col shrink-0">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">作業批改</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition"><X className="w-5 h-5 text-slate-400"/></button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {item.studentName[0]}
                    </div>
                    <div>
                        <div className="font-bold text-slate-700">{item.studentName}</div>
                        <div className="text-xs text-slate-500">{item.className}</div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">教師評語</label>
                    <textarea 
                        className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition"
                        placeholder="寫下給學生的回饋..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    ></textarea>
                </div>

                <div className="mb-8">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">快速回饋</label>
                    <div className="flex flex-wrap gap-2">
                        {quickComments.map((c, i) => (
                            <button 
                                key={i}
                                onClick={() => setFeedback(prev => prev + (prev ? '\n' : '') + c)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-lg transition"
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
                <button onClick={() => handleGrade('verified')} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition">
                    <Check className="w-5 h-5" /> 通過並發送獎勵
                </button>
                <button onClick={() => handleGrade('rejected')} className="w-full py-3 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold flex items-center justify-center gap-2 transition">
                    <XCircle className="w-5 h-5" /> 退回要求修改
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}