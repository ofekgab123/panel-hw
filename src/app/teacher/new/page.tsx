"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Question {
  id: string;
  text: string;
  isMainText?: boolean;
}

export default function NewTaskPage() {
  const router = useRouter();

  // Step
  const [step, setStep] = useState<"upload" | "preview">("upload");

  // Upload step
  const [format, setFormat] = useState<"pdf" | "word">("word");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [documentPath, setDocumentPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview step
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  /* ── helpers ── */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (format === "pdf" && ext !== "pdf") {
      setError("נא לבחור קובץ PDF");
      return;
    }
    if (format === "word" && !["docx", "doc"].includes(ext || "")) {
      setError("נא לבחור קובץ Word (.docx או .doc)");
      return;
    }
    setFile(f);
    setError("");
  };

  const handleUpload = async () => {
    if (!file || !name.trim()) {
      setError("נא למלא את שם המשימה ולבחור קובץ");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה בהעלאה");
      setDocumentPath(data.documentPath);
      const qs: Question[] = data.questions || [];
      if (!qs.length) {
        setError("לא נמצאו שאלות במסמך. נסה מסמך עם שאלות ממוספרות.");
        return;
      }
      setQuestions(qs);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהעלאה");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!documentPath || questions.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), documentPath, questions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה ביצירת המשימה");
      router.push("/teacher");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה ביצירת המשימה");
    } finally {
      setLoading(false);
    }
  };

  /* ── question editing ── */

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditingText(q.text);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setQuestions((prev) =>
      prev.map((q) => (q.id === editingId ? { ...q, text: editingText.trim() || q.text } : q))
    );
    setEditingId(null);
    setEditingText("");
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const toggleMainText = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, isMainText: !q.isMainText }
          : { ...q, isMainText: false }
      )
    );
  };

  const addQuestion = () => {
    const newId = `q${Date.now()}`;
    const newQ: Question = { id: newId, text: "" };
    setQuestions((prev) => [...prev, newQ]);
    setEditingId(newId);
    setEditingText("");
  };

  /* ── render ── */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {step === "upload" ? "משימה חדשה" : "עריכת שאלות"}
              </h1>
              <p className="text-xs text-slate-500">
                {step === "upload" ? "שלב 1 מתוך 2 — פרטי המשימה" : "שלב 2 מתוך 2 — בדיקה ועריכה"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Step dots */}
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full transition-colors ${step === "upload" ? "bg-indigo-600" : "bg-green-500"}`} />
              <span className={`h-2 w-2 rounded-full transition-colors ${step === "preview" ? "bg-indigo-600" : "bg-slate-200"}`} />
            </div>
            <Link
              href="/teacher"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors text-lg"
            >
              ✕
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-red-700 border border-red-100">
            <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* ── Step 1: Upload ── */}
        {step === "upload" && (
          <div className="space-y-6">
            {/* Format */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <label className="mb-3 block text-sm font-semibold text-slate-700">פורמט המסמך</label>
              <div className="grid grid-cols-2 gap-3">
                {(["word", "pdf"] as const).map((f) => (
                  <label
                    key={f}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                      format === f ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input type="radio" name="format" className="sr-only" checked={format === f} onChange={() => { setFormat(f); setFile(null); }} />
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${format === f ? "bg-indigo-100" : "bg-slate-100"}`}>
                      <svg className={`h-5 w-5 ${format === f ? "text-indigo-600" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${format === f ? "text-indigo-700" : "text-slate-700"}`}>
                        {f === "word" ? "Word" : "PDF"}
                      </p>
                      <p className="text-xs text-slate-400">{f === "word" ? ".docx / .doc" : ".pdf"}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Task name */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <label className="mb-3 block text-sm font-semibold text-slate-700">שם המשימה</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="למשל: מבחן מתמטיקה — פרק 1"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            {/* File upload */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <label className="mb-3 block text-sm font-semibold text-slate-700">העלאת קובץ</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                  file ? "border-green-300 bg-green-50" : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-700 text-sm">{file.name}</p>
                      <p className="text-xs text-green-500">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200">
                      <svg className="h-6 w-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-600">לחץ לבחירת קובץ</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {format === "pdf" ? "PDF עד 10MB" : "Word (.docx, .doc) עד 10MB"}
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={format === "pdf" ? ".pdf" : ".doc,.docx"}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 font-semibold text-white shadow-lg shadow-indigo-200 disabled:opacity-50 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  מעבד את המסמך...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  העלה וחפש שאלות
                </>
              )}
            </button>
          </div>
        )}

        {/* ── Step 2: Preview + Edit ── */}
        {step === "preview" && (
          <div className="space-y-5">
            {/* Summary banner */}
            <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-4 border border-green-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 shrink-0">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-800 text-sm">נמצאו {questions.length} שאלות</p>
                <p className="text-xs text-green-600 mt-0.5">ניתן לערוך, למחוק ולהוסיף שאלות לפני האישור</p>
              </div>
            </div>

            {/* Main text hint */}
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
              <svg className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p className="text-xs text-amber-700">
                לחץ על סמל הסימנייה ליד פסקה כדי לסמן אותה כ<strong>טקסט ראשי</strong> — היא תופיע בראש הדף לתלמיד ולא תיספר כשאלה. שימושי למקצועות כמו עברית וספרות.
              </p>
            </div>

            {/* Questions list */}
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  {editingId === q.id ? (
                    /* Editing mode */
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-600">
                          {i + 1}
                        </span>
                        <span className="text-xs font-medium text-slate-400">עריכת שאלה</span>
                      </div>
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={3}
                        autoFocus
                        className="w-full rounded-xl border border-indigo-300 bg-indigo-50/40 px-4 py-3 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          שמור
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditingText(""); }}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          ביטול
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div className="flex items-start gap-3">
                      {q.isMainText ? (
                        <span className="shrink-0 mt-0.5 rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                          טקסט ראשי
                        </span>
                      ) : (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-600 mt-0.5">
                          {questions.filter((x) => !x.isMainText).indexOf(q) + 1}
                        </span>
                      )}
                      <p className="flex-1 text-sm text-slate-700 leading-relaxed line-clamp-3">
                        {q.text || <span className="italic text-slate-400">שאלה ריקה</span>}
                      </p>
                      <div className="flex gap-1 shrink-0 mr-1">
                        <button
                          onClick={() => toggleMainText(q.id)}
                          title={q.isMainText ? "בטל טקסט ראשי" : "סמן כטקסט ראשי"}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            q.isMainText
                              ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                              : "text-slate-400 hover:bg-amber-50 hover:text-amber-500"
                          }`}
                        >
                          <svg className="h-4 w-4" fill={q.isMainText ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => startEdit(q)}
                          title="עריכה"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteQuestion(q.id)}
                          title="מחיקה"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add question */}
              <button
                onClick={addQuestion}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-3.5 text-sm font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                הוסף שאלה
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreate}
                disabled={loading || questions.length === 0}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 font-semibold text-white shadow-lg shadow-indigo-200 disabled:opacity-50 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    יוצר...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    צור משימה ({questions.length} שאלות)
                  </>
                )}
              </button>
              <button
                onClick={() => setStep("upload")}
                className="rounded-2xl border border-slate-200 px-5 py-4 font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                חזרה
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
