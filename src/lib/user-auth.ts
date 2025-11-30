// src/lib/user-auth.ts
import { cookies } from "next/headers";
import { verifyJWT } from "./auth";
import { prisma } from "./priams";

type UserPayload = {
  userId: string;
  username: string;
  role: "ADMIN" | "MODERATOR" | "USER";
};

const getUserFromAuth = async (): Promise<UserPayload | null> => {
  try {
    const token = (await cookies()).get("accessToken")?.value;
    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    return user ? (payload as UserPayload) : null;
  } catch {
    return null;
  }
};

export default getUserFromAuth;
