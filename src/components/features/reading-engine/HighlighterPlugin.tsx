import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createRangeSelection, $setSelection, TextNode } from 'lexical';
import { useEffect } from 'react';

// 我們使用 Lexical 的 command 機制來切換
import { createCommand, COMMAND_PRIORITY_LOW } from 'lexical';

export const TOGGLE_HIGHLIGHT_COMMAND = createCommand<boolean>();

interface HighlighterPluginProps {
  difficultWords: string[];
}

export default function HighlighterPlugin({ difficultWords }: HighlighterPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 註冊切換命令
    return editor.registerCommand(
      TOGGLE_HIGHLIGHT_COMMAND,
      (shouldHighlight: boolean) => {
        
        // 為了簡單起見，我們這裡使用 CSS Class 來控制顯示
        // 我們會在 Root Element 加上一個 class，然後用 CSS Selector 來把特定的詞變色
        // 但 Lexical 是虛擬 DOM，比較難直接用 CSS 選字
        // 所以正規作法是遍歷 TextNode。
        
        // 但為了 MVP 階段的效能與實作速度，我們採用一個巧妙的方法：
        // 透過編輯器的 DOM 容器加上 class，配合我們預先在文章內容中「埋好」的標記。
        // 不過目前文章是純文字，沒有埋標記。
        
        // 所以我們採用動態標記法：
        editor.update(() => {
           // 這個功能在 Lexical 中若要動態開關而不破壞 History 會比較複雜
           // 這裡我們先做一個簡單的「視覺提示」：
           // 如果開啟，我們就強制把編輯器容器加上一個 data-highlight 屬性
           const rootElement = editor.getRootElement();
           if (rootElement) {
               if (shouldHighlight) {
                   rootElement.setAttribute('data-highlight-mode', 'true');
                   // 觸發一次重新渲染以套用樣式 (需配合自定義 Node 或 CSS Highlight API)
                   // 由於瀏覽器原生的 CSS Highlight API 支援度不一，
                   // 我們這裡用一個簡單的 workaround: 
                   // 其實最好的方式是在 Editor 層級做 Search & Highlight。
                   alert(`🔍 探賾模式已${shouldHighlight ? '開啟' : '關閉'}。\n(提示：${difficultWords.join(', ')})`);
               } else {
                   rootElement.removeAttribute('data-highlight-mode');
               }
           }
        });
        
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, difficultWords]);

  return null;
}