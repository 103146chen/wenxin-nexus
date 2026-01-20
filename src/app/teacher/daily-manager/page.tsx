'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { useDailyStore } from "@/store/daily-store";
import Link from "next/link";
import { Plus, Edit3, Trash2, Calendar, Sun } from "lucide-react";

export default function DailyManagerPage() {
  const { articles, deleteArticle } = useDailyStore();

  const handleDelete = (id: string, title: string) => {
      if (confirm(`確定要刪除《${title}》嗎？此操作無法復原。`)) {
          deleteArticle(id);
      }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-10">
        
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">每日閱讀管理</h1>
                <p className="text-slate-500 mt-1">安排每日的晨讀文章與測驗題目。</p>
            </div>
            <Link href="/teacher/daily-manager/new" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition font-bold">
                <Plus className="w-5 h-5" /> 新增文章
            </Link>
        </div>

        {articles.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center text-slate-400">
                <Sun className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                <p>目前沒有每日閱讀文章，請點擊右上角新增。</p>
            </div>
        ) : (
            <div className="space-y-4">
                {articles.map(article => (
                    <div key={article.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex justify-between items-center group">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold">
                                <Calendar className="w-6 h-6"/>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{article.title}</h3>
                                <p className="text-sm text-slate-500">{article.author} • {article.questions.length} 題測驗</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            <Link href={`/teacher/daily-manager/${article.id}/edit`} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition">
                                <Edit3 className="w-5 h-5"/>
                            </Link>
                            <button onClick={() => handleDelete(article.id, article.title)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition">
                                <Trash2 className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}