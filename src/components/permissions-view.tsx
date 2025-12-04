"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import api from "@/lib/axiosClient";
import { useAuth } from "@/providers/auth-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown, Loader2, Shield, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DotLoader } from "./app-loader";

// ------------------------
// أنواع الأدوار
// ------------------------
export type UserRole = "OWNER" | "ADMIN" | "MODERATOR" | "USER";

type User = {
  id: string;
  username: string;
  role: UserRole;
};

// ------------------------
// خيارات الصلاحيات
// ------------------------
const ROLE_OPTIONS: {
  role: UserRole;
  label: string;
  description: string;
}[] = [
  {
    role: "ADMIN",
    label: "مدير",
    description: "وصول كامل للوحة التحكم والإعدادات.",
  },
  {
    role: "MODERATOR",
    label: "مشرف",
    description: "إدارة اللاعبين والنقاط فقط.",
  },
  {
    role: "USER",
    label: "مستخدم",
    description: "وصول محدود بدون تحكم.",
  },
];

// ------------------------
// من يمكنه تعديل من؟
// currentRole: دور المستخدم الذي يقوم بالتعديل
// targetRole: دور المستخدم المراد تعديله
// newRole: الدور الذي يحاول تعيينه
// ------------------------
export function canEditUser(
  currentRole: UserRole,
  targetRole: UserRole,
  newRole: UserRole
): boolean {
  if (currentRole === "OWNER") return true;

  if (currentRole === "ADMIN") {
    if (targetRole === "OWNER") return false; // لا يمكن تعديل OWNER
    if (targetRole === "ADMIN" && targetRole !== newRole) return false; // لا يمكن خفض ADMIN آخر
    return true; // يمكن الترقية أو تعديل MODERATOR/USER
  }

  if (currentRole === "MODERATOR") {
    if (targetRole === "USER") return true;
    return false;
  }

  return false;
}

// ------------------------
// تلوين شارة الدور
// ------------------------
const getRoleVariant = (role: UserRole) => {
  switch (role) {
    case "OWNER":
      return "default";
    case "ADMIN":
      return "destructive";
    case "MODERATOR":
      return "default";
    case "USER":
      return "secondary";
    default:
      return "secondary";
  }
};

export default function PermissionsView() {
  useAuthGuard(["OWNER", "ADMIN"], "/auth", "/");

  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [localRoles, setLocalRoles] = useState<Record<string, UserRole>>({});

  // ------------------------
  // تحميل المستخدمين
  // ------------------------
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await api.get("/permissions");
      const usersData = res.data.users as User[];

      const initRoles: Record<string, UserRole> = {};
      usersData.forEach((u) => (initRoles[u.id] = u.role));

      setLocalRoles(initRoles);
      return usersData;
    },
    enabled: !!currentUser,
  });

  const sortedNumbers: Record<string, number> = {
    ONWER: 0,
    ADMIN: 1,
    MODERATOR: 2,
    USER: 3,
  };

  const sortedUsers = users?.slice().sort((a, b) => {
    return sortedNumbers[a.role] - sortedNumbers[b.role];
  });

  // ------------------------
  // تحديث الصلاحيات
  // ------------------------
  const mutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(localRoles).map(([id, role]) => ({
        id,
        role,
      }));
      await api.put("/permissions", { updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("✅ تم تحديث الصلاحيات بنجاح.");
    },
    onError: () => {
      toast.error("❌ فشل التحديث.");
    },
  });

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col justify-center items-center">
        <DotLoader size="lg" text="جاري تحميل قائمة المستخدمين" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6 p-4 md:p-0">
      <Card className="border shadow-lg dark:border-gray-800">
        <CardHeader className="flex flex-row items-center gap-3 border-b dark:border-gray-800 p-4 md:p-6">
          <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <CardTitle className="text-xl md:text-2xl font-bold">
            إدارة صلاحيات المستخدمين
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto p-0">
          <table className="w-full table-fixed border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr className="text-sm text-gray-600 dark:text-gray-400 uppercase">
                <th className="w-[30%] p-4 text-right border-b dark:border-gray-800">
                  <Users className="inline w-4 h-4 ml-1" /> الاسم
                </th>
                {ROLE_OPTIONS.map((r) => (
                  <th
                    key={r.role}
                    className="w-[20%] p-4 text-center border-b dark:border-gray-800"
                  >
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sortedUsers?.map((u) => {
                const isCurrent = currentUser?.id === u.id;
                const originalRole = u.role as UserRole; // الدور من قاعدة البيانات
                const currentRole = localRoles[u.id] as UserRole;
                const isChanged = currentRole !== originalRole;

                const isOwnerLocked =
                  u.role === "OWNER" && currentUser?.role !== "OWNER";

                return (
                  <tr
                    key={u.id}
                    className={`
                      border-b dark:border-gray-800
                      ${
                        isOwnerLocked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }
                      ${isCurrent ? "bg-indigo-50/50 dark:bg-gray-700/30" : ""}
                    `}
                  >
                    {/* اسم المستخدم */}
                    <td className="p-4 flex items-center gap-2">
                      <span className="text-gray-900 dark:text-gray-100">
                        {u.username}
                      </span>

                      {u.role === "OWNER" && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}

                      {isCurrent && (
                        <Badge
                          variant="secondary"
                          className="bg-gray-300 dark:bg-gray-600 text-xs"
                        >
                          أنت
                        </Badge>
                      )}

                      {isChanged && (
                        <Badge
                          variant="outline"
                          className="text-xs border-dashed text-orange-500 border-orange-300"
                        >
                          لم يُحفظ
                        </Badge>
                      )}
                    </td>

                    {/* خيارات الدور */}
                    {ROLE_OPTIONS.map((roleOption) => {
                      const allowEdit = currentUser
                        ? canEditUser(
                            currentUser.role as UserRole,
                            u.role as UserRole,
                            roleOption.role as UserRole
                          )
                        : false;

                      return (
                        <td key={roleOption.role} className="p-4 text-center">
                          <label
                            className={`inline-flex items-center justify-center w-full p-2 rounded-full cursor-pointer
                              ${
                                currentRole === roleOption.role
                                  ? "bg-indigo-100 dark:bg-indigo-900/50"
                                  : "hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                              }
                              ${
                                !allowEdit || isOwnerLocked
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            `}
                          >
                            <input
                              type="radio"
                              name={u.id}
                              disabled={
                                !allowEdit ||
                                isOwnerLocked ||
                                mutation.isPending
                              }
                              checked={currentRole === roleOption.role}
                              onChange={() =>
                                setLocalRoles((prev) => ({
                                  ...prev,
                                  [u.id]: roleOption.role as UserRole,
                                }))
                              }
                              className="w-4 h-4 accent-indigo-600 disabled:opacity-40"
                            />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* زر الحفظ */}
      <div className="flex justify-start p-4 md:p-0">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              جارٍ الحفظ
              <Loader2 className="animate-spin w-5 h-5 ml-2" />
            </>
          ) : (
            "تحديث الصلاحيات"
          )}
        </Button>
      </div>

      {/* توضيح الأدوار */}
      <div className="pt-4 border-t dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          توضيح الأدوار:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLE_OPTIONS.map((r) => (
            <div
              key={r.role}
              className="p-3 border rounded-lg bg-white dark:bg-gray-800 shadow-sm"
            >
              <Badge variant={getRoleVariant(r.role)} className="mb-1 text-sm">
                {r.label}
              </Badge>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {r.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
