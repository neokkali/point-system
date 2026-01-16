// src/app/api/room/[roomId]/clear/route.ts
import { prisma } from "@/lib/priams";
import { NextResponse } from "next/server";

const ROOM_ID = "82392cb6-78b2-4ea8-949f-484ba86b1e56";
const ADMIN_ID = "f58012fd-7d4c-4fc1-a6b4-78d1d70d6e7f";

export async function DELETE(req: Request) {
  try {
    // حذف جميع نقاط اللاعبين الذين ينتمون لهذا المشرف فقط في الغرفة
    await prisma.playerRoomScore.deleteMany({
      where: {
        roomId: ROOM_ID,
        player: { userId: ADMIN_ID },
      },
    });

    // حذف أي لاعب لهذا المشرف لم يعد مرتبط بأي غرفة
    await prisma.player.deleteMany({
      where: {
        userId: ADMIN_ID,
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
