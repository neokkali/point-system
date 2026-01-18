// src/app/api/room/[roomId]/clear/route.ts
import { prisma } from "@/lib/priams";
import getUserFromAuth from "@/lib/user-auth";
import { NextResponse } from "next/server";

const allowedRoles = ["OWNER"];
const ROOM_ID = "82392cb6-78b2-4ea8-949f-484ba86b1e56";

export async function DELETE(req: Request) {
  try {
    const user = await getUserFromAuth();
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    if (!allowedRoles.includes(user.role))
      return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 403 });

    // 1. حذف جميع النقاط المرتبطة بهذه الغرفة لكل اللاعبين والمشرفين
    await prisma.playerRoomScore.deleteMany({
      where: {
        roomId: ROOM_ID,
      },
    });

    // 2. اختياري: حذف اللاعبين الذين ليس لديهم أي سجلات نقاط في أي غرفة أخرى (تنظيف قاعدة البيانات)
    await prisma.player.deleteMany({
      where: {
        roomScores: { none: {} },
      },
    });

    return NextResponse.json({
      message: "تم حذف جميع النقاط في هذه الغرفة بنجاح لجميع المستخدمين",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "فشل مسح بيانات الغرفة" },
      { status: 500 },
    );
  }
}
