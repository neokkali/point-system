// api/speed/route.ts
import { prisma } from "@/lib/priams";
import getUserFromAuth from "@/lib/user-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getUserFromAuth();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = user.userId;
  const { wpm } = await req.json();

  const previousWpm = user.globalScore?.wpm ?? 0;

  // ❌ إذا النتيجة الجديدة أقل أو مساوية للسابق → لا تحدث
  if (wpm <= previousWpm) {
    return NextResponse.json(
      { message: "نتيجتك الحالية أقل أو مساوية لنتيجتك السابقة" },
      { status: 200 }
    );
  }

  // جلب أفضل 10 لاعبين
  const topScores = await prisma.globalScore.findMany({
    orderBy: { wpm: "desc" },
    take: 10,
    include: {
      user: {
        select: { id: true, username: true, role: true, createdAt: true }, // استبعاد كلمة المرور
      },
    },
  });

  const minTopWpm =
    topScores.length < 10 ? 0 : topScores[topScores.length - 1].wpm;

  if (wpm < minTopWpm) {
    return NextResponse.json({ message: "Not in top 10" }, { status: 200 });
  }

  // تحديث أو إنشاء سجل اللاعب
  const updated = await prisma.globalScore.upsert({
    where: { userId },
    update: { wpm, totalScore: wpm },
    create: { userId, wpm, totalScore: wpm },
    include: {
      user: {
        select: { id: true, username: true, role: true, createdAt: true },
      },
    },
  });

  // إعادة أفضل 10 لاعبين بعد التحديث
  const updatedTopScores = [
    ...topScores.filter((s) => s.userId !== userId),
    updated,
  ]
    .sort((a, b) => b.wpm - a.wpm)
    .slice(0, 10);

  return NextResponse.json({ topScores: updatedTopScores });
}

export async function GET() {
  const topScores = await prisma.globalScore.findMany({
    orderBy: { wpm: "desc" },
    take: 10,
    include: {
      user: {
        select: { id: true, username: true, role: true, createdAt: true }, // استبعاد كلمة المرور
      },
    },
  });

  return NextResponse.json({ topScores });
}
