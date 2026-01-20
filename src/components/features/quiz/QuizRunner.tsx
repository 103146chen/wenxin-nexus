'use client';

import { Lesson, SingleChoiceQuestion, MultipleChoiceQuestion, ShortAnswerQuestion } from "@/lib/data/lessons";
import { useUserStore } from "@/store/user-store";
import { GamificationEngine } from "@/lib/engines/GamificationEngine";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Zap, Key, CheckCircle, XCircle, Award, RotateCcw, HelpCircle, BookOpen, Send, Eye, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudentAsset } from "@/lib/types/gamification";

type PlayableQuestion = (SingleChoiceQuestion | MultipleChoiceQuestion | ShortAnswerQuestion) & {
  groupContent?: string;
  groupTitle?: string;
};

type QuizMode = 'normal' | 'correction' | 'review';

export default function QuizRunner({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const { name, unlockedSkills, activateSkill, addXp, addCoins, quizRecords, updateQuizRecord, correctMistake } = useUserStore();
  
  const [refreshKey, setRefreshKey] = useState(0);

  const calculateSession = useCallback(() => {
    const myAssets = GamificationEngine.getMyAssets(name);

    const flatQuestions: PlayableQuestion[] = [];
    lesson.quizzes.forEach(q => {
      if (q.type === 'group') {
        q.subQuestions.forEach(sub => {
          flatQuestions.push({ ...sub, groupContent: q.groupContent, groupTitle: q.question });
        });
      } else {
        flatQuestions.push(q);
      }
    });

    const record = useUserStore.getState().quizRecords[lesson.id];

    const rejectedShortQs = flatQuestions.filter(q => {
        if (q.type !== 'short') return false;
        const assetId = `${lesson.id}-${q.id}-${name}`;
        const asset = myAssets.find(a => a.id === assetId);
        return asset?.status === 'rejected';
    });

    if (rejectedShortQs.length > 0) {
        return { mode: 'correction' as QuizMode, questions: rejectedShortQs };
    }

    if (!record || !record.isFinished) {
        return { mode: 'normal' as QuizMode, questions: flatQuestions };
    }

    if (record.wrongQuestionIds.length > 0) {
        const wrongQs = flatQuestions.filter(q => record.wrongQuestionIds.includes(q.id));
        return { mode: 'correction' as QuizMode, questions: wrongQs };
    }

    return { mode: 'review' as QuizMode, questions: flatQuestions };
  }, [lesson, quizRecords, name, refreshKey]);

  const [session, setSession] = useState<{ mode: QuizMode; questions: PlayableQuestion[] } | null>(null);

  useEffect(() => {
      setSession(calculateSession());
  }, [calculateSession]);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [shortAnswerText, setShortAnswerText] = useState("");
  
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [score, setScore] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [removedOptions, setRemovedOptions] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);

  const currentQuestion = session?.questions[currentQIndex];
  const totalQuestions = session?.questions.length || 0;

  const currentAsset: StudentAsset | undefined = useMemo(() => {
      if (!currentQuestion || currentQuestion.type !== 'short') return undefined;
      const myAssets = GamificationEngine.getMyAssets(name);
      return myAssets.find(a => a.id === `${lesson.id}-${currentQuestion.id}-${name}`);
  }, [currentQuestion, name, lesson.id, refreshKey]);

  useEffect(() => {
      setSelectedIndices([]);
      setIsAnswered(false);
      setIsCorrect(false);
      setRemovedOptions([]);
      setShowHint(false);

      if (currentQuestion?.type === 'short' && currentAsset) {
          setShortAnswerText(currentAsset.contentPreview || "");
      } else {
          setShortAnswerText("");
      }
  }, [currentQIndex, session, currentAsset, currentQuestion]);

  const handleRestart = () => {
      setRefreshKey(prev => prev + 1);
      setCurrentQIndex(0);
      setScore(0);
      setWrongIds([]);
      setIsFinished(false);
      setIsAnswered(false);
  };

  const handleOptionClick = (index: number) => {
      if (isAnswered) return;
      if (currentQuestion?.type === 'single') setSelectedIndices([index]);
      else if (currentQuestion?.type === 'multiple') {
          if (selectedIndices.includes(index)) setSelectedIndices(prev => prev.filter(i => i !== index));
          else setSelectedIndices(prev => [...prev, index]);
      }
  };

  const handleSubmit = () => {
      if (!currentQuestion) return;

      // 🔥 修正：檢查簡答題是否已提交 (已送出或已通過)
      const isShortAnswerSubmitted = currentQuestion.type === 'short' && (currentAsset?.status === 'pending' || currentAsset?.status === 'verified');

      // 🔥 修正：若已回答或簡答已提交，直接跳下一題
      if (isAnswered || isShortAnswerSubmitted) {
          handleNext();
          return;
      }

      setIsAnswered(true);
      let correct = false;

      if (currentQuestion.type === 'single') {
          correct = selectedIndices[0] === currentQuestion.correctIndex;
      }
      else if (currentQuestion.type === 'multiple') {
          const ans = currentQuestion.correctIndices.sort().join(',');
          const user = [...selectedIndices].sort().join(',');
          correct = ans === user;
      }
      else if (currentQuestion.type === 'short') {
          GamificationEngine.submitAsset({
              id: `${lesson.id}-${currentQuestion.id}-${name}`,
              type: 'quiz-short',
              title: `簡答題：${lesson.title}`,
              contentPreview: shortAnswerText,
              authorId: name,
              authorName: name
          });
          correct = true; 
          alert("已提交簡答給老師批閱！");
          setRefreshKey(k => k + 1); 
      }

      setIsCorrect(correct);

      if (correct) {
          if (session?.mode === 'correction') {
              if (currentQuestion.type !== 'short') {
                  addCoins(5);
                  addXp(10);
                  correctMistake(lesson.id, currentQuestion.id);
              }
          } else if (session?.mode === 'normal') {
              setScore(s => s + 1);
          }
      } else {
          if (session?.mode === 'normal') {
              setWrongIds(prev => [...prev, currentQuestion.id]);
          }
      }
  };

  const handleNext = () => {
    if (currentQIndex < totalQuestions - 1) {
        setCurrentQIndex(prev => prev + 1);
    } else {
        if (session?.mode === 'normal') {
             const finalScore = score + (isCorrect ? 1 : 0);
             const finalWrongIds = [...wrongIds];
             if (!isCorrect && currentQuestion?.type !== 'short') finalWrongIds.push(currentQuestion!.id);

             updateQuizRecord(lesson.id, finalScore, finalWrongIds, true);
             const xpReward = finalScore * 50;
             const coinReward = finalScore * 10;
             addXp(xpReward);
             addCoins(coinReward);
        }
        setIsFinished(true);
    }
  };

  const handleUseZap = () => {
    if (isAnswered || currentQuestion?.type !== 'single') return;
    if (!activateSkill('quiz-1', 12)) { alert("技能冷卻中！"); return; }
    const correctIdx = currentQuestion.correctIndex;
    const wrongIndices = currentQuestion.options
        .map((_: any, idx: number) => idx)
        .filter((idx: number) => idx !== correctIdx && !removedOptions.includes(idx));
    if (wrongIndices.length > 0) setRemovedOptions([...removedOptions, wrongIndices[Math.floor(Math.random() * wrongIndices.length)]]);
  };

  const handleUseHint = () => {
      if (!activateSkill('quiz-2', 48)) { alert("技能冷卻中！"); return; }
      setShowHint(true);
  };

  if (!session || !currentQuestion) return <div className="p-12 text-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto"/> 載入題庫中...</div>;

  if (isFinished) {
      const currentRecord = useUserStore.getState().quizRecords[lesson.id];
      const myAssets = GamificationEngine.getMyAssets(name);
      const hasRejectedShorts = lesson.quizzes.some(q => {
          if (q.type !== 'short') return false;
          const a = myAssets.find(as => as.id === `${lesson.id}-${q.id}-${name}`);
          return a?.status === 'rejected';
      });
      
      const hasWrongsLeft = (currentRecord?.wrongQuestionIds?.length > 0) || hasRejectedShorts;

      if (session.mode === 'correction') {
          return (
            <div className="flex min-h-screen bg-slate-50">
                <div className="flex-1 p-12 flex items-center justify-center">
                    <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full animate-in zoom-in-95">
                        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">訂正完成！</h2>
                        <p className="text-slate-500 mb-8">
                            {hasWrongsLeft ? "還有部分題目尚未通過，要繼續嗎？" : "太棒了！所有題目都已處理完畢。"}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Link href="/quiz" className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">返回大廳</Link>
                            {hasWrongsLeft && (
                                <button onClick={handleRestart} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4" /> 繼續訂正
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          );
      }
      
      const isReview = session.mode === 'review';
      return (
        <div className="flex min-h-screen bg-slate-50">
            <div className="flex-1 p-12 flex items-center justify-center">
                <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full animate-in zoom-in-95">
                    {isReview ? <Eye className="w-24 h-24 text-slate-400 mx-auto mb-6" /> : <Award className="w-24 h-24 text-yellow-400 mx-auto mb-6" />}
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">{isReview ? '複習結束' : '測驗完成！'}</h2>
                    
                    {!isReview && (
                        <div className="flex justify-center gap-8 mb-8 mt-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-indigo-600">{score + (isCorrect ? 1 : 0)} / {totalQuestions}</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">選擇題得分</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-emerald-600">+{(score + (isCorrect ? 1 : 0)) * 50}</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">獲得 XP</div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 justify-center mt-8">
                        <Link href="/quiz" className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">返回大廳</Link>
                        {hasWrongsLeft && (
                            <button onClick={handleRestart} className="px-6 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 flex items-center gap-2 transition">
                                <RotateCcw className="w-4 h-4" /> 立即訂正錯題
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="flex-1 p-8 flex flex-col h-screen">
        <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/quiz" className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500"><ChevronLeft className="w-5 h-5" /></Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">
                        {session.mode === 'correction' ? `📝 錯題訂正：${lesson.title}` : session.mode === 'review' ? `👀 複習模式：${lesson.title}` : `${lesson.title} 隨堂測驗`}
                    </h1>
                    <p className="text-xs text-slate-500">Question {currentQIndex + 1} of {totalQuestions}</p>
                </div>
            </div>
            {session.mode === 'correction' && <div className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full flex items-center gap-1"><RotateCcw className="w-3 h-3"/> 訂正模式</div>}
            {session.mode === 'review' && <div className="text-xs font-bold text-slate-600 bg-slate-200 px-3 py-1 rounded-full flex items-center gap-1"><Eye className="w-3 h-3"/> 複習模式</div>}
        </div>

        <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col justify-center pb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6 relative overflow-hidden">
                
                {currentQuestion.groupContent && (
                    <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-serif leading-loose relative">
                        <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg">題組文章</div>
                        <div className="flex items-center gap-2 mb-2 text-indigo-800 font-bold text-sm"><BookOpen className="w-4 h-4" />{currentQuestion.groupTitle || "閱讀測驗"}</div>
                        {currentQuestion.groupContent}
                    </div>
                )}

                <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
                    {currentQuestion.question}
                    {currentQuestion.type === 'multiple' && <span className="ml-2 text-sm font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full align-middle">多選</span>}
                </h2>

                <div className="space-y-3">
                    {(currentQuestion.type === 'single' || currentQuestion.type === 'multiple') && 
                      currentQuestion.options.map((opt, idx) => {
                        const isRemoved = removedOptions.includes(idx);
                        if (isRemoved) return null;
                        const isSelected = selectedIndices.includes(idx);
                        let style = "border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
                        let icon = null;

                        if (isAnswered) {
                            // @ts-ignore
                            const isCorrectOpt = currentQuestion.type === 'single' ? idx === currentQuestion.correctIndex : currentQuestion.correctIndices.includes(idx);
                            if (isCorrectOpt) { style = "border-green-500 bg-green-50 text-green-700 font-bold"; icon = <CheckCircle className="w-5 h-5 text-green-500" />; }
                            else if (isSelected) { style = "border-red-500 bg-red-50 text-red-700"; icon = <XCircle className="w-5 h-5 text-red-500" />; }
                            else { style = "border-slate-100 text-slate-400 opacity-50"; }
                        } else if (isSelected) { style = "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600"; }

                        return (
                            <button key={idx} onClick={() => handleOptionClick(idx)} disabled={isAnswered} className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${style}`}>
                                <span className="flex items-center gap-3"><span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{String.fromCharCode(65 + idx)}</span>{opt}</span>
                                {icon}
                            </button>
                        );
                    })}

                    {currentQuestion.type === 'short' && (
                        <div className="space-y-4">
                            
                            {currentAsset?.status === 'rejected' && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-2 font-bold mb-1"><AlertCircle className="w-4 h-4"/> 老師的回饋：</div>
                                    <p className="text-sm">{currentAsset.feedback || "請參考課文重點後重新作答。"}</p>
                                    <div className="mt-2 text-xs font-bold text-red-600">請修改下方答案並重新提交。</div>
                                </div>
                            )}

                            {(currentAsset?.status === 'pending' || currentAsset?.status === 'verified') && (
                                <div className={`p-3 rounded-lg border flex items-center gap-2 text-sm font-bold ${
                                    currentAsset.status === 'verified' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                }`}>
                                    {currentAsset.status === 'verified' ? <CheckCircle className="w-4 h-4"/> : <Loader2 className="w-4 h-4 animate-spin"/>}
                                    {currentAsset.status === 'verified' ? '此題已通過，做得好！' : '作業已送出，等待老師批改中...'}
                                </div>
                            )}

                            <textarea
                                value={shortAnswerText}
                                onChange={(e) => setShortAnswerText(e.target.value)}
                                disabled={isAnswered || currentAsset?.status === 'pending' || currentAsset?.status === 'verified'}
                                placeholder="請在此輸入你的答案..."
                                className="w-full h-32 p-4 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none disabled:bg-slate-100 disabled:text-slate-500"
                            />
                        </div>
                    )}
                </div>

                {(showHint || (session.mode === 'correction' && !isCorrect && isAnswered && currentQuestion.type !== 'short')) && (
                    <div className="mt-6 p-4 bg-amber-50 text-amber-900 rounded-xl text-sm border border-amber-100 animate-in fade-in slide-in-from-top-2">
                        <div className="font-bold flex items-center gap-2 mb-1"><HelpCircle className="w-4 h-4" /> {session.mode === 'correction' ? '思考導引' : '詳解提示'}</div>
                        {session.mode === 'correction' ? currentQuestion.guidance : currentQuestion.explanation}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center">
                <div className="flex gap-3">
                    {unlockedSkills.includes('quiz-1') && currentQuestion.type === 'single' && !isAnswered && session.mode === 'normal' && (
                        <button onClick={handleUseZap} className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-yellow-500 hover:scale-110 transition"><Zap className="w-6 h-6 fill-current" /></button>
                    )}
                     {unlockedSkills.includes('quiz-2') && !isAnswered && !showHint && session.mode === 'normal' && (
                        <button onClick={handleUseHint} className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-purple-500 hover:scale-110 transition"><Key className="w-6 h-6" /></button>
                    )}
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={(!isAnswered && selectedIndices.length === 0 && !shortAnswerText) && !(currentQuestion.type === 'short' && (currentAsset?.status === 'pending' || currentAsset?.status === 'verified'))}
                    className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition shadow-lg animate-in fade-in slide-in-from-right-5 flex items-center gap-2"
                >
                    {isAnswered || (currentQuestion.type === 'short' && (currentAsset?.status === 'pending' || currentAsset?.status === 'verified'))
                        ? (currentQIndex < totalQuestions - 1 ? '下一題' : (session.mode === 'correction' ? '完成訂正' : '查看結果')) 
                        : (currentQuestion.type === 'short' ? (currentAsset?.status === 'rejected' ? '重新提交' : '提交簡答') : '確認答案')
                    }
                    {!isAnswered && <Send className="w-4 h-4"/>}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}