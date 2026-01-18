import {
  TextNode,
  NodeKey,
  EditorConfig,
  SerializedTextNode,
  Spread,
} from 'lexical';

export type SerializedCommentaryNode = Spread<
  {
    commentId: string; // 每個註釋都有一個獨立 ID
  },
  SerializedTextNode
>;

export class CommentaryNode extends TextNode {
  __commentId: string;

  constructor(text: string, commentId: string, key?: NodeKey) {
    super(text, key);
    this.__commentId = commentId;
  }

  static getType(): string {
    return 'commentary';
  }

  static clone(node: CommentaryNode): CommentaryNode {
    return new CommentaryNode(node.__text, node.__commentId, node.__key);
  }

  // 1. 定義它在網頁上看起來的樣子 (DOM)
  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    // 加上樣式：紫色虛線底線、滑鼠變問號
    dom.className = 'border-b-2 border-indigo-400 border-dotted cursor-help hover:bg-indigo-50 transition-colors';
    dom.dataset.commentId = this.__commentId;
    return dom;
  }

  // 2. 當資料更新時，檢查是否需要更新畫面
  updateDOM(prevNode: CommentaryNode, dom: HTMLElement, config: EditorConfig): boolean {
    const isUpdated = super.updateDOM(prevNode, dom, config);
    if (prevNode.__commentId !== this.__commentId) {
      dom.dataset.commentId = this.__commentId;
      return true;
    }
    return isUpdated;
  }

  // 3. 序列化 (存檔用)
  exportJSON(): SerializedCommentaryNode {
    return {
      ...super.exportJSON(),
      commentId: this.__commentId,
      type: 'commentary',
      version: 1,
    };
  }

  // 4. 反序列化 (讀檔用)
  static importJSON(serializedNode: SerializedCommentaryNode): CommentaryNode {
    const node = $createCommentaryNode(
      serializedNode.text,
      serializedNode.commentId
    );
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }
}

// 5. 提供一個方便的函數來建立節點
export function $createCommentaryNode(text: string, commentId: string): CommentaryNode {
  return new CommentaryNode(text, commentId);
}

// 6. 判斷某個節點是不是註釋節點
export function $isCommentaryNode(node: TextNode | null | undefined): node is CommentaryNode {
  return node instanceof CommentaryNode;
}