// app/api/global-scores/room-summary/route.ts
import { prisma } from "@/lib/priams";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. التحقق من الهوية (Security)
  // نظام Vercel Cron يرسل التوكين تلقائياً في الـ Headers
  const authHeader = request.headers.get("authorization");
  console.log("الخام القادم من Header:", authHeader);
  console.log("المتغير المحمل في السيرفر:", process.env.CRON_SECRET);
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // 2. تجميع النقاط من جدول النقاط
    const roomAggregates = await prisma.playerRoomScore.groupBy({
      by: ["roomId"],
      _sum: {
        totalScore: true,
      },
    });

    // إذا لم تكن هناك نقاط جديدة، ننهي العملية بنجاح
    if (roomAggregates.length === 0) {
      return NextResponse.json({
        message: "No points to aggregate this week.",
      });
    }

    // 3. التحديث التراكمي في جدول RoomSummary
    const updatePromises = roomAggregates.map(async (aggregate) => {
      const newPoints = aggregate._sum.totalScore || 0;

      // جلب اسم الغرفة لضمان ظهوره بشكل صحيح في الـ Card
      const room = await prisma.room.findUnique({
        where: { id: aggregate.roomId },
        select: { name: true },
      });

      return prisma.roomSummary.upsert({
        where: { roomId: aggregate.roomId },
        update: {
          // هنا السحر: increment تضيف النقاط الجديدة للقديمة دون مسحها
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
      message: "Success: Weekly points merged into global summary.",
    });
  } catch (err) {
    console.error("Aggregation Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
