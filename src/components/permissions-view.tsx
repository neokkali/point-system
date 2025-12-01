"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import api from "@/lib/axiosClient";
import { useAuth } from "@/providers/auth-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Shield, Users } from "lucide-react"; // تم إضافة أيقونات
import { useState } from "react";
import { toast } from "sonner";
import { DotLoader } from "./app-loader";

type User = {
  id: string;
  username: string;
  role: "ADMIN" | "MODERATOR" | "USER";
};

// تعريف الأدوار المتاحة للعرض والتحرير
const ROLE_OPTIONS: {
  role: User["role"];
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
    description: "وصول محدود أو غير مصرح له بالإدارة.",
  },
];

// دالة مساعدة لتلوين الصلاحيات
const getRoleVariant = (role: User["role"]) => {
  switch (role) {
    case "ADMIN":
      return "destructive"; // أحمر قوي
    case "MODERATOR":
      return "default"; // اللون الأساسي (Primary/Indigo)
    case "USER":
      return "secondary"; // رمادي هادئ
    default:
      return "secondary";
  }
};

export default function PermissionsView() {
  useAuthGuard(["ADMIN"], "/auth", "/");
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // حالة محلية لتتبع التغييرات قبل الحفظ
  const [localRoles, setLocalRoles] = useState<Record<string, User["role"]>>(
    {}
  );

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await api.get("/permissions");
      const usersData = res.data.users as User[];

      // تهيئة الحالة المحلية بالصلاحيات الحالية
      const initRoles: Record<string, User["role"]> = {};
      usersData.forEach((u) => {
        initRoles[u.id] = u.role;
      });
      setLocalRoles(initRoles);
      return usersData;
    },
    // إيقاف الاستعلام المتكرر إذا لم يكن هناك مستخدمين
    enabled: !!currentUser,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(localRoles).map(([id, role]) => ({
        id,
        role,
      }));
      // إرسال التحديثات إلى نقطة النهاية (API Endpoint)
      await api.put("/permissions", { updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("✅ تم تحديث الصلاحيات بنجاح.");
    },
    onError: (error) => {
      toast.error(`❌ فشل التحديث: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col justify-center items-center">
        <DotLoader
          size="lg"
          text="جاري تحميل قائمة المستخدمين"
          color="primary"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6 p-4 md:p-0">
      <Card className="border shadow-lg dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-start gap-3 border-b dark:border-gray-800 p-4 md:p-6">
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
                {ROLE_OPTIONS.map((option) => (
                  <th
                    key={option.role}
                    className="w-[20%] p-4 text-center border-b dark:border-gray-800"
                  >
                    {option.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {users?.map((u) => {
                const isCurrent = currentUser?.id === u.id;
                const currentRole = localRoles[u.id] || u.role;
                const isRoleChanged = currentRole !== u.role;

                return (
                  <tr
                    key={u.id}
                    className={`
                      border-b dark:border-gray-800 transition-colors duration-200
                      ${
                        isCurrent
                          ? "bg-indigo-50/50 dark:bg-gray-700/30 font-medium"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }
                    `}
                  >
                    {/* عمود اسم المستخدم */}
                    <td className="p-4 flex items-center gap-2">
                      <span className="text-gray-900 dark:text-gray-100 truncate">
                        {u.username}
                      </span>
                      {isCurrent && (
                        <Badge
                          variant="secondary"
                          className="bg-gray-300 dark:bg-gray-600 text-xs"
                        >
                          أنت
                        </Badge>
                      )}
                      {isRoleChanged && (
                        <Badge
                          variant="outline"
                          className="text-xs border-dashed text-orange-500 border-orange-300"
                        >
                          لم يُحفظ
                        </Badge>
                      )}
                    </td>

                    {/* أعمدة اختيار الصلاحيات */}
                    {ROLE_OPTIONS.map((roleOption) => (
                      <td key={roleOption.role} className="p-4 text-center">
                        <label
                          className={`
                            inline-flex items-center justify-center w-full h-full cursor-pointer rounded-full transition-all duration-150 p-2
                            ${
                              localRoles[u.id] === roleOption.role
                                ? "bg-indigo-100 dark:bg-indigo-900/50"
                                : "hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                            }
                        `}
                        >
                          <input
                            type="radio"
                            name={u.id}
                            disabled={isCurrent || mutation.isPending}
                            checked={localRoles[u.id] === roleOption.role}
                            onChange={() =>
                              setLocalRoles((prev) => ({
                                ...prev,
                                [u.id]: roleOption.role,
                              }))
                            }
                            // تصميم أفضل لأزرار الراديو
                            className="w-4 h-4 accent-indigo-600 dark:accent-indigo-400 cursor-pointer disabled:opacity-50"
                          />
                        </label>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* زر الحفظ */}
      <div className="flex justify-start p-4 md:p-0">
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className=""
        >
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

      {/* قسم تلميحات الأدوار (لتحسين UX) */}
      <div className="pt-4 border-t dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          توضيح الأدوار:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLE_OPTIONS.map((option) => (
            <div
              key={option.role}
              className="p-3 border rounded-lg bg-white dark:bg-gray-800 shadow-sm"
            >
              <Badge
                variant={getRoleVariant(option.role)}
                className="mb-1 text-sm"
              >
                {option.label}
              </Badge>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {option.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
