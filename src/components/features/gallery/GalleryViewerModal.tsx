'use client';

import { useMemo } from 'react';
import { X } from 'lucide-react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { StudentAsset } from '@/lib/types/gamification';

interface GalleryViewerModalProps {
  asset: StudentAsset | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GalleryViewerModal({ asset, isOpen, onClose }: GalleryViewerModalProps) {
  const flowData = useMemo(() => {
      if (!asset) return null;
      try {
          return JSON.parse(asset.contentPreview);
      } catch(e) { return null; }
  }, [asset]);

  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                {asset.authorName[0]}
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-sm">{asset.title}</h3>
                <p className="text-[10px] text-slate-500">作者：{asset.authorName}</p>
            </div>
        </div>

        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm border border-slate-200 transition text-slate-500 hover:text-slate-800"
        >
            <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex-1 bg-slate-50">
            {flowData && flowData.nodes ? (
                <ReactFlow
                    defaultNodes={flowData.nodes}
                    defaultEdges={flowData.edges}
                    defaultViewport={flowData.viewport}
                    fitView
                    attributionPosition="bottom-right"
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={true}
                >
                    <Background color="#94a3b8" gap={20} size={1} />
                    <Controls showInteractive={false} />
                    <MiniMap />
                </ReactFlow>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                    無法讀取作品內容
                </div>
            )}
        </div>

      </div>
    </div>
  );
}