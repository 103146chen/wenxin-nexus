import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, CLEAR_EDITOR_COMMAND } from 'lexical';
import { $createCommentaryNode } from './nodes/CommentaryNode';
import { Edit3, BookOpen, Wand2, Trash2, Cloud, Loader2, Search } from 'lucide-react'; // 新增 Search
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/user-store'; // 引入 Store
import { TOGGLE_HIGHLIGHT_COMMAND } from './HighlighterPlugin'; // 引入 Command

interface ToolbarProps {
  lessonId: string;
}

export default function ToolbarPlugin({ lessonId }: ToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const { unlockedSkills } = useUserStore(); // 取得技能
  
  const [isEditable, setIsEditable] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isHighlightOn, setIsHighlightOn] = useState(false);

  const STORAGE_KEY = `wenxin-editor-${lessonId}`; 
  const hasReadSkill = unlockedSkills.includes('read-2'); // 檢查技能

  // 初始化與自動存檔 (保持不變)
  useEffect(() => {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
      editor.update(() => {
        const editorState = editor.parseEditorState(savedContent);
        editor.setEditorState(editorState);
      });
    }
  }, [editor, lessonId, STORAGE_KEY]);

  useEffect(() => {
    return editor.registerUpdateListener(({ dirtyElements, dirtyLeaves, editorState }) => {
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
      setSaveStatus('saving');
      editorState.read(() => {
        const jsonString = JSON.stringify(editorState);
        localStorage.setItem(STORAGE_KEY, jsonString);
        setTimeout(() => setSaveStatus('saved'), 500);
      });
    });
  }, [editor, STORAGE_KEY]);

  const handleClear = () => {
    if (confirm('確定要清空所有筆記與標註嗎？此動作無法復原。')) {
      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const toggleEditable = () => {
    editor.setEditable(!isEditable);
    setIsEditable(!isEditable);
  };

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

  // 🔥 切換高亮模式
  const toggleHighlight = () => {
      const newState = !isHighlightOn;
      setIsHighlightOn(newState);
      editor.dispatchCommand(TOGGLE_HIGHLIGHT_COMMAND, newState);
  };

  return (
    <div className="flex items-center justify-between p-2 bg-white border-b border-stone-200 shadow-sm sticky top-0 z-20 h-14">
      
      <div className="flex items-center gap-3 px-2">
        {saveStatus === 'saving' ? (
          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Loader2 className="w-3 h-3 animate-spin" /> 自動儲存中...
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium animate-in fade-in duration-300">
            <Cloud className="w-3 h-3" /> 已同步
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

        {/* 🔥 技能按鈕：探賾 (難詞高亮) */}
        {hasReadSkill && (
            <button 
                onClick={toggleHighlight}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded transition border ${
                    isHighlightOn
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
                title="技能：探賾 - 開啟難詞提示"
            >
                <Search className="w-4 h-4" />
                {isHighlightOn ? '探賾 ON' : '探賾 OFF'}
            </button>
        )}
      </div>

      <div className="flex gap-2">
         {isEditable && (
            <>
              <button 
                onClick={handleAddComment}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded transition"
                title="選取文字後點擊此按鈕"
              >
                <Wand2 className="w-4 h-4" /> 新增註釋
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