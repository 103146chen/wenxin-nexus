import { Sidebar } from "@/components/layout/Sidebar";
import { getLessonById } from "@/lib/data/lessons";
import QuizRunner from "@/components/features/quiz/QuizRunner";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

// 這裡不需要 'use client'，這是一個 Server Component，所以可以 async
export default async function QuizPage({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);

  if (!lesson) return <div>找不到課程</div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1">
        {/* 這裡我們將互動邏輯交給 QuizRunner (Client Component) */}
        <QuizRunner lesson={lesson} />
      </div>
    </div>
  );
}