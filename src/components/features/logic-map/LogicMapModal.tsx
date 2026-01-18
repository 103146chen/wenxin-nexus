'use client';

import { X, GitGraph } from 'lucide-react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  BackgroundVariant 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEffect } from 'react';

interface LogicMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  dataString: string; // 這是存好的 JSON 字串
}

function LogicMapModalContent({ isOpen, onClose, title, dataString }: LogicMapModalProps) {
  // 使用 React Flow 的 Hook 來管理唯讀狀態
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (isOpen && dataString) {
      try {
        const parsed = JSON.parse(dataString);
        if (parsed.nodes) setNodes(parsed.nodes);
        if (parsed.edges) setEdges(parsed.edges);
        // 如果有存 viewport，也可以在這裡 setViewport (需使用 useReactFlow)
      } catch (e) {
        console.error("無法解析邏輯圖資料", e);
      }
    }
  }, [isOpen, dataString, setNodes, setEdges]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-[90vw] h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* 標題列 */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <GitGraph className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                <p className="text-xs text-slate-500">唯讀預覽模式</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 畫布區域 */}
        <div className="flex-1 bg-slate-50 relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                // 鎖定所有互動，變成純展示
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                fitView
            >
                <Background color="#94a3b8" variant={BackgroundVariant.Dots} gap={20} size={1} />
                <Controls showInteractive={false} />
                <MiniMap nodeColor="#e2e8f0" />
            </ReactFlow>
        </div>
      </div>
    </div>
  );
}

// 外層包裝 Provider
export default function LogicMapModal(props: LogicMapModalProps) {
  if (!props.isOpen) return null;
  return (
    <ReactFlowProvider>
      <LogicMapModalContent {...props} />
    </ReactFlowProvider>
  );
}