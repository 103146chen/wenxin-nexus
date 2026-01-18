'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { getLessonById, Lesson } from "@/lib/data/lessons"; // 👈 1. 引入 Lesson 型別
import { useUserStore } from "@/store/user-store";
import { useState } from "react";
import { ChevronLeft, Zap, Key, CheckCircle, XCircle, Award, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function QuizPage({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);

  if (!lesson) return <div>找不到課程</div>;

  return <QuizRunner lesson={lesson} />;
}

// 🔥 2. 將 lesson: any 改為 lesson: Lesson
function QuizRunner({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const { unlockedSkills, activateSkill, skillCooldowns, addXp, addCoins } = useUserStore();
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  const [removedOptions, setRemovedOptions] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);

  const currentQuestion = lesson.quizzes[currentQIndex];
  const totalQuestions = lesson.quizzes.length;

  const handleUseZap = () => {
    if (isAnswered) return;
    
    if (!activateSkill('quiz-1', 12)) {
        alert("技能冷卻中！");
        return;
    }

    // 🔥 3. 這裡的型別推斷現在會正常運作，為了保險我們加上明確型別
    const wrongIndices = currentQuestion.options
        .map((_: string, idx: number) => idx) 
        .filter((idx: number) => idx !== currentQuestion.correctIndex && !removedOptions.includes(idx));
    
    if (wrongIndices.length > 0) {
        const randomWrong = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        setRemovedOptions([...removedOptions, randomWrong]);
    }
  };

  const handleUseHint = () => {
      if (!activateSkill('quiz-2', 48)) {
          alert("技能冷卻中！");
          return;
      }
      setShowHint(true);
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctIndex) {
        setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQIndex < totalQuestions - 1) {
        setCurrentQIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setRemovedOptions([]);
        setShowHint(false);
    } else {
        setIsFinished(true);
        const xpReward = score * 50;
        const coinReward = score * 10;
        addXp(xpReward);
        addCoins(coinReward);
    }
  };

  const getCooldownText = (skillId: string, hours: number) => {
      const lastUsed = skillCooldowns[skillId] || 0;
      const now = Date.now();
      const diff = now - lastUsed;
      const cooldownMs = hours * 60 * 60 * 1000;
      
      if (diff < cooldownMs) {
          const remainingHours = Math.ceil((cooldownMs - diff) / (60 * 60 * 1000));
          return `${remainingHours}h`;
      }
      return null;
  };

  if (isFinished) {
      return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="ml-64 flex-1 p-12 flex items-center justify-center">
                <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full animate-in zoom-in-95">
                    <Award className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">測驗完成！</h2>
                    <p className="text-slate-500 mb-8">恭喜你完成了{lesson.title}的測驗。</p>
                    
                    <div className="flex justify-center gap-8 mb-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-indigo-600">{score} / {totalQuestions}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">答對題數</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-emerald-600">+{score * 50}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">獲得 XP</div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                        <Link href="/quiz" className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">
                            返回大廳
                        </Link>
                        <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" /> 再試一次
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 flex flex-col h-screen">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/quiz" className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
                <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
                <h1 className="text-xl font-bold text-slate-800">{lesson.title} 隨堂測驗</h1>
                <p className="text-xs text-slate-500">Question {currentQIndex + 1} of {totalQuestions}</p>
            </div>
          </div>
          <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Score: {score}
          </div>
        </div>

        <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col justify-center pb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6 relative overflow-hidden">
                <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
                    {currentQuestion.question}
                </h2>

                <div className="space-y-3">
                    {currentQuestion.options.map((opt: string, idx: number) => {
                        const isRemoved = removedOptions.includes(idx);
                        if (isRemoved) return null;

                        let optionStyle = "border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
                        let icon = null;

                        if (isAnswered) {
                            if (idx === currentQuestion.correctIndex) {
                                optionStyle = "border-green-500 bg-green-50 text-green-700 font-bold";
                                icon = <CheckCircle className="w-5 h-5 text-green-500" />;
                            } else if (idx === selectedOption) {
                                optionStyle = "border-red-500 bg-red-50 text-red-700";
                                icon = <XCircle className="w-5 h-5 text-red-500" />;
                            } else {
                                optionStyle = "border-slate-100 text-slate-400 opacity-50";
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={isAnswered}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${optionStyle}`}
                            >
                                <span className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    {opt}
                                </span>
                                {icon}
                            </button>
                        );
                    })}
                </div>

                {(isAnswered || showHint) && (
                    <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm border border-blue-100 animate-in fade-in slide-in-from-top-2">
                        <div className="font-bold flex items-center gap-2 mb-1">
                            <Key className="w-4 h-4" /> 詳解提示：
                        </div>
                        {currentQuestion.explanation}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center">
                <div className="flex gap-3">
                    {unlockedSkills.includes('quiz-1') && (
                        <div className="flex flex-col items-center gap-1">
                            <button 
                                onClick={handleUseZap}
                                disabled={isAnswered || !!getCooldownText('quiz-1', 12)}
                                className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-yellow-500 hover:scale-110 hover:border-yellow-400 transition disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                title="發動技能：靈光 (刪去一個選項)"
                            >
                                <Zap className="w-6 h-6 fill-current" />
                            </button>
                            {getCooldownText('quiz-1', 12) && <span className="text-[10px] font-bold text-slate-400">{getCooldownText('quiz-1', 12)}</span>}
                        </div>
                    )}

                    {unlockedSkills.includes('quiz-2') && (
                        <div className="flex flex-col items-center gap-1">
                            <button 
                                onClick={handleUseHint}
                                disabled={isAnswered || showHint || !!getCooldownText('quiz-2', 48)}
                                className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-purple-500 hover:scale-110 hover:border-purple-400 transition disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                title="發動技能：天機 (顯示提示)"
                            >
                                <Key className="w-6 h-6" />
                            </button>
                            {getCooldownText('quiz-2', 48) && <span className="text-[10px] font-bold text-slate-400">{getCooldownText('quiz-2', 48)}</span>}
                        </div>
                    )}
                </div>

                {isAnswered && (
                    <button 
                        onClick={handleNext}
                        className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition shadow-lg animate-in fade-in slide-in-from-right-5"
                    >
                        {currentQIndex < totalQuestions - 1 ? '下一題' : '查看結果'}
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}