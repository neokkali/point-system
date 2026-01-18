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

    // حذف جميع النقاط في الغرفة المحددة
    await prisma.playerRoomScore.deleteMany({
      where: { roomId: ROOM_ID },
    });

    // تنظيف اللاعبين اليتامى
    await prisma.player.deleteMany({
      where: { roomScores: { none: {} } },
    });

    return NextResponse.json({ message: "تم الحذف بنجاح" });
  } catch {
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}
