// /app/api/rooms/route.ts
import { prisma } from "@/lib/priams";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    return NextResponse.json(rooms);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "فشل جلب الغرف" }, { status: 500 });
  }
}
