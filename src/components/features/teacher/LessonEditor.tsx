'use client';

import { useState, useRef } from 'react';
import { Lesson, QuizSet, QuizQuestion, QuestionType, SingleChoiceQuestion, MultipleChoiceQuestion, ShortAnswerQuestion, GroupQuestion } from '@/lib/data/lessons';
import { Save, Plus, Trash2, ChevronRight, HelpCircle, AlertCircle, MousePointerClick, LayoutList, FileText, CheckSquare, ListChecks, Type, Layers, BookOpen, Sparkles } from 'lucide-react';

interface LessonEditorProps {
  initialData?: Lesson;
  onSave: (data: Lesson) => void;
  mode: 'create' | 'edit';
}

// 預設題目工廠模式
const createQuestion = (type: QuestionType): any => {
    const base = {
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        question: '',
        explanation: '',
        guidance: ''
    };

    switch (type) {
        case 'single':
            return { ...base, type, options: ['', '', '', ''], correctIndex: 0 };
        case 'multiple':
            return { ...base, type, options: ['', '', '', ''], correctIndices: [] };
        case 'short':
            return { ...base, type, referenceAnswer: '' };
        case 'group':
            return { ...base, type, groupContent: '', subQuestions: [] };
        default:
            return base;
    }
};

export default function LessonEditor({ initialData, onSave, mode }: LessonEditorProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'quiz'>('basic');
  
  // Basic Info
  const [title, setTitle] = useState(initialData?.title || '');
  const [author, setAuthor] = useState(initialData?.author || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [content, setContent] = useState(initialData?.content || '');
  // 🔥 新增 AI Persona State
  const [aiPersona, setAiPersona] = useState(initialData?.aiPersona || `你是一位博學的國文老師。
請用溫和、引導的方式回答學生的問題。
請勿直接給出答案，而是透過反問來引導思考。`);
  
  // Difficult Words
  const [words, setWords] = useState(initialData?.difficultWords || []);
  const [selectionInfo, setSelectionInfo] = useState<{term: string, index: number} | null>(null);
  const [tempDefinition, setTempDefinition] = useState('');
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Quiz Sets
  const [quizSets, setQuizSets] = useState<QuizSet[]>(initialData?.quizSets || []);
  const [activeSetId, setActiveSetId] = useState<string | null>(initialData?.quizSets?.[0]?.id || null);

  // --- Logic: Difficult Words ---
  const handleSelectText = () => {
      const textarea = contentTextareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end).trim();

      if (!selectedText) {
          alert('請先在課文中反白選取要標註的詞彙！');
          return;
      }

      // 檢查是否重疊 (簡單檢查)
      const isOverlapping = words.some(w => 
          (start >= w.startIndex && start < w.startIndex + w.term.length) ||
          (end > w.startIndex && end <= w.startIndex + w.term.length)
      );

      if (isOverlapping) {
          alert('此區域已有標註，請勿重疊。');
          return;
      }

      setSelectionInfo({ term: selectedText, index: start });
      setTempDefinition('');
  };

  const confirmAddWord = () => {
      if (!selectionInfo || !tempDefinition) return;
      setWords([...words, { 
          term: selectionInfo.term, 
          definition: tempDefinition, 
          startIndex: selectionInfo.index 
      }].sort((a, b) => a.startIndex - b.startIndex));
      
      setSelectionInfo(null);
      setTempDefinition('');
  };

  // --- Logic: Quiz Management ---
  const activeSet = quizSets.find(s => s.id === activeSetId);

  const addQuizSet = () => {
      const newSet: QuizSet = {
          id: `set-${Date.now()}`,
          title: '新測驗卷',
          questions: []
      };
      setQuizSets([...quizSets, newSet]);
      setActiveSetId(newSet.id);
  };

  const deleteQuizSet = (id: string) => {
      if (confirm('確定刪除此測驗卷？')) {
          setQuizSets(prev => prev.filter(s => s.id !== id));
          if (activeSetId === id) setActiveSetId(null);
      }
  };

  const updateSetTitle = (title: string) => {
      if (!activeSetId) return;
      setQuizSets(prev => prev.map(s => s.id === activeSetId ? { ...s, title } : s));
  };

  const addQuestionToSet = (type: QuestionType) => {
      if (!activeSetId) return;
      const newQ = createQuestion(type);
      setQuizSets(prev => prev.map(s => s.id === activeSetId ? { ...s, questions: [...s.questions, newQ] } : s));
  };

  const updateQuestion = (qId: string, updates: any) => {
      if (!activeSetId) return;
      setQuizSets(prev => prev.map(s => {
          if (s.id !== activeSetId) return s;
          return {
              ...s,
              questions: s.questions.map(q => q.id === qId ? { ...q, ...updates } : q)
          };
      }));
  };

  const deleteQuestion = (qId: string) => {
      if (!activeSetId) return;
      if (!confirm('確定刪除此題？')) return;
      setQuizSets(prev => prev.map(s => {
          if (s.id !== activeSetId) return s;
          return { ...s, questions: s.questions.filter(q => q.id !== qId) };
      }));
  };

  // --- Sub-component: Question Editor ---
  const QuestionEditor = ({ question, onChange, onDelete, isSub = false }: { question: QuizQuestion, onChange: (u: any) => void, onDelete: () => void, isSub?: boolean }) => {
      return (
          <div className={`p-6 rounded-xl border-2 transition-all ${isSub ? 'bg-slate-50 border-slate-200 mt-4' : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm'}`}>
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${
                          question.type === 'single' ? 'bg-green-100 text-green-700' : 
                          question.type === 'multiple' ? 'bg-purple-100 text-purple-700' :
                          question.type === 'group' ? 'bg-slate-800 text-white' : 
                          'bg-orange-100 text-orange-700'
                      }`}>
                          {question.type === 'single' ? <CheckSquare className="w-3 h-3"/> : 
                           question.type === 'multiple' ? <ListChecks className="w-3 h-3"/> :
                           question.type === 'group' ? <Layers className="w-3 h-3"/> :
                           <Type className="w-3 h-3"/>}
                          {question.type === 'single' ? '單選題' : question.type === 'multiple' ? '多選題' : question.type === 'group' ? '題組' : '簡答題'}
                      </span>
                  </div>
                  <button onClick={onDelete} className="text-slate-300 hover:text-red-500 transition"><Trash2 className="w-4 h-4"/></button>
              </div>

              {/* Common Fields */}
              <div className="space-y-4">
                  {question.type === 'group' ? (
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">題組引文 / 文章</label>
                          <textarea 
                              value={(question as GroupQuestion).groupContent} 
                              onChange={(e) => onChange({ groupContent: e.target.value })}
                              className="w-full p-3 bg-slate-50 border rounded-lg text-sm font-serif min-h-[100px]"
                              placeholder="請貼上閱讀測驗的文章內容..."
                          />
                      </div>
                  ) : (
                      <input 
                          value={question.question} 
                          onChange={(e) => onChange({ question: e.target.value })}
                          className="w-full p-2 font-bold text-slate-800 border-b-2 border-slate-100 focus:border-indigo-500 outline-none bg-transparent placeholder-slate-300"
                          placeholder="請輸入題目敘述..."
                      />
                  )}

                  {/* Type Specific Fields */}
                  {(question.type === 'single' || question.type === 'multiple') && (
                      <div className="space-y-2">
                          {question.options.map((opt, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                  <button 
                                      onClick={() => {
                                          if (question.type === 'single') {
                                              onChange({ correctIndex: idx });
                                          } else {
                                              const current = (question as MultipleChoiceQuestion).correctIndices || [];
                                              const newIndices = current.includes(idx) 
                                                  ? current.filter(i => i !== idx) 
                                                  : [...current, idx];
                                              onChange({ correctIndices: newIndices });
                                          }
                                      }}
                                      className={`w-6 h-6 rounded flex items-center justify-center border transition ${
                                          (question.type === 'single' ? (question as SingleChoiceQuestion).correctIndex === idx : (question as MultipleChoiceQuestion).correctIndices?.includes(idx))
                                          ? 'bg-green-500 border-green-500 text-white' 
                                          : 'border-slate-300 text-slate-300 hover:border-slate-400'
                                      }`}
                                  >
                                      <CheckSquare className="w-3 h-3" />
                                  </button>
                                  <input 
                                      value={opt} 
                                      onChange={(e) => {
                                          const newOpts = [...question.options];
                                          newOpts[idx] = e.target.value;
                                          onChange({ options: newOpts });
                                      }}
                                      className="flex-1 p-2 text-sm border rounded hover:bg-slate-50 focus:bg-white transition"
                                      placeholder={`選項 ${idx + 1}`}
                                  />
                              </div>
                          ))}
                      </div>
                  )}

                  {question.type === 'short' && (
                      <div>
                          <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">參考答案 (給老師看)</label>
                          <textarea 
                              value={(question as ShortAnswerQuestion).referenceAnswer} 
                              onChange={(e) => onChange({ referenceAnswer: e.target.value })}
                              className="w-full p-2 text-sm border rounded bg-slate-50"
                              placeholder="輸入參考答案..."
                          />
                      </div>
                  )}

                  {/* Group Sub-questions */}
                  {question.type === 'group' && (
                      <div className="border-l-2 border-indigo-100 pl-4 mt-4 space-y-4">
                          <label className="text-xs font-bold text-indigo-500 uppercase block">子題列表</label>
                          {(question as GroupQuestion).subQuestions.map((subQ, subIdx) => (
                              <QuestionEditor 
                                  key={subQ.id} 
                                  question={subQ} 
                                  isSub={true}
                                  onChange={(u) => {
                                      const newSubs = [...(question as GroupQuestion).subQuestions];
                                      newSubs[subIdx] = { ...newSubs[subIdx], ...u };
                                      onChange({ subQuestions: newSubs });
                                  }}
                                  onDelete={() => {
                                      const newSubs = (question as GroupQuestion).subQuestions.filter((_, i) => i !== subIdx);
                                      onChange({ subQuestions: newSubs });
                                  }}
                              />
                          ))}
                          <div className="flex gap-2">
                              <button onClick={() => onChange({ subQuestions: [...(question as GroupQuestion).subQuestions, createQuestion('single')] })} className="text-xs px-3 py-1.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold">+ 單選子題</button>
                              <button onClick={() => onChange({ subQuestions: [...(question as GroupQuestion).subQuestions, createQuestion('multiple')] })} className="text-xs px-3 py-1.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold">+ 多選子題</button>
                              <button onClick={() => onChange({ subQuestions: [...(question as GroupQuestion).subQuestions, createQuestion('short')] })} className="text-xs px-3 py-1.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold">+ 簡答子題</button>
                          </div>
                      </div>
                  )}

                  {/* Footer: Guidance */}
                  {question.type !== 'group' && (
                      <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">詳解</label>
                              <input 
                                  value={question.explanation} 
                                  onChange={(e) => onChange({ explanation: e.target.value })}
                                  className="w-full p-2 text-xs border rounded bg-slate-50 focus:bg-white transition"
                                  placeholder="解釋答案原因..."
                              />
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">引導提示</label>
                              <input 
                                  value={question.guidance} 
                                  onChange={(e) => onChange({ guidance: e.target.value })}
                                  className="w-full p-2 text-xs border rounded bg-slate-50 focus:bg-white transition"
                                  placeholder="給學生的思考提示..."
                              />
                          </div>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  // --- Main Render ---
  const handleSave = () => {
      if (!title || !content) {
          alert('請至少填寫標題與課文內容');
          return;
      }
      const lessonData: Lesson = {
          id: initialData?.id || `lesson-${Date.now()}`,
          title,
          author,
          description,
          content,
          colorTheme: 'indigo',
          difficultWords: words,
          quizSets,
          // 🔥 儲存 AI Persona
          aiPersona
      };
      onSave(lessonData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50 shrink-0">
          {[
              { id: 'basic', label: '1. 基本資訊 & AI 設定' },
              { id: 'content', label: '2. 課文與難詞' },
              { id: 'quiz', label: `3. 測驗管理 (${quizSets.length})` }
          ].map(tab => (
              <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)} 
                  className={`px-6 py-4 text-sm font-bold transition border-b-2 ${
                      activeTab === tab.id 
                      ? 'bg-white text-indigo-600 border-indigo-600' 
                      : 'text-slate-500 border-transparent hover:bg-slate-100'
                  }`}
              >
                  {tab.label}
              </button>
          ))}
      </div>

      <div className="flex-1 overflow-hidden">
          
          {/* Tab 1: Basic */}
          {activeTab === 'basic' && (
              <div className="h-full overflow-y-auto p-8 animate-in fade-in">
                  <div className="max-w-3xl mx-auto space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">課程標題</label>
                              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border rounded-xl font-bold text-lg focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="例如：岳陽樓記" />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">作者</label>
                              <input value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="例如：宋 ‧ 范仲淹" />
                          </div>
                      </div>
                      
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">課程簡介</label>
                          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border rounded-xl h-24 focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="簡述課程背景..." />
                      </div>

                      {/* 🔥 新增 AI 設定區塊 */}
                      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                          <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                  <Sparkles className="w-5 h-5" />
                              </div>
                              <div>
                                  <h3 className="font-bold text-indigo-900">AI 助教角色設定 (System Prompt)</h3>
                                  <p className="text-xs text-indigo-600">定義 AI 在「虛擬書齋」中與學生對話時的人格與限制。</p>
                              </div>
                          </div>
                          
                          <div className="bg-white rounded-xl border border-indigo-200 p-1">
                              <textarea 
                                  value={aiPersona} 
                                  onChange={e => setAiPersona(e.target.value)} 
                                  className="w-full p-4 rounded-lg h-48 focus:outline-none text-sm font-mono text-slate-700 leading-relaxed resize-none" 
                                  placeholder="在此輸入 System Prompt..." 
                              />
                          </div>
                          
                          <div className="mt-3 flex gap-2">
                              <button 
                                  onClick={() => setAiPersona(`你現在是[角色名]。\n背景：[時代背景]。\n個性：[性格描述]。\n限制：不要提到現代科技。\n目標：引導學生思考[主題]。`)}
                                  className="text-xs px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-indigo-600 font-bold hover:bg-indigo-50 transition"
                              >
                                  套用範本：古人角色
                              </button>
                              <button 
                                  onClick={() => setAiPersona(`你是一位蘇格拉底式的導師。\n不要直接給答案，請用提問的方式引導學生自己找出答案。\n語氣要鼓勵且充滿好奇心。`)}
                                  className="text-xs px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-indigo-600 font-bold hover:bg-indigo-50 transition"
                              >
                                  套用範本：引導式教學
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* Tab 2: Content & Words */}
          {activeTab === 'content' && (
              <div className="h-full grid grid-cols-12 animate-in fade-in">
                  {/* Left: Text Editor */}
                  <div className="col-span-8 p-6 flex flex-col h-full border-r border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-bold text-slate-700">課文內容</label>
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">反白選取文字即可新增難詞標註</span>
                      </div>
                      <div className="flex-1 relative group">
                          <textarea 
                              ref={contentTextareaRef}
                              value={content} 
                              onChange={e => setContent(e.target.value)}
                              onSelect={() => {}} // 讓 React 知道我們在監聽選擇
                              className="w-full h-full p-6 border rounded-xl font-serif text-lg leading-loose resize-none focus:ring-2 focus:ring-indigo-200 outline-none" 
                              placeholder="請在此貼上課文內容..." 
                          />
                          <button 
                              onClick={handleSelectText}
                              className="absolute top-4 right-4 bg-slate-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition flex items-center gap-1 hover:bg-indigo-600"
                          >
                              <MousePointerClick className="w-3 h-3" /> 標註選取文字
                          </button>
                      </div>
                  </div>

                  {/* Right: Words List */}
                  <div className="col-span-4 p-6 bg-slate-50 flex flex-col h-full">
                      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                          <BookOpen className="w-4 h-4"/> 難詞標註 ({words.length})
                      </h3>
                      
                      {selectionInfo && (
                          <div className="mb-6 p-4 bg-white rounded-xl shadow-lg border border-indigo-100 animate-in slide-in-from-top-2">
                              <div className="text-xs font-bold text-indigo-500 mb-2 uppercase">新增標註</div>
                              <div className="font-serif text-lg font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
                                  {selectionInfo.term}
                              </div>
                              <input 
                                  value={tempDefinition}
                                  onChange={e => setTempDefinition(e.target.value)}
                                  className="w-full p-2 border rounded-lg text-sm mb-3 focus:border-indigo-500 outline-none"
                                  placeholder="輸入解釋..."
                                  autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                  <button onClick={() => setSelectionInfo(null)} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded">取消</button>
                                  <button onClick={confirmAddWord} className="px-3 py-1.5 text-xs bg-indigo-600 text-white font-bold rounded shadow-sm hover:bg-indigo-700">確認新增</button>
                              </div>
                          </div>
                      )}

                      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                          {words.map((w, i) => (
                              <div key={i} className="group bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 transition">
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <div className="font-bold text-indigo-700 mb-1">{w.term}</div>
                                          <div className="text-slate-500 text-xs leading-relaxed">{w.definition}</div>
                                      </div>
                                      <button onClick={() => setWords(words.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                                          <Trash2 className="w-4 h-4"/>
                                      </button>
                                  </div>
                              </div>
                          ))}
                          {words.length === 0 && !selectionInfo && (
                              <div className="text-center text-slate-400 py-10 text-sm">
                                  尚未新增難詞。<br/>請在左側選取文字以新增。
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          )}

          {/* Tab 3: Quiz Management (Split View) */}
          {activeTab === 'quiz' && (
              <div className="h-full flex animate-in fade-in">
                  
                  {/* Left Sidebar: Quiz Sets */}
                  <div className="w-72 bg-slate-50 border-r border-slate-200 p-4 flex flex-col h-full">
                      <div className="flex justify-between items-center mb-4 px-2">
                          <h3 className="font-bold text-slate-700 text-sm">測驗卷列表</h3>
                          <button onClick={addQuizSet} className="p-1 hover:bg-indigo-100 text-indigo-600 rounded transition"><Plus className="w-4 h-4"/></button>
                      </div>
                      
                      <div className="space-y-2 flex-1 overflow-y-auto">
                          {quizSets.map(set => (
                              <button 
                                  key={set.id}
                                  onClick={() => setActiveSetId(set.id)}
                                  className={`w-full text-left p-3 rounded-xl border transition-all relative group ${
                                      activeSetId === set.id 
                                      ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500' 
                                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                                  }`}
                              >
                                  <div className="font-bold text-slate-800 text-sm truncate pr-6">{set.title}</div>
                                  <div className="text-xs text-slate-400 mt-1">{set.questions.length} 題</div>
                                  
                                  <div 
                                      onClick={(e) => { e.stopPropagation(); deleteQuizSet(set.id); }}
                                      className="absolute right-2 top-2 p-1.5 text-slate-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition"
                                  >
                                      <Trash2 className="w-3.5 h-3.5" />
                                  </div>
                              </button>
                          ))}
                          {quizSets.length === 0 && (
                              <div className="text-center py-8 text-xs text-slate-400">
                                  點擊 + 新增第一份試卷
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Right Main: Questions Editor */}
                  <div className="flex-1 flex flex-col h-full bg-slate-50/50">
                      {activeSet ? (
                          <>
                              {/* Header: Set Title */}
                              <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
                                  <div className="flex-1 mr-8">
                                      <label className="text-xs font-bold text-slate-400 uppercase block mb-1">試卷名稱</label>
                                      <input 
                                          value={activeSet.title} 
                                          onChange={(e) => updateSetTitle(e.target.value)}
                                          className="w-full text-xl font-bold text-slate-800 outline-none border-b border-transparent focus:border-indigo-500 transition placeholder-slate-300"
                                          placeholder="請輸入試卷標題..."
                                      />
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => addQuestionToSet('single')} className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition"><Plus className="w-3 h-3"/> 單選</button>
                                      <button onClick={() => addQuestionToSet('multiple')} className="flex items-center gap-1 px-3 py-2 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg hover:bg-purple-100 transition"><Plus className="w-3 h-3"/> 多選</button>
                                      <button onClick={() => addQuestionToSet('short')} className="flex items-center gap-1 px-3 py-2 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg hover:bg-orange-100 transition"><Plus className="w-3 h-3"/> 簡答</button>
                                      <button onClick={() => addQuestionToSet('group')} className="flex items-center gap-1 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition"><Plus className="w-3 h-3"/> 題組</button>
                                  </div>
                              </div>

                              {/* Questions List */}
                              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                  {activeSet.questions.length === 0 ? (
                                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                          <LayoutList className="w-12 h-12 mb-3 opacity-20"/>
                                          <p>此試卷尚無題目，請從上方按鈕新增。</p>
                                      </div>
                                  ) : (
                                      activeSet.questions.map((q) => (
                                          <QuestionEditor 
                                              key={q.id} 
                                              question={q} 
                                              onChange={(u) => updateQuestion(q.id, u)} 
                                              onDelete={() => deleteQuestion(q.id)}
                                          />
                                      ))
                                  )}
                              </div>
                          </>
                      ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                              <FileText className="w-12 h-12 mb-3 opacity-20"/>
                              <p>請先從左側選擇或建立一份試卷</p>
                          </div>
                      )}
                  </div>
              </div>
          )}

      </div>

      <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-4 shrink-0 z-10">
          <button onClick={handleSave} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition flex items-center gap-2 shadow-lg">
              <Save className="w-4 h-4"/> {mode === 'create' ? '確認建立課程' : '儲存修改'}
          </button>
      </div>
    </div>
  );
}