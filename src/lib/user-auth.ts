// src/lib/user-auth.ts
import { cookies } from "next/headers";
import { verifyJWT } from "./auth";

type UserPayload = {
  userId: string;
  username: string;
  role: "ADMIN" | "MODERATOR" | "USER";
};

const getUserFromAuth = async (): Promise<UserPayload | null> => {
  try {
    const token = (await cookies()).get("accessToken")?.value;
    if (!token) return null;

    const payload = (await verifyJWT(token)) as UserPayload | null;
    if (!payload) return null;

    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };
  } catch {
    return null;
  }
};

export default getUserFromAuth;
