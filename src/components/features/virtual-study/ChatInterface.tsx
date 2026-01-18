'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  tutorName: string; // 例如 "蘇軾"
  initialMessage: string; // 例如 "吾乃蘇子瞻，客官有何指教？"
}

export default function ChatInterface({ tutorName, initialMessage }: ChatInterfaceProps) {
  // 聊天記錄狀態
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'assistant', content: initialMessage }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // 自動捲動到底部
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages, isTyping]);

  // 模擬 AI 回應的簡單邏輯 (之後會換成真的 OpenAI API)
  const simulateAIResponse = (userText: string) => {
    setIsTyping(true);
    
    // 假裝思考 1~2 秒
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

    // 1. 加入使用者訊息
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // 2. 觸發 AI 回應
    simulateAIResponse(inputValue);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* 聊天標題 */}
      <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Bot className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800">{tutorName} AI</h3>
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
            title="重新開始對話"
        >
            <RefreshCw className="w-4 h-4 text-slate-400" />
        </Button>
      </div>

      {/* 訊息顯示區 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* 頭像 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-600'
                }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* 氣泡 */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                        ? 'bg-slate-800 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                    {msg.content}
                </div>
            </div>
          </div>
        ))}
        
        {/* 打字動畫 */}
        {isTyping && (
          <div className="flex justify-start">
             <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center h-10">
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
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
            <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`請輸入你想問${tutorName}的問題...`}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition"
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