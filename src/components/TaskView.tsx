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

const QUESTION_COLORS = [
  {
    bg: "bg-pink-50", border: "border-pink-300", badge: "bg-pink-500",
    glow: "shadow-pink-100", focusBorder: "focus:border-pink-400",
    focusRing: "focus:ring-pink-100", textarea: "bg-pink-50/60",
    btn: "bg-pink-500 hover:bg-pink-600 shadow-pink-200",
    prevBtn: "border-pink-200 text-pink-600 hover:bg-pink-50",
  },
  {
    bg: "bg-orange-50", border: "border-orange-300", badge: "bg-orange-500",
    glow: "shadow-orange-100", focusBorder: "focus:border-orange-400",
    focusRing: "focus:ring-orange-100", textarea: "bg-orange-50/60",
    btn: "bg-orange-500 hover:bg-orange-600 shadow-orange-200",
    prevBtn: "border-orange-200 text-orange-600 hover:bg-orange-50",
  },
  {
    bg: "bg-emerald-50", border: "border-emerald-300", badge: "bg-emerald-500",
    glow: "shadow-emerald-100", focusBorder: "focus:border-emerald-400",
    focusRing: "focus:ring-emerald-100", textarea: "bg-emerald-50/60",
    btn: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200",
    prevBtn: "border-emerald-200 text-emerald-600 hover:bg-emerald-50",
  },
  {
    bg: "bg-sky-50", border: "border-sky-300", badge: "bg-sky-500",
    glow: "shadow-sky-100", focusBorder: "focus:border-sky-400",
    focusRing: "focus:ring-sky-100", textarea: "bg-sky-50/60",
    btn: "bg-sky-500 hover:bg-sky-600 shadow-sky-200",
    prevBtn: "border-sky-200 text-sky-600 hover:bg-sky-50",
  },
  {
    bg: "bg-violet-50", border: "border-violet-300", badge: "bg-violet-500",
    glow: "shadow-violet-100", focusBorder: "focus:border-violet-400",
    focusRing: "focus:ring-violet-100", textarea: "bg-violet-50/60",
    btn: "bg-violet-500 hover:bg-violet-600 shadow-violet-200",
    prevBtn: "border-violet-200 text-violet-600 hover:bg-violet-50",
  },
  {
    bg: "bg-yellow-50", border: "border-yellow-300", badge: "bg-yellow-500",
    glow: "shadow-yellow-100", focusBorder: "focus:border-yellow-400",
    focusRing: "focus:ring-yellow-100", textarea: "bg-yellow-50/60",
    btn: "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200",
    prevBtn: "border-yellow-200 text-yellow-600 hover:bg-yellow-50",
  },
];

const ENCOURAGEMENTS = [
  { text: "כל הכבוד! ממשיכים קדימה!", icon: "⭐" },
  { text: "מעולה! אתה עושה עבודה נהדרת!", icon: "🎉" },
  { text: "יפה מאוד! עוד קצת!", icon: "🌟" },
  { text: "סבבה! כמעט הגעת!", icon: "🚀" },
  { text: "אחלה! שאלה נוספת!", icon: "💪" },
  { text: "וואו, אתה ממש טוב בזה!", icon: "🔥" },
];

const QUESTION_ICONS = ["🦁", "🐬", "🦋", "🌈", "⚡", "🎯", "🌸", "🦄", "🐙", "🎸"];

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
  const [encouragement, setEncouragement] = useState<{ text: string; icon: string } | null>(null);

  const current = gameQuestions[currentIndex];
  const isLast = currentIndex === gameQuestions.length - 1;
  const isFirst = currentIndex === 0;
  const color = QUESTION_COLORS[currentIndex % QUESTION_COLORS.length];
  const questionIcon = QUESTION_ICONS[currentIndex % QUESTION_ICONS.length];

  const navigate = (dir: "next" | "prev") => {
    const nextIndex = dir === "next" ? currentIndex + 1 : currentIndex - 1;
    setAnimDir(dir === "next" ? "right" : "left");
    setAnimKey((k) => k + 1);
    setCurrentIndex(nextIndex);
    if (dir === "next") {
      const enc = ENCOURAGEMENTS[currentIndex % ENCOURAGEMENTS.length];
      setEncouragement(enc);
      setTimeout(() => setEncouragement(null), 1800);
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

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-6">
        <div className="text-8xl animate-bounce">🎊</div>
        <div className="rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 p-8 shadow-2xl shadow-green-200 text-white">
          <h3 className="text-3xl font-black mb-2">כל הכבוד!</h3>
          <p className="text-xl font-semibold opacity-90">{studentName} סיים את המשימה!</p>
        </div>
        <div className="flex gap-3 text-4xl">
          <span>⭐</span><span>⭐</span><span>⭐</span>
        </div>
        <p className="text-slate-400 text-sm">אפשר לסגור את הדף</p>
      </div>
    );
  }

  if (!current) return null;

  const answeredCount = gameQuestions.filter((q) => answers[q.id]?.trim()).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-l from-purple-500 to-blue-500 p-5 text-white shadow-lg shadow-purple-200">
        <h2 className="text-lg font-black">{taskName}</h2>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg">👤</span>
          <p className="text-sm font-semibold opacity-90">
            {studentName} · כיתה {studentClass}
          </p>
        </div>
      </div>

      {/* Main text passage */}
      {mainText && (
        <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 shadow-md shadow-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📖</span>
            <span className="text-sm font-black text-amber-700 uppercase tracking-wide">קרא את הטקסט הבא</span>
          </div>
          <p className="text-sm text-slate-800 leading-loose whitespace-pre-wrap font-medium">{mainText.text}</p>
        </div>
      )}

      {/* Star progress */}
      <div className="rounded-2xl bg-white border-2 border-slate-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-slate-600">
            שאלה <span className="text-2xl font-black text-slate-800">{currentIndex + 1}</span> מתוך {gameQuestions.length}
          </p>
          <p className="text-sm font-bold text-emerald-600">
            {answeredCount} ענית ✓
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {gameQuestions.map((_, i) => {
            const c = QUESTION_COLORS[i % QUESTION_COLORS.length];
            const isAnswered = !!answers[gameQuestions[i].id]?.trim();
            const isCurrent = i === currentIndex;
            return (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  isAnswered
                    ? `${c.badge} w-7 h-7 shadow-sm`
                    : isCurrent
                    ? `${c.badge} w-8 h-8 ring-4 ring-offset-1 ${c.glow}`
                    : "bg-slate-200 w-5 h-5"
                } flex items-center justify-center`}
              >
                {isAnswered && <span className="text-white text-xs font-black">✓</span>}
                {isCurrent && !isAnswered && <span className="text-white text-xs font-black">{i + 1}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Encouragement toast */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          encouragement ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-2xl bg-gradient-to-l from-green-400 to-emerald-400 px-4 py-3 text-center text-base font-bold text-white shadow-md shadow-green-200">
          <span className="mr-2 text-xl">{encouragement?.icon}</span>
          {encouragement?.text}
        </div>
      </div>

      {/* Question card */}
      <div
        key={animKey}
        className={`rounded-3xl border-2 ${color.border} ${color.bg} p-6 shadow-lg ${color.glow} ${
          animDir === "right" ? "slide-in-right" : "slide-in-left"
        }`}
      >
        {/* Question icon + number */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color.badge} shadow-md text-2xl`}>
            {questionIcon}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">שאלה {currentIndex + 1}</p>
            <p className="text-xs text-slate-400">כתוב את התשובה שלך למטה</p>
          </div>
        </div>

        {/* Question text */}
        <p className="text-base font-bold text-slate-800 leading-relaxed mb-5">
          {current.text}
        </p>

        {/* Answer textarea */}
        <textarea
          value={answers[current.id] ?? ""}
          onChange={(e) =>
            setAnswers((prev) => ({ ...prev, [current.id]: e.target.value }))
          }
          rows={4}
          placeholder="✍️  כתוב את התשובה שלך כאן..."
          className={`w-full rounded-2xl border-2 ${color.border} ${color.textarea} px-4 py-3 text-base text-slate-800 placeholder-slate-400 ${color.focusBorder} focus:outline-none focus:ring-4 ${color.focusRing} transition-all resize-none font-medium`}
          autoFocus
        />

        {/* Answered checkmark */}
        {answers[current.id]?.trim() && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-black">✓</div>
            <p className="text-sm font-semibold text-green-600">תשובה נשמרה!</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {!isFirst && (
          <button
            onClick={() => navigate("prev")}
            className={`flex-1 rounded-2xl border-2 ${color.prevBtn} py-3.5 text-base font-bold transition-all hover:shadow-sm`}
          >
            ← הקודם
          </button>
        )}

        {!isLast ? (
          <button
            onClick={() => navigate("next")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl ${color.btn} py-3.5 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl`}
          >
            הבא ←
            <span className="text-xl">✨</span>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-green-500 to-emerald-500 py-3.5 text-base font-bold text-white shadow-lg shadow-green-200 disabled:opacity-50 hover:from-green-600 hover:to-emerald-600 transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                שולח...
              </>
            ) : (
              <>
                <span className="text-xl">🎊</span>
                סיימתי! שלח
              </>
            )}
          </button>
        )}
      </div>

      {/* Bottom hint */}
      <p className="text-center text-xs text-slate-400">
        אפשר לחזור אחורה ולשנות תשובות בכל עת
      </p>
    </div>
  );
}
