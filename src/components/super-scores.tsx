"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

type RoomScore = {
  totalScore: number;
  room: {
    id: string;
    name: string;
    type: string;
  };
};

type Player = {
  id: string;
  username: string;
  roomScores: RoomScore[];
};

type UserSupervisor = {
  id: string;
  username: string;
  role: "ADMIN" | "MODERATOR";
  players: Player[];
};

export default function SuperScores() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["supervisors"],
    queryFn: async () => {
      const res = await api.get("/super"); // ← استبدلنا fetch تماماً
      return res.data.users || [];
    },
    refetchInterval: 5000, // ← تحديث تلقائي كل 5 ثوانٍ
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 text-xl p-10">
        حدث خطأ أثناء تحميل البيانات
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 text-xl p-10">
        لا يوجد أي مشرفين حالياً
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-8">
      <h2 className="text-3xl font-bold text-center mb-6">إدارة المشرفين</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((sup: UserSupervisor) => (
          <Card key={sup.id} className="border shadow-sm dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg font-bold">{sup.username}</span>

                <Badge variant={sup.role === "ADMIN" ? "default" : "outline"}>
                  {sup.role === "ADMIN" ? "مدير" : "مشرف"}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {sup.players.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  لا يوجد لاعبين مرتبطين بهذا المشرف
                </div>
              ) : (
                sup.players.map((player) => (
                  <div
                    key={player.id}
                    className="border p-3 rounded-lg bg-muted/30 space-y-2"
                  >
                    <div className="font-semibold text-base">
                      اللاعب: {player.username}
                    </div>

                    {player.roomScores.length === 0 ? (
                      <div className="text-gray-500 text-sm">
                        لا يوجد نقاط لهذا اللاعب حتى الآن
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {player.roomScores.map((rs) => (
                          <div
                            key={rs.room.id}
                            className="flex justify-between bg-white dark:bg-gray-800 p-2 rounded shadow-sm items-center"
                          >
                            <span className="font-medium">
                              الغرفة: {rs.room.name}
                            </span>

                            <Badge variant="secondary">
                              {rs.totalScore} نقطة
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
