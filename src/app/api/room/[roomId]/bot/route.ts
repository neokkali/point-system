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
    // --- المرحلة 1: معالجة الأسماء وتجميع النقاط برمجياً ---
    const sanitizedMap = new Map<string, number>();

    players.forEach((p) => {
      // المنطق: إذا كان الاسم بعد الحذف فارغاً (يعني كله مسافات)، اتركه كما هو.
      // غير ذلك، قم بعمل trim.
      const nameHasContent = p.username.trim().length > 0;
      const processedName = nameHasContent ? p.username.trim() : p.username;

      const currentPoints = sanitizedMap.get(processedName) || 0;
      sanitizedMap.set(processedName, currentPoints + p.points);
    });

    const uniquePlayers = Array.from(sanitizedMap.entries()).map(
      ([username, points]) => ({
        username,
        points,
      }),
    );

    const usernames = uniquePlayers.map((p) => p.username);

    // --- المرحلة 2: العمليات المجمعة على قاعدة البيانات (السرعة القصوى) ---

    // 1. إنشاء اللاعبين غير الموجودين دفعة واحدة (Batch Create)
    // نستخدم skipDuplicates لضمان عدم حدوث خطأ إذا كان اللاعب موجوداً مسبقاً
    await prisma.player.createMany({
      data: usernames.map((uname) => ({
        username: uname,
        userId: finalUserId,
      })),
      skipDuplicates: true,
    });

    // 2. جلب جميع الـ IDs في استعلام واحد فقط
    const dbPlayers = await prisma.player.findMany({
      where: {
        username: { in: usernames },
        userId: finalUserId,
      },
      select: { id: true, username: true },
    });

    const playerMap = new Map(dbPlayers.map((p) => [p.username, p.id]));

    // 3. تحديث النقاط داخل Transaction واحد
    // هذا الجزء هو الذي يوفر 90% من الوقت مقارنة بالـ Promise.all العادي
    // --- المرحلة 3 (المحسنة جداً): تحديث النقاط باستعلام واحد خام ---
    // --- المرحلة 3 (المؤمنة ضد أخطاء 500 والتضارب) ---
    if (uniquePlayers.length > 0) {
      // 1. تصفية اللاعبين: نأخذ فقط من نجد له ID حقيقي في الخريطة
      const validEntries = uniquePlayers
        .map((p) => {
          const playerId = playerMap.get(p.username);
          return playerId ? `('${playerId}', '${roomId}', ${p.points})` : null;
        })
        .filter((entry): entry is string => entry !== null);

      // 2. التنفيذ فقط إذا كانت هناك بيانات صالحة
      if (validEntries.length > 0) {
        const values = validEntries.join(", ");

        await prisma.$executeRawUnsafe(`
          INSERT INTO "PlayerRoomScore" ("playerId", "roomId", "totalScore", "updatedAt")
          VALUES ${values}
          ON CONFLICT ("playerId", "roomId") 
          DO UPDATE SET 
            "totalScore" = "PlayerRoomScore"."totalScore" + EXCLUDED."totalScore",
            "updatedAt" = CURRENT_TIMESTAMP;
        `);
      }
    }

    return NextResponse.json({ message: "تمت المعالجة بنجاح وسرعة فائقة" });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "فشل تحديث البيانات" }, { status: 500 });
  }
}
