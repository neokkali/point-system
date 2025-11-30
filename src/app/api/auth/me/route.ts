import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { TOKEN_EXPIRED, verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/priams";

export async function GET() {
  const token = (await cookies()).get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ user: null, code: "NO_TOKEN" }, { status: 401 });
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return NextResponse.json(
      { user: null, code: TOKEN_EXPIRED },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      role: true,
    },
  });

  return NextResponse.json({
    user,
  });
}
