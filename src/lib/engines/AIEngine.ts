export const AIEngine = {
    // 核心對話函式，接收 systemPrompt 與 (選填的) lessonId
    chat: async (message: string, systemPrompt: string, lessonId?: string): Promise<string> => {
        
        // --- 模擬 API 呼叫 (Development Mode) ---
        // 當您準備好接 Gemini 時，會在這裡替換成真實的 fetch 程式碼
        // 屆時 systemPrompt 將被放入 API 的 messages[0].content (作為 system 或 developer instruction)
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // 這裡為了 Demo 效果，我們仍保留一點「寫死」的 Mock 邏輯，讓內建課程看起來很聰明
                const response = mockResponseGenerator(message, lessonId);
                resolve(response);
            }, 1500); // 模擬網路延遲，增加真實感
        });
    }
};

// --- 簡單的規則式回應 (Mock) ---
// 這讓您在沒有 API Key 的情況下也能展示「角色扮演」的效果
// 如果有真實 API，這個函式就不需要了，直接由 LLM 根據 systemPrompt 生成
function mockResponseGenerator(userMsg: string, lessonId?: string): string {
    const msg = userMsg.toLowerCase();
    
    // 保留內建課程的 Mock「彩蛋」，讓 Demo 比較生動
    if (lessonId === 'lesson-1') { // 蘇軾
        if (msg.includes('心情') || msg.includes('難過')) return "客亦知夫水與月乎？逝者如斯，而未嘗往也。人生短暫，何必糾結於一時的得失呢？來，與吾共以此酒，敬江上之清風！";
        if (msg.includes('赤壁') || msg.includes('風景')) return "清風徐來，水波不興。此間景色甚好，彷彿遺世獨立，羽化而登仙。小友不妨閉目想像一番。";
        if (msg.includes('手機') || msg.includes('網路')) return "手...機？此乃何種機關？吾平生所見機巧之物甚多，卻未聞此名。莫非是西洋傳來之奇物？";
    }
    
    if (lessonId === 'lesson-2') { // 韓愈
        if (msg.includes('老師') || msg.includes('學習')) return "古之學者必有師。師者，所以傳道、受業、解惑也。今之眾人，恥學於師，此乃吾所憂也。";
        if (msg.includes('笨') || msg.includes('聰明')) return "聖人之所以為聖，愚人之所以為愚，其皆出於此乎？愛其子，擇師而教之；於其身也，則恥師焉，惑矣！";
    }

    // 通用回應：如果沒有命中彩蛋 (或老師自訂課程)，給出一個通用的回應
    // 在真實 AI 中，這裡會根據 System Prompt 產生回應
    return "（撫鬚）善哉，善哉。小友所言甚是，然則其中深意，尚需細細品味。（此為模擬回應，串接真實 API 後，我將依照您的「AI 角色設定」進行回答）";
}