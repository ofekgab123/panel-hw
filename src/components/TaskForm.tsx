"use client";

import { useState, useRef } from "react";

interface Question {
  id: string;
  text: string;
}

interface TaskFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function TaskForm({ onClose, onSuccess }: TaskFormProps) {
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [format, setFormat] = useState<"pdf" | "word">("word");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [documentPath, setDocumentPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
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
    }
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

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "שגיאה בהעלאה");
      }

      setDocumentPath(data.documentPath);
      setQuestions(data.questions || []);

      if (!data.questions?.length) {
        setError("לא נמצאו שאלות במסמך. נסה מסמך עם שאלות ממוספרות.");
      } else {
        setStep("preview");
      }
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
        body: JSON.stringify({
          name: name.trim(),
          documentPath,
          questions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "שגיאה ביצירת המשימה");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה ביצירת המשימה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 rounded-t-3xl border-b border-slate-100 bg-white px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`h-2 w-2 rounded-full ${step === "upload" ? "bg-indigo-600" : "bg-slate-200"}`}></span>
              <span className={`h-2 w-2 rounded-full ${step === "preview" ? "bg-indigo-600" : "bg-slate-200"}`}></span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {step === "upload" ? "משימה חדשה" : "אישור שאלות"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {step === "upload" ? "שלב 1 מתוך 2 — פרטי המשימה" : "שלב 2 מתוך 2 — בדיקת תוצאות"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-red-700 border border-red-100">
              <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {step === "upload" ? (
            <div className="space-y-5">
              {/* Format selector */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  פורמט המסמך
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["word", "pdf"] as const).map((f) => (
                    <label
                      key={f}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                        format === f
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        className="sr-only"
                        checked={format === f}
                        onChange={() => {
                          setFormat(f);
                          setFile(null);
                        }}
                      />
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${format === f ? "bg-indigo-100" : "bg-slate-100"}`}>
                        {f === "word" ? (
                          <svg className={`h-5 w-5 ${format === f ? "text-indigo-600" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        ) : (
                          <svg className={`h-5 w-5 ${format === f ? "text-indigo-600" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        )}
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
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  שם המשימה
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="למשל: מבחן מתמטיקה — פרק 1"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              {/* File upload */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  העלאת קובץ
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                    file
                      ? "border-green-300 bg-green-50"
                      : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50"
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
                        <p className="text-xs text-green-500">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
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

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 font-semibold text-white shadow-md shadow-indigo-200 disabled:opacity-50 hover:bg-indigo-700 transition-all"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                      מעבד...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      העלה וחפש שאלות
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 px-5 py-3 font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  ביטול
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-4 border border-green-100">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 shrink-0">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-green-800 text-sm">נמצאו {questions.length} שאלות</p>
                  <p className="text-xs text-green-600 mt-0.5">בדוק את השאלות ואשר ליצירת המשימה</p>
                </div>
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-3">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="flex gap-3 rounded-xl bg-white p-3 shadow-sm"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-600">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {q.text.slice(0, 160)}
                      {q.text.length > 160 && "..."}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 font-semibold text-white shadow-md shadow-indigo-200 disabled:opacity-50 hover:bg-indigo-700 transition-all"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                      יוצר...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      צור משימה
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep("upload")}
                  className="rounded-2xl border border-slate-200 px-5 py-3 font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  חזרה
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
