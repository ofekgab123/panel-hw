"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Task {
  id: string;
  name: string;
  shareSlug: string;
  createdAt: string;
  submissionsCount: number;
}

export function TeacherPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const copyTaskUrl = async (slug: string) => {
    const url = `${window.location.origin}/task/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">פאנל מורה</h1>
              <p className="text-xs text-slate-500">ניהול משימות והגשות</p>
            </div>
          </div>
          <Link href="/" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
            ← דף הבית
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Stats row */}
        {!loading && tasks.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <p className="text-2xl font-bold text-indigo-600">{tasks.length}</p>
              <p className="text-sm text-slate-500 mt-1">משימות</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <p className="text-2xl font-bold text-violet-600">
                {tasks.reduce((sum, t) => sum + t.submissionsCount, 0)}
              </p>
              <p className="text-sm text-slate-500 mt-1">הגשות סה"כ</p>
            </div>
            <div className="hidden sm:block rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <p className="text-2xl font-bold text-purple-600">
                {tasks.filter((t) => t.submissionsCount > 0).length}
              </p>
              <p className="text-sm text-slate-500 mt-1">משימות עם הגשות</p>
            </div>
          </div>
        )}

        {/* Add button */}
        <Link
          href="/teacher/new"
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-indigo-200 bg-white px-6 py-5 text-indigo-600 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm group"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold transition-colors group-hover:bg-indigo-200">+</span>
          <span className="font-medium">הוספת משימה חדשה</span>
        </Link>

        {/* Task list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-8 w-8 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            <p className="text-slate-500 text-sm">טוען משימות...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <svg className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium text-slate-700">עדיין אין משימות</p>
            <p className="mt-1 text-sm text-slate-400">לחץ על הכפתור למעלה כדי להוסיף את המשימה הראשונה</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                    <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{task.name}</h3>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {task.submissionsCount > 0
                        ? `${task.submissionsCount} הגשות`
                        : "אין הגשות עדיין"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 mr-2">
                  <button
                    onClick={() => copyTaskUrl(task.shareSlug)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      copiedSlug === task.shareSlug
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {copiedSlug === task.shareSlug ? (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        הועתק!
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        העתק קישור
                      </>
                    )}
                  </button>
                  <Link
                    href={`/teacher/task/${task.id}`}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    הגשות
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
