import { NextResponse } from "next/server";

import { prisma } from "@/lib/priams";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;

  try {
    const { players } = await req.json(); // [{ username, points }, ...]

    await Promise.all(
      players.map(async (p: { username: string; points: number }) => {
        const player = await prisma.player.upsert({
          where: { username: p.username },
          update: {},
          create: { username: p.username },
        });

        await prisma.playerRoomScore.upsert({
          where: { playerId_roomId: { playerId: player.id, roomId } },
          update: { totalScore: p.points }, // تحديث النقاط إذا موجود
          create: { playerId: player.id, roomId, totalScore: p.points }, // إنشاء جديد إذا غير موجود
        });
      })
    );

    return NextResponse.json({ message: "Players updated/added successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "فشل التحديث/الإضافة" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  if (!roomId) {
    return NextResponse.json({ error: "roomId غير موجود" }, { status: 400 });
  }

  // 🔹 فقط جلب اللاعبين لهذه الغرفة
  const playerScores = await prisma.playerRoomScore.findMany({
    where: { roomId }, // هنا roomId مهم جداً
    include: { player: true },
    orderBy: { totalScore: "desc" },
  });

  // صياغة البيانات بالشكل المطلوب للواجهة
  const players = playerScores.map((ps) => ({
    id: ps.playerId,
    username: ps.player.username,
    totalScore: ps.totalScore,
  }));

  return NextResponse.json(players);
}
