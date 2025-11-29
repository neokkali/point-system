import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { TOKEN_EXPIRED, verifyJWT } from "@/lib/auth";

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

  return NextResponse.json({
    user: { id: payload.id, username: payload.username, role: payload.role },
  });
}
