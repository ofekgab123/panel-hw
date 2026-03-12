import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { submissions: true },
    });

    if (!task) {
      return NextResponse.json(
        { error: "המשימה לא נמצאה" },
        { status: 404 }
      );
    }

    const questions = JSON.parse(task.questions) as { id: string; text: string }[];

    return NextResponse.json({
      task: {
        id: task.id,
        name: task.name,
        questions,
      },
      submissions: task.submissions.map((s) => ({
        id: s.id,
        studentName: s.studentName,
        studentClass: s.studentClass,
        answers: JSON.parse(s.answers) as Record<string, string>,
        completedAt: s.completedAt,
      })),
    });
  } catch (error) {
    console.error("Submissions fetch error:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת ההגשות" },
      { status: 500 }
    );
  }
}
