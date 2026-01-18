'use client';

import { Lesson, SingleChoiceQuestion, MultipleChoiceQuestion, ShortAnswerQuestion } from "@/lib/data/lessons";
import { useUserStore } from "@/store/user-store";
import { GamificationEngine } from "@/lib/engines/GamificationEngine";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, Zap, Key, CheckCircle, XCircle, Award, RotateCcw, HelpCircle, BookOpen, Send, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PlayableQuestion = (SingleChoiceQuestion | MultipleChoiceQuestion | ShortAnswerQuestion) & {
  groupContent?: string;
  groupTitle?: string;
};

type QuizMode = 'normal' | 'correction' | 'review';

export default function QuizRunner({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const { name, unlockedSkills, activateSkill, skillCooldowns, addXp, addCoins, quizRecords, updateQuizRecord, correctMistake } = useUserStore();
  
  // 🔥 1. 抽離邏輯：計算目前的模式與題目列表
  const calculateSession = useCallback(() => {
    // A. 題目扁平化
    const flatQuestions: PlayableQuestion[] = [];
    lesson.quizzes.forEach(q => {
      if (q.type === 'group') {
        q.subQuestions.forEach(sub => {
          flatQuestions.push({
            ...sub,
            groupContent: q.groupContent,
            groupTitle: q.question
          });
        });
      } else {
        flatQuestions.push(q);
      }
    });

    // B. 從 Store 獲取最新紀錄
    // 注意：這裡是直接從 hook 拿到的 quizRecords，它是響應式的
    const record = useUserStore.getState().quizRecords[lesson.id];

    // 情境 1: 沒紀錄或未完成 -> Normal
    if (!record || !record.isFinished) {
        return { mode: 'normal' as QuizMode, questions: flatQuestions };
    }

    // 情境 2: 有錯題 -> Correction
    if (record.wrongQuestionIds.length > 0) {
        const wrongQs = flatQuestions.filter(q => record.wrongQuestionIds.includes(q.id));
        return { mode: 'correction' as QuizMode, questions: wrongQs };
    }

    // 情境 3: 無錯題 -> Review
    return { mode: 'review' as QuizMode, questions: flatQuestions };
  }, [lesson, quizRecords]); // 依賴 quizRecords，確保資料更新時邏輯正確

  // 🔥 2. 使用 lazy initialization 設定初始狀態
  const [session, setSession] = useState<{ mode: QuizMode; questions: PlayableQuestion[] }>(() => calculateSession());

  const { mode, questions: questionsToPlay } = session;

  // 狀態管理
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

  // 防呆：如果 questionsToPlay 為空 (例如全部訂正完了)，顯示完成狀態
  const currentQuestion = questionsToPlay[currentQIndex];
  const totalQuestions = questionsToPlay.length;

  useEffect(() => {
      setSelectedIndices([]);
      setShortAnswerText("");
      setIsAnswered(false);
      setIsCorrect(false);
      setRemovedOptions([]);
      setShowHint(false);
  }, [currentQIndex, session]); // session 改變時也要重置

  // 🔥 3. 處理「重新開始 / 立即訂正」的邏輯
  const handleRestart = () => {
      // 重新計算 Session (這時會讀到最新的錯題紀錄)
      const newSession = calculateSession();
      setSession(newSession);
      
      // 重置所有狀態
      setCurrentQIndex(0);
      setScore(0);
      setWrongIds([]);
      setIsFinished(false);
      setIsAnswered(false);
  };

  // 技能 1: 刪去法
  const handleUseZap = () => {
    if (isAnswered || currentQuestion.type !== 'single') return;
    if (!activateSkill('quiz-1', 12)) { alert("技能冷卻中！"); return; }
    
    const correctIdx = currentQuestion.correctIndex;
    const wrongIndices = currentQuestion.options
        .map((_: string, idx: number) => idx)
        .filter((idx: number) => idx !== correctIdx && !removedOptions.includes(idx));
    
    if (wrongIndices.length > 0) {
        const randomWrong = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        setRemovedOptions([...removedOptions, randomWrong]);
    }
  };

  // 技能 2: 提示
  const handleUseHint = () => {
      if (!activateSkill('quiz-2', 48)) { alert("技能冷卻中！"); return; }
      setShowHint(true);
  };

  const handleOptionClick = (index: number) => {
      if (isAnswered) return;

      if (currentQuestion.type === 'single') {
          setSelectedIndices([index]);
      } else if (currentQuestion.type === 'multiple') {
          if (selectedIndices.includes(index)) {
              setSelectedIndices(prev => prev.filter(i => i !== index));
          } else {
              setSelectedIndices(prev => [...prev, index]);
          }
      }
  };

  const handleSubmit = () => {
      if (isAnswered) {
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
              id: `${lesson.id}-${currentQuestion.id}-${Date.now()}`,
              type: 'quiz-short',
              title: `簡答題：${lesson.title}`,
              contentPreview: shortAnswerText,
              authorId: name,
              authorName: name
          });
          correct = true;
          alert("已提交簡答給老師批閱！");
      }

      setIsCorrect(correct);

      if (correct) {
          if (mode === 'correction') {
              addCoins(5);
              addXp(10);
              correctMistake(lesson.id, currentQuestion.id);
          } else if (mode === 'normal') {
              setScore(s => s + 1);
          }
      } else {
          if (mode === 'normal') {
              setWrongIds(prev => [...prev, currentQuestion.id]);
          }
      }
  };

  const handleNext = () => {
    if (currentQIndex < totalQuestions - 1) {
        setCurrentQIndex(prev => prev + 1);
    } else {
        if (mode === 'normal') {
             const finalScore = score + (isCorrect ? 1 : 0);
             const finalWrongIds = [...wrongIds];
             if (!isCorrect) finalWrongIds.push(currentQuestion.id);

             updateQuizRecord(lesson.id, finalScore, finalWrongIds, true);
             
             const xpReward = finalScore * 50;
             const coinReward = finalScore * 10;
             addXp(xpReward);
             addCoins(coinReward);
        }
        setIsFinished(true);
    }
  };

  // --- 畫面渲染 ---

  if (isFinished) {
      // 檢查是否還有新的錯題 (用於決定是否顯示「立即訂正」按鈕)
      // 這邊直接讀取 Store 最準確
      const currentRecord = useUserStore.getState().quizRecords[lesson.id];
      const hasWrongsLeft = currentRecord?.wrongQuestionIds?.length > 0;

      if (mode === 'correction') {
          return (
            <div className="flex min-h-screen bg-slate-50">
                <div className="flex-1 p-12 flex items-center justify-center">
                    <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full animate-in zoom-in-95">
                        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">訂正完成！</h2>
                        <p className="text-slate-500 mb-8">
                            {hasWrongsLeft 
                                ? "還有部分題目尚未訂正，要繼續嗎？" 
                                : "太棒了！所有錯題都已訂正完畢。"}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Link href="/quiz" className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">
                                返回大廳
                            </Link>
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
      
      const isReview = mode === 'review';
      return (
        <div className="flex min-h-screen bg-slate-50">
            <div className="flex-1 p-12 flex items-center justify-center">
                <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full animate-in zoom-in-95">
                    {isReview ? (
                        <Eye className="w-24 h-24 text-slate-400 mx-auto mb-6" />
                    ) : (
                        <Award className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
                    )}
                    
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">
                        {isReview ? '複習結束' : '測驗完成！'}
                    </h2>
                    
                    {!isReview && (
                        <div className="flex justify-center gap-8 mb-8 mt-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-indigo-600">
                                    {score + (isCorrect ? 1 : 0)} / {totalQuestions}
                                </div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">得分</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-emerald-600">
                                    +{(score + (isCorrect ? 1 : 0)) * 50}
                                </div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">獲得 XP</div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 justify-center mt-8">
                        <Link href="/quiz" className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">
                            返回大廳
                        </Link>
                        {/* 🔥 修正：使用 handleRestart 而不是 reload */}
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

  // 空狀態 (例如訂正模式沒有題目)
  if (!currentQuestion) {
      return (
          <div className="flex min-h-screen bg-slate-50">
            <div className="flex-1 p-12 flex items-center justify-center">
                <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">恭喜！</h2>
                    <p className="text-slate-500">目前沒有需要訂正的題目。</p>
                    <Link href="/quiz" className="mt-6 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">
                        回上一頁
                    </Link>
                </div>
            </div>
          </div>
      )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="flex-1 p-8 flex flex-col h-screen">
        {/* Top Bar */}
        <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/quiz" className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500"><ChevronLeft className="w-5 h-5" /></Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">
                        {mode === 'correction' ? `📝 錯題訂正：${lesson.title}` : mode === 'review' ? `👀 複習模式：${lesson.title}` : `${lesson.title} 隨堂測驗`}
                    </h1>
                    <p className="text-xs text-slate-500">Question {currentQIndex + 1} of {totalQuestions}</p>
                </div>
            </div>
            
            {mode === 'correction' && <div className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full flex items-center gap-1"><RotateCcw className="w-3 h-3"/> 訂正模式</div>}
            {mode === 'review' && <div className="text-xs font-bold text-slate-600 bg-slate-200 px-3 py-1 rounded-full flex items-center gap-1"><Eye className="w-3 h-3"/> 複習模式 (不計分)</div>}
        </div>

        {/* Content */}
        <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col justify-center pb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6 relative overflow-hidden">
                
                {currentQuestion.groupContent && (
                    <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-serif leading-loose relative">
                        <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg">題組文章</div>
                        <div className="flex items-center gap-2 mb-2 text-indigo-800 font-bold text-sm">
                            <BookOpen className="w-4 h-4" />
                            {currentQuestion.groupTitle || "閱讀測驗"}
                        </div>
                        {currentQuestion.groupContent}
                    </div>
                )}

                <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
                    {currentQuestion.question}
                    {currentQuestion.type === 'multiple' && <span className="ml-2 text-sm font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full align-middle">多選</span>}
                    {currentQuestion.groupContent && <span className="ml-2 text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full align-middle">題組子題</span>}
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
                            
                            if (isCorrectOpt) {
                                style = "border-green-500 bg-green-50 text-green-700 font-bold";
                                icon = <CheckCircle className="w-5 h-5 text-green-500" />;
                            } else if (isSelected) {
                                style = "border-red-500 bg-red-50 text-red-700";
                                icon = <XCircle className="w-5 h-5 text-red-500" />;
                            } else {
                                style = "border-slate-100 text-slate-400 opacity-50";
                            }
                        } else if (isSelected) {
                             style = "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionClick(idx)}
                                disabled={isAnswered}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${style}`}
                            >
                                <span className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    {opt}
                                </span>
                                {icon}
                            </button>
                        );
                    })}

                    {currentQuestion.type === 'short' && (
                        <div className="space-y-4">
                            <textarea
                                value={shortAnswerText}
                                onChange={(e) => setShortAnswerText(e.target.value)}
                                disabled={isAnswered}
                                placeholder="請在此輸入你的答案..."
                                className="w-full h-32 p-4 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                            />
                            {isAnswered && (
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-indigo-800 text-sm">
                                    <h4 className="font-bold mb-1">參考答案：</h4>
                                    {currentQuestion.referenceAnswer}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {(showHint || (mode === 'correction' && !isCorrect && isAnswered)) && (
                    <div className="mt-6 p-4 bg-amber-50 text-amber-900 rounded-xl text-sm border border-amber-100 animate-in fade-in slide-in-from-top-2">
                        <div className="font-bold flex items-center gap-2 mb-1">
                            <HelpCircle className="w-4 h-4" /> 
                            {mode === 'correction' ? '思考導引 (Thinking Guidance)' : '詳解提示'}
                        </div>
                        {mode === 'correction' ? currentQuestion.guidance : currentQuestion.explanation}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center">
                <div className="flex gap-3">
                    {unlockedSkills.includes('quiz-1') && currentQuestion.type === 'single' && !isAnswered && mode === 'normal' && (
                        <button onClick={handleUseZap} className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-yellow-500 hover:scale-110 transition" title="發動技能：靈光">
                            <Zap className="w-6 h-6 fill-current" />
                        </button>
                    )}
                     {unlockedSkills.includes('quiz-2') && !isAnswered && !showHint && mode === 'normal' && (
                        <button onClick={handleUseHint} className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-purple-500 hover:scale-110 transition" title="發動技能：天機">
                            <Key className="w-6 h-6" />
                        </button>
                    )}
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={!isAnswered && selectedIndices.length === 0 && !shortAnswerText}
                    className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition shadow-lg animate-in fade-in slide-in-from-right-5 flex items-center gap-2"
                >
                    {isAnswered 
                        ? (currentQIndex < totalQuestions - 1 ? '下一題' : (mode === 'correction' ? '完成訂正' : '查看結果')) 
                        : (currentQuestion.type === 'short' ? '提交簡答' : '確認答案')
                    }
                    {!isAnswered && <Send className="w-4 h-4"/>}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}