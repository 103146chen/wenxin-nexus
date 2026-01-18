import { LucideIcon } from "lucide-react";

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active';
  cost: number; // 消耗 SP
  cooldown?: string; // 例如 "24h"
  icon: string; // Lucide icon name string
  parentId?: string; // 前置技能 ID
}

export const SKILL_TREE: Skill[] = [
  // --- 博聞系 (Reading) ---
  {
    id: 'read-1',
    name: '明眸',
    description: '閱讀古文時，獲得的 XP 提升 10%。',
    type: 'passive',
    cost: 1,
    icon: 'Eye'
  },
  {
    id: 'read-2',
    name: '探賾',
    description: '開啟「生難字詞」高亮模式，快速掌握文章重點。',
    type: 'active',
    cost: 2,
    parentId: 'read-1',
    icon: 'Search'
  },
  
  // --- 審問系 (Logic) ---
  {
    id: 'logic-1',
    name: '條理',
    description: '提交邏輯圖獲得的基礎獎勵增加 20 XP。',
    type: 'passive',
    cost: 1,
    icon: 'GitBranch'
  },
  {
    id: 'logic-2',
    name: '縱橫',
    description: '解鎖邏輯圖特殊節點：【反駁】(六邊形) 與 【佐證】(圓形)。',
    type: 'active',
    cost: 3,
    parentId: 'logic-1',
    icon: 'Hexagon'
  },
  {
    id: 'logic-3',
    name: '精闢',
    description: '當邏輯圖被老師評為「優選」時，獲得雙倍獎勵。',
    type: 'passive',
    cost: 5,
    parentId: 'logic-2',
    icon: 'Award'
  },

  // --- 慎思系 (Quiz) ---
  {
    id: 'quiz-1',
    name: '靈光',
    description: '【測驗專用】刪去一個錯誤選項 (CD: 12hr)。',
    type: 'active',
    cost: 2,
    cooldown: '12h',
    icon: 'Zap'
  },
  {
    id: 'quiz-2',
    name: '時之砂',
    description: '【測驗專用】延長作答時間 30 秒 (CD: 24hr)。',
    type: 'active',
    cost: 3,
    parentId: 'quiz-1',
    cooldown: '24h',
    icon: 'Hourglass'
  },
  {
    id: 'quiz-3',
    name: '天機',
    description: '【測驗專用】查看當前題目的詳解提示 (CD: 48hr)。',
    type: 'active',
    cost: 4,
    cooldown: '48h',
    parentId: 'quiz-2',
    icon: 'Key'
  }
];