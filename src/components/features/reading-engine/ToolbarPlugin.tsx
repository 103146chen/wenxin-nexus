import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, CLEAR_EDITOR_COMMAND } from 'lexical';
import { $createCommentaryNode } from './nodes/CommentaryNode';
import { Save, Edit3, BookOpen, Wand2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const LOCAL_STORAGE_KEY = 'wenxin-editor-content';

interface ToolbarProps {
  lessonId: string;
}

export default function ToolbarPlugin({ lessonId }: ToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(true);

  const STORAGE_KEY = `wenxin-editor-${lessonId}`;

  // 1. 初始化時，嘗試讀取存檔
  useEffect(() => {
    const savedContent = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedContent) {
      editor.update(() => {
        // 將 JSON 字串轉回編輯器狀態
        const editorState = editor.parseEditorState(savedContent);
        editor.setEditorState(editorState);
      });
      console.log("已從 LocalStorage 載入內容");
    }
  }, [editor, lessonId, STORAGE_KEY]);

  // 2. 存檔功能
  const handleSave = () => {
    const editorState = editor.getEditorState();
    const jsonString = JSON.stringify(editorState);
    localStorage.setItem(STORAGE_KEY, jsonString);
    alert('✅ 內容已儲存到瀏覽器！');
  };

  // 3. 清空功能
  const handleClear = () => {
    if (confirm('確定要清空所有內容嗎？')) {
      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // 4. 切換 閱讀/編輯 模式
  const toggleEditable = () => {
    editor.setEditable(!isEditable);
    setIsEditable(!isEditable);
  };

  // 5. 魔法註釋功能 (從之前的元件移過來)
  const handleAddComment = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const textContent = selection.getTextContent();
        if (!textContent) return;
        
        // 隨機 ID
        const commentId = 'term-' + Math.floor(Math.random() * 1000);
        const commentaryNode = $createCommentaryNode(textContent, commentId);
        selection.insertNodes([commentaryNode]);
      }
    });
  };

  return (
    <div className="flex items-center justify-between p-2 bg-white border-b border-stone-200 shadow-sm sticky top-0 z-20">
      
      {/* 左側：操作區 */}
      <div className="flex gap-2">
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 bg-stone-100 rounded hover:bg-stone-200 transition"
          title="儲存內容"
        >
          <Save className="w-4 h-4" />
          存檔
        </button>

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
         {/* 只有在編輯模式下才顯示這些按鈕 */}
         {isEditable && (
            <>
              <button 
                onClick={handleAddComment}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded transition"
              >
                <Wand2 className="w-4 h-4" />
                標註重點
              </button>

              <div className="w-px h-6 bg-stone-300 mx-1"></div>

              <button 
                onClick={handleClear}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
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