'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { useTeacherStore } from "@/store/teacher-store";
import { ALL_LESSONS } from "@/lib/data/lessons";
import Link from "next/link";
import { Plus, Edit3, Trash2, BookOpen, FileText, MoreVertical, Copy } from "lucide-react";
import { useState } from "react";
// 🔥 引入 hook
import { useLessons } from "@/hooks/use-lessons";

export default function LessonListPage() {
  const { deleteLesson, addLesson } = useTeacherStore();
  // 🔥 改用 myCustomLessons
  const { myCustomLessons } = useLessons();
  
  const handleDelete = (id: string, title: string) => {
      if (confirm(`確定要刪除課程《${title}》嗎？此動作無法復原。`)) {
          deleteLesson(id);
      }
  };

  const handleClone = (lesson: any) => {
      if(confirm(`是否複製《${lesson.title}》為自訂課程並進行編輯？`)) {
          const newLesson = {
              ...lesson,
              id: `custom-${Date.now()}`,
              title: `${lesson.title} (副本)`,
              author: '我 (改編)',
              // 這裡不需要手動加 ownerId，addLesson 會自動處理
          };
          addLesson(newLesson);
          alert('複製成功！請在自訂課程列表中進行編輯。');
      }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex-1 p-10">
        
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">課程管理</h1>
                <p className="text-slate-500 mt-1">建立新教材，或編輯現有的課程內容與測驗。</p>
            </div>
            <Link href="/teacher/lessons/new" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition font-bold">
                <Plus className="w-5 h-5" /> 建立新課程
            </Link>
        </div>

        {/* 自訂課程區 - 改用 myCustomLessons */}
        <section className="mb-12">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600"/> 我的自訂課程
            </h2>
            
            {myCustomLessons.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50"/>
                    <p>尚無自訂課程，點擊右上角按鈕開始建立。</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {myCustomLessons.map(lesson => (
                        <div key={lesson.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{lesson.title}</h3>
                                    <p className="text-xs text-slate-500">{lesson.author}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/teacher/lessons/${lesson.id}/edit`} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition" title="編輯">
                                        <Edit3 className="w-4 h-4"/>
                                    </Link>
                                    <button onClick={() => handleDelete(lesson.id, lesson.title)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition" title="刪除">
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{lesson.description}</p>
                            <div className="flex gap-2 mt-auto">
                                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                    {lesson.quizSets?.length || 0} 組測驗
                                </span>
                                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                    {lesson.difficultWords?.length || 0} 個難詞
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>

        {/* 系統內建課程區 */}
        <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-slate-400"/> 系統內建課程
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {ALL_LESSONS.map(lesson => (
                    <div key={lesson.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative overflow-hidden">
                        <h3 className="font-bold text-slate-700">{lesson.title}</h3>
                        <p className="text-xs text-slate-500 mb-4">{lesson.author}</p>
                        <button 
                            onClick={() => handleClone(lesson)}
                            className="w-full py-2 bg-white border border-slate-300 text-slate-600 text-xs font-bold rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition flex items-center justify-center gap-2"
                        >
                            <Copy className="w-3 h-3"/> 複製並編輯
                        </button>
                    </div>
                ))}
            </div>
        </section>

      </div>
    </div>
  );
}