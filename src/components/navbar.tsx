"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { LogOut, PlusCircle, Shield, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggleButton } from "./theme-toggle.button";
import UserBadge from "./user-with-badge";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isRooms = pathname.startsWith("/rooms");

  const { user, isAuthenticated, logout, loading } = useAuth();
  const isOnwer = user?.role === "OWNER";
  const isAdmin = user?.role === "ADMIN";
  const isModerator = user?.role === "MODERATOR";

  const sliceUsername = (username: string) => {
    if (!username) return "User";
    return username.length <= 5 ? username : username.slice(0, 5) + "...";
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
                {/* {(isAdmin || isModerator) && (
                  <Shield
                    className={cn(
                      "mb-1",
                      isAdmin ? "text-red-500" : "text-blue-500"
                    )}
                  />
                )} */}
                {/* {isOnwer && <Crown className="h-4 w-4 text-yellow-500" />} */}
                <UserBadge
                  name={sliceUsername(user?.username || "User")}
                  role={(user?.role as string) || ""}
                />
                {/* {sliceUsername(user?.username || "User")} */}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-60 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
              align="start"
            >
              <DropdownMenuGroup>
                {(isOnwer || isAdmin || isModerator) && (
                  <DropdownMenuItem
                    onClick={() => router.push("/super")}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Users className="w-4 h-4 opacity-70" />
                    نقاط السوابر
                  </DropdownMenuItem>
                )}
                {(isOnwer || isAdmin) && (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push("/super/permissions")}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Shield className="w-5 h-5" />
                      صلاحيات المستخدمين
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {isOnwer && (
                  <DropdownMenuItem
                    onClick={() => router.push("/rooms/create")}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <PlusCircle className="w-4 h-4 opacity-70" />
                    الغرف
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => logout()}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4 opacity-80" />
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
              pathname === "/" ? "font-bold" : "font-normal",
            )}
          >
            الرئيسية
          </Link>
          <Link
            href="/typing-speed"
            className={cn(
              "text-base md:text-lg hidden md:block",
              pathname === "/typing-speed" ? "font-bold" : "font-normal",
            )}
          >
            مدرب الطباعة
          </Link>

          {!loading &&
            isAuthenticated &&
            (isOnwer || isAdmin || isModerator) && (
              <Link
                href="/rooms"
                className={cn(
                  "text-base md:text-lg",
                  isRooms ? "font-bold" : "font-normal",
                )}
              >
                نقاطي
              </Link>
            )}
        </div>

        {!loading && !isAuthenticated && (
          <Link
            href="/auth"
            className="dark:bg-white dark:text-black text-white bg-black text-sm py-1 px-3 rounded-lg"
          >
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
