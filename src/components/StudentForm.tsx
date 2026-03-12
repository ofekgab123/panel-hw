"use client";

import { useState } from "react";

interface StudentFormProps {
  onSubmit: (name: string, studentClass: string) => void;
  taskName?: string;
}

export function StudentForm({ onSubmit, taskName }: StudentFormProps) {
  const [name, setName] = useState("");
  const [studentClass, setStudentClass] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && studentClass.trim()) {
      onSubmit(name.trim(), studentClass.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {taskName && (
        <div className="rounded-2xl bg-gradient-to-l from-purple-100 to-blue-100 border border-purple-200 p-4">
          <p className="text-xs font-bold text-purple-500 mb-1 uppercase tracking-wide">📋 המשימה שלנו היום</p>
          <p className="font-bold text-purple-900 text-base">{taskName}</p>
        </div>
      )}

      <div>
        <label className="mb-2 flex items-center gap-2 text-base font-bold text-slate-700">
          <span className="text-xl">✏️</span> מה השם שלך?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="כתוב את שמך כאן..."
          className="w-full rounded-2xl border-2 border-purple-200 bg-purple-50 px-4 py-3.5 text-lg text-slate-900 placeholder-purple-300 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all font-medium"
        />
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-base font-bold text-slate-700">
          <span className="text-xl">🏫</span> באיזו כיתה אתה?
        </label>
        <input
          type="text"
          value={studentClass}
          onChange={(e) => setStudentClass(e.target.value)}
          required
          placeholder='למשל: ג׳ 2'
          className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50 px-4 py-3.5 text-lg text-slate-900 placeholder-blue-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
        />
      </div>

      <button
        type="submit"
        disabled={!name.trim() || !studentClass.trim()}
        className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-purple-600 to-blue-600 py-4 text-lg font-bold text-white shadow-lg shadow-purple-200 hover:from-purple-700 hover:to-blue-700 disabled:opacity-40 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-300 active:translate-y-0"
      >
        <span className="text-2xl">🚀</span>
        בואו נתחיל!
      </button>
    </form>
  );
}
