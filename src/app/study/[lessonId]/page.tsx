import { getLessonById } from "@/lib/data/lessons";
import StudyRoomClient from "@/components/features/virtual-study/StudyRoomClient";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonStudyPage({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);

  if (!lesson) return <div>找不到課程</div>;

  // 修正點：屬性名稱改為 initialLesson，與 StudyRoomClient 的介面定義一致
  return <StudyRoomClient initialLesson={lesson} />;
}