// /app/api/rooms/route.ts
import { prisma } from "@/lib/priams";
import getUserFromAuth from "@/lib/user-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getUserFromAuth();
  try {
    if (!user || user.role.toUpperCase() !== "ADMIN") {
      return NextResponse.json(
        { error: "غير مصرح بإنشاء غرفة" },
        { status: 403 }
      );
    }

    const { name, type } = await req.json();

    // التحقق من البيانات
    if (!name || !type) {
      return NextResponse.json(
        { error: "يجب توفير اسم ونوع الغرفة" },
        { status: 400 }
      );
    }

    // التحقق من صحة الـ enum
    if (!["ARTICLE", "QUIZ"].includes(type)) {
      return NextResponse.json(
        { error: "نوع الغرفة غير صالح" },
        { status: 400 }
      );
    }

    // إنشاء الغرفة
    const newRoom = await prisma.room.create({
      data: {
        name,
        type,
      },
    });

    return NextResponse.json(newRoom);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "فشل إنشاء الغرفة" }, { status: 500 });
  }
}

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
