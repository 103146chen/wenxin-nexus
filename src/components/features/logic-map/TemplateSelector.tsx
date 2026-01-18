'use client';

import { LOGIC_TEMPLATES, LogicTemplate } from "@/lib/data/logic-templates";
import { Layout, List, GitMerge, Check } from "lucide-react";

interface TemplateSelectorProps {
  onSelect: (template: LogicTemplate) => void;
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'layout': return <Layout className="w-8 h-8" />;
      case 'list': return <List className="w-8 h-8" />;
      case 'git-merge': return <GitMerge className="w-8 h-8" />;
      default: return <Layout className="w-8 h-8" />;
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">選擇邏輯圖模板</h2>
          <p className="text-slate-500">好的結構是思考的第一步。請選擇一個適合這篇文章的分析架構。</p>
        </div>
        
        <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50">
          {LOGIC_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="group relative flex flex-col items-center text-center p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 flex items-center justify-center mb-4 transition-colors">
                {getIcon(template.iconType)}
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-700">
                {template.name}
              </h3>
              
              <p className="text-sm text-slate-500 leading-relaxed">
                {template.description}
              </p>

              <div className="mt-6 px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center gap-2">
                <Check className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                使用此模板
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}