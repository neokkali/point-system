import { prisma } from "@/lib/priams";
import getUserFromAuth from "@/lib/user-auth";
import { NextResponse } from "next/server";

const allowedRoles = ["OWNER", "ADMIN", "MODERATOR"];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const user = await getUserFromAuth();

  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (!allowedRoles.includes(user.role))
    return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 403 });

  try {
    const { players } = await req.json();

    await Promise.all(
      players.map(
        async (p: { id?: string; username: string; points: number }) => {
          let player;

          // ----------------------------------------------------
          // 1) تحديث لاعب موجود (بشرط أن يكون للمشرف نفسه)
          // ----------------------------------------------------
          if (p.id) {
            const updated = await prisma.player.updateMany({
              where: { id: p.id, userId: user.userId },
              data: { username: p.username },
            });

            if (updated.count === 0) {
              throw new Error(`لا يمكن تعديل اللاعب لأنه ليس ملكك`);
            }

            player = await prisma.player.findUnique({ where: { id: p.id } });
          }

          // ----------------------------------------------------
          // 2) البحث عن لاعب بنفس الاسم لنفس المشرف - إن لم يوجد ننشئه
          // ----------------------------------------------------
          else {
            player = await prisma.player.findFirst({
              where: {
                username: p.username,
                userId: user.userId,
              },
            });

            if (!player) {
              player = await prisma.player.create({
                data: {
                  username: p.username,
                  userId: user.userId,
                },
              });
            }
          }

          // ----------------------------------------------------
          // 3) إضافة أو تحديث النقاط في الغرفة
          // ----------------------------------------------------
          await prisma.playerRoomScore.upsert({
            where: {
              playerId_roomId: {
                playerId: player!.id,
                roomId,
              },
            },
            update: { totalScore: p.points },
            create: {
              playerId: player!.id,
              roomId,
              totalScore: p.points,
            },
          });
        }
      )
    );

    return NextResponse.json({ message: "تم تحديث اللاعبين بنجاح" });
  } catch (err) {
    console.error("ERR:", err);
    return NextResponse.json({ error: err || "فشل التحديث" }, { status: 500 });
  }
}

// ------------------- GET: جلب اللاعبين لمشرف محدد -------------------
export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  if (!roomId)
    return NextResponse.json({ error: "roomId غير موجود" }, { status: 400 });

  const user = await getUserFromAuth();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const playerScores = await prisma.playerRoomScore.findMany({
    where: {
      roomId,
      player: { userId: user.userId },
    },
    select: {
      totalScore: true,
      player: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: { totalScore: "desc" },
  });

  const players = playerScores.map((ps) => ({
    id: ps.player.id,
    username: ps.player.username,
    totalScore: ps.totalScore,
  }));

  return NextResponse.json(players);
}

const SECRET_KEY = "MY_SUPER_SECRET_TOKEN"; // نفس المفتاح في كود البايثون
export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const botAuthToken = req.headers.get("x-bot-secret");
  const body = await req.json();

  let finalUserId: string;

  // 1. نظام التوثيق المزدوج (هيدر للبوت أو جلسة للمشرف)
  if (botAuthToken === SECRET_KEY) {
    finalUserId = body.adminUserId; // نأخذ الايدي المرسل من البايثون يدوياً
  } else {
    const user = await getUserFromAuth();
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    finalUserId = user.userId;
  }

  try {
    const { players } = body; // مصفوفة اللاعبين من البايثون

    await Promise.all(
      players.map(async (p: { username: string; points: number }) => {
        // البحث عن اللاعب أو إنشاؤه إذا لم يوجد تحت هذا المشرف
        let player = await prisma.player.findFirst({
          where: {
            username: p.username,
            userId: finalUserId,
          },
        });

        if (!player) {
          player = await prisma.player.create({
            data: {
              username: p.username,
              userId: finalUserId,
            },
          });
        }

        // تحديث النقاط في الغرفة (إضافة النقاط الجديدة للقديمة أو استبدالها)
        await prisma.playerRoomScore.upsert({
          where: {
            playerId_roomId: {
              playerId: player.id,
              roomId: roomId,
            },
          },
          update: {
            totalScore: { increment: p.points }, // استخدم increment لجمع النقاط
          },
          create: {
            playerId: player.id,
            roomId: roomId,
            totalScore: p.points,
          },
        });
      })
    );

    return NextResponse.json({ message: "تمت العملية بنجاح" });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "فشل تحديث البيانات" }, { status: 500 });
  }
}
