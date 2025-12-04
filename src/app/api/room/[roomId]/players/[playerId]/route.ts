// api/room/[roomId]/players/[playerId]/route.ts
import { prisma } from "@/lib/priams";
import getUserFromAuth from "@/lib/user-auth";
import { NextResponse } from "next/server";

const allowedRoles = ["OWNER", "ADMIN", "MODERATOR"];

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ roomId: string; playerId: string }> }
) {
  const user = await getUserFromAuth();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  if (!allowedRoles.includes(user.role))
    return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 403 });

  const { roomId, playerId } = await params;

  try {
    // حذف نقاط اللاعب إذا كان يخص هذا المشرف
    await prisma.playerRoomScore.deleteMany({
      where: {
        roomId,
        playerId,
        player: { userId: user.userId },
      },
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
