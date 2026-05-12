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
    // 1. تجميع النقاط في الذاكرة مع منطق معالجة الأسماء الجديد
    const pointsMap = new Map<string, number>();

    for (const p of players) {
      let processedName = p.username;

      // 🟢 التحسين المطلوب:
      // إذا كان الاسم يحتوي على أي حرف أو رقم (بعد حذف المسافات لا يزال هناك محتوى)
      if (p.username.trim().length > 0) {
        processedName = p.username.trim(); // نزيل المسافات من الطرفين (أو أي منطق تريده للمسافات)
      }
      // أما إذا كان الاسم "مسافات فقط"، فسيتم تجاهل الـ trim وسيبقى كما هو (processedName = p.username)

      const currentPoints = pointsMap.get(processedName) || 0;
      pointsMap.set(processedName, currentPoints + Math.floor(p.points));
    }

    const uniqueUsernames = Array.from(pointsMap.keys());

    // --- [تحسين 1]: إنشاء مجمع للاعبين الجدد ---
    await prisma.player.createMany({
      data: uniqueUsernames.map((uname) => ({
        username: uname,
        userId: finalUserId,
      })),
      skipDuplicates: true,
    });

    // --- [تحسين 2]: جلب الـ IDs ---
    const dbPlayers = await prisma.player.findMany({
      where: {
        username: { in: uniqueUsernames },
        userId: finalUserId,
      },
      select: { id: true, username: true },
    });

    // --- [تحسين 3]: تنفيذ الـ Transaction ---
    const operations = dbPlayers.map((player) => {
      const pointsToAdd = pointsMap.get(player.username) || 0;
      return prisma.playerRoomScore.upsert({
        where: {
          playerId_roomId: {
            playerId: player.id,
            roomId: roomId,
          },
        },
        update: {
          totalScore: { increment: pointsToAdd },
          updatedAt: new Date(),
        },
        create: {
          playerId: player.id,
          roomId: roomId,
          totalScore: pointsToAdd,
        },
      });
    });

    await prisma.$transaction(operations);

    return NextResponse.json({ message: "تم التحسين والمعالجة بنجاح" });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "فشل تحديث البيانات" }, { status: 500 });
  }
}
