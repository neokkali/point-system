import { NextResponse } from "next/server";

import { prisma } from "@/lib/priams";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;

  try {
    const { players } = await req.json();
    // players: [{ id?, username, points }]

    await Promise.all(
      players.map(
        async (p: { id?: string; username: string; points: number }) => {
          let player;

          // إذا لديه ID → تحديث فقط
          if (p.id) {
            player = await prisma.player.update({
              where: { id: p.id },
              data: { username: p.username }, // ← يسمح بتعديل الاسم
            });
          } else {
            // إذا بدون ID → إنشاء لاعب جديد
            player = await prisma.player.create({
              data: { username: p.username },
            });
          }

          await prisma.playerRoomScore.upsert({
            where: { playerId_roomId: { playerId: player.id, roomId } },
            update: { totalScore: p.points },
            create: { playerId: player.id, roomId, totalScore: p.points },
          });
        }
      )
    );

    return NextResponse.json({ message: "Players updated successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ roomId: string }> } // ← هنا Promise
) {
  const { roomId } = await context.params; // ← تفكيك الـ Promise
  if (!roomId) {
    return NextResponse.json({ error: "roomId غير موجود" }, { status: 400 });
  }

  const playerScores = await prisma.playerRoomScore.findMany({
    where: { roomId },
    include: { player: true },
    orderBy: { totalScore: "desc" },
  });

  const players = playerScores.map((ps) => ({
    id: ps.playerId,
    username: ps.player.username,
    totalScore: ps.totalScore,
  }));

  return NextResponse.json(players);
}

// export async function DELETE(
//   req: Request,
//   { params }: { params: Promise<{ roomId: string; playerId: string }> }
// ) {
//   const { roomId, playerId } = await params;

//   try {
//     // 1) حذف نقاط اللاعب فقط من هذه الغرفة
//     await prisma.playerRoomScore.delete({
//       where: {
//         playerId_roomId: {
//           playerId,
//           roomId,
//         },
//       },
//     });

//     // 2) فحص إذا اللاعب لم يعد مرتبط بأي غرفة → نحذفه (اختياري)
//     const stillExists = await prisma.playerRoomScore.findFirst({
//       where: { playerId },
//     });

//     if (!stillExists) {
//       await prisma.player.delete({
//         where: { id: playerId },
//       });
//     }

//     return NextResponse.json({ message: "تم حذف اللاعب نجاح" });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to remove player" },
//       { status: 500 }
//     );
//   }
// }
