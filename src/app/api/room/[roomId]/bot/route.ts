import { prisma } from "@/lib/priams";
import { NextResponse } from "next/server";

const SECRET_KEY = "MY_SUPER_SECRET_TOKEN";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  const botAuthToken = req.headers.get("x-bot-secret");
  const body = await req.json();

  if (botAuthToken !== SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const finalUserId = body.adminUserId;
  const { players }: { players: { username: string; points: number }[] } = body;

  try {
    // 1. تجميع النقاط برمجياً قبل دخول قاعدة البيانات (لتقليل العمليات)
    const sanitizedMap = new Map<string, number>();
    players.forEach((p) => {
      const name = p.username.trim() || p.username;
      sanitizedMap.set(
        name,
        (sanitizedMap.get(name) || 0) + Math.floor(p.points),
      );
    });

    const uniqueUsernames = Array.from(sanitizedMap.keys());

    // 2. خطوة سريعة: إنشاء كل اللاعبين غير الموجودين دفعة واحدة
    // هذه العملية تتجاهل الموجود مسبقاً وتنشئ الجديد فقط بطلقة واحدة
    await prisma.player.createMany({
      data: uniqueUsernames.map((uname) => ({
        username: uname,
        userId: finalUserId,
      })),
      skipDuplicates: true,
    });

    // 3. جلب بيانات اللاعبين (الـ IDs) دفعة واحدة
    const dbPlayers = await prisma.player.findMany({
      where: {
        username: { in: uniqueUsernames },
        userId: finalUserId,
      },
      select: { id: true, username: true },
    });

    // 4. تنفيذ الـ Upsert لجميع اللاعبين في Transaction واحد (سرعة هائلة)
    // بدلاً من انتظار كل لاعب على حدة، نرسلهم جميعاً كـ Transaction
    const operations = dbPlayers.map((player) => {
      const points = sanitizedMap.get(player.username) || 0;
      return prisma.playerRoomScore.upsert({
        where: {
          playerId_roomId: {
            playerId: player.id,
            roomId: roomId,
          },
        },
        update: {
          totalScore: { increment: points },
          updatedAt: new Date(),
        },
        create: {
          playerId: player.id,
          roomId: roomId,
          totalScore: points,
        },
      });
    });

    await prisma.$transaction(operations);

    return NextResponse.json({ message: "تمت العملية بسرعة فائقة" });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "فشل تحديث البيانات" }, { status: 500 });
  }
}
