import { signJWT, signRefreshToken } from "@/lib/auth";
import { prisma } from "@/lib/priams";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    // إنشاء التوكن
    const accessToken = await signJWT({
      userId: user.id,
      role: user.role,
      username: user.username,
    });
    const refreshToken = await signRefreshToken({ userId: user.id });

    // تخزين التوكن في الكوكيز
    (await cookies()).set("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 2592000,
    });

    (await cookies()).set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 2678400, // 👈🏻 تم التعديل: 30 يومًا (30 * 24 * 60 * 60)
    });

    return NextResponse.json({
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch {
    return NextResponse.json({ message: "خطأ في السيرفر" }, { status: 500 });
  }
}
