'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import DailyArticleEditor from "@/components/features/teacher/DailyArticleEditor";
import { useDailyStore } from "@/store/daily-store";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditDailyArticlePage() {
  const { id } = useParams();
  const { getArticleById, updateArticle } = useDailyStore();
  const router = useRouter();
  const article = getArticleById(id as string);

  const handleUpdate = (data: any) => {
      updateArticle(id as string, data);
      alert('✅ 修改已儲存！');
      router.push('/teacher/daily-manager');
  };

  if (!article) return <div>載入中...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex items-center gap-4 mb-6">
            <Link href="/teacher/daily-manager" className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">編輯：{article.title}</h1>
        </div>
        <DailyArticleEditor initialData={article} onSave={handleUpdate} />
      </div>
    </div>
  );
}