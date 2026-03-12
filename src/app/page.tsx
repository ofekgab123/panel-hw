import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-8">
      <main className="flex max-w-lg flex-col items-center gap-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 shadow-lg shadow-indigo-200">
          <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">
            משימות ממוחשבת
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            העלה מסמך Word או PDF והפוך אותו למשימה דיגיטלית לשיתוף עם התלמידים
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <Link
            href="/teacher"
            className="w-full rounded-2xl bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 text-center"
          >
            כניסה לפאנל מורה
          </Link>
        </div>

        <div className="flex gap-8 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
            העלאת מסמך
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-violet-400"></div>
            חילוץ שאלות
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-400"></div>
            מעקב הגשות
          </div>
        </div>
      </main>
    </div>
  );
}
