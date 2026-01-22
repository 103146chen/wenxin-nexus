'use client';

import { useState } from 'react';
import { DailyArticle, DailyQuestion } from '@/lib/data/daily-articles';
import { Save, Plus, Trash2, CheckCircle, HelpCircle, Calendar } from 'lucide-react';

interface DailyArticleEditorProps {
  initialData?: DailyArticle;
  onSave: (data: DailyArticle) => void;
}

export default function DailyArticleEditor({ initialData, onSave }: DailyArticleEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [author, setAuthor] = useState(initialData?.author || '');
  const [content, setContent] = useState(initialData?.content || '');
  // 🔥 新增日期
  const [publishDate, setPublishDate] = useState(initialData?.publishDate || new Date().toISOString().split('T')[0]);
  const [questions, setQuestions] = useState<DailyQuestion[]>(initialData?.questions || []);

  const addQuestion = () => {
      const newQ: DailyQuestion = {
          id: `dq-${Date.now()}`,
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          hint: ''
      };
      setQuestions([...questions, newQ]);
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
      const newQs = [...questions];
      (newQs[idx] as any)[field] = value;
      setQuestions(newQs);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
      const newQs = [...questions];
      newQs[qIdx].options[oIdx] = value;
      setQuestions(newQs);
  };

  const handleSave = () => {
      if (!title || !content || questions.length === 0) {
          alert('請填寫標題、內容並至少新增一題測驗');
          return;
      }
      onSave({
          id: initialData?.id || `daily-${Date.now()}`,
          title,
          author,
          content,
          questions,
          publishDate
      });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex h-[calc(100vh-140px)]">
        
        {/* Left: Article Info */}
        <div className="w-1/2 border-r border-slate-200 p-8 overflow-y-auto">
            <h3 className="font-bold text-lg mb-6 text-slate-800">文章內容與排程</h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">文章標題</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border rounded-xl font-bold" placeholder="例如：愛蓮說" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">作者</label>
                        <input value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="例如：周敦頤" />
                    </div>
                    {/* 🔥 日期選擇器 */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1"><Calendar className="w-4 h-4"/> 發布日期</label>
                        <input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)} className="w-full p-3 border rounded-xl" />
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-bold text-slate-700 mb-2">內文</label>
                    <textarea 
                        value={content} 
                        onChange={e => setContent(e.target.value)} 
                        className="w-full p-4 border rounded-xl font-serif text-lg leading-loose min-h-[300px]" 
                        placeholder="請貼上文章內容..." 
                    />
                </div>
            </div>
        </div>

        {/* Right: Questions (保持原樣) */}
        <div className="w-1/2 p-8 overflow-y-auto bg-slate-50">
            {/* ... (測驗編輯部分保持原樣) ... */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">測驗題目 ({questions.length})</h3>
                <button onClick={addQuestion} className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-bold hover:bg-indigo-200">
                    <Plus className="w-4 h-4"/> 新增題目
                </button>
            </div>

            <div className="space-y-6">
                {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group">
                        <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500">
                            <Trash2 className="w-4 h-4"/>
                        </button>
                        
                        <div className="mb-4">
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">題目 {idx + 1}</label>
                            <input 
                                value={q.question} 
                                onChange={e => updateQuestion(idx, 'question', e.target.value)}
                                className="w-full p-2 border-b-2 border-slate-100 focus:border-indigo-500 outline-none font-bold"
                                placeholder="輸入題目..."
                            />
                        </div>

                        <div className="space-y-2 mb-4">
                            {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                    <input 
                                        type="radio" 
                                        name={`correct-${q.id}`} 
                                        checked={q.correctIndex === oIdx}
                                        onChange={() => updateQuestion(idx, 'correctIndex', oIdx)}
                                    />
                                    <input 
                                        value={opt} 
                                        onChange={e => updateOption(idx, oIdx, e.target.value)}
                                        className={`flex-1 p-2 border rounded-lg text-sm ${q.correctIndex === oIdx ? 'border-green-500 bg-green-50' : ''}`}
                                        placeholder={`選項 ${oIdx + 1}`}
                                    />
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-amber-600 uppercase mb-1 block flex items-center gap-1"><HelpCircle className="w-3 h-3"/> 錯誤引導 (Hint)</label>
                            <input 
                                value={q.hint} 
                                onChange={e => updateQuestion(idx, 'hint', e.target.value)}
                                className="w-full p-2 bg-amber-50 border border-amber-100 rounded-lg text-sm"
                                placeholder="當學生答錯時，給予的引導提示..."
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
                <button onClick={handleSave} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-indigo-600 transition flex items-center justify-center gap-2 shadow-lg">
                    <Save className="w-5 h-5"/> 儲存發布
                </button>
            </div>
        </div>
    </div>
  );
}