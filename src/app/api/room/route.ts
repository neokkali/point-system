import { prisma } from "@/lib/priams";
import { NextResponse } from "next/server";

const SECRET_KEY = "MY_SUPER_SECRET_TOKEN"; // نفس المفتاح في كود البايثون
export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  const botAuthToken = req.headers.get("x-bot-secret");
  const body = await req.json();

  let finalUserId: string;

  // 1. نظام التوثيق المزدوج (هيدر للبوت أو جلسة للمشرف)
  if (botAuthToken === SECRET_KEY) {
    finalUserId = body.adminUserId; // نأخذ الايدي المرسل من البايثون يدوياً
  }

  try {
    const { players } = body; // مصفوفة اللاعبين من البايثون

    await Promise.all(
      players.map(async (p: { username: string; points: number }) => {
        // البحث عن اللاعب أو إنشاؤه إذا لم يوجد تحت هذا المشرف
        let player = await prisma.player.findFirst({
          where: {
            username: p.username,
            userId: finalUserId,
          },
        });

        if (!player) {
          player = await prisma.player.create({
            data: {
              username: p.username,
              userId: finalUserId,
            },
          });
        }

        // تحديث النقاط في الغرفة (إضافة النقاط الجديدة للقديمة أو استبدالها)
        await prisma.playerRoomScore.upsert({
          where: {
            playerId_roomId: {
              playerId: player.id,
              roomId: roomId,
            },
          },
          update: {
            totalScore: { increment: p.points }, // استخدم increment لجمع النقاط
          },
          create: {
            playerId: player.id,
            roomId: roomId,
            totalScore: p.points,
          },
        });
      }),
    );

    return NextResponse.json({ message: "تمت العملية بنجاح" });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "فشل تحديث البيانات" }, { status: 500 });
  }
}
