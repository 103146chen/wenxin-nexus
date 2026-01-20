'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import LessonEditor from "@/components/features/teacher/LessonEditor";
import { useTeacherStore } from "@/store/teacher-store";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewLessonPage() {
  const { addLesson } = useTeacherStore();
  const router = useRouter();

  const handleCreate = (data: any) => {
      addLesson(data);
      alert('🎉 課程建立成功！');
      router.push('/teacher/lessons');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex items-center gap-4 mb-6">
            <Link href="/teacher/lessons" className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">建立新課程</h1>
        </div>
        <LessonEditor onSave={handleCreate} mode="create" />
      </div>
    </div>
  );
}