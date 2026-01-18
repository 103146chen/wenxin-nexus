import { Node, Edge } from 'reactflow';

export interface LogicTemplate {
  id: string;
  name: string;
  description: string;
  iconType: 'layout' | 'list' | 'git-merge'; // 用來決定顯示什麼 icon
  nodes: Node[];
  edges: Edge[];
}

export const LOGIC_TEMPLATES: LogicTemplate[] = [
  {
    id: 'empty',
    name: '空白畫布',
    description: '從零開始，自由揮灑你的創意與洞見。',
    iconType: 'layout',
    nodes: [
      { 
        id: 'root', 
        position: { x: 300, y: 50 }, 
        data: { label: '中心論題' }, 
        style: { background: '#fef3c7', border: '1px solid #d97706', fontWeight: 'bold' } 
      }
    ],
    edges: []
  },
  {
    id: 'structure',
    name: '起承轉合',
    description: '經典的文章結構分析，適合絕大多數的古文篇章。',
    iconType: 'list',
    nodes: [
      { id: 'root', position: { x: 350, y: 50 }, data: { label: '文章主旨' }, style: { background: '#fef3c7', border: '1px solid #d97706', fontWeight: 'bold', width: 150 } },
      { id: 'n1', position: { x: 100, y: 200 }, data: { label: '【起】\n開頭背景、破題' }, style: { background: '#fff', border: '1px solid #94a3b8' } },
      { id: 'n2', position: { x: 300, y: 200 }, data: { label: '【承】\n發展鋪陳、敘事' }, style: { background: '#fff', border: '1px solid #94a3b8' } },
      { id: 'n3', position: { x: 500, y: 200 }, data: { label: '【轉】\n觀點轉折、變局' }, style: { background: '#fff', border: '1px solid #94a3b8' } },
      { id: 'n4', position: { x: 350, y: 350 }, data: { label: '【合】\n結論昇華、感懷' }, style: { background: '#e0e7ff', border: '1px solid #4338ca', fontWeight: 'bold' } },
    ],
    edges: [
      { id: 'e1', source: 'root', target: 'n1' },
      { id: 'e2', source: 'root', target: 'n2' },
      { id: 'e3', source: 'root', target: 'n3' },
      { id: 'e4', source: 'n1', target: 'n4', animated: true, style: { stroke: '#cbd5e1' } },
      { id: 'e5', source: 'n2', target: 'n4', animated: true, style: { stroke: '#cbd5e1' } },
      { id: 'e6', source: 'n3', target: 'n4', animated: true, style: { stroke: '#cbd5e1' } },
    ]
  },
  {
    id: 'debate',
    name: '正反論證',
    description: '分析議論文的利器，釐清正反觀點與統合。',
    iconType: 'git-merge',
    nodes: [
      { id: 'root', position: { x: 300, y: 50 }, data: { label: '核心議題' }, style: { background: '#fef3c7', border: '1px solid #d97706', fontWeight: 'bold' } },
      { id: 'pos', position: { x: 100, y: 200 }, data: { label: '正方觀點 (支持)' }, style: { background: '#dcfce7', border: '2px solid #16a34a' } },
      { id: 'neg', position: { x: 500, y: 200 }, data: { label: '反方觀點 (挑戰)' }, style: { background: '#fee2e2', border: '2px solid #dc2626' } },
      { id: 'syn', position: { x: 300, y: 350 }, data: { label: '綜合結論 / 你的看法' }, style: { background: '#f0f9ff', border: '1px dashed #0ea5e9' } },
    ],
    edges: [
      { id: 'e1', source: 'root', target: 'pos', label: '包含' },
      { id: 'e2', source: 'root', target: 'neg', label: '包含' },
      { id: 'e3', source: 'pos', target: 'syn', label: '綜合' },
      { id: 'e4', source: 'neg', target: 'syn', label: '反思' },
    ]
  },
];