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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Send, Cloud, Loader2, Clock, CheckCircle, AlertCircle, Hexagon, Circle, RotateCcw } from 'lucide-react'; 
import { GamificationEngine } from '@/lib/engines/GamificationEngine';
import { useUserStore } from '@/store/user-store';
import { AssetStatus } from '@/lib/types/gamification';
import TemplateSelector from './TemplateSelector';
import { LogicTemplate } from '@/lib/data/logic-templates';
import { toPng } from 'html-to-image';

interface LogicCanvasProps {
  lessonId: string;
}

function LogicCanvasContent({ lessonId }: LogicCanvasProps) {
  const { name, unlockedSkills } = useUserStore(); 
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setViewport, toObject, fitView, getViewport } = useReactFlow();

  const [status, setStatus] = useState<AssetStatus>('draft');
  const [feedback, setFeedback] = useState<string | undefined>(undefined);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const hasLoaded = useRef(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const isLocked = status === 'pending' || status === 'verified';
  const assetId = `logic-${lessonId}`;
  const STORAGE_KEY = `logic-map-${lessonId}`;
  const SNAPSHOT_KEY = `logic-map-img-${lessonId}`;

  const hasAdvancedLogic = unlockedSkills.includes('logic-2');

  // 🔥 修復後的截圖函式
  const captureAndSave = useCallback(async () => {
    // 1. 取得畫布容器 (.react-flow)
    // 這裡我們抓取包含節點的視口部分，避免抓到外層的 padding
    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    const originalViewport = getViewport();

    try {
      // 2. 自動聚焦 (Fit View)
      // 使用更寬鬆的 padding 確保邊緣不會被切掉
      fitView({ padding: 0.5, duration: 0 }); 

      // 等待 React Flow 更新 DOM (增加延遲以確保 SVG markers 渲染完成)
      await new Promise(resolve => setTimeout(resolve, 100));

      // 3. 截圖
      // 🔥 修正重點：移除 width/height/style 的強制設定
      // 讓它抓取當前容器的自然大小，避免 SVG 座標錯亂
      const dataUrl = await toPng(flowElement, {
        backgroundColor: '#ffffff',
        // 提升解析度 (2倍)，這樣即使容器較小，圖片依然清晰
        pixelRatio: 2, 
        // 過濾掉 UI 控制項
        filter: (node) => {
            const classList = node.classList;
            if (!classList) return true;
            return !classList.contains('react-flow__controls') && 
                   !classList.contains('react-flow__panel') && 
                   !classList.contains('react-flow__minimap');
        }
      });

      localStorage.setItem(SNAPSHOT_KEY, dataUrl);
      console.log('邏輯圖快照已儲存 (Auto)');

    } catch (err) {
      console.error('截圖失敗', err);
    } finally {
      // 4. 恢復使用者原本的視角
      setViewport(originalViewport);
    }
  }, [SNAPSHOT_KEY, fitView, getViewport, setViewport]);

  // 初始化
  useEffect(() => {
    let localData: any = null;
    const savedString = localStorage.getItem(STORAGE_KEY);
    if (savedString) localData = JSON.parse(savedString);

    const myAssets = GamificationEngine.getMyAssets(name);
    const remoteAsset = myAssets.find(a => a.id === assetId);

    let finalNodes = [];
    let finalEdges = [];
    let finalStatus: AssetStatus = 'draft';
    let finalFeedback = undefined;
    let finalViewport = { x: 0, y: 0, zoom: 1 };
    
    let hasData = false;

    if (remoteAsset) {
        finalStatus = remoteAsset.status;
        finalFeedback = remoteAsset.feedback;
        if (!localData && remoteAsset.contentPreview) {
            try {
                const restoredData = JSON.parse(remoteAsset.contentPreview);
                if (restoredData.nodes) {
                    finalNodes = restoredData.nodes;
                    finalEdges = restoredData.edges || [];
                    finalViewport = restoredData.viewport || finalViewport;
                    hasData = true;
                }
            } catch (e) {}
        } else if (localData) {
            finalNodes = localData.nodes || [];
            finalEdges = localData.edges || [];
            finalViewport = localData.viewport || finalViewport;
            hasData = true;
        }
    } else if (localData) {
        finalNodes = localData.nodes || [];
        finalEdges = localData.edges || [];
        finalStatus = localData.status || 'draft';
        finalViewport = localData.viewport || finalViewport;
        hasData = true;
    }

    setNodes(finalNodes);
    setEdges(finalEdges);
    setStatus(finalStatus);
    setFeedback(finalFeedback);
    if (finalViewport) setViewport(finalViewport);
    
    if (!hasData) {
        setShowTemplateSelector(true);
    }
    
    setTimeout(() => { hasLoaded.current = true; }, 500);
  }, [lessonId, name, setNodes, setEdges, setViewport, assetId, STORAGE_KEY]);

  // 自動存檔 + 截圖
  useEffect(() => {
    if (!hasLoaded.current || isLocked || showTemplateSelector) return;
    setSaveStatus('saving');
    
    // 延長 debounce 時間，避免頻繁截圖造成卡頓
    const timer = setTimeout(() => {
      const flowData = {
        nodes,
        edges,
        viewport: toObject().viewport,
        status: status === 'rejected' ? 'rejected' : 'draft',
        feedback
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flowData));
      
      captureAndSave(); 

      setSaveStatus('saved');
    }, 2000); 
    return () => clearTimeout(timer);
  }, [nodes, edges, status, feedback, isLocked, toObject, STORAGE_KEY, showTemplateSelector, captureAndSave]);

  // 提交
  const onSubmit = useCallback(async () => {
    if (nodes.length < 3) {
      alert('⚠️ 結構太簡單了！至少需要 3 個節點才能提交喔。');
      return;
    }
    
    // 提交前強制截圖一次，並等待完成
    await captureAndSave();

    const fullData = { nodes, edges, viewport: toObject().viewport };
    const localPayload = { ...fullData, status: 'pending', feedback: undefined };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localPayload));
    setStatus('pending');
    setFeedback(undefined);

    GamificationEngine.submitAsset({
      id: assetId,
      type: 'logic-map',
      title: `邏輯圖：${lessonId} 結構分析`,
      contentPreview: JSON.stringify(fullData),
      authorId: name,
      authorName: name
    });

    alert('🚀 已提交邏輯圖！(獲得 +10 XP)');
  }, [nodes, edges, lessonId, toObject, name, assetId, STORAGE_KEY, captureAndSave]);

  const handleTemplateSelect = (template: LogicTemplate) => {
      setNodes(template.nodes);
      setEdges(template.edges);
      setShowTemplateSelector(false);
      setViewport({ x: 0, y: 0, zoom: 1 });
  };

  const handleReset = () => {
      if(confirm('確定要清空畫布並重新選擇模板嗎？\n這將會刪除目前的進度！')) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(SNAPSHOT_KEY); 
          setShowTemplateSelector(true);
      }
  };

  const onConnect = useCallback(
    (params: Connection | Edge) => !isLocked && setEdges((eds) => addEdge(params, eds)),
    [setEdges, isLocked]
  );

  const onAddNode = useCallback((type: 'default' | 'rebuttal' | 'evidence' = 'default') => {
    if (isLocked) return;
    let style = { background: '#ffffff', border: '1px solid #cbd5e1' };
    let label = '新觀點';
    if (type === 'rebuttal') {
        // @ts-ignore
        style = { background: '#fee2e2', border: '2px solid #ef4444', borderRadius: '4px' };
        label = '反駁/轉折';
    } else if (type === 'evidence') {
        // @ts-ignore
        style = { background: '#dcfce7', border: '2px solid #22c55e', borderRadius: '50%', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
        label = '佐證';
    }
    const newNode = {
      id: Math.random().toString(36).substr(2, 5),
      position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 }, 
      data: { label },
      style
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
        {showTemplateSelector && <TemplateSelector onSelect={handleTemplateSelect} />}

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

          <Panel position="top-right" className="flex flex-col gap-2 items-end">
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

             <div className="bg-white p-2 rounded-lg shadow-md border border-slate-100 flex gap-2 items-center">
                {status === 'pending' && <span className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded"><Clock className="w-3 h-3 mr-1"/>審核中</span>}
                {status === 'verified' && <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded"><CheckCircle className="w-3 h-3 mr-1"/>已認證</span>}
                {status === 'rejected' && <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded"><AlertCircle className="w-3 h-3 mr-1"/>需修改</span>}

                {!isLocked && (
                    <>
                    <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                        <button onClick={() => onAddNode('default')} className="flex items-center gap-1 px-3 py-1.5 bg-white text-slate-700 text-sm font-bold rounded shadow-sm hover:text-indigo-600 transition" title="一般觀點">
                            <Plus className="w-4 h-4" /> 觀點
                        </button>
                        {hasAdvancedLogic && (
                            <>
                                <button onClick={() => onAddNode('rebuttal')} className="flex items-center gap-1 px-3 py-1.5 hover:bg-white text-red-500 text-sm font-bold rounded transition" title="反駁/轉折">
                                    <Hexagon className="w-4 h-4" />
                                </button>
                                <button onClick={() => onAddNode('evidence')} className="flex items-center gap-1 px-3 py-1.5 hover:bg-white text-green-600 text-sm font-bold rounded transition" title="佐證資料">
                                    <Circle className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <button onClick={handleReset} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition" title="重新選擇模板">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button onClick={onSubmit} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded hover:bg-indigo-700 transition shadow-sm">
                        <Send className="w-4 h-4" /> {status === 'rejected' ? '重新提交' : '提交'}
                    </button>
                    </>
                )}
             </div>
          </Panel>

          {status === 'rejected' && feedback && (
             <Panel position="bottom-center" className="mb-8">
                 <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl shadow-lg flex items-start gap-3 max-w-md">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm mb-1">老師的回饋：</h4>
                        <p className="text-sm leading-relaxed">{feedback}</p>
                    </div>
                 </div>
             </Panel>
          )}
        </ReactFlow>

        {isModalOpen && (
           <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
             <div className="bg-white p-6 rounded-xl shadow-2xl w-80 border border-slate-200">
               <h3 className="font-bold text-slate-800 mb-4">編輯論點</h3>
               <input type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg mb-4 outline-none focus:border-indigo-500" onKeyDown={(e) => e.key === 'Enter' && handleModalSave()} />
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