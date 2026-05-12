// src/app/api/global-scores/route.ts
import { prisma } from "@/lib/priams";
import { NextResponse } from "next/server";

// type PlayerData = {
//   id?: string; // يمكن ترك id اختياري لأنه سيتم دمج اللاعبين بنفس الاسم
//   username: string;
//   totalScore: number;
// };
//
// type RoomData = {
//   roomId: string;
//   roomName: string;
//   roomType: string;
//   players: PlayerData[];
// };

export async function GET() {
  try {
    // 1. جلب البيانات المطلوبة فقط (Selective Selection)
    // نستخدم select بدلاً من include لتقليل حجم البيانات القادمة من DB
    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        roomScores: {
          select: {
            totalScore: true,
            player: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const result = rooms.map((room) => {
      // 2. استخدام Map بدلاً من Object للدمج (أسرع في المعالجة)
      const merged = new Map<string, number>();

      room.roomScores.forEach((score) => {
        // تطبيق منطق المسافات الخاص بك:
        // إذا كان الاسم يحتوي محتوى، يتم عمل trim، وإلا يترك كما هو
        const rawName = score.player.username;
        const nameHasContent = rawName.trim().length > 0;
        const processedName = nameHasContent ? rawName.trim() : rawName;

        const currentPoints = merged.get(processedName) || 0;
        merged.set(processedName, currentPoints + (score.totalScore || 0));
      });

      // 3. تحويل الـ Map لمصفوفة مرتبة
      const players = Array.from(merged.entries())
        .map(([username, totalScore]) => ({
          username,
          totalScore,
        }))
        .sort((a, b) => b.totalScore - a.totalScore);

      return {
        roomId: room.id,
        roomName: room.name,
        roomType: room.type,
        players,
      };
    });

    // استخدام NextResponse.json بدلاً من JSON.stringify اليدوي (أكثر كفاءة)
    return NextResponse.json(result);
  } catch (err) {
    console.error("Fetch Points Error:", err);
    return NextResponse.json({ error: "فشل جلب النقاط" }, { status: 500 });
  }
}
