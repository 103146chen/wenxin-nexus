'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { useDailyStore } from "@/store/daily-store"; // 🔥 改用 Store
import { useUserStore } from "@/store/user-store";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Send } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function DailyReadingTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const { markArticleError, completeDailyArticle, dailyMission } = useUserStore();
  const { getArticleById } = useDailyStore(); // 🔥 使用 Hook
  
  // 🔥 取得文章
  const article = getArticleById(id as string);
  const progress = dailyMission.progress.find(p => p.articleId === id);
  const isPreviouslyCompleted = progress?.isCompleted;

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'checked'>('idle');

  useEffect(() => {
      if (isPreviouslyCompleted && article) {
          const correctAnswers: Record<string, number> = {};
          article.questions.forEach(q => correctAnswers[q.id] = q.correctIndex);
          setAnswers(correctAnswers);
          setSubmissionStatus('checked');
      }
  }, [isPreviouslyCompleted, article]);

  if (!article) return <div>找不到文章</div>;

  const handleSelect = (qId: string, optionIdx: number) => {
      if (submissionStatus === 'checked' && isPreviouslyCompleted) return;
      setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmit = () => {
      if (article.questions.some(q => answers[q.id] === undefined)) {
          alert("請先完成所有題目再送出！");
          return;
      }
      setSubmissionStatus('checked');
      
      const wrongIds: string[] = [];
      article.questions.forEach(q => {
          if (answers[q.id] !== q.correctIndex) wrongIds.push(q.id);
      });

      if (wrongIds.length > 0) {
          alert(`還有 ${wrongIds.length} 題需要訂正，請參考提示再試一次。`);
          markArticleError(article.id);
      } else {
          completeDailyArticle(article.id, !progress?.hasError);
          setTimeout(() => {
              if (confirm('恭喜完成！是否返回列表？')) router.push('/daily-reading');
          }, 500);
      }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 h-screen flex flex-col overflow-hidden">
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
                <Link href="/daily-reading" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition"><ArrowLeft className="w-5 h-5"/></Link>
                <h1 className="font-bold text-slate-800">{article.title}</h1>
            </div>
            {isPreviouslyCompleted && <span className="text-green-600 font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5"/> 已完成</span>}
        </div>

        <div className="flex-1 flex overflow-hidden">
            <div className="w-1/2 p-10 overflow-y-auto border-r border-slate-200 bg-white custom-scrollbar">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">{article.title}</h2>
                    <div className="text-sm text-slate-500 mb-8">{article.author}</div>
                    <div className="font-serif text-lg leading-loose text-slate-700 whitespace-pre-wrap">{article.content}</div>
                </div>
            </div>

            <div className="w-1/2 p-8 overflow-y-auto bg-slate-50 custom-scrollbar">
                <div className="max-w-2xl mx-auto space-y-8 pb-20">
                    {article.questions.map((q, qIndex) => {
                        const isWrong = submissionStatus === 'checked' && answers[q.id] !== q.correctIndex;
                        const isCorrect = submissionStatus === 'checked' && answers[q.id] === q.correctIndex;
                        return (
                            <div key={q.id} className={`bg-white p-6 rounded-2xl border-2 transition-all ${isWrong ? 'border-red-200 shadow-sm' : isCorrect ? 'border-green-200' : 'border-slate-100 shadow-sm'}`}>
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">Q{qIndex + 1}</span>
                                    <h3 className="font-bold text-slate-800 text-lg leading-relaxed">{q.question}</h3>
                                </div>
                                <div className="space-y-2">
                                    {q.options.map((opt, optIdx) => {
                                        const isSelected = answers[q.id] === optIdx;
                                        let btnClass = "border-slate-200 hover:bg-slate-50";
                                        if (isSelected) {
                                            if (submissionStatus === 'idle') btnClass = "border-indigo-500 bg-indigo-50 text-indigo-700";
                                            else if (isCorrect) btnClass = "border-green-500 bg-green-50 text-green-700";
                                            else btnClass = "border-red-500 bg-red-50 text-red-700";
                                        }
                                        return (
                                            <button key={optIdx} onClick={() => handleSelect(q.id, optIdx)} className={`w-full text-left p-3 rounded-xl border-2 transition-all font-medium text-sm flex justify-between items-center ${btnClass}`}>
                                                {opt}
                                                {isSelected && isCorrect && <CheckCircle className="w-4 h-4"/>}
                                                {isSelected && isWrong && <XCircle className="w-4 h-4"/>}
                                            </button>
                                        );
                                    })}
                                </div>
                                {isWrong && <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-xl flex items-start gap-2 animate-in fade-in"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/><div><span className="font-bold">思考引導：</span>{q.hint}</div></div>}
                            </div>
                        );
                    })}
                    {!isPreviouslyCompleted && (
                        <button onClick={handleSubmit} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                            <Send className="w-5 h-5"/> {submissionStatus === 'checked' ? '訂正並再次送出' : '送出答案'}
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}