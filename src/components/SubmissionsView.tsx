"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Question {
  id: string;
  text: string;
}

interface Submission {
  id: string;
  studentName: string;
  studentClass: string;
  answers: Record<string, string>;
  completedAt: string;
}

interface ApiResponse {
  task: { id: string; name: string; questions: Question[] };
  submissions: Submission[];
}

export function SubmissionsView({ taskId }: { taskId: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tasks/${taskId}/submissions`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [taskId]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
        <p className="text-slate-500 font-medium">טוען הגשות...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-red-50 p-8 text-center border border-red-100">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
          <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="font-semibold text-red-800">לא ניתן לטעון את המשימה</p>
      </div>
    );
  }

  const { task, submissions } = data;
  const answeredAll = submissions.filter(
    (s) => task.questions.every((q) => s.answers[q.id]?.trim())
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/teacher" className="mb-2 flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            חזרה למשימות
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">{task.name}</h2>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-2xl font-bold text-indigo-600">{submissions.length}</p>
          <p className="text-xs text-slate-500 mt-1">הגשות</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-2xl font-bold text-violet-600">{task.questions.length}</p>
          <p className="text-xs text-slate-500 mt-1">שאלות</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-2xl font-bold text-green-600">{answeredAll}</p>
          <p className="text-xs text-slate-500 mt-1">ענו הכל</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <svg className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="font-semibold text-slate-700">עדיין אין הגשות</p>
          <p className="mt-1 text-sm text-slate-400">תלמידים שישלחו את המשימה יופיעו כאן</p>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((sub, index) => {
            const isExpanded = expandedId === sub.id;
            const answeredCount = task.questions.filter((q) => sub.answers[q.id]?.trim()).length;
            return (
              <React.Fragment key={sub.id}>
                <div
                  className={`rounded-2xl border bg-white transition-all cursor-pointer ${
                    isExpanded ? "border-indigo-200 shadow-md" : "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-600 text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{sub.studentName}</p>
                      <p className="text-sm text-slate-400">{sub.studentClass} · {new Date(sub.completedAt).toLocaleDateString("he-IL")}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-left">
                        <p className="text-xs text-slate-400">ענה על</p>
                        <p className="text-sm font-semibold text-slate-700">{answeredCount}/{task.questions.length}</p>
                      </div>
                      <div className={`flex h-7 w-7 items-center justify-center rounded-xl transition-colors ${isExpanded ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                        <svg className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 p-4">
                      <div className="space-y-3">
                        {task.questions.map((q, qi) => (
                          <div key={q.id} className="rounded-xl bg-slate-50 p-4">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-xs font-bold text-indigo-600 mt-0.5">
                                {qi + 1}
                              </span>
                              <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                                {q.text.slice(0, 120)}{q.text.length > 120 && "..."}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white border border-slate-100 px-3 py-2">
                              {sub.answers[q.id]?.trim() ? (
                                <p className="text-slate-800 text-sm leading-relaxed">{sub.answers[q.id]}</p>
                              ) : (
                                <p className="text-slate-400 text-sm italic">לא ענה על שאלה זו</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
