'use client';

import { useState, useRef } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useTeacherStore } from '@/store/teacher-store';
import { useRouter } from 'next/navigation';
import { BookOpen, Save, Plus, Trash2, ChevronLeft, BrainCircuit, CheckCircle, List, FileText, Layers, AlignLeft, CheckSquare, Eye, Edit3, X, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Lesson, QuizQuestion, SingleChoiceQuestion, MultipleChoiceQuestion, ShortAnswerQuestion, DifficultWord } from '@/lib/data/lessons';

type QuestionType = 'single' | 'multiple' | 'short' | 'group';

const DEFAULT_QUESTION = {
    id: '',
    type: 'single' as QuestionType,
    question: '',
    explanation: '',
    guidance: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    correctIndices: [] as number[],
    groupContent: '',
    subQuestions: [] as (SingleChoiceQuestion | MultipleChoiceQuestion | ShortAnswerQuestion)[],
    referenceAnswer: ''
};

export default function CreateLessonPage() {
  const router = useRouter();
  const { addLesson } = useTeacherStore();
  
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'quiz'>('basic');

  // 基本資訊
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    content: '',
  });

  // 難詞狀態
  const [difficultWords, setDifficultWords] = useState<DifficultWord[]>([]);
  // 難詞標註 UI 狀態
  const [selection, setSelection] = useState<{text: string, startIndex: number, top: number, left: number} | null>(null);
  const [draftDefinition, setDraftDefinition] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  // 題目狀態
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [editingQ, setEditingQ] = useState({ ...DEFAULT_QUESTION });
  const [editingSubQ, setEditingSubQ] = useState({ ...DEFAULT_QUESTION, type: 'single' as 'single' | 'multiple' | 'short' });
  const [isAddingSubQ, setIsAddingSubQ] = useState(false);

  // --- 難詞標註操作 ---
  const handleMouseUp = () => {
      // 只有在內容分頁且有內容時才觸發
      if (activeTab !== 'content' || !formData.content) return;
      
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) { setSelection(null); return; }
      if (contentRef.current && !contentRef.current.contains(sel.anchorNode)) return;

      const text = sel.toString().trim();
      if (text.length === 0) return;

      // 計算 startIndex
      let startIndex = 0;
      if (contentRef.current && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const preSelectionRange = range.cloneRange();
          preSelectionRange.selectNodeContents(contentRef.current);
          preSelectionRange.setEnd(range.startContainer, range.startOffset);
          startIndex = preSelectionRange.toString().length;
      }

      // 校正換行符號導致的位移 (簡單防呆)
      // 如果直接對應不到，嘗試在附近搜尋
      if (formData.content.substr(startIndex, text.length) !== text) {
          const fallback = formData.content.indexOf(text, Math.max(0, startIndex - 5));
          if (fallback !== -1 && Math.abs(fallback - startIndex) < 10) startIndex = fallback;
      }

      const rect = sel.getRangeAt(0).getBoundingClientRect();
      // 設定選單位置
      const relativeTop = rect.top - (contentRef.current?.getBoundingClientRect().top || 0) + contentRef.current!.scrollTop;
      
      setSelection({ 
          text, 
          startIndex, 
          top: rect.top + window.scrollY - 50, // 顯示在上方
          left: rect.left + (rect.width / 2) - 100 
      });
      setDraftDefinition(""); // 重置輸入框
  };

  const handleAddDifficultWord = () => {
      if (!selection || !draftDefinition) return;
      setDifficultWords([...difficultWords, {
          term: selection.text,
          definition: draftDefinition,
          startIndex: selection.startIndex
      }]);
      setSelection(null);
      window.getSelection()?.removeAllRanges();
  };

  const handleDeleteWord = (idx: number) => {
      setDifficultWords(difficultWords.filter((_, i) => i !== idx));
  };

  // --- 渲染編輯器內容 (支援難詞高亮) ---
  const renderPreviewContent = () => {
      if (!formData.content) return <p className="text-slate-400">請先在上方輸入課文內容...</p>;
      
      const content = formData.content;
      const charStyles = new Array(content.length).fill(false);
      
      difficultWords.forEach(dw => {
          if (dw.startIndex >= 0 && dw.startIndex < content.length) {
              for (let i = dw.startIndex; i < dw.startIndex + dw.term.length; i++) {
                  charStyles[i] = true;
              }
          }
      });

      const elements = [];
      let currentText = "";
      let isMarked = false;

      for (let i = 0; i < content.length; i++) {
          if (charStyles[i] !== isMarked) {
              if (currentText) {
                  elements.push(isMarked 
                      ? <span key={i} className="bg-yellow-200 border-b-2 border-yellow-400 px-0.5 cursor-help" title="已標註難詞">{currentText}</span> 
                      : <span key={i}>{currentText}</span>
                  );
              }
              currentText = content[i];
              isMarked = charStyles[i];
          } else {
              currentText += content[i];
          }
      }
      if (currentText) {
          elements.push(isMarked 
              ? <span key="last" className="bg-yellow-200 border-b-2 border-yellow-400 px-0.5 cursor-help" title="已標註難詞">{currentText}</span> 
              : <span key="last">{currentText}</span>
          );
      }

      return (
          <div 
            ref={contentRef}
            className="prose prose-lg max-w-none font-serif leading-loose whitespace-pre-wrap select-text p-6 bg-white rounded-xl border border-slate-200 shadow-sm relative min-h-[400px]"
            onMouseUp={handleMouseUp}
          >
              {elements}
              {selection && (
                  <div 
                    className="absolute z-100 bg-slate-800 text-white p-3 rounded-xl shadow-xl w-64 flex flex-col gap-2 animate-in fade-in zoom-in duration-200"
                    style={{ top: selection.top - contentRef.current!.getBoundingClientRect().top + 20, left: selection.left - contentRef.current!.getBoundingClientRect().left + 20 }}
                  >
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-b border-slate-600 pb-2 mb-1">
                          <span>標註難詞：{selection.text}</span>
                          <button onClick={() => setSelection(null)}><X className="w-3 h-3"/></button>
                      </div>
                      <input 
                          autoFocus
                          className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm outline-none focus:border-indigo-400"
                          placeholder="請輸入解釋..."
                          value={draftDefinition}
                          onChange={e => setDraftDefinition(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddDifficultWord()}
                      />
                      <button onClick={handleAddDifficultWord} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1.5 rounded">確認新增</button>
                  </div>
              )}
          </div>
      );
  };

  // --- 題目操作 (保持不變) ---
  const handleAddQuestion = () => {
      if (!editingQ.question) { alert("請輸入題目說明"); return; }
      const baseQ = {
          id: `q-${Date.now()}`,
          question: editingQ.question,
          explanation: editingQ.explanation || '（無詳解）',
          guidance: editingQ.guidance || '請參考課文。',
      };
      let newQ: QuizQuestion;
      if (editingQ.type === 'single') {
          newQ = { ...baseQ, type: 'single', options: editingQ.options.filter(o=>o), correctIndex: editingQ.correctIndex };
      } else if (editingQ.type === 'multiple') {
          newQ = { ...baseQ, type: 'multiple', options: editingQ.options.filter(o=>o), correctIndices: editingQ.correctIndices };
      } else if (editingQ.type === 'short') {
          newQ = { ...baseQ, type: 'short', referenceAnswer: editingQ.referenceAnswer };
      } else {
          if (!editingQ.groupContent) { alert("題組文章內容不能為空"); return; }
          newQ = { ...baseQ, type: 'group', groupContent: editingQ.groupContent, subQuestions: editingQ.subQuestions };
      }
      setQuestions([...questions, newQ]);
      setEditingQ({ ...DEFAULT_QUESTION, type: editingQ.type }); 
  };

  const handleDeleteQuestion = (index: number) => {
      setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleAddSubQuestion = () => {
      if (!editingSubQ.question) return;
      const subId = `sub-${Date.now()}`;
      const baseSub = {
          id: subId,
          question: editingSubQ.question,
          explanation: editingSubQ.explanation,
          guidance: editingSubQ.guidance
      };
      let newSub: any;
      if (editingSubQ.type === 'single') {
          newSub = { ...baseSub, type: 'single', options: editingSubQ.options.filter(o=>o), correctIndex: editingSubQ.correctIndex };
      } else if (editingSubQ.type === 'multiple') {
          newSub = { ...baseSub, type: 'multiple', options: editingSubQ.options.filter(o=>o), correctIndices: editingSubQ.correctIndices };
      } else {
          newSub = { ...baseSub, type: 'short', referenceAnswer: editingSubQ.referenceAnswer };
      }
      setEditingQ({ ...editingQ, subQuestions: [...editingQ.subQuestions, newSub] });
      setEditingSubQ({ ...DEFAULT_QUESTION, type: 'single' });
      setIsAddingSubQ(false);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
        alert('請至少輸入標題與課文內容！');
        return;
    }
    const newLesson: Lesson = {
        id: `custom-${Date.now()}`,
        title: formData.title,
        author: formData.author || '未知作者',
        description: formData.description || '由教師新增的自訂課程',
        content: formData.content,
        colorTheme: 'indigo', 
        difficultWords: difficultWords, 
        quizzes: questions
    };
    addLesson(newLesson);
    alert('🎉 課程建立成功！');
    router.push('/dashboard');
  };

  const renderOptionEditor = (target: typeof editingQ | typeof editingSubQ, setTarget: Function) => (
      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="text-xs font-bold text-slate-500 uppercase">選項設定</label>
          {target.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                  <button 
                      onClick={() => {
                          if (target.type === 'single') {
                              setTarget({ ...target, correctIndex: idx });
                          } else {
                              const newIndices = target.correctIndices.includes(idx)
                                  ? target.correctIndices.filter(i => i !== idx)
                                  : [...target.correctIndices, idx];
                              setTarget({ ...target, correctIndices: newIndices });
                          }
                      }}
                      className={`w-8 h-8 flex-shrink-0 rounded-lg border flex items-center justify-center transition-all ${
                          (target.type === 'single' ? target.correctIndex === idx : target.correctIndices.includes(idx))
                              ? 'bg-green-500 border-green-500 text-white shadow-md' 
                              : 'bg-white border-slate-300 text-slate-300 hover:border-slate-400'
                      }`}
                  >
                      <CheckCircle className="w-4 h-4" />
                  </button>
                  <input className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500" placeholder={`選項 ${idx + 1}`} value={opt} onChange={e => { const newOpts = [...target.options]; newOpts[idx] = e.target.value; setTarget({...target, options: newOpts}); }} />
                  <button onClick={() => { const newOpts = target.options.filter((_, i) => i !== idx); setTarget({...target, options: newOpts}); }} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
              </div>
          ))}
          <button onClick={() => setTarget({...target, options: [...target.options, '']})} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"><Plus className="w-3 h-3"/> 新增選項</button>
      </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 flex flex-col h-screen overflow-hidden">
        
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500"><ChevronLeft className="w-5 h-5" /></Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">建立新課程</h1>
                    <p className="text-xs text-slate-500">自訂教材內容與測驗</p>
                </div>
            </div>
            <div className="flex gap-3">
                <div className="bg-slate-200 p-1 rounded-lg flex text-sm font-bold">
                    <button onClick={() => setActiveTab('basic')} className={`px-4 py-1.5 rounded-md transition ${activeTab === 'basic' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>基本資訊</button>
                    <button onClick={() => setActiveTab('content')} className={`px-4 py-1.5 rounded-md transition ${activeTab === 'content' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>課文與難詞</button>
                    <button onClick={() => setActiveTab('quiz')} className={`px-4 py-1.5 rounded-md transition ${activeTab === 'quiz' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>測驗題目 ({questions.length})</button>
                </div>
                <div className="w-px h-8 bg-slate-300 mx-2"></div>
                <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition font-bold text-sm"><Save className="w-4 h-4" /> 儲存發布</button>
            </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
            {activeTab === 'basic' && (
                <div className="max-w-3xl mx-auto space-y-6 pb-10">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-600"/> 基本資訊</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">課程標題</label>
                                <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold" placeholder="例如：岳陽樓記" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">作者</label>
                                <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" placeholder="例如：宋 ‧ 范仲淹" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">簡介</label>
                                <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl h-32 resize-none" placeholder="課程摘要..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'content' && (
                <div className="grid grid-cols-12 gap-8 pb-10 h-full">
                    {/* 左欄：純文字編輯與難詞列表 */}
                    <div className="col-span-4 space-y-6 h-full flex flex-col">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Edit3 className="w-4 h-4 text-indigo-500"/> 課文編輯</h3>
                            <textarea 
                                className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-serif leading-loose resize-none"
                                placeholder="請在此貼上完整課文，貼上後請切換到右側選取難詞..."
                                value={formData.content}
                                onChange={e => setFormData({...formData, content: e.target.value})}
                            />
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-1/3 flex flex-col">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><List className="w-4 h-4 text-indigo-500"/> 已標註難詞 ({difficultWords.length})</h3>
                            <div className="flex-1 overflow-y-auto space-y-2">
                                {difficultWords.map((dw, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm group">
                                        <div>
                                            <span className="font-bold text-slate-800 bg-yellow-100 px-1 rounded mr-2">{dw.term}</span>
                                            <span className="text-slate-500 truncate max-w-[150px] inline-block align-bottom">{dw.definition}</span>
                                        </div>
                                        <button onClick={() => handleDeleteWord(idx)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                {difficultWords.length === 0 && <p className="text-slate-400 text-xs text-center py-4">請在右側預覽區選取文字來新增難詞</p>}
                            </div>
                        </div>
                    </div>

                    {/* 右欄：預覽與標註區 */}
                    <div className="col-span-8 h-full flex flex-col">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Eye className="w-4 h-4 text-indigo-500"/> 預覽與標註模式</h3>
                                <div className="text-xs text-slate-500 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold">
                                    💡 提示：使用滑鼠圈選文字即可新增難詞註釋
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-slate-50/50 relative">
                                {renderPreviewContent()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'quiz' && (
                <div className="grid grid-cols-12 gap-8 pb-10 h-full">
                    {/* 左側：題目列表 */}
                    <div className="col-span-4 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><List className="w-4 h-4"/> 已新增題目</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {questions.length === 0 && <div className="text-center text-slate-400 text-sm py-10">尚無題目，請在右側新增。</div>}
                            {questions.map((q, idx) => (
                                <div key={idx} className="group relative bg-white border border-slate-200 p-4 rounded-xl hover:border-indigo-300 hover:shadow-md transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                            q.type === 'single' ? 'bg-blue-100 text-blue-600' :
                                            q.type === 'multiple' ? 'bg-purple-100 text-purple-600' :
                                            q.type === 'group' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                            {q.type === 'single' ? '單選' : q.type === 'multiple' ? '多選' : q.type === 'group' ? '題組' : '簡答'}
                                        </span>
                                        <button onClick={() => handleDeleteQuestion(idx)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                    <div className="font-bold text-slate-700 text-sm line-clamp-2 mb-1">{q.question}</div>
                                    {q.type === 'group' && <div className="text-xs text-slate-400">包含 {q.subQuestions.length} 個子題</div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 右側：編輯器 (保持不變，略過重複部分) */}
                    <div className="col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-indigo-600"/> 題目編輯器</h3>
                            <div className="flex bg-slate-200 p-1 rounded-lg">
                                {[{id: 'single', label: '單選', icon: CheckCircle}, {id: 'multiple', label: '多選', icon: CheckSquare}, {id: 'short', label: '簡答', icon: AlignLeft}, {id: 'group', label: '題組', icon: Layers}].map(type => (
                                    <button key={type.id} onClick={() => setEditingQ({...DEFAULT_QUESTION, type: type.id as any})} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${editingQ.type === type.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                        <type.icon className="w-3 h-3"/> {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">題目敘述 / 標題</label>
                                <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 min-h-[80px] text-lg font-bold text-slate-800 resize-none transition" placeholder="請輸入問題..." value={editingQ.question} onChange={e => setEditingQ({...editingQ, question: e.target.value})} />
                            </div>
                            {(editingQ.type === 'single' || editingQ.type === 'multiple') && renderOptionEditor(editingQ, setEditingQ)}
                            {editingQ.type === 'short' && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">參考解答</label>
                                    <textarea className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 h-24 resize-none" placeholder="建議學生回答的方向..." value={editingQ.referenceAnswer} onChange={e => setEditingQ({...editingQ, referenceAnswer: e.target.value})} />
                                </div>
                            )}
                            {editingQ.type === 'group' && (
                                <div className="space-y-6">
                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                        <label className="block text-xs font-bold text-indigo-800 uppercase mb-2 flex items-center gap-2"><FileText className="w-4 h-4"/> 閱讀文章內容</label>
                                        <textarea className="w-full p-4 bg-white border border-indigo-200 rounded-lg outline-none focus:border-indigo-500 h-40 font-serif leading-relaxed" placeholder="請貼上題組文章..." value={editingQ.groupContent} onChange={e => setEditingQ({...editingQ, groupContent: e.target.value})} />
                                    </div>
                                    <div className="border-t border-slate-100 pt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-xs font-bold text-slate-500 uppercase">子題目 ({editingQ.subQuestions.length})</label>
                                            <button onClick={() => setIsAddingSubQ(true)} className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition">+ 新增子題</button>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            {editingQ.subQuestions.map((sub, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 rounded">{sub.type === 'single' ? '單選' : sub.type === 'multiple' ? '多選' : '簡答'}</span>
                                                        <span className="truncate max-w-[200px] font-medium">{sub.question}</span>
                                                    </div>
                                                    <button onClick={() => { const newSubs = editingQ.subQuestions.filter((_, i) => i !== idx); setEditingQ({...editingQ, subQuestions: newSubs}); }} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                                </div>
                                            ))}
                                        </div>
                                        {isAddingSubQ && (
                                            <div className="bg-white border-2 border-indigo-100 p-4 rounded-xl shadow-lg animate-in slide-in-from-top-2">
                                                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                                                    <span className="text-sm font-bold text-indigo-800">新增子題</span>
                                                    <div className="flex gap-2">
                                                        {['single', 'multiple', 'short'].map(t => (
                                                            <button key={t} onClick={() => setEditingSubQ({...editingSubQ, type: t as any})} className={`text-[10px] px-2 py-1 rounded border ${editingSubQ.type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}>{t === 'single' ? '單選' : t === 'multiple' ? '多選' : '簡答'}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <input className="w-full p-2 mb-3 bg-slate-50 border border-slate-200 rounded text-sm font-bold" placeholder="子題目敘述..." value={editingSubQ.question} onChange={e => setEditingSubQ({...editingSubQ, question: e.target.value})} />
                                                {(editingSubQ.type === 'single' || editingSubQ.type === 'multiple') && renderOptionEditor(editingSubQ, setEditingSubQ)}
                                                {editingSubQ.type === 'short' && (
                                                    <textarea className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded outline-none focus:border-indigo-500 h-20 resize-none mb-3" placeholder="參考解答..." value={editingSubQ.referenceAnswer} onChange={e => setEditingSubQ({...editingSubQ, referenceAnswer: e.target.value})} />
                                                )}
                                                <div className="flex justify-end gap-2 mt-4">
                                                    <button onClick={() => setIsAddingSubQ(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded">取消</button>
                                                    <button onClick={handleAddSubQuestion} className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700">確認加入</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">詳解</label>
                                    <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 h-24 resize-none text-sm" placeholder="測驗結束後顯示..." value={editingQ.explanation} onChange={e => setEditingQ({...editingQ, explanation: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">思考導引</label>
                                    <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 h-24 resize-none text-sm" placeholder="答錯時顯示的提示..." value={editingQ.guidance} onChange={e => setEditingQ({...editingQ, guidance: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button onClick={handleAddQuestion} className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> 加入至測驗</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}