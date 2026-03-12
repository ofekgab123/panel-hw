import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { submissions: true } },
      },
    });

    return NextResponse.json(
      tasks.map((t) => ({
        id: t.id,
        name: t.name,
        shareSlug: t.shareSlug,
        createdAt: t.createdAt,
        submissionsCount: t._count.submissions,
      }))
    );
  } catch (error) {
    console.error("Tasks list error:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת המשימות" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, documentPath, questions } = body;

    if (!name || !documentPath || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "חסרים פרטים: שם, קובץ או שאלות" },
        { status: 400 }
      );
    }

    const shareSlug = nanoid(10);

    const task = await prisma.task.create({
      data: {
        name,
        documentPath,
        questions: JSON.stringify(questions),
        shareSlug,
      },
    });

    return NextResponse.json({
      id: task.id,
      name: task.name,
      shareSlug: task.shareSlug,
    });
  } catch (error) {
    console.error("Task create error:", error);
    return NextResponse.json(
      { error: "שגיאה ביצירת המשימה" },
      { status: 500 }
    );
  }
}
