// api/speed/top-wpm/route.ts
import { prisma } from "@/lib/priams";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const bestWpm = await prisma.globalScore.findFirst({
      orderBy: { wpm: "desc" },
      take: 1,
      include: {
        user: { select: { username: true } },
      },
    });

    return NextResponse.json(
      { bestWpm },
      {
        status: 200,
      }
    );
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
