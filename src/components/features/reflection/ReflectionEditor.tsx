'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/user-store';
import { GamificationEngine } from '@/lib/engines/GamificationEngine';
import { AssetStatus } from '@/lib/types/gamification';
import { Smile, Frown, Meh, Heart, Zap, Coffee, Save, Send, Loader2, Cloud } from 'lucide-react';

interface ReflectionEditorProps {
  lessonId: string;
  lessonTitle: string;
}

const MOODS = [
  { id: 'inspired', label: '受到啟發', icon: Zap, color: 'text-yellow-500 bg-yellow-50 border-yellow-200' },
  { id: 'happy', label: '心情愉悅', icon: Smile, color: 'text-green-500 bg-green-50 border-green-200' },
  { id: 'moved', label: '深受感動', icon: Heart, color: 'text-rose-500 bg-rose-50 border-rose-200' },
  { id: 'confused', label: '感到困惑', icon: Meh, color: 'text-slate-500 bg-slate-50 border-slate-200' },
  { id: 'sad', label: '有些感傷', icon: Frown, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { id: 'calm', label: '平靜自在', icon: Coffee, color: 'text-amber-700 bg-amber-50 border-amber-200' },
];

export default function ReflectionEditor({ lessonId, lessonTitle }: ReflectionEditorProps) {
  const { name, addXp } = useUserStore();
  
  const [mood, setMood] = useState<string>('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<AssetStatus>('draft');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  const assetId = `reflection-${lessonId}`;
  const STORAGE_KEY = `reflection-draft-${lessonId}`;

  // 1. 初始化
  useEffect(() => {
    const myAssets = GamificationEngine.getMyAssets(name);
    const remoteAsset = myAssets.find(a => a.id === assetId);

    if (remoteAsset) {
      setContent(remoteAsset.contentPreview);
      setMood(remoteAsset.metadata?.mood || '');
      setStatus(remoteAsset.status);
    } else {
      const localDraft = localStorage.getItem(STORAGE_KEY);
      if (localDraft) {
        const parsed = JSON.parse(localDraft);
        setContent(parsed.content || '');
        setMood(parsed.mood || '');
      }
    }
  }, [name, assetId, STORAGE_KEY]);

  // 2. 自動存檔
  useEffect(() => {
    if (status !== 'draft') return;
    
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ content, mood }));
      setSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, mood, status, STORAGE_KEY]);

  // 3. 提交處理
  const handleSubmit = () => {
    if (!mood) {
      alert('請先選擇一個代表你現在心情的貼紙！');
      return;
    }
    if (content.length < 20) {
      alert('心得稍微短了點，多寫幾句吧！(至少 20 字)');
      return;
    }

    if (confirm('確定要提交這篇心得嗎？提交後將公開在畫廊。')) {
      GamificationEngine.submitAsset({
        id: assetId,
        type: 'reflection',
        title: `【心得】${lessonTitle}`,
        contentPreview: content,
        authorId: name,
        authorName: name,
        targetText: lessonId,
        metadata: { mood },
        // 🔥 修正：移除了 status: 'pending'，submitAsset 內部會自動處理
      });

      setStatus('pending');
      localStorage.removeItem(STORAGE_KEY);
      addXp(30);
      alert('🎉 心得提交成功！獲得 30 XP');
    }
  };

  // 唯讀模式顯示
  if (status !== 'draft') {
    const selectedMood = MOODS.find(m => m.id === mood);
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${selectedMood?.color}`}>
          {selectedMood && <selectedMood.icon className="w-8 h-8" />}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
            你覺得：{selectedMood?.label}
        </h3>
        <p className="text-slate-600 font-serif leading-loose whitespace-pre-wrap max-w-2xl mx-auto bg-slate-50 p-6 rounded-xl text-left">
            {content}
        </p>
        <div className="mt-6 flex justify-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}>
                {status === 'pending' ? '審核中' : status === 'verified' ? '已發佈' : '狀態未知'}
            </span>
        </div>
      </div>
    );
  }

  // 編輯模式
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 bg-slate-50 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4">這篇文章帶給你什麼感覺？</h2>
        <div className="flex flex-wrap gap-3">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                mood === m.id 
                  ? m.color + ' ring-2 ring-offset-1 ring-slate-200' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <m.icon className="w-4 h-4" />
              <span className="text-sm font-bold">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`試著寫下你的想法...\n- 你最喜歡哪一句話？\n- 這篇文章讓你聯想到自身的什麼經驗？\n- 如果你是作者，你會怎麼做？`}
          className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none resize-none font-serif text-lg leading-relaxed text-slate-700 placeholder-slate-400 transition-all"
        />
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
             {saveStatus === 'saving' ? (
                 <><Loader2 className="w-3 h-3 animate-spin"/> 自動儲存中...</>
             ) : (
                 <><Cloud className="w-3 h-3"/> 草稿已儲存</>
             )}
             <span className="mx-1">|</span>
             <span>{content.length} 字</span>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={!mood || content.length < 20}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all shadow-md ${
                !mood || content.length < 20
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'
            }`}
          >
            <Send className="w-4 h-4" /> 提交心得
          </button>
        </div>
      </div>
    </div>
  );
}