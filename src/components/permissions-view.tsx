"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import api from "@/lib/axiosClient";
import { useAuth } from "@/providers/auth-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DotLoader } from "./app-loader";

type User = {
  id: string;
  username: string;
  role: "ADMIN" | "MODERATOR" | "USER";
};

export default function PermissionsView() {
  useAuthGuard(["ADMIN"], "/auth", "/");
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [localRoles, setLocalRoles] = useState<Record<string, User["role"]>>(
    {}
  );

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await api.get("/permissions");
      const usersData = res.data.users as User[];
      // initialize local state
      const initRoles: Record<string, User["role"]> = {};
      usersData.forEach((u) => {
        initRoles[u.id] = u.role;
      });
      setLocalRoles(initRoles);
      return usersData;
    },
  });

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
      toast.success("تم تحديث الصلاحيات بنجاح");
    },
  });

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col justify-center items-center">
        <DotLoader size="lg" text="جاري التحميل" color="primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-6">
      <Card className="border shadow-sm dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            إدارة صلاحيات المستخدمين
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-right border-b">الاسم</th>
                <th className="p-3 text-center border-b">مدير</th>
                <th className="p-3 text-center border-b">مشرف</th>
                <th className="p-3 text-center border-b">بدون صلاحيات</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => {
                const isCurrent = currentUser?.id === u.id;
                return (
                  <tr
                    key={u.id}
                    className={isCurrent ? "bg-gray-200 dark:bg-gray-700" : ""}
                  >
                    <td className="p-3 border-b flex items-center gap-2">
                      {u.username}
                      {isCurrent && <Badge variant="secondary">أنت</Badge>}
                    </td>
                    {(["ADMIN", "MODERATOR", "USER"] as User["role"][]).map(
                      (roleOption) => (
                        <td
                          key={roleOption}
                          className="p-3 border-b text-center"
                        >
                          <input
                            type="radio"
                            name={u.id}
                            disabled={isCurrent}
                            checked={localRoles[u.id] === roleOption}
                            onChange={() =>
                              setLocalRoles((prev) => ({
                                ...prev,
                                [u.id]: roleOption,
                              }))
                            }
                            className="w-5 h-5 accent-indigo-600 dark:accent-indigo-400 cursor-pointer"
                          />
                        </td>
                      )
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-8"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 mr-2" /> جارٍ الحفظ...
            </>
          ) : (
            "تحديث الصلاحيات"
          )}
        </Button>
      </div>
    </div>
  );
}
