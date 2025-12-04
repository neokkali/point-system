// app/api/permissions/route.ts
import { prisma } from "@/lib/priams";
import getUserFromAuth from "@/lib/user-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getUserFromAuth();
  const allowedRoles = ["OWNER", "ADMIN"];

  if (!user || !allowedRoles.includes(user.role)) {
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
  const user = await getUserFromAuth();
  const allowedRoles = ["OWNER", "ADMIN"];

  if (!user || !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 403 });
  }

  const {
    updates,
  }: { updates: { id: string; role: "ADMIN" | "MODERATOR" | "USER" }[] } =
    await req.json();

  // منع تعديل حسابك نفسه
  const filteredUpdates = updates.filter((u) => u.id !== user.userId);

  // جلب بيانات المستخدمين الحاليين
  const targetUsers = await prisma.user.findMany({
    where: { id: { in: filteredUpdates.map((u) => u.id) } },
  });

  // فلترة التحديثات المسموح بها
  const allowedUpdates = filteredUpdates.filter((update) => {
    const target = targetUsers.find((t) => t.id === update.id);
    if (!target) return false;

    // OWNER يمكنه تعديل أي شخص
    if (user.role === "OWNER") return true;

    // ADMIN القواعد:
    if (user.role === "ADMIN") {
      // لا يمكن تعديل OWNER
      if (target.role === "OWNER") return false;

      // لا يمكن تعديل أي ADMIN آخر
      if (target.role === "ADMIN") return false;

      // MODERATOR أو USER يمكن تعديلهم:
      // - رفع أي شخص إلى ADMIN
      // - خفض MODERATOR → USER
      if (target.role === "MODERATOR") return true;
      if (target.role === "USER") return true;

      return false;
    }

    // أي شخص آخر ممنوع
    return false;
  });

  try {
    const promises = allowedUpdates.map((u) =>
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
