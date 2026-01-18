import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { CLICK_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical';
import { useEffect, useState, useCallback } from 'react';
import { Save, Edit2, X } from 'lucide-react';

// 定義儲存註釋內容的 LocalStorage Key
const COMMENTS_STORAGE_KEY = 'wenxin-comments-data';

export default function CommentaryClickPlugin() {
  const [editor] = useLexicalComposerContext();
  
  // 1. 狀態管理
  // comments: 儲存所有註釋內容 { "id1": "解釋1", "id2": "解釋2" }
  const [comments, setComments] = useState<Record<string, string>>({});
  
  // activeComment: 目前被點擊、正在顯示的那個註釋
  const [activeComment, setActiveComment] = useState<{
    id: string;
    x: number;
    y: number;
    text: string; // 原文
  } | null>(null);

  // isEditing: 控制卡片是否處於「編輯模式」
  const [isEditing, setIsEditing] = useState(false);
  
  // tempContent: 編輯中的暫存文字
  const [tempContent, setTempContent] = useState("");

  // 2. 初始化：從 LocalStorage 讀取舊的註釋資料
  useEffect(() => {
    const savedData = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (savedData) {
      try {
        setComments(JSON.parse(savedData));
      } catch (e) {
        console.error("讀取註釋失敗", e);
      }
    }
  }, []);

  // 3. 儲存功能：將新的解釋寫入 LocalStorage
  const handleSaveContent = () => {
    if (!activeComment) return;

    const newComments = {
      ...comments,
      [activeComment.id]: tempContent
    };

    setComments(newComments);
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(newComments));
    setIsEditing(false); // 存檔後退出編輯模式
  };

  // 4. 註冊點擊監聽器
  useEffect(() => {
    return editor.registerCommand(
      CLICK_COMMAND,
      (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const commentId = target.dataset.commentId;

        if (commentId) {
          const rect = target.getBoundingClientRect();
          
          // 設定當前活動的註釋
          setActiveComment({
            id: commentId,
            x: rect.left + window.scrollX,
            y: rect.bottom + window.scrollY + 8, // 稍微往下挪一點
            text: target.innerText,
          });

          // 如果這個 ID 已經有內容，就載入內容；如果沒有，就預設進入編輯模式
          const existingContent = comments[commentId] || "";
          setTempContent(existingContent);
          
          // 如果內容是空的，自動開啟編輯模式方便輸入
          setIsEditing(!existingContent); 
          
          event.stopPropagation();
          return true; 
        }

        // 點擊空白處，關閉卡片
        setActiveComment(null);
        setIsEditing(false);
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, comments]); // 注意這裡 dependency 加入了 comments

  if (!activeComment) return null;

  return (
    <div 
      className="fixed z-50 w-72 bg-white rounded-xl shadow-2xl border border-indigo-100 p-4 animate-in fade-in zoom-in-95 duration-200"
      style={{ left: activeComment.x, top: activeComment.y }}
    >
      {/* 卡片標題區 */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
        <h4 className="font-bold text-indigo-700 text-sm flex items-center gap-2">
          <span className="bg-indigo-100 px-2 py-0.5 rounded text-xs">原文</span>
          {activeComment.text}
        </h4>
        <div className="flex gap-1">
          {/* 編輯按鈕 (如果在閱讀模式，可以按這個切換) */}
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
              title="編輯釋義"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {/* 關閉按鈕 */}
          <button 
            onClick={() => setActiveComment(null)}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 內容顯示區 / 編輯區 */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            placeholder="請在此輸入詳細的字詞解釋、翻譯或補充說明..."
            className="w-full h-24 p-2 text-sm text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none resize-none bg-slate-50"
            autoFocus
          />
          <div className="flex justify-end">
            <button
              onClick={handleSaveContent}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700 transition shadow-sm"
            >
              <Save className="w-3 h-3" />
              儲存解釋
            </button>
          </div>
        </div>
      ) : (
        // 閱讀模式顯示
        <div className="text-slate-600 text-sm leading-relaxed min-h-[40px]">
          {comments[activeComment.id] ? (
            comments[activeComment.id]
          ) : (
            <span className="text-slate-400 italic text-xs">尚未輸入解釋...</span>
          )}
        </div>
      )}

      {/* 底部裝飾 (箭頭) */}
      <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-t border-l border-indigo-100 transform rotate-45"></div>
    </div>
  );
}