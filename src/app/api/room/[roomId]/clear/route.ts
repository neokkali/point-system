// src/app/api/room/[roomId]/clear/route.ts
import { prisma } from "@/lib/priams";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;

  try {
    // حذف جميع نقاط اللاعبين في الغرفة
    await prisma.playerRoomScore.deleteMany({
      where: { roomId },
    });

    // حذف أي لاعب لم يعد مرتبط بأي غرفة (اختياري)
    await prisma.player.deleteMany({
      where: {
        roomScores: {
          none: {}, // لا توجد نقاط مرتبطة بأي غرفة
        },
      },
    });

    return NextResponse.json({ message: "All players cleared from room" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to clear players from room" },
      { status: 500 }
    );
  }
}
