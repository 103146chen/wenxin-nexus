'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Panel,
  Node,
  useReactFlow,
  ReactFlowProvider,
  Viewport,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Send, Lock, Cloud, Loader2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { GamificationEngine } from '@/lib/engines/GamificationEngine';
import { useUserStore } from '@/store/user-store';
import { AssetStatus } from '@/lib/types/gamification';

interface LogicCanvasProps {
  lessonId: string;
}

const defaultNodes = [
  { 
    id: 'root', 
    position: { x: 300, y: 50 }, 
    data: { label: '中心論題 (點兩下編輯)' }, 
    style: { background: '#fef3c7', border: '1px solid #d97706', fontWeight: 'bold' }
  }
];

function LogicCanvasContent({ lessonId }: LogicCanvasProps) {
  const { name } = useUserStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setViewport, toObject } = useReactFlow();

  // 狀態管理
  const [status, setStatus] = useState<AssetStatus>('draft');
  const [feedback, setFeedback] = useState<string | undefined>(undefined);
  
  // 自動存檔狀態
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const hasLoaded = useRef(false); // 避免初次載入時觸發自動存檔

  // Modal 相關
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  // 鎖定邏輯：審核中或已通過時鎖定；被退回時解鎖
  const isLocked = status === 'pending' || status === 'verified';
  const assetId = `logic-${lessonId}`;
  const STORAGE_KEY = `logic-map-${lessonId}`;

  // 🔄 1. 初始化與同步邏輯 (Sync Logic)
  useEffect(() => {
    // A. 讀取本地 LocalStorage
    let localData: any = null;
    const savedString = localStorage.getItem(STORAGE_KEY);
    if (savedString) {
      localData = JSON.parse(savedString);
    }

    // B. 從引擎讀取遠端狀態 (模擬伺服器同步)
    const myAssets = GamificationEngine.getMyAssets(name);
    const remoteAsset = myAssets.find(a => a.id === assetId);

    // C. 比較與合併
    let finalNodes = defaultNodes;
    let finalEdges = [];
    let finalStatus: AssetStatus = 'draft';
    let finalFeedback = undefined;
    let finalViewport = { x: 0, y: 0, zoom: 1 };

    // 如果遠端存在，以遠端狀態為準
    if (remoteAsset) {
        finalStatus = remoteAsset.status;
        finalFeedback = remoteAsset.feedback;
        
        // 如果本地遺失資料，嘗試從遠端還原 (前提是提交時有存完整 JSON)
        if (!localData && remoteAsset.contentPreview) {
            try {
                const restoredData = JSON.parse(remoteAsset.contentPreview);
                if (restoredData.nodes) {
                    finalNodes = restoredData.nodes;
                    finalEdges = restoredData.edges || [];
                    finalViewport = restoredData.viewport || finalViewport;
                    console.log("🔄 已從伺服器還原邏輯圖內容");
                }
            } catch (e) {
                console.error("還原失敗", e);
            }
        } else if (localData) {
            // 本地還在，直接用本地的圖，但更新狀態
            finalNodes = localData.nodes || defaultNodes;
            finalEdges = localData.edges || [];
            finalViewport = localData.viewport || finalViewport;
        }
    } else if (localData) {
        // 只有本地資料 (尚未提交過)
        finalNodes = localData.nodes || defaultNodes;
        finalEdges = localData.edges || [];
        finalStatus = localData.status || 'draft';
        finalViewport = localData.viewport || finalViewport;
    }

    // D. 套用設定
    setNodes(finalNodes);
    setEdges(finalEdges);
    setStatus(finalStatus);
    setFeedback(finalFeedback);
    if (finalViewport) setViewport(finalViewport);
    
    // 標記已載入完成，可以開始監聽自動存檔
    setTimeout(() => { hasLoaded.current = true; }, 500);

  }, [lessonId, name, setNodes, setEdges, setViewport, assetId, STORAGE_KEY]);


  // 🔥 2. 全自動存檔 (Auto-Save)
  useEffect(() => {
    if (!hasLoaded.current || isLocked) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const flowData = {
        nodes,
        edges,
        viewport: toObject().viewport,
        status: status === 'rejected' ? 'rejected' : 'draft', // 保持狀態
        feedback // 保留評語以免消失
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flowData));
      setSaveStatus('saved');
    }, 1000); // 1秒後自動存

    return () => clearTimeout(timer);
  }, [nodes, edges, status, feedback, isLocked, toObject, STORAGE_KEY]);


  // 🚀 3. 提交功能
  const onSubmit = useCallback(() => {
    if (nodes.length < 3) {
      alert('⚠️ 結構太簡單了！至少需要 3 個節點才能提交喔。');
      return;
    }

    // 準備完整資料 (用於備份還原)
    const fullData = {
        nodes,
        edges,
        viewport: toObject().viewport
    };

    // 更新本地狀態
    const localPayload = { ...fullData, status: 'pending', feedback: undefined };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localPayload));
    setStatus('pending');
    setFeedback(undefined); // 清空舊評語

    // 送入遊戲引擎 (將完整 JSON 存入 contentPreview 以便還原)
    GamificationEngine.submitAsset({
      id: assetId,
      type: 'logic-map',
      title: `邏輯圖：${lessonId} 結構分析`,
      contentPreview: JSON.stringify(fullData), // 🔥 這裡存入完整資料字串
      authorId: name,
      authorName: name
    });

    alert('🚀 已提交邏輯圖！(獲得 +10 XP)');
  }, [nodes, edges, lessonId, toObject, name, assetId, STORAGE_KEY]);


  // --- 互動邏輯 ---
  const onConnect = useCallback(
    (params: Connection | Edge) => !isLocked && setEdges((eds) => addEdge(params, eds)),
    [setEdges, isLocked]
  );

  const onAddNode = useCallback(() => {
    if (isLocked) return;
    const newNode = {
      id: Math.random().toString(36).substr(2, 5),
      position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 }, 
      data: { label: '新觀點' },
      style: { background: '#ffffff', border: '1px solid #cbd5e1' }
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, isLocked]);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (isLocked) return;
    setEditingNodeId(node.id);
    setEditLabel(node.data.label);
    setIsModalOpen(true);
  }, [isLocked]);

  const handleModalSave = () => {
    if (editingNodeId) {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === editingNodeId) return { ...n, data: { ...n.data, label: editLabel } };
          return n;
        })
      );
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="w-full h-full bg-white relative group">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={!isLocked ? onNodesChange : undefined}
          onEdgesChange={!isLocked ? onEdgesChange : undefined}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          nodesDraggable={!isLocked}
          nodesConnectable={!isLocked}
          elementsSelectable={!isLocked}
          fitView
        >
          <Background color="#94a3b8" variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
          <MiniMap nodeColor="#e2e8f0" style={{ height: 100 }} />

          {/* 右上控制面板 */}
          <Panel position="top-right" className="flex flex-col gap-2 items-end">
             {/* 儲存狀態指示器 */}
             <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-slate-100 flex items-center gap-2 text-xs font-medium">
                {saveStatus === 'saving' ? (
                    <>
                        <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                        <span className="text-slate-500">自動儲存中...</span>
                    </>
                ) : (
                    <>
                        <Cloud className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-600">已同步</span>
                    </>
                )}
             </div>

             {/* 操作面板 */}
             <div className="bg-white p-2 rounded-lg shadow-md border border-slate-100 flex gap-2 items-center">
                {/* 狀態標籤 */}
                {status === 'pending' && <span className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded"><Clock className="w-3 h-3 mr-1"/>審核中</span>}
                {status === 'verified' && <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded"><CheckCircle className="w-3 h-3 mr-1"/>已認證</span>}
                {status === 'rejected' && <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded"><AlertCircle className="w-3 h-3 mr-1"/>需修改</span>}

                {/* 按鈕群組 */}
                {!isLocked && (
                    <>
                    <button onClick={onAddNode} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-bold rounded hover:bg-indigo-100 transition">
                        <Plus className="w-4 h-4" /> 新增
                    </button>
                    <button onClick={onSubmit} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded hover:bg-indigo-700 transition shadow-sm">
                        <Send className="w-4 h-4" /> {status === 'rejected' ? '重新提交' : '提交'}
                    </button>
                    </>
                )}
             </div>
          </Panel>

          {/* 退回評語顯示區 */}
          {status === 'rejected' && feedback && (
             <Panel position="bottom-center" className="mb-8">
                 <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl shadow-lg flex items-start gap-3 max-w-md animate-in slide-in-from-bottom-5">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm mb-1">老師的回饋：</h4>
                        <p className="text-sm leading-relaxed">{feedback}</p>
                    </div>
                 </div>
             </Panel>
          )}
        </ReactFlow>

        {/* Modal 保持不變 */}
        {isModalOpen && (
           <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
             <div className="bg-white p-6 rounded-xl shadow-2xl w-80 border border-slate-200">
               <h3 className="font-bold text-slate-800 mb-4">編輯論點</h3>
               <input
                 type="text"
                 value={editLabel}
                 onChange={(e) => setEditLabel(e.target.value)}
                 className="w-full p-2 border border-slate-300 rounded-lg mb-4 outline-none focus:border-indigo-500"
                 onKeyDown={(e) => e.key === 'Enter' && handleModalSave()}
               />
               <div className="flex justify-end gap-2">
                 <button onClick={() => setIsModalOpen(false)} className="px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 rounded">取消</button>
                 <button onClick={handleModalSave} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">確定</button>
               </div>
             </div>
           </div>
        )}
      </div>
    </>
  );
}

export default function LogicCanvas(props: LogicCanvasProps) {
  return (
    <div className="w-full h-[600px] border border-slate-200 rounded-xl overflow-hidden shadow-inner">
      <ReactFlowProvider>
        <LogicCanvasContent {...props} />
      </ReactFlowProvider>
    </div>
  );
}