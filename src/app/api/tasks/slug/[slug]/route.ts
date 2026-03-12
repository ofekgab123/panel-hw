import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const task = await prisma.task.findUnique({
      where: { shareSlug: slug },
    });

    if (!task) {
      return NextResponse.json(
        { error: "המשימה לא נמצאה" },
        { status: 404 }
      );
    }

    const questions = JSON.parse(task.questions) as { id: string; text: string }[];

    return NextResponse.json({
      id: task.id,
      name: task.name,
      questions,
    });
  } catch (error) {
    console.error("Task fetch error:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת המשימה" },
      { status: 500 }
    );
  }
}
