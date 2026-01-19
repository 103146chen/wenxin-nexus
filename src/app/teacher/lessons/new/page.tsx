'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useTeacherStore } from '@/store/teacher-store';
import { useRouter } from 'next/navigation';
import { BookOpen, Save, Plus, Trash2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Lesson, QuizQuestion } from '@/lib/data/lessons';

export default function CreateLessonPage() {
  const router = useRouter();
  const { addLesson } = useTeacherStore();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    content: '',
    difficultWords: '', // 用逗號分隔
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
        alert('請至少輸入標題與課文內容！');
        return;
    }

    const newLesson: Lesson = {
        id: `custom-lesson-${Date.now()}`,
        title: formData.title,
        author: formData.author || '未知作者',
        description: formData.description || '由教師新增的自訂課程',
        content: formData.content,
        colorTheme: 'indigo', // 預設顏色
        difficultWords: formData.difficultWords.split(/[,，\s]+/).filter(Boolean),
        quizzes: [] // MVP 先不實作複雜的題目編輯，先留空
    };

    addLesson(newLesson);
    alert('🎉 課程建立成功！');
    router.push('/dashboard'); // 回儀表板
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl font-bold text-slate-900">建立新課程</h1>
            </div>
            <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition font-bold">
                <Save className="w-4 h-4" /> 儲存發布
            </button>
        </div>

        <div className="grid grid-cols-3 gap-8">
            {/* 左側：基本資訊 */}
            <div className="col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500"/> 基本資訊
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">課程標題</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                                placeholder="例如：岳陽樓記"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">作者</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                                placeholder="例如：范仲淹"
                                value={formData.author}
                                onChange={e => setFormData({...formData, author: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">簡介 (摘要)</label>
                            <textarea 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 h-24 resize-none"
                                placeholder="這篇文章主要在講述..."
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">難詞標註 (用逗號分隔)</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                                placeholder="浩浩湯湯, 橫無際涯..."
                                value={formData.difficultWords}
                                onChange={e => setFormData({...formData, difficultWords: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 右側：課文內容 */}
            <div className="col-span-2">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-4">課文內容</h3>
                    <textarea 
                        className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-serif text-lg leading-loose resize-none"
                        placeholder="請在此貼上完整課文..."
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                    />
                    <p className="text-xs text-slate-400 mt-2 text-right">支援自動斷行與排版</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}