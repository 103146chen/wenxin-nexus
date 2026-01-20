'use client';

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Sparkles, Coins, Lock } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { AIEngine } from "@/lib/engines/AIEngine";
// 🔥 Import useLessons
import { useLessons } from "@/hooks/use-lessons";

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  lessonId: string;
  lessonTitle: string;
}

export default function ChatInterface({ lessonId, lessonTitle }: ChatInterfaceProps) {
  const { 
      avatar, 
      name, 
      aiDailyUsage, 
      aiMaxDailyFree, 
      consumeAiQuota, 
      coins 
  } = useUserStore();

  // 🔥 取得完整課程資訊以獲取 Prompt
  const { getLesson } = useLessons();
  const lesson = getLesson(lessonId);
  const aiPersona = lesson?.aiPersona || '你是一位博學的導師。';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      // 根據 lessonId 簡單客製化歡迎語，也可以存在 Lesson 資料中
      content: `吾乃${lessonId === 'lesson-1' ? '蘇子瞻' : lessonId === 'lesson-2' ? '韓退之' : '書齋先生'}。今日與小友共讀《${lessonTitle}》，有何感悟或困惑，不妨道來？`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // 1. 檢查配額
    const quotaResult = consumeAiQuota();
    
    if (quotaResult === 'limit_reached') {
        alert("今日免費額度已用完，且文心幣不足 (需 10 枚/句)！\n請先去賺取文心幣吧。");
        return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    if (quotaResult === 'paid_success') {
        // 可以顯示一個小的 Toast 提示扣款成功 (這裡先用 console)
        console.log("已扣除 10 文心幣");
    }

    // 2. 呼叫 AI 引擎
    try {
        // 🔥 將動態的 aiPersona 傳入
        const aiResponseText = await AIEngine.chat(userMsg.content, aiPersona, lessonId);
        
        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: aiResponseText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'ai',
            content: "（撫鬚）老夫今日略感疲乏，思緒不清，改日再議吧...",
            timestamp: new Date()
        }]);
    } finally {
        setIsTyping(false);
    }
  };

  const remainingFree = Math.max(0, aiMaxDailyFree - aiDailyUsage);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="font-bold text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              與{lessonId === 'lesson-1' ? '蘇軾' : lessonId === 'lesson-2' ? '韓愈' : 'AI 導師'}對話中
          </div>
          
          {/* 🔥 顯示配額狀態 */}
          <div className="text-xs font-bold flex items-center gap-2">
              {remainingFree > 0 ? (
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                      今日免費：{remainingFree} 句
                  </span>
              ) : (
                  <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 flex items-center gap-1">
                      <Coins className="w-3 h-3"/> 付費模式 (10幣/句)
                  </span>
              )}
          </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-emerald-100'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-indigo-600" /> : <Bot className="w-5 h-5 text-emerald-600" />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none font-serif'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-emerald-600" />
             </div>
             <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span className="text-xs text-slate-400 ml-2">思考中...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative">
            <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={remainingFree > 0 ? "輸入訊息..." : `餘額 ${coins} 幣，發送將扣除 10 幣`}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:bg-slate-100"
            disabled={isTyping || (remainingFree === 0 && coins < 10)}
            />
            <button 
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping || (remainingFree === 0 && coins < 10)}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
            <Send className="w-4 h-4" />
            </button>
        </div>
        {remainingFree === 0 && coins < 10 && (
            <div className="text-xs text-rose-500 mt-2 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3"/> 文心幣不足，無法繼續對話
            </div>
        )}
      </div>
    </div>
  );
}