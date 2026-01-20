export interface DailyQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string; // 錯誤時的引導
}

export interface DailyArticle {
  id: string;
  title: string;
  author: string;
  content: string;
  questions: DailyQuestion[];
}

export const DAILY_ARTICLES: DailyArticle[] = [
  {
    id: 'daily-1',
    title: '愛蓮說',
    author: '宋 ‧ 周敦頤',
    content: `水陸草木之花，可愛者甚蕃。晉陶淵明獨愛菊。自李唐來，世人甚愛牡丹。予獨愛蓮之出淤泥而不染，濯清漣而不妖，中通外直，不蔓不枝，香遠益清，亭亭淨植，可遠觀而不可褻玩焉。

予謂：菊，花之隱逸者也；牡丹，花之富貴者也；蓮，花之君子者也。噫！菊之愛，陶後鮮有聞；蓮之愛，同予者何人？牡丹之愛，宜乎眾矣！`,
    questions: [
      {
        id: 'dq-1',
        question: '「出淤泥而不染」象徵君子的何種特質？',
        options: ['潔身自愛，不隨波逐流', '出身貧寒，卻能致富', '喜歡在泥濘中生長', '態度傲慢，不與人來往'],
        correctIndex: 0,
        hint: '淤泥象徵汙濁的環境，君子雖處其中卻不被汙染。'
      },
      {
        id: 'dq-2',
        question: '文中以「牡丹」來比喻哪一類人？',
        options: ['隱居的高士', '追求富貴名利之人', '道德高尚的君子', '喜愛園藝的農夫'],
        correctIndex: 1,
        hint: '文中提到「牡丹，花之富貴者也」，想想世人都追求什麼？'
      },
      {
        id: 'dq-3',
        question: '「香遠益清」是用來形容君子的哪方面？',
        options: ['外表整潔', '名聲遠播', '身體健康', '學識淵博'],
        correctIndex: 1,
        hint: '香氣傳得越遠越清幽，如同君子的美德與名聲會自然傳播。'
      },
      {
        id: 'dq-4',
        question: '「菊之愛，陶後鮮有聞」表達了作者什麼樣的感嘆？',
        options: ['菊花太貴買不起', '沒人懂得種植菊花', '像陶淵明那樣隱逸高潔的人很少了', '陶淵明之後菊花就絕種了'],
        correctIndex: 2,
        hint: '這裡的「鮮」是少的意思，作者在感嘆世風日下。'
      },
      {
        id: 'dq-5',
        question: '這篇文章主要運用了哪種寫作手法？',
        options: ['開門見山法', '託物言志', '虛實交錯', '先抑後揚'],
        correctIndex: 1,
        hint: '作者藉由描寫蓮花的特質，來表達自己嚮往的君子志向。'
      }
    ]
  },
  {
    id: 'daily-2',
    title: '座右銘',
    author: '漢 ‧ 崔瑗',
    content: `無道人之短，無說己之長。施人慎勿念，受施慎勿忘。世譽不足慕，唯仁為紀綱。隱心而後動，謗議庸何傷？無使名過實，守愚聖所臧。在涅貴不淄，曖曖內含光。柔弱生之徒，老氏戒剛強。行行鄙夫志，悠悠故難量。慎言節飲食，知足勝不祥。行之苟有恆，久久自芬芳。`,
    questions: [
      {
        id: 'dq-2-1',
        question: '「無道人之短，無說己之長」的意思為何？',
        options: ['不要走路太短，不要說話太長', '不要說別人的缺點，不要誇耀自己的優點', '這條路很短，那條路很長', '別人的短處就是自己的長處'],
        correctIndex: 1,
        hint: '道在這裡是「說」的意思。這句話在勸人修口德與謙虛。'
      },
      {
        id: 'dq-2-2',
        question: '「隱心而後動」強調做事前應該如何？',
        options: ['先隱藏起來', '先問別人的意見', '先捫心自問是否合乎良知', '先確認有沒有利益'],
        correctIndex: 2,
        hint: '隱心是指審視自己的內心。'
      },
      {
        id: 'dq-2-3',
        question: '「在涅貴不淄」的比喻意義與下列何者最接近？',
        options: ['近朱者赤，近墨者黑', '出淤泥而不染', '三人行必有我師', '己所不欲，勿施於人'],
        correctIndex: 1,
        hint: '涅是黑泥，淄是染黑。處在黑泥中卻不被染黑，與愛蓮說的哪一句相似？'
      },
      {
        id: 'dq-2-4',
        question: '文中提到「老氏戒剛強」，「老氏」指的是誰？',
        options: ['老師', '孔子', '老子', '孟子'],
        correctIndex: 2,
        hint: '提倡「柔弱勝剛強」哲學的是道家創始人。'
      },
      {
        id: 'dq-2-5',
        question: '整篇《座右銘》的核心精神是什麼？',
        options: ['追求功名利祿', '及時行樂', '嚴以律己，寬以待人，修身養性', '學習辯論技巧'],
        correctIndex: 2,
        hint: '這是一篇用來自我警惕的文章，內容多關於修養品德。'
      }
    ]
  }
];