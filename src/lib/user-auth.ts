// src/lib/user-auth.ts
import { cookies } from "next/headers";
import { verifyJWT } from "./auth";
import { prisma } from "./priams";

export type UserPayload = {
  userId: string;
  username: string;
  role: "ADMIN" | "MODERATOR" | "USER";
};

const getUserFromAuth = async (): Promise<UserPayload | null> => {
  try {
    // جلب التوكن من الكوكيز
    const token = (await cookies()).get("accessToken")?.value;
    if (!token) return null;

    // التحقق من صلاحية التوكن
    const payload = await verifyJWT(token);
    if (!payload) return null;

    // جلب المستخدم من قاعدة البيانات للتأكد من الدور
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    if (!user) return null;

    // إرجاع معلومات المستخدم بما في ذلك الدور
    return {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
  } catch {
    // console.error("getUserFromAuth error:", err);
    return null;
  }
};

export default getUserFromAuth;
