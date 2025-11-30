import { prisma } from "@/lib/priams";
import getUserFromAuth from "@/lib/user-auth";
import { NextResponse } from "next/server";

const allowedRoles = ["ADMIN", "MODERATOR"];

// ------------------- POST: إضافة/تحديث اللاعبين -------------------
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

          if (p.id) {
            // تحديث اللاعب فقط إذا يخص المشرف
            const updatedCount = await prisma.player.updateMany({
              where: { id: p.id, userId: user.userId },
              data: { username: p.username },
            });

            if (updatedCount.count === 0) {
              throw new Error(`لا يمكن تعديل اللاعب ${p.id} ليس ملكك`);
            }

            player = await prisma.player.findUnique({ where: { id: p.id } });
          } else {
            // إنشاء لاعب جديد مرتبط بالمشرف
            player = await prisma.player.create({
              data: { username: p.username, userId: user.userId },
            });
          }

          // إضافة أو تحديث النقاط في الغرفة
          await prisma.playerRoomScore.upsert({
            where: { playerId_roomId: { playerId: player!.id, roomId } },
            update: { totalScore: p.points },
            create: { playerId: player!.id, roomId, totalScore: p.points },
          });
        }
      )
    );

    return NextResponse.json({ message: "تم تحديث اللاعبين بنجاح" });
  } catch (err) {
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
      player: { userId: user.userId }, // فقط لاعبين هذا المشرف
    },
    include: { player: true },
    orderBy: { totalScore: "desc" },
  });

  const players = playerScores.map((ps) => ({
    id: ps.playerId,
    username: ps.player.username,
    totalScore: ps.totalScore,
  }));

  return NextResponse.json(players);
}

// ------------------- DELETE: حذف لاعب واحد لغرفة لمشرف محدد -------------------
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ roomId: string; playerId: string }> }
) {
  const user = await getUserFromAuth();
  if (!user)
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
  if (!allowedRoles.includes(user.role))
    return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 403 });

  const { roomId, playerId } = await params;

  try {
    // حذف نقاط اللاعب إذا كان يخص هذا المشرف
    await prisma.playerRoomScore.deleteMany({
      where: { roomId, playerId, player: { userId: user.userId } },
    });

    // حذف اللاعب إذا لم يعد مرتبط بأي غرفة
    const stillExists = await prisma.playerRoomScore.findFirst({
      where: { playerId, player: { userId: user.userId } },
    });
    if (!stillExists) {
      await prisma.player.deleteMany({
        where: { id: playerId, userId: user.userId },
      });
    }

    return NextResponse.json({ message: "تم حذف اللاعب بنجاح" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "فشل حذف اللاعب" }, { status: 500 });
  }
}
