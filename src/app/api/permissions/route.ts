// app/api/permissions/route.ts
import { prisma } from "@/lib/priams";
import getUserFromAuth from "@/lib/user-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const currentUser = await getUserFromAuth();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      role: true,
    },
    orderBy: { username: "asc" },
  });

  return NextResponse.json({ users });
}

export async function PUT(req: Request) {
  const currentUser = await getUserFromAuth();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 403 });
  }

  const {
    updates,
  }: { updates: { id: string; role: "ADMIN" | "MODERATOR" | "USER" }[] } =
    await req.json();

  // منع تعديل حسابك
  const filteredUpdates = updates.filter((u) => u.id !== currentUser.userId);

  try {
    const promises = filteredUpdates.map((u) =>
      prisma.user.update({
        where: { id: u.id },
        data: { role: u.role },
      })
    );
    await Promise.all(promises);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "فشل تحديث الصلاحيات" }, { status: 500 });
  }
}
