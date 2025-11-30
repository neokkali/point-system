"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { ThemeToggleButton } from "./theme-toggle.button";

const Navbar = () => {
  const router = useRouter();

  const { user, isAuthenticated, logout, loading } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isModerator = user?.role === "MODERATOR";

  const sliceUsername = (username: string) => {
    if (!username) return "User";
    return username.length <= 8 ? username : username.slice(0, 8) + "...";
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 shadow-md">
      {/* الشعار أو اسم النظام */}
      <div className="flex items-center gap-4">
        {!loading && isAuthenticated && (isAdmin || isModerator) && (
          <Link
            href="/rooms"
            className="text-xl font-bold text-gray-800 dark:text-white"
          >
            نقاطي
          </Link>
        )}

        {/* قائمة Dropdown */}
        {!loading && isAuthenticated && (
          <DropdownMenu dir="rtl" modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full px-4">
                {sliceUsername(user?.username || "User")}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-60 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
              align="start"
            >
              <DropdownMenuGroup>
                {isAdmin && (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push("/super")}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      السوابر
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/rooms/create")}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      الغرف
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuItem
                  onClick={() => logout()}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* زر تسجيل الدخول: يظهر فقط إن لم يكن loading + غير مصرح */}
        {!loading && !isAuthenticated && (
          <Link href="/auth" className="">
            تسجيل الدخول
          </Link>
        )}
      </div>

      {/* عناصر اليمين */}
      <div className="flex items-center gap-4">
        <Link href="/" className="text-lg">
          الرئيسية
        </Link>
        <ThemeToggleButton />
      </div>
    </nav>
  );
};

export default Navbar;
