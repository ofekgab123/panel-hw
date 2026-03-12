"use client";

import { useState } from "react";

interface Question {
  id: string;
  text: string;
  isMainText?: boolean;
}

interface TaskViewProps {
  taskName: string;
  questions: Question[];
  studentName: string;
  studentClass: string;
  slug: string;
}

const ENCOURAGEMENTS = [
  "כל הכבוד! ממשיכים...",
  "מצוין! עוד קצת...",
  "יפה מאוד! שאלה הבאה...",
  "סבבה! ממשיכים קדימה...",
  "אש! שאלה נוספת...",
  "מעולה! כמעט שם...",
];

export function TaskView({
  taskName,
  questions,
  studentName,
  studentClass,
  slug,
}: TaskViewProps) {
  const mainText = questions.find((q) => q.isMainText) ?? null;
  const gameQuestions = questions.filter((q) => !q.isMainText);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [animDir, setAnimDir] = useState<"right" | "left">("right");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [encouragement, setEncouragement] = useState<string | null>(null);

  const current = gameQuestions[currentIndex];
  const isLast = currentIndex === gameQuestions.length - 1;
  const isFirst = currentIndex === 0;
  const progress = gameQuestions.length > 0 ? ((currentIndex + 1) / gameQuestions.length) * 100 : 100;

  const navigate = (dir: "next" | "prev") => {
    const nextIndex = dir === "next" ? currentIndex + 1 : currentIndex - 1;
    setAnimDir(dir === "next" ? "right" : "left");
    setAnimKey((k) => k + 1);
    setCurrentIndex(nextIndex);
    if (dir === "next") {
      setEncouragement(ENCOURAGEMENTS[currentIndex % ENCOURAGEMENTS.length]);
      setTimeout(() => setEncouragement(null), 1500);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/slug/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, studentClass, answers }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה בשליחת ההגשה");
      setSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "שגיאה בשליחת ההגשה");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 shadow-xl shadow-green-100">
          <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">ההגשה נשלחה!</h3>
          <p className="mt-2 text-slate-500">תודה {studentName}, עבודתך נשמרה בהצלחה.</p>
        </div>
        <p className="text-sm text-slate-400">ניתן לסגור את הדף</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-l from-indigo-50 to-violet-50 border border-indigo-100 p-5">
        <h2 className="text-xl font-bold text-slate-900">{taskName}</h2>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-200">
            <svg className="h-3.5 w-3.5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-indigo-700">
            {studentName} · {studentClass}
          </p>
        </div>
      </div>

      {/* Main text passage */}
      {mainText && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="h-4 w-4 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">קרא את הטקסט הבא</span>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{mainText.text}</p>
        </div>
      )}

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-600">
            שאלה {currentIndex + 1} מתוך {gameQuestions.length}
          </p>
          <div className="flex gap-1">
            {gameQuestions.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i < currentIndex
                    ? "bg-green-400 w-4"
                    : i === currentIndex
                    ? "bg-indigo-500 w-6"
                    : "bg-slate-200 w-2"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Encouragement toast */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          encouragement ? "max-h-12 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-2 text-center text-sm font-medium text-green-700">
          {encouragement}
        </div>
      </div>

      {/* Question card */}
      <div
        key={animKey}
        className={`rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm ${
          animDir === "right" ? "slide-in-right" : "slide-in-left"
        }`}
      >
        <div className="flex items-start gap-3 mb-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-base font-bold text-indigo-600">
            {currentIndex + 1}
          </span>
          <p className="font-medium text-slate-800 leading-relaxed pt-1 text-base">
            {current.text}
          </p>
        </div>
        <textarea
          value={answers[current.id] ?? ""}
          onChange={(e) =>
            setAnswers((prev) => ({ ...prev, [current.id]: e.target.value }))
          }
          rows={4}
          placeholder="כתוב את תשובתך כאן..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
          autoFocus
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {!isFirst && (
          <button
            onClick={() => navigate("prev")}
            className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            ← הקודם
          </button>
        )}

        {!isLast ? (
          <button
            onClick={() => navigate("next")}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
          >
            הבא →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 font-semibold text-white shadow-lg shadow-green-200 disabled:opacity-50 hover:bg-green-700 transition-all hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                שולח...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                סיימתי — שלח הגשה
              </>
            )}
          </button>
        )}
      </div>

      {/* Skip indicator */}
      {!answers[current.id]?.trim() && isLast && (
        <p className="text-center text-xs text-slate-400">
          ניתן לשלוח גם ללא מענה על כל השאלות
        </p>
      )}
    </div>
  );
}
