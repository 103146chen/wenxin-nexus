'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { useUserStore } from "@/store/user-store";
import { SKILL_TREE } from "@/lib/data/skills";
import { Brain, Lock, CheckCircle, Zap, Eye, GitBranch, Hexagon, Key, Search } from "lucide-react";
import * as Icons from "lucide-react";

export default function SkillsPage() {
  const { sp, unlockedSkills, unlockSkill } = useUserStore();

  const handleUnlock = (id: string, cost: number, name: string) => {
    if (confirm(`確定要花費 ${cost} SP 解鎖【${name}】嗎？`)) {
      const success = unlockSkill(id, cost);
      if (success) {
        alert("解鎖成功！");
      } else {
        alert("技能點不足或前置技能未解鎖！");
      }
    }
  };

  // 動態取得 Icon 元件
  const getIcon = (iconName: string) => {
    // @ts-ignore
    const IconComponent = Icons[iconName] || Brain;
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-12">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold font-serif text-slate-900 mb-2">素養技能樹</h1>
            <p className="text-lg text-slate-600">運用你的學習成果，解鎖強大的輔助能力。</p>
          </div>
          <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
            <Brain className="w-6 h-6" />
            <div>
                <p className="text-xs opacity-80">剩餘技能點 (SP)</p>
                <p className="text-2xl font-bold">{sp}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* 簡單的視覺連線背景 (可選) */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 hidden md:block"></div>

          {SKILL_TREE.map((skill) => {
            const isUnlocked = unlockedSkills.includes(skill.id);
            const isParentUnlocked = !skill.parentId || unlockedSkills.includes(skill.parentId);
            const canUnlock = !isUnlocked && isParentUnlocked && sp >= skill.cost;

            return (
              <div 
                key={skill.id} 
                className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isUnlocked 
                        ? 'bg-white border-indigo-500 shadow-md' 
                        : canUnlock 
                            ? 'bg-white border-slate-300 hover:border-indigo-300 shadow-sm cursor-pointer' 
                            : 'bg-slate-100 border-slate-200 opacity-70 grayscale'
                }`}
                onClick={() => canUnlock && handleUnlock(skill.id, skill.cost, skill.name)}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white shadow-md ${
                    isUnlocked ? 'bg-indigo-500' : 'bg-slate-400'
                }`}>
                    {getIcon(skill.icon)}
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2">{skill.name}</h3>
                <p className="text-sm text-slate-500 text-center mb-4 min-h-[40px]">{skill.description}</p>

                <div className="mt-auto">
                    {isUnlocked ? (
                        <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
                            <CheckCircle className="w-4 h-4" /> 已習得
                        </span>
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            {skill.cooldown && <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-0.5 rounded">CD: {skill.cooldown}</span>}
                            <button 
                                disabled={!canUnlock}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 ${
                                    canUnlock 
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                        : 'bg-slate-200 text-slate-400'
                                }`}
                            >
                                {canUnlock ? '解鎖技能' : <Lock className="w-3 h-3" />}
                                <span className="ml-1">{skill.cost} SP</span>
                            </button>
                        </div>
                    )}
                </div>
                
                {/* 類型標籤 */}
                <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    {skill.type}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}