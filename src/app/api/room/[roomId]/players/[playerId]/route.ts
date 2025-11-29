import { NextResponse } from "next/server";

import { prisma } from "@/lib/priams";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ roomId: string; playerId: string }> }
) {
  const { roomId, playerId } = await params;

  try {
    // 1) حذف نقاط اللاعب فقط من هذه الغرفة
    await prisma.playerRoomScore.delete({
      where: {
        playerId_roomId: {
          playerId,
          roomId,
        },
      },
    });

    // 2) فحص إذا اللاعب لم يعد مرتبط بأي غرفة → نحذفه (اختياري)
    const stillExists = await prisma.playerRoomScore.findFirst({
      where: { playerId },
    });

    if (!stillExists) {
      await prisma.player.delete({
        where: { id: playerId },
      });
    }

    return NextResponse.json({ message: "Player removed successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to remove player" },
      { status: 500 }
    );
  }
}
