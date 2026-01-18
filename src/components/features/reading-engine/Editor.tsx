'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
// ❌ 修正前：import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
// ✅ 修正後：改成具名匯出 (加花括號)
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import ToolbarPlugin from './ToolbarPlugin';
import CommentaryClickPlugin from './CommentaryClickPlugin';
import HighlighterPlugin from './HighlighterPlugin';
import { CommentaryNode } from './nodes/CommentaryNode';

import { getLessonById } from '@/lib/data/lessons';

interface EditorProps {
  lessonId: string;
}

const theme = {
  paragraph: 'mb-4 text-lg leading-loose text-slate-800 tracking-wide font-serif',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline decoration-indigo-300 decoration-2 underline-offset-4',
  },
};

function onError(error: Error) {
  console.error(error);
}

export default function ReadingEditor({ lessonId }: EditorProps) {
  const lesson = getLessonById(lessonId);
  const difficultWords = lesson?.difficultWords || [];

  const initialConfig = {
    namespace: 'WenxinEditor',
    theme,
    onError,
    nodes: [CommentaryNode],
    editable: true,
  };

  return (
    <div className="relative min-h-[500px] bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      <LexicalComposer initialConfig={initialConfig}>
        
        <ToolbarPlugin lessonId={lessonId} />
        
        <div className="relative p-8">
          <RichTextPlugin
            contentEditable={<ContentEditable className="outline-none min-h-[400px]" />}
            placeholder={<div className="absolute top-8 left-8 text-stone-300 pointer-events-none">正在載入古文篇章...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          
          <CommentaryClickPlugin />
          
          <HighlighterPlugin difficultWords={difficultWords} />
        </div>

      </LexicalComposer>
    </div>
  );
}