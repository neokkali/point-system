import { prisma } from "@/lib/priams";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // جلب كل السجلات مع معلومات اللاعب
    const scores = await prisma.playerRoomScore.findMany({
      include: {
        player: true,
      },
    });

    // دمج النقاط حسب اسم اللاعب
    const merged: Record<string, number> = {};

    scores.forEach((item) => {
      const name = item.player.username.trim(); // اسم اللاعب
      const points = item.totalScore || 0; // <= هنا التعديل

      if (!merged[name]) merged[name] = 0;
      merged[name] += points;
    });

    // تحويل الكائن إلى مصفوفة مرتبة
    const result = Object.entries(merged)
      .map(([username, totalScore]) => ({
        username,
        totalScore,
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "فشل جلب النقاط" }, { status: 500 });
  }
}
