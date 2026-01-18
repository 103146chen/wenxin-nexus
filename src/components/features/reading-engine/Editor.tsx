'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $getSelection, $isRangeSelection } from 'lexical';

import { CommentaryNode, $createCommentaryNode } from './nodes/CommentaryNode';
import CommentaryClickPlugin from './CommentaryClickPlugin';
import ToolbarPlugin from './ToolbarPlugin';

// 1. 定義編輯器的主題 (Theme)
const theme = {
  paragraph: 'mb-4 text-lg leading-relaxed tracking-wide text-slate-800',
  text: {
    bold: 'font-bold text-slate-900',
    italic: 'italic',
    underline: 'underline decoration-slate-400 decoration-wavy',
  },
};

function onError(error: Error) {
  console.error(error);
}

interface EditorProps {
  lessonId: string;
}

export default function ReadingEditor({ lessonId }: EditorProps) {
  const initialConfig = {
    namespace: 'WenxinReader',
    theme,
    onError,
    nodes: [CommentaryNode],
    editable: true,
  };

  return (
    <div className="relative min-h-[600px] w-full max-w-4xl mx-auto bg-white shadow-sm border border-stone-200 rounded-lg overflow-hidden flex flex-col">
      <LexicalComposer initialConfig={initialConfig}>
        
        {/* 上方工具列 (裝飾用) */}
        <div className="bg-stone-50 border-b border-stone-200 p-3 flex items-center space-x-4 text-sm text-stone-500">
            <div className="flex space-x-1">
                <span className="w-3 h-3 rounded-full bg-red-400/50"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400/50"></span>
                <span className="w-3 h-3 rounded-full bg-green-400/50"></span>
            </div>
            <span>文心閱讀器 v1.0</span>
        </div>

        {/* 新增註釋功能 */}
        <ToolbarPlugin lessonId={lessonId} />
        <CommentaryClickPlugin />

        {/* 編輯區域 */}
        <div className="relative flex-1 p-8 bg-white cursor-text">
          <RichTextPlugin
            contentEditable={
                <ContentEditable className="outline-none min-h-[500px] font-serif" />
            }
            placeholder={
                <div className="absolute top-8 left-8 text-slate-300 pointer-events-none font-serif select-none text-lg">
                    請在此輸入古文，或等待系統載入...
                </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
        </div>
      </LexicalComposer>
    </div>
  );
}