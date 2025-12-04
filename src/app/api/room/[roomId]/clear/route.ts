// src/app/api/room/[roomId]/clear/route.ts
import { prisma } from "@/lib/priams";
import getUserFromAuth from "@/lib/user-auth";
import { NextResponse } from "next/server";

const allowedRoles = ["OWNER", "ADMIN", "MODERATOR"];

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const user = await getUserFromAuth();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  if (!allowedRoles.includes(user.role))
    return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 403 });

  const { roomId } = await params;

  try {
    // حذف جميع نقاط اللاعبين الذين ينتمون لهذا المشرف فقط في الغرفة
    await prisma.playerRoomScore.deleteMany({
      where: {
        roomId,
        player: { userId: user.userId },
      },
    });

    // حذف أي لاعب لهذا المشرف لم يعد مرتبط بأي غرفة
    await prisma.player.deleteMany({
      where: {
        userId: user.userId,
        roomScores: { none: {} },
      },
    });

    return NextResponse.json({
      message: "تم تنظيف جميع لاعبيك في هذه الغرفة بنجاح",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "فشل تنظيف اللاعبين" }, { status: 500 });
  }
}
