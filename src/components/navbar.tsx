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
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggleButton } from "./theme-toggle.button";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isRooms = pathname.startsWith("/rooms");

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
                      onClick={() => router.push("/super/permissions")}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      الصلاحيات
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

        <div className="flex items-center mt-0.5 gap-2">
          <Link
            href="/"
            className={cn(
              "text-base md:text-lg",
              pathname === "/" ? "font-bold" : "font-normal"
            )}
          >
            الرئيسية
          </Link>

          {!loading && isAuthenticated && (isAdmin || isModerator) && (
            <Link
              href="/rooms"
              className={cn(
                "text-base md:text-lg",
                isRooms ? "font-bold" : "font-normal"
              )}
            >
              نقاطي
            </Link>
          )}
        </div>

        {!loading && !isAuthenticated && (
          <Link href="/auth" className="">
            تسجيل الدخول
          </Link>
        )}
      </div>

      {/* عناصر اليمين */}
      <div className="flex items-center gap-4">
        <ThemeToggleButton />
      </div>
    </nav>
  );
};

export default Navbar;
