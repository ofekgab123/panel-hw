import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { studentName, studentClass, answers } = body;

    if (!studentName || !studentClass || typeof answers !== "object") {
      return NextResponse.json(
        { error: "חסרים פרטים: שם, כיתה או תשובות" },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { shareSlug: slug },
    });

    if (!task) {
      return NextResponse.json(
        { error: "המשימה לא נמצאה" },
        { status: 404 }
      );
    }

    const submission = await prisma.submission.create({
      data: {
        taskId: task.id,
        studentName: String(studentName).trim(),
        studentClass: String(studentClass).trim(),
        answers: JSON.stringify(answers),
      },
    });

    return NextResponse.json({
      id: submission.id,
      success: true,
    });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { error: "שגיאה בשמירת ההגשה" },
      { status: 500 }
    );
  }
}
