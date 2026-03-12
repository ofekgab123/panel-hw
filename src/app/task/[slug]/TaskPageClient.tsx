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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100">
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-spin">⭐</div>
          <p className="text-lg font-bold text-purple-700">טוען את המשימה...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-10 shadow-xl text-center max-w-sm border-2 border-red-100">
          <div className="text-6xl">😕</div>
          <div>
            <h2 className="text-xl font-black text-slate-900">אופס! המשימה לא נמצאה</h2>
            <p className="mt-2 text-sm text-slate-500">ייתכן שהקישור שגוי או שהמשימה הוסרה.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100">
      {/* Top bar */}
      <div className="bg-gradient-to-l from-purple-600 to-blue-600 shadow-lg shadow-purple-200">
        <div className="mx-auto max-w-2xl px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <span className="text-base font-bold text-white">משימה ממוחשבת</span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {!studentInfo ? (
          <div className="rounded-3xl bg-white p-8 shadow-xl border-2 border-purple-100">
            <div className="mb-6 text-center">
              <div className="text-7xl mb-4">👋</div>
              <h2 className="text-2xl font-black text-slate-900">שלום!</h2>
              <p className="mt-1 text-base font-semibold text-slate-500">מלא את הפרטים שלך כדי להתחיל</p>
            </div>
            <StudentForm onSubmit={handleStudentSubmit} taskName={task.name} />
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-6 shadow-xl border-2 border-purple-100">
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
