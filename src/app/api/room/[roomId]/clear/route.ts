// src/app/api/room/[roomId]/clear/route.ts
import { prisma } from "@/lib/priams";
import getUserFromAuth from "@/lib/user-auth";
import { NextResponse } from "next/server";

const allowedRoles = ["OWNER", "ADMIN", "MODERATOR"];

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const user = await getUserFromAuth();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  if (!allowedRoles.includes(user.role))
    return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 403 });

  const { roomId } = await params;

  try {
    // استخدام الترانزاكشن لضمان السرعة والتكامل
    await prisma.$transaction(async (tx) => {
      // 1. حذف النقاط الخاصة بلاعبي هذا المشرف في هذه الغرفة
      await tx.playerRoomScore.deleteMany({
        where: {
          roomId: roomId,
          player: { userId: user.userId },
        },
      });

      // 2. حذف اللاعبين الذين ليس لديهم أي نقاط في أي غرفة (Cleanup)
      // هذا الاستعلام سيحذف فقط من ينتمون لهذا المستخدم ولا يملكون أي سجلات نقاط
      await tx.player.deleteMany({
        where: {
          userId: user.userId,
          roomScores: {
            none: {},
          },
        },
      });
    });

    return NextResponse.json({
      message: "تم تنظيف بيانات لاعبيك بنجاح",
    });
  } catch (err) {
    console.error("Delete Error:", err);
    return NextResponse.json({ error: "فشل تنظيف اللاعبين" }, { status: 500 });
  }
}
