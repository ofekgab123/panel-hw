"use client";

import { useState, useEffect } from "react";
import { StudentForm } from "@/components/StudentForm";
import { TaskView } from "@/components/TaskView";

interface Question {
  id: string;
  text: string;
  isMainText?: boolean;
}

interface TaskData {
  id: string;
  name: string;
  questions: Question[];
}

export function TaskPageClient({ slug }: { slug: string }) {
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<{
    name: string;
    studentClass: string;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`task-${slug}-student`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.name && parsed.studentClass) {
          setStudentInfo(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, [slug]);

  useEffect(() => {
    fetch(`/api/tasks/slug/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.questions) {
          setTask(data);
        }
      })
      .catch(() => setTask(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleStudentSubmit = (name: string, studentClass: string) => {
    const info = { name, studentClass };
    setStudentInfo(info);
    localStorage.setItem(`task-${slug}-student`, JSON.stringify(info));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
          <p className="text-slate-500 font-medium">טוען משימה...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-10 shadow-lg text-center max-w-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">המשימה לא נמצאה</h2>
            <p className="mt-2 text-sm text-slate-500">ייתכן שהקישור שגוי או שהמשימה הוסרה.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-6 py-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-slate-600">משימה ממוחשבת</span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {!studentInfo ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
                <svg className="h-7 w-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">ברוך הבא!</h2>
              <p className="mt-1 text-sm text-slate-500">הזן את פרטיך כדי להתחיל</p>
            </div>
            <StudentForm onSubmit={handleStudentSubmit} taskName={task.name} />
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <TaskView
              taskName={task.name}
              questions={task.questions}
              studentName={studentInfo.name}
              studentClass={studentInfo.studentClass}
              slug={slug}
            />
          </div>
        )}
      </div>
    </div>
  );
}
