// src/app/api/global-scores/route.ts
import { prisma } from "@/lib/priams";
import { NextResponse } from "next/server";

type PlayerData = {
  id?: string; // يمكن ترك id اختياري لأنه سيتم دمج اللاعبين بنفس الاسم
  username: string;
  totalScore: number;
};

type RoomData = {
  roomId: string;
  roomName: string;
  roomType: string;
  players: PlayerData[];
};

export async function GET() {
  try {
    // جلب كل الغرف مع سجل النقاط لكل لاعب
    const rooms = await prisma.room.findMany({
      include: {
        roomScores: {
          include: {
            player: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const result: RoomData[] = rooms.map((room) => {
      // دمج اللاعبين الذين لديهم نفس الاسم داخل نفس الغرفة
      const merged: Record<string, number> = {};

      room.roomScores.forEach((score) => {
        const name = score.player.username.trim();
        const points = score.totalScore || 0;

        if (!merged[name]) merged[name] = 0;
        merged[name] += points;
      });

      // تحويل الكائن إلى مصفوفة مرتبة حسب النقاط
      const players: PlayerData[] = Object.entries(merged)
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

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "فشل جلب النقاط" }, { status: 500 });
  }
}
