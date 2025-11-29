// app/api/auth/register/route.ts
// export const runtime = 'nodejs'; // 👈🏻 هام جداً لعمل Prisma

import { NextResponse } from "next/server";
// import { prisma } from '@/lib/prisma';
import { prisma } from "@/lib/priams";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json(
        { message: "المستخدم موجود مسبقاً" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "تم إنشاء الحساب بنجاح" });
  } catch (error) {
    // 👈🏻 الإصلاح: ضمان إرسال رسالة نصية (String) بدلاً من كائن (Object)
    const errorMessage =
      error instanceof Error ? error.message : "حدث خطأ غير معروف في السيرفر.";

    return NextResponse.json(
      { message: `فشل التسجيل: ${errorMessage}` },
      { status: 500 }
    );
  }
}
