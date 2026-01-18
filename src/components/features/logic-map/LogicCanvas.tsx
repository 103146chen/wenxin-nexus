'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { Plus, Edit3, Save, X, Send, Lock } from 'lucide-react'; // 新增 Icon
import { GamificationEngine } from '@/lib/engines/GamificationEngine'; // 引入引擎
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  // 判斷是否鎖定 (審核中或已通過，都不能編輯)
  const isLocked = status === 'pending' || status === 'verified';

  // 1. 讀取存檔 (包含狀態)
  useEffect(() => {
    const savedData = localStorage.getItem(`logic-map-${lessonId}`);
    if (savedData) {
      const { nodes: savedNodes, edges: savedEdges, viewport, status: savedStatus } = JSON.parse(savedData);
      setNodes(savedNodes || []);
      setEdges(savedEdges || []);
      if (savedStatus) setStatus(savedStatus); // 讀取狀態
      if (viewport) setViewport(viewport);
    } else {
      setNodes(defaultNodes);
      setEdges([]);
    }
  }, [lessonId, setNodes, setEdges, setViewport]);

  // 2. 存檔功能 (草稿)
  const onSave = useCallback(() => {
    if (isLocked) return; // 鎖定狀態不能存檔

    const flowData = {
      nodes,
      edges,
      viewport: toObject().viewport,
      status: 'draft' // 強制設為草稿
    };
    localStorage.setItem(`logic-map-${lessonId}`, JSON.stringify(flowData));
    setStatus('draft');
    alert('✅ 邏輯圖草稿已儲存！');
  }, [nodes, edges, lessonId, toObject, isLocked]);

  // 🔥 3. 提交功能
  const onSubmit = useCallback(() => {
    if (nodes.length < 3) {
      alert('⚠️ 結構太簡單了！至少需要 3 個節點才能提交喔。');
      return;
    }

    // 1. 更新本地狀態
    const flowData = {
      nodes,
      edges,
      viewport: toObject().viewport,
      status: 'pending' // 設定為審核中
    };
    localStorage.setItem(`logic-map-${lessonId}`, JSON.stringify(flowData));
    setStatus('pending');

    // 2. 送入遊戲引擎
    GamificationEngine.submitAsset({
      id: `logic-${lessonId}`, // 簡單起見，每個課次只有一個邏輯圖
      type: 'logic-map',
      title: `邏輯圖：${lessonId} 結構分析`,
      // 邏輯圖的預覽比較複雜，我們先存摘要資訊，之後 Gallery 可以解析
      contentPreview: JSON.stringify({ nodeCount: nodes.length, edgeCount: edges.length }), 
      authorId: name,
      authorName: name
    });

    alert('🚀 已提交邏輯圖！(獲得 +10 XP)');
  }, [nodes, edges, lessonId, toObject, name]);


  // --- 互動邏輯 (受 isLocked 控制) ---
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
          onNodesChange={!isLocked ? onNodesChange : undefined} // 鎖定時禁止拖拉
          onEdgesChange={!isLocked ? onEdgesChange : undefined}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          nodesDraggable={!isLocked} // 🔥 關鍵：鎖定拖拉
          nodesConnectable={!isLocked}
          elementsSelectable={!isLocked}
          fitView
        >
          <Background color="#94a3b8" variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
          <MiniMap nodeColor="#e2e8f0" style={{ height: 100 }} />

          {/* 右上控制面板 */}
          <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-md border border-slate-100 flex gap-2 items-center">
              {/* 狀態指示燈 */}
              {status === 'pending' && <span className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded"><Lock className="w-3 h-3 mr-1"/>審核中</span>}
              {status === 'verified' && <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded"><Lock className="w-3 h-3 mr-1"/>已認證</span>}

              {/* 按鈕群組 (只有非鎖定狀態顯示編輯按鈕) */}
              {!isLocked && (
                <>
                  <button onClick={onAddNode} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-bold rounded hover:bg-indigo-100 transition">
                      <Plus className="w-4 h-4" /> 新增
                  </button>
                  <button onClick={onSave} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-bold rounded hover:bg-slate-200 transition">
                      <Save className="w-4 h-4" /> 草稿
                  </button>
                  <button onClick={onSubmit} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded hover:bg-indigo-700 transition shadow-sm">
                      <Send className="w-4 h-4" /> 提交
                  </button>
                </>
              )}
          </Panel>
        </ReactFlow>

        {/* Modal 程式碼 */}
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