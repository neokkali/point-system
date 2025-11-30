import { prisma } from "@/lib/priams";
import getUserFromAuth from "@/lib/user-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getUserFromAuth();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "غير مصرح بالدخول إلى هذه البيانات" },
      { status: 403 }
    );
  }

  try {
    const data = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "MODERATOR"] },
      },
      include: {
        players: {
          include: {
            roomScores: {
              include: {
                room: true,
              },
              orderBy: {
                totalScore: "desc",
              },
            },
          },
        },
      },
      orderBy: {
        role: "asc",
      },
    });

    return NextResponse.json({ users: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "فشل جلب بيانات المشرفين والمدراء" },
      { status: 500 }
    );
  }
}
