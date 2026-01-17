import { prisma } from "@/lib/priams";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.user.findMany({
      where: {
        role: { in: ["OWNER", "ADMIN", "MODERATOR"] },
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
      { status: 500 },
    );
  }
}
