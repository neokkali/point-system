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
    // --- المرحلة 1: معالجة الأسماء وتجميع النقاط ---
    const sanitizedMap = new Map<string, number>();

    players.forEach((p) => {
      const nameHasContent = p.username.trim().length > 0;
      const processedName = nameHasContent ? p.username.trim() : p.username;

      const currentPoints = sanitizedMap.get(processedName) || 0;
      // نضمن أن الرقم صحيح Integer قبل أي عملية
      sanitizedMap.set(
        processedName,
        currentPoints + Math.floor(Number(p.points)),
      );
    });

    const uniquePlayers = Array.from(sanitizedMap.entries()).map(
      ([username, points]) => ({ username, points }),
    );

    const usernames = uniquePlayers.map((p) => p.username);

    // --- المرحلة 2: العمليات المجمعة ---
    await prisma.player.createMany({
      data: usernames.map((uname) => ({
        username: uname,
        userId: finalUserId,
      })),
      skipDuplicates: true,
    });

    const dbPlayers = await prisma.player.findMany({
      where: {
        username: { in: usernames },
        userId: finalUserId,
      },
      select: { id: true, username: true },
    });

    const playerMap = new Map(dbPlayers.map((p) => [p.username, p.id]));

    // --- المرحلة 3: التحديث المجمع (استعلام واحد فقط وبدون تكرار) ---
    if (uniquePlayers.length > 0) {
      const validEntries = uniquePlayers
        .map((p) => {
          const playerId = playerMap.get(p.username);
          return playerId ? `('${playerId}', '${roomId}', ${p.points})` : null;
        })
        .filter((entry): entry is string => entry !== null);

      if (validEntries.length > 0) {
        const values = validEntries.join(", ");

        // تنفيذ الاستعلام مرة واحدة فقط!
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

    return NextResponse.json({ message: "Success" });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
