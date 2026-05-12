// app/api/global-scores/global-room-summary/route.ts
import { prisma } from "@/lib/priams";
import { NextResponse } from "next/server";

// نستخدم هذه الخاصية لضمان عدم تخزين استجابة قديمة في الكاش إذا تغيرت البيانات
export const revalidate = 0;

export async function GET() {
  try {
    // جلب البيانات مع اختيار الحقول المطلوبة فقط لتقليل حجم الـ JSON المرسل
    const stats = await prisma.roomSummary.findMany({
      select: {
        roomId: true, // الأيدي الخاص بالغرفة
        roomName: true, // اسم الغرفة
        totalPoints: true, // النقاط التراكمية
        updatedAt: true,
      },
      orderBy: {
        totalPoints: "desc", // ترتيب من الأكثر نقاطاً (Leaderboard)
      },
    });

    return NextResponse.json(stats, {
      status: 200,
      headers: {
        // لضمان دعم اللغة العربية بشكل صحيح
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("Home Stats Error:", err);
    return NextResponse.json(
      { error: "فشل جلب إحصائيات الشاشة الرئيسية" },
      { status: 500 },
    );
  }
}
