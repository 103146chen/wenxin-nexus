import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, CLEAR_EDITOR_COMMAND } from 'lexical';
import { $createCommentaryNode } from './nodes/CommentaryNode';
import { Edit3, BookOpen, Wand2, Trash2, CheckCircle, Cloud, Loader2 } from 'lucide-react'; // 新增 Icon
import { useEffect, useState, useCallback } from 'react';

interface ToolbarProps {
  lessonId: string;
}

export default function ToolbarPlugin({ lessonId }: ToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // 產生唯一的 Storage Key
  const STORAGE_KEY = `wenxin-editor-${lessonId}`; 

  // 1. 初始化讀取
  useEffect(() => {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
      editor.update(() => {
        const editorState = editor.parseEditorState(savedContent);
        editor.setEditorState(editorState);
      });
    }
  }, [editor, lessonId, STORAGE_KEY]);

  // 🔥 2. 全自動存檔監聽器 (Auto-Save Listener)
  useEffect(() => {
    return editor.registerUpdateListener(({ dirtyElements, dirtyLeaves, editorState }) => {
      // 只有當內容真的有變動時才存檔
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;

      setSaveStatus('saving');
      
      // 使用 editorState.read 確保拿到最新狀態
      editorState.read(() => {
        const jsonString = JSON.stringify(editorState);
        localStorage.setItem(STORAGE_KEY, jsonString);
        
        // 模擬一點延遲讓使用者感覺到「正在存」
        setTimeout(() => {
          setSaveStatus('saved');
        }, 500);
      });
    });
  }, [editor, STORAGE_KEY]);

  // 3. 清空功能
  const handleClear = () => {
    if (confirm('確定要清空所有筆記與標註嗎？此動作無法復原。')) {
      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // 4. 切換模式
  const toggleEditable = () => {
    editor.setEditable(!isEditable);
    setIsEditable(!isEditable);
  };

  // 5. 魔法註釋
  const handleAddComment = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const textContent = selection.getTextContent();
        if (!textContent) return;
        
        const commentId = 'term-' + Math.floor(Math.random() * 100000);
        const commentaryNode = $createCommentaryNode(textContent, commentId);
        selection.insertNodes([commentaryNode]);
      }
    });
  };

  return (
    <div className="flex items-center justify-between p-2 bg-white border-b border-stone-200 shadow-sm sticky top-0 z-20 h-14">
      
      {/* 左側：狀態顯示區 */}
      <div className="flex items-center gap-3 px-2">
        {saveStatus === 'saving' ? (
          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            自動儲存中...
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium animate-in fade-in duration-300">
            <Cloud className="w-3 h-3" />
            已同步
          </span>
        )}

        <div className="h-4 w-px bg-stone-300 mx-1"></div>

        <button 
          onClick={toggleEditable}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition ${
            isEditable 
              ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          {isEditable ? <Edit3 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          {isEditable ? '編輯模式' : '閱讀模式'}
        </button>
      </div>

      {/* 右側：工具區 */}
      <div className="flex gap-2">
         {isEditable && (
            <>
              <button 
                onClick={handleAddComment}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded transition"
                title="選取文字後點擊此按鈕"
              >
                <Wand2 className="w-4 h-4" />
                新增註釋
              </button>

              <button 
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                title="清空畫布"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
         )}
      </div>
    </div>
  );
}