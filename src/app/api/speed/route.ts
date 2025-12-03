// api/speed/route.ts

import { prisma } from "@/lib/priams";
import getUserFromAuth from "@/lib/user-auth";

export async function POST(req: Request) {
  const user = await getUserFromAuth();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { wpm } = await req.json();

  const userId = user.userId;

  // تحقق إذا كان ضمن العشرة الأوائل
  const topScores = await prisma.globalScore.findMany({
    orderBy: { wpm: "desc" },
    take: 10,
  });

  const minTopWpm =
    topScores.length < 10 ? 0 : topScores[topScores.length - 1].wpm;

  if (wpm < minTopWpm) {
    return new Response("Not in top 10", { status: 200 });
  }

  // تحديث أو إنشاء سجل اللاعب
  const updated = await prisma.globalScore.upsert({
    where: { userId },
    update: { wpm: wpm, totalScore: wpm }, // يمكن تعديل حسب الصيغة
    create: { userId, wpm, totalScore: wpm },
  });

  return new Response(
    JSON.stringify({
      topScores: [...topScores, updated]
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, 10),
    }),
    {
      status: 200,
    }
  );
}

export async function GET() {
  const topScores = await prisma.globalScore.findMany({
    orderBy: { wpm: "desc" },
    take: 10,
    include: { user: true },
  });

  return new Response(JSON.stringify({ topScores }), { status: 200 });
}
