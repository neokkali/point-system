import { prisma } from "@/lib/priams";
import { NextResponse } from "next/server";

const SECRET_KEY = "MY_SUPER_SECRET_TOKEN";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;

    const botAuthToken = req.headers.get("x-bot-secret");

    if (botAuthToken !== SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const finalUserId = body.adminUserId;

    const players: { username: string; points: number }[] = body.players;

    if (!players?.length) {
      return NextResponse.json({
        message: "No players",
      });
    }

    // تنظيف البيانات + إزالة التكرار
    const mergedPlayers = new Map<string, number>();

    const isOnlyWhitespace = (str: string) => /^[\s\u00A0\t\r\n]*$/.test(str);
    const hasContent = (str: string) => /[^\s\u00A0\t\r\n]/.test(str);

    for (const p of players) {
      if (typeof p.username !== "string") continue;

      let cleanUsername = p.username;

      if (hasContent(cleanUsername)) {
        cleanUsername = cleanUsername
          .normalize("NFKC")
          .replace(/[\u00A0\t\r\n]+/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      } else if (isOnlyWhitespace(cleanUsername)) {
        // لا تعديل إطلاقًا
        cleanUsername = p.username;
      }

      const old = mergedPlayers.get(cleanUsername) || 0;

      mergedPlayers.set(cleanUsername, old + (p.points || 0));
    }

    const usernames = [...mergedPlayers.keys()];

    // إنشاء اللاعبين غير الموجودين دفعة واحدة
    await prisma.player.createMany({
      data: usernames.map((username) => ({
        username,
        userId: finalUserId,
      })),
      skipDuplicates: true,
    });

    // جلب كل اللاعبين دفعة واحدة
    const dbPlayers = await prisma.player.findMany({
      where: {
        userId: finalUserId,
        username: {
          in: usernames,
        },
      },
      select: {
        id: true,
        username: true,
      },
    });

    const playerMap = new Map(dbPlayers.map((p) => [p.username, p.id]));

    // تجهيز العمليات دفعة واحدة
    const operations = [];

    for (const [username, points] of mergedPlayers.entries()) {
      const playerId = playerMap.get(username);

      if (!playerId) continue;

      operations.push(
        prisma.playerRoomScore.upsert({
          where: {
            playerId_roomId: {
              playerId,
              roomId,
            },
          },
          update: {
            totalScore: {
              increment: points,
            },
          },
          create: {
            playerId,
            roomId,
            totalScore: points,
          },
        }),
      );
    }

    // تنفيذ جماعي داخل transaction
    await prisma.$transaction(operations);

    return NextResponse.json({
      message: "تمت العملية بنجاح",
    });
  } catch (err) {
    console.error("DB Error:", err);

    return NextResponse.json({ error: "فشل تحديث البيانات" }, { status: 500 });
  }
}
