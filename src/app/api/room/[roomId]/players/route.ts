import { prisma } from "@/lib/priams";
import getUserFromAuth from "@/lib/user-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const user = await getUserFromAuth();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { roomId } = await params;

  try {
    // جلب نقاط المتسابقين في هذه الغرفة والذين يتبعون لهذا المستخدم (المشرف)
    const playersInRoom = await prisma.playerRoomScore.findMany({
      where: {
        roomId: roomId,
        player: {
          userId: user.userId, // تصفية اللاعبين التابعين للمستخدم الحالي فقط
        },
      },
      include: {
        player: {
          select: {
            username: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        totalScore: "desc", // ترتيب من الأعلى نقاطاً إلى الأقل
      },
    });

    return NextResponse.json(playersInRoom);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "فشل جلب البيانات" }, { status: 500 });
  }
}
