'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, RefreshCw, Sparkles } from 'lucide-react'; // 新增 Sparkles
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/user-store'; // 引入 Store

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  tutorName: string; 
  initialMessage: string;
}

export default function ChatInterface({ tutorName, initialMessage }: ChatInterfaceProps) {
  const { activeTheme } = useUserStore(); // 🔥 取得目前主題
  
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'assistant', content: initialMessage }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages, isTyping]);

  const simulateAIResponse = (userText: string) => {
    setIsTyping(true);
    setTimeout(() => {
      let reply = '';
      if (userText.includes('你好') || userText.includes('嗨')) {
        reply = `幸會幸會。今日風清月白，正適合談論詩文。`;
      } else if (userText.includes('赤壁') || userText.includes('水') || userText.includes('月')) {
        reply = `逝者如斯，而未嘗往也；盈虛者如彼，而卒莫消長也。閣下以為然否？`;
      } else if (userText.includes('難') || userText.includes('不懂')) {
        reply = `莫急。讀書如下棋，初時不解，久之自通。且放下執著，與我共飲一杯如何？`;
      } else {
        reply = `閣下所言甚是，然則世間萬物，皆有其理。我們可以從「變」與「不變」的角度再思考看看。`;
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: reply
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    simulateAIResponse(inputValue);
  };

  // 🔥 定義主題樣式
  const isNightTheme = activeTheme === 'theme-night';
  
  const containerClass = isNightTheme 
    ? 'bg-slate-900 border-slate-700' 
    : 'bg-white border-slate-200';
    
  const headerClass = isNightTheme 
    ? 'bg-slate-800 border-slate-700 text-slate-100' 
    : 'bg-slate-50 border-slate-100 text-slate-800';
    
  const contentBgClass = isNightTheme
    ? 'bg-[url("https://www.transparenttextures.com/patterns/stardust.png")] bg-slate-900 text-slate-200' // 簡單的星空紋理模擬
    : 'bg-slate-50/50 text-slate-700';

  const botBubbleClass = isNightTheme
    ? 'bg-slate-800 text-slate-200 border-slate-700'
    : 'bg-white text-slate-700 border border-slate-100';

  return (
    <div className={`flex flex-col h-[600px] border rounded-xl shadow-sm overflow-hidden transition-colors duration-500 ${containerClass}`}>
      {/* 聊天標題 */}
      <div className={`p-4 flex items-center justify-between border-b ${headerClass}`}>
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isNightTheme ? 'bg-indigo-900 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                <Bot className="w-6 h-6" />
            </div>
            <div>
                <h3 className={`font-bold flex items-center gap-2 ${isNightTheme ? 'text-white' : 'text-slate-800'}`}>
                    {tutorName} AI
                    {isNightTheme && <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse"/>}
                </h3>
                <p className="text-xs text-green-600 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                    在線中
                </p>
            </div>
        </div>
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMessages([{ id: 'init', role: 'assistant', content: initialMessage }])}
            className={isNightTheme ? 'text-slate-400 hover:text-white hover:bg-slate-700' : ''}
        >
            <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* 訊息顯示區 */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${contentBgClass}`}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* 頭像 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' 
                        ? (isNightTheme ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600')
                        : (isNightTheme ? 'bg-indigo-900 text-indigo-400' : 'bg-indigo-100 text-indigo-600')
                }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* 氣泡 */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : `${botBubbleClass} rounded-tl-none`
                }`}>
                    {msg.content}
                </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
             <div className="flex gap-3 max-w-[80%]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isNightTheme ? 'bg-indigo-900 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    <Bot className="w-4 h-4" />
                </div>
                <div className={`${botBubbleClass} p-4 rounded-2xl rounded-tl-none flex gap-1 items-center h-10`}>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 輸入區 */}
      <div className={`p-4 border-t ${isNightTheme ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex gap-2">
            <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`請輸入你想問${tutorName}的問題...`}
                className={`flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    isNightTheme 
                    ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:ring-indigo-500' 
                    : 'bg-slate-50 border-slate-200 focus:ring-indigo-100 focus:border-indigo-400'
                }`}
            />
            <Button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700"
            >
                <Send className="w-5 h-5" />
            </Button>
        </div>
      </div>
    </div>
  );
}