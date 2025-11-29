// app/api/auth/refresh/route.ts

// 👈🏻 هام جداً: ضمان التشغيل في بيئة Node.js لعمل Prisma

import { signJWT, verifyRefreshToken } from "@/lib/auth";
import { prisma } from "@/lib/priams";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // 1. التحقق من وجود Refresh Token
  if (!refreshToken) {
    return NextResponse.json(
      { message: "غير مصرح: لا يوجد توكن تجديد" },
      { status: 401 }
    );
  }

  // 2. التحقق من صلاحية Refresh Token
  const payload = await verifyRefreshToken(refreshToken);

  // إذا كان التوكن غير صالح أو منتهي الصلاحية
  if (!payload) {
    // حذف التوكنات المنتهية لضمان تسجيل الخروج الكامل
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    return NextResponse.json(
      { message: "غير مصرح: توكن التجديد غير صالح" },
      { status: 401 }
    );
  }

  // 3. التحقق من وجود المستخدم في قاعدة البيانات
  // نعتمد على user ID الموجود في Payload
  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
  });

  if (!user) {
    return NextResponse.json(
      { message: "غير مصرح: المستخدم غير موجود" },
      { status: 401 }
    );
  }

  // 4. إنشاء Access Token جديد
  const newAccessToken = await signJWT({
    userId: user.id,
    role: user.role,
    username: user.username,
  });

  // 5. تعيين Access Token الجديد في الكوكيز
  cookieStore.set("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 900, // 15 دقيقة
  });

  return NextResponse.json({ message: "تم تجديد التوكن بنجاح" });
}
