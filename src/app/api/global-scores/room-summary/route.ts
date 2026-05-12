// app/api/global-scores/room-summary/route.ts
import { prisma } from "@/lib/priams";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. استخدام groupBy لجعل قاعدة البيانات تحسب المجموع (Optimized)
    // هذا أسرع بكثير لأنه يقلل من حجم البيانات المنقولة من DB إلى الـ API
    const roomAggregates = await prisma.playerRoomScore.groupBy({
      by: ["roomId"],
      _sum: {
        totalScore: true,
      },
    });

    // 2. تحديث جدول RoomSummary بشكل تراكمي
    const updatePromises = roomAggregates.map(async (aggregate) => {
      const newPoints = aggregate._sum.totalScore || 0;

      // جلب اسم الغرفة (اختياري لضمان دقة البيانات)
      const room = await prisma.room.findUnique({
        where: { id: aggregate.roomId },
        select: { name: true },
      });

      return prisma.roomSummary.upsert({
        where: { roomId: aggregate.roomId },
        update: {
          // التراكم: إضافة النقاط الجديدة للموجودة مسبقاً باستخدام increment
          totalPoints: {
            increment: newPoints,
          },
          roomName: room?.name || "Unknown",
        },
        create: {
          roomId: aggregate.roomId,
          roomName: room?.name || "Unknown",
          totalPoints: newPoints,
        },
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: "تم تحديث النقاط بنجاح (إضافة تراكمية)",
    });
  } catch (err) {
    console.error("Aggregation Error:", err);
    return NextResponse.json({ error: "فشل تحديث البيانات" }, { status: 500 });
  }
}
