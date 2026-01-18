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
import { Plus, Edit3, Save, X } from 'lucide-react';

// 定義 Props，接收外部傳來的課程 ID
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

// 內部元件：主要畫布邏輯
function LogicCanvasContent({ lessonId }: LogicCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setViewport } = useReactFlow();

  // --- 狀態管理：Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  // --- 1. 讀取存檔 (當 lessonId 改變時) ---
  useEffect(() => {
    const savedData = localStorage.getItem(`logic-map-${lessonId}`);
    if (savedData) {
      const { nodes: savedNodes, edges: savedEdges, viewport } = JSON.parse(savedData);
      setNodes(savedNodes || []);
      setEdges(savedEdges || []);
      if (viewport) setViewport(viewport);
    } else {
      // 如果沒存檔，載入預設值
      setNodes(defaultNodes);
      setEdges([]);
    }
  }, [lessonId, setNodes, setEdges, setViewport]);

  // --- 2. 存檔功能 ---
  const onSave = useCallback(() => {
    // 這裡需要透過 ReactFlowInstance 取得 viewport，但為求簡化，我們存資料為主
    const flowData = {
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 } // 暫時簡化
    };
    localStorage.setItem(`logic-map-${lessonId}`, JSON.stringify(flowData));
    alert('✅ 邏輯圖已儲存！');
  }, [nodes, edges, lessonId]);

  // --- 3. 互動邏輯 ---
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onAddNode = useCallback(() => {
    const newNode = {
      id: Math.random().toString(36).substr(2, 5),
      position: { 
        x: Math.random() * 400 + 50, 
        y: Math.random() * 300 + 50 
      }, 
      data: { label: '新觀點' },
      style: { background: '#ffffff', border: '1px solid #cbd5e1' }
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  // 開啟編輯視窗
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setEditingNodeId(node.id);
    setEditLabel(node.data.label);
    setIsModalOpen(true);
  }, []);

  // 儲存編輯內容
  const handleModalSave = () => {
    if (editingNodeId) {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === editingNodeId) {
            return { ...n, data: { ...n.data, label: editLabel } };
          }
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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          fitView
        >
          <Background color="#94a3b8" variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
          <MiniMap nodeColor="#e2e8f0" style={{ height: 100 }} />

          {/* 右上控制面板 */}
          <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-md border border-slate-100 flex gap-2">
              <button 
                  onClick={onAddNode}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-bold rounded hover:bg-indigo-100 transition"
              >
                  <Plus className="w-4 h-4" />
                  新增
              </button>
              <button 
                  onClick={onSave}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-900 transition shadow-sm"
              >
                  <Save className="w-4 h-4" />
                  儲存進度
              </button>
          </Panel>
        </ReactFlow>

        {/* --- 自定義彈出視窗 (Modal) --- */}
        {isModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-80 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">編輯論點內容</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleModalSave()} // 按 Enter 直接儲存
              />
              
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  取消
                </button>
                <button 
                  onClick={handleModalSave}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition"
                >
                  確認修改
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// 外層包裝 Provider (ReactFlow 要求)
export default function LogicCanvas(props: LogicCanvasProps) {
  return (
    <div className="w-full h-[600px] border border-slate-200 rounded-xl overflow-hidden shadow-inner">
      <ReactFlowProvider>
        <LogicCanvasContent {...props} />
      </ReactFlowProvider>
    </div>
  );
}