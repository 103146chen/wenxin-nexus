export interface Lesson {
  id: string;
  title: string;
  author: string;
  description: string;
  colorTheme: string; // 用來區分不同課程的主色調 (Tailwind class)
}

export const ALL_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    title: '赤壁賦',
    author: '宋 ‧ 蘇軾',
    description: '壬戌之秋，七月既望，蘇子與客泛舟遊於赤壁之下。清風徐來，水波不興...',
    colorTheme: 'orange', 
  },
  {
    id: 'lesson-2',
    title: '師說',
    author: '唐 ‧ 韓愈',
    description: '古之學者必有師。師者，所以傳道、受業、解惑也。人非生而知之者，孰能無惑？',
    colorTheme: 'indigo',
  },
  {
    id: 'lesson-3',
    title: '始得西山宴遊記',
    author: '唐 ‧ 柳宗元',
    description: '自余為僇人，居是州，恆惴慄。其隙也，則施施而行，漫漫而遊...',
    colorTheme: 'emerald',
  },
  // 💡 未來只要在這裡加入第 4 課，全網站就會自動出現！
];

//這是一個方便的小工具函數，讓別的頁面可以用 ID 查到課程資料
export function getLessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find((lesson) => lesson.id === id);
}