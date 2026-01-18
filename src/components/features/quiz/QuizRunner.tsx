'use client';

import { Lesson, SingleChoiceQuestion, MultipleChoiceQuestion, ShortAnswerQuestion } from "@/lib/data/lessons";
import { useUserStore } from "@/store/user-store";
import { GamificationEngine } from "@/lib/engines/GamificationEngine";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Zap, Key, CheckCircle, XCircle, Award, RotateCcw, HelpCircle, BookOpen, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 定義扁平化後的題目介面 (不包含 GroupQuestion，因為已經被拆解了)
type PlayableQuestion = (SingleChoiceQuestion | MultipleChoiceQuestion | ShortAnswerQuestion) & {
  groupContent?: string;
  groupTitle?: string;
};

export default function QuizRunner({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const { name, unlockedSkills, activateSkill, skillCooldowns, addXp, addCoins, quizRecords, updateQuizRecord, correctMistake } = useUserStore();
  
  const record = quizRecords[lesson.id];
  const isCorrectionMode = record?.isFinished && record.wrongQuestionIds.length > 0;
  
  // 扁平化題目列表
  const allPlayableQuestions = useMemo(() => {
    const flat: PlayableQuestion[] = [];
    lesson.quizzes.forEach(q => {
      if (q.type === 'group') {
        q.subQuestions.forEach(sub => {
          flat.push({
            ...sub,
            groupContent: q.groupContent,
            groupTitle: q.question
          });
        });
      } else {
        flat.push(q);
      }
    });
    return flat;
  }, [lesson]);

  // 根據模式篩選題目
  const questionsToPlay = useMemo(() => {
    if (isCorrectionMode) {
      return allPlayableQuestions.filter(q => record.wrongQuestionIds.includes(q.id));
    }
    return allPlayableQuestions;
  }, [allPlayableQuestions, isCorrectionMode, record]);

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

  const currentQuestion = questionsToPlay[currentQIndex];
  const totalQuestions = questionsToPlay.length;

  // 重置題目狀態
  useEffect(() => {
      setSelectedIndices([]);
      setShortAnswerText("");
      setIsAnswered(false);
      setIsCorrect(false);
      setRemovedOptions([]);
      setShowHint(false);
  }, [currentQIndex, isCorrectionMode]);

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
          if (isCorrectionMode) {
              addCoins(5);
              addXp(10);
              correctMistake(lesson.id, currentQuestion.id);
          } else {
              setScore(s => s + 1);
          }
      } else {
          if (!isCorrectionMode) {
              setWrongIds(prev => [...prev, currentQuestion.id]);
          }
      }
  };

  const handleNext = () => {
    if (currentQIndex < totalQuestions - 1) {
        setCurrentQIndex(prev => prev + 1);
    } else {
        if (!isCorrectionMode) {
             updateQuizRecord(lesson.id, score + (isCorrect ? 1 : 0), wrongIds, true);
             const finalScore = score + (isCorrect ? 1 : 0);
             addXp(finalScore * 50);
             addCoins(finalScore * 10);
        }
        setIsFinished(true);
    }
  };

  // --- 畫面渲染 ---

  // 1. 完成畫面
  if (isFinished) {
      if (isCorrectionMode) {
          return (
            <div className="flex min-h-screen bg-slate-50">
                <div className="flex-1 p-12 flex items-center justify-center">
                    <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full">
                        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">訂正完成！</h2>
                        <p className="text-slate-500 mb-8">觀念釐清了，下次考試一定沒問題。</p>
                        <Link href="/quiz" className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700">返回大廳</Link>
                    </div>
                </div>
            </div>
          );
      }
      return (
        <div className="flex min-h-screen bg-slate-50">
            <div className="flex-1 p-12 flex items-center justify-center">
                <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full">
                    <Award className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">測驗完成！</h2>
                    <p className="text-slate-500 mb-8">恭喜你完成了{lesson.title}的測驗。</p>
                    <div className="flex gap-3 justify-center">
                        <Link href="/quiz" className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">返回大廳</Link>
                        {wrongIds.length > 0 && (
                            <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 flex items-center gap-2">
                                <RotateCcw className="w-4 h-4" /> 立即訂正錯題
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // 2. 空狀態
  if (!currentQuestion) {
      return (
          <div className="flex min-h-screen bg-slate-50">
            <div className="flex-1 p-12 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">準備就緒</h2>
                    <p className="text-slate-500">尚無錯題紀錄，或已全數訂正完畢。</p>
                    <Link href="/quiz" className="mt-4 inline-block text-indigo-600 underline">回上一頁</Link>
                </div>
            </div>
          </div>
      )
  }

  // 3. 測驗進行中
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="flex-1 p-8 flex flex-col h-screen">
        <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/quiz" className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500"><ChevronLeft className="w-5 h-5" /></Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">
                        {isCorrectionMode ? `📝 錯題訂正：${lesson.title}` : `${lesson.title} 隨堂測驗`}
                    </h1>
                    <p className="text-xs text-slate-500">Question {currentQIndex + 1} of {totalQuestions}</p>
                </div>
            </div>
            {isCorrectionMode && <div className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">訂正模式</div>}
        </div>

        <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col justify-center pb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6 relative overflow-hidden">
                
                {/* 題組文章渲染 */}
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

                {/* 題目 */}
                <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
                    {currentQuestion.question}
                    {currentQuestion.type === 'multiple' && <span className="ml-2 text-sm font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full align-middle">多選</span>}
                    {currentQuestion.groupContent && <span className="ml-2 text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full align-middle">題組子題</span>}
                </h2>

                <div className="space-y-3">
                    {/* 單選 / 多選 */}
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

                    {/* 簡答題 */}
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

                {/* 思考導引 / 詳解 */}
                {(showHint || (isCorrectionMode && !isCorrect && isAnswered)) && (
                    <div className="mt-6 p-4 bg-amber-50 text-amber-900 rounded-xl text-sm border border-amber-100 animate-in fade-in slide-in-from-top-2">
                        <div className="font-bold flex items-center gap-2 mb-1">
                            <HelpCircle className="w-4 h-4" /> 
                            {isCorrectionMode ? '思考導引 (Thinking Guidance)' : '詳解提示'}
                        </div>
                        {isCorrectionMode ? currentQuestion.guidance : currentQuestion.explanation}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center">
                <div className="flex gap-3">
                    {/* 技能按鈕 */}
                    {unlockedSkills.includes('quiz-1') && currentQuestion.type === 'single' && !isAnswered && (
                        <button onClick={handleUseZap} className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-yellow-500 hover:scale-110 transition" title="發動技能：靈光">
                            <Zap className="w-6 h-6 fill-current" />
                        </button>
                    )}
                     {unlockedSkills.includes('quiz-2') && !isAnswered && !showHint && (
                        <button onClick={handleUseHint} className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-purple-500 hover:scale-110 transition" title="發動技能：天機">
                            <Key className="w-6 h-6" />
                        </button>
                    )}
                </div>

                <button 
                    onClick={handleSubmit}
                    // 🔥 修正了這裡的邏輯：移除了 currentQuestion.type !== 'group'
                    disabled={!isAnswered && selectedIndices.length === 0 && !shortAnswerText}
                    className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition shadow-lg animate-in fade-in slide-in-from-right-5 flex items-center gap-2"
                >
                    {isAnswered 
                        ? (currentQIndex < totalQuestions - 1 ? '下一題' : (isCorrectionMode ? '完成訂正' : '查看結果')) 
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