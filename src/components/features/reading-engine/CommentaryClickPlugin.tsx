import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { CLICK_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical';
import { useEffect, useState } from 'react';
import { Edit2, X, Send, Clock, CheckCircle, Users, Heart, AlertCircle, RefreshCw } from 'lucide-react';
import { GamificationEngine } from '@/lib/engines/GamificationEngine';
import { useUserStore } from '@/store/user-store';
import { StudentAsset } from '@/lib/types/gamification';

const COMMENTS_STORAGE_KEY = 'wenxin-comments-data';

interface CommentData {
  content: string;
  status: 'draft' | 'pending' | 'verified' | 'rejected';
  feedback?: string; 
}

export default function CommentaryClickPlugin() {
  const [editor] = useLexicalComposerContext();
  const { name } = useUserStore();
  
  const [comments, setComments] = useState<Record<string, CommentData>>({});
  const [activeComment, setActiveComment] = useState<{
    id: string;
    x: number;
    y: number;
    text: string;
  } | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState("");
  const [communityNotes, setCommunityNotes] = useState<StudentAsset[]>([]);

  // 輔助：寫入本地儲存
  const saveToLocal = (data: Record<string, CommentData>) => {
    setComments(data);
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(data));
  };

  // 1. 初始化讀取
  useEffect(() => {
    const savedData = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (savedData) {
      try { setComments(JSON.parse(savedData)); } catch (e) { console.error(e); }
    }
  }, []);

  // 🔥 2. 當卡片打開時，執行「精準同步」
  useEffect(() => {
    if (activeComment) {
        // A. 載入社群註釋 (別人的)
        const notes = GamificationEngine.getCommunityAnnotations(activeComment.text);
        setCommunityNotes(notes.filter(n => n.authorName !== name));

        // B. 檢查我自己的註釋狀態 (跟伺服器對帳)
        // 從引擎撈出「我」針對「這個註釋ID」的資產
        const myAssets = GamificationEngine.getMyAssets(name);
        const remoteAsset = myAssets.find(a => a.id === activeComment.id);

        if (remoteAsset) {
            // 如果伺服器有資料，比較一下本地狀態
            setComments(prev => {
                const currentLocal = prev[activeComment.id];
                
                // 如果本地沒有，或是狀態不一致，就強制更新
                if (!currentLocal || currentLocal.status !== remoteAsset.status || currentLocal.feedback !== remoteAsset.feedback) {
                    const newComments = {
                        ...prev,
                        [activeComment.id]: {
                            content: remoteAsset.contentPreview, // 確保內容也同步
                            status: remoteAsset.status,
                            feedback: remoteAsset.feedback
                        }
                    };
                    // 寫入 LocalStorage 避免下次閃爍
                    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(newComments));
                    console.log(`🔄 同步完成：${remoteAsset.title} -> ${remoteAsset.status}`);
                    return newComments;
                }
                return prev;
            });
        }
    }
  }, [activeComment, name]); // 每次打開卡片都會觸發

  // 自動存檔 (編輯中)
  useEffect(() => {
    if (!isEditing || !activeComment) return;
    const timer = setTimeout(() => {
        const newComments = {
            ...comments,
            [activeComment.id]: { 
              content: tempContent, 
              status: comments[activeComment.id]?.status || 'draft',
              feedback: comments[activeComment.id]?.feedback
            }
        };
        saveToLocal(newComments);
    }, 1000);
    return () => clearTimeout(timer);
  }, [tempContent, isEditing, activeComment, comments]);

  // 提交
  const handleSubmit = () => {
    if (!activeComment) return;
    
    const newComments = {
      ...comments,
      [activeComment.id]: { 
        content: tempContent, 
        status: 'pending' as const,
        feedback: undefined
      }
    };
    saveToLocal(newComments);
    setIsEditing(false);

    GamificationEngine.submitAsset({
        id: activeComment.id,
        type: 'annotation',
        title: `註釋：${activeComment.text}`,
        contentPreview: tempContent,
        authorId: name,
        authorName: name,
        targetText: activeComment.text
    });
    
    alert("已提交給老師審核！(獲得 +10 XP)");
  };

  const handleLikeCommunityNote = (assetId: string) => {
      GamificationEngine.toggleLike(assetId, name);
      if (activeComment) {
          const notes = GamificationEngine.getCommunityAnnotations(activeComment.text);
          setCommunityNotes(notes.filter(n => n.authorName !== name));
      }
  };

  // 註冊點擊
  useEffect(() => {
    return editor.registerCommand(
      CLICK_COMMAND,
      (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const commentId = target.dataset.commentId;
        if (commentId) {
          const rect = target.getBoundingClientRect();
          let left = rect.left + window.scrollX;
          if (left > window.innerWidth - 300) left = window.innerWidth - 320;

          setActiveComment({
            id: commentId,
            x: left,
            y: rect.bottom + window.scrollY + 8,
            text: target.innerText,
          });

          const existing = comments[commentId];
          setTempContent(existing?.content || "");
          
          const shouldEdit = !existing?.content || existing?.status === 'rejected';
          setIsEditing(shouldEdit); 
          
          event.stopPropagation();
          return true; 
        }
        setActiveComment(null);
        setIsEditing(false);
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, comments]);

  if (!activeComment) return null;

  const currentData = comments[activeComment.id];
  const currentStatus = currentData?.status || 'draft';

  return (
    <div 
      className="fixed z-50 w-80 bg-white rounded-xl shadow-2xl border border-indigo-100 p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[500px]"
      style={{ left: activeComment.x, top: activeComment.y }}
    >
      <div className="flex justify-between items-center p-3 bg-slate-50 border-b border-slate-100 shrink-0">
        <h4 className="font-bold text-indigo-700 text-sm flex items-center gap-2">
          {activeComment.text}
          {currentStatus === 'pending' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded flex items-center gap-1"><Clock className="w-3 h-3"/>審核中</span>}
          {currentStatus === 'verified' && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1"><CheckCircle className="w-3 h-3"/>已認證</span>}
          {currentStatus === 'rejected' && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded flex items-center gap-1"><AlertCircle className="w-3 h-3"/>需修改</span>}
        </h4>
        <div className="flex gap-1">
          {!isEditing && (currentStatus === 'draft' || currentStatus === 'rejected') && (
            <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => setActiveComment(null)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto p-4 space-y-6">
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">我的筆記</h5>
            </div>
            
            {currentStatus === 'rejected' && currentData.feedback && (
                <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-xs text-red-700 mb-2 flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold block mb-1">老師的回饋：</span>
                        {currentData.feedback}
                    </div>
                </div>
            )}

            {isEditing ? (
                <div className="space-y-3">
                <textarea
                    value={tempContent}
                    onChange={(e) => setTempContent(e.target.value)}
                    placeholder="輸入解釋..."
                    className="w-full h-24 p-2 text-sm text-slate-700 border border-slate-200 rounded-lg focus:ring-2 outline-none bg-slate-50"
                    autoFocus
                />
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 italic">
                       {currentStatus === 'rejected' ? '修改後可重新提交' : '已自動儲存草稿'}
                    </span>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700 transition shadow-sm"
                    >
                        <Send className="w-3 h-3" /> {currentStatus === 'rejected' ? '重新提交' : '提交'}
                    </button>
                </div>
                </div>
            ) : (
                <div className="text-slate-700 text-sm leading-relaxed p-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
                    {comments[activeComment.id]?.content || <span className="text-slate-400 italic text-xs">尚未輸入...</span>}
                </div>
            )}
        </div>

        {communityNotes.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3" /> 同學共構 ({communityNotes.length})
                </h5>
                {communityNotes.map(note => {
                    const isLikedByMe = note.likedBy?.includes(name);
                    return (
                        <div key={note.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:border-indigo-200 transition">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-slate-800">{note.authorName}</span>
                                <button 
                                    onClick={() => handleLikeCommunityNote(note.id)}
                                    className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border transition ${
                                        isLikedByMe ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white text-slate-400 border-slate-200'
                                    }`}
                                >
                                    <Heart className={`w-3 h-3 ${isLikedByMe ? 'fill-current' : ''}`} />
                                    {note.likes}
                                </button>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{note.contentPreview}</p>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}