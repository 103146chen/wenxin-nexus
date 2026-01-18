// 定義各種題型介面

export type QuestionType = 'single' | 'multiple' | 'short' | 'group';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  explanation: string;
  guidance: string;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single';
  options: string[];
  correctIndex: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple';
  options: string[];
  correctIndices: number[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short';
  referenceAnswer?: string;
}

export interface GroupQuestion extends BaseQuestion {
  type: 'group';
  groupContent: string;
  subQuestions: (SingleChoiceQuestion | MultipleChoiceQuestion)[];
}

export type QuizQuestion = SingleChoiceQuestion | MultipleChoiceQuestion | ShortAnswerQuestion | GroupQuestion;

export interface Lesson {
  id: string;
  title: string;
  author: string;
  description: string;
  colorTheme: string;
  difficultWords: string[];
  quizzes: QuizQuestion[];
}

export const ALL_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    title: '赤壁賦',
    author: '宋 ‧ 蘇軾',
    description: '壬戌之秋，七月既望，蘇子與客泛舟遊於赤壁之下...',
    colorTheme: 'orange',
    difficultWords: ['既望', '馮虛御風', '嫠婦', '愀然', '蜉蝣', '無盡藏'],
    quizzes: [
      {
        id: 'q1-1',
        type: 'single',
        question: '「縱一葦之所如，凌萬頃之茫然」句中，「一葦」運用了何種修辭手法？',
        options: ['譬喻', '轉化', '借代', '誇飾'],
        correctIndex: 2,
        explanation: '「一葦」原指蘆葦，這裡借代為小船。',
        guidance: '請思考「一葦」原本是指什麼植物？在這裡它代替了什麼交通工具？'
      },
      {
        id: 'q1-2',
        type: 'multiple',
        question: '關於《赤壁賦》中的哲理，下列敘述哪些正確？ (多選)',
        options: [
          '蘇軾認為人生短暫，應及時行樂，不必在意身後名',
          '客因見流水逝去、月亮盈虛，而感嘆生命無常',
          '蘇軾以「變」與「不變」的觀點，化解客的悲傷',
          '文中運用主客問答，實為蘇軾內心自我對話的過程'
        ],
        correctIndices: [1, 2, 3],
        explanation: '蘇軾並非主張及時行樂的虛無主義，而是強調從變與不變中找到安身立命之處。',
        guidance: '回想一下，蘇軾最後是如何安慰客人的？他對於「水」和「月」有什麼獨特的看法？'
      },
      {
        id: 'q1-3',
        type: 'short',
        question: '請簡述《赤壁賦》中「風」與「月」在全文結構與情景營造上的作用。',
        explanation: '風月是貫穿全文的線索，既是寫景的對象，也是議論的媒介。',
        guidance: '試著從文章開頭的「清風徐來」、中間的「客吹洞簫」、到最後的「杯盤狼藉」中，找出風月的存在。',
        referenceAnswer: '風月作為景色貫穿全文（清風徐來、月出東山），營造寧靜氛圍；同時也是哲理思考的載體（耳得之而為聲，目遇之而成色）。'
      },
      // 🔥 4. 題組 (已擴充子題)
      {
        id: 'q1-group',
        type: 'group',
        question: '閱讀下文，回答問題',
        explanation: '詳解見各子題。',
        guidance: '請先閱讀引文，注意作者對於「樂」的看法。',
        groupContent: '於是飲酒樂甚，扣舷而歌之。歌曰：「桂棹兮蘭槳，擊空明兮溯流光。渺渺兮予懷，望美人兮天一方。」客有吹洞簫者，倚歌而和之。',
        subQuestions: [
          {
            id: 'q1-g-1',
            type: 'single',
            question: '這段文字描寫的情感轉折為何？',
            options: ['由悲轉樂', '由樂轉悲', '始終悲涼', '始終歡樂'],
            correctIndex: 1,
            explanation: '起初「飲酒樂甚」，後因客吹洞簫之聲悲涼，導致「蘇子愀然」。',
            guidance: '注意「飲酒樂甚」之後接了什麼動作？客人的簫聲聽起來如何？'
          },
          // 🔥 新增第二小題
          {
            id: 'q1-g-2',
            type: 'single',
            question: '「望美人兮天一方」一句，反映了作者何種心境？',
            options: ['思念遠方的情人', '渴望歸隱山林', '忠君愛國卻遭貶謫', '感嘆時光飛逝'],
            correctIndex: 2,
            explanation: '「美人」在此比喻君王，表達作者雖在貶謫之中，仍心懷君國的幽微情思。',
            guidance: '在古文中，臣子常以什麼詞彙來借指君王？結合蘇軾當時被貶黃州的背景思考。'
          }
        ]
      }
    ]
  },
  {
    id: 'lesson-2',
    title: '師說',
    author: '唐 ‧ 韓愈',
    description: '古之學者必有師。師者，所以傳道、受業、解惑也。',
    colorTheme: 'indigo',
    difficultWords: ['句讀', '老聃', '郯子', '諂媚', '不恥相師'],
    quizzes: []
  },
  {
    id: 'lesson-3',
    title: '始得西山宴遊記',
    author: '唐 ‧ 柳宗元',
    description: '自余為僇人，居是州，恆惴慄。其隙也，則施施而行，漫漫而遊...',
    colorTheme: 'emerald',
    difficultWords: ['僇人', '惴慄', '施施', '箕踞', '衽席', '培塿'],
    quizzes: []
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find((lesson) => lesson.id === id);
}