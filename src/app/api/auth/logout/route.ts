import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  // حذف Access Token
  cookieStore.delete("accessToken");

  // حذف Refresh Token
  cookieStore.delete("refreshToken");

  return NextResponse.json({ message: "تم تسجيل الخروج بنجاح" });
}
