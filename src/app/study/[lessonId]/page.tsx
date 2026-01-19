'use client';

import { useParams } from "next/navigation";
import { useLessons } from "@/hooks/use-lessons";
import StudyRoomClient from "@/components/features/virtual-study/StudyRoomClient";
import { Loader2 } from "lucide-react";

export default function LessonStudyPage() {
  const { lessonId } = useParams();
  const { getLesson } = useLessons();
  
  const lesson = getLesson(lessonId as string);

  if (!lesson) return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
          <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin"/>
              <span>載入課程中...</span>
          </div>
      </div>
  );

  return <StudyRoomClient initialLesson={lesson} />;
}