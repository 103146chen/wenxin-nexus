'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import QuizRunner from "@/components/features/quiz/QuizRunner";
import { useParams } from "next/navigation";
import { useLessons } from "@/hooks/use-lessons";
import { Loader2 } from "lucide-react";

export default function QuizPage() {
  const { lessonId } = useParams();
  const { getLesson } = useLessons();
  
  const lesson = getLesson(lessonId as string);

  if (!lesson) return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
          <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin"/>
              <span>載入測驗中...</span>
          </div>
      </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1">
        <QuizRunner lesson={lesson} />
      </div>
    </div>
  );
}