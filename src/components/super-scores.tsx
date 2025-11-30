"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

type RoomScore = {
  totalScore: number;
  room: { id: string; name: string; type: string };
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
      const res = await api.get("/super");
      return res.data.users || [];
    },
    refetchInterval: 5000,
  });

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );

  if (isError)
    return (
      <div className="text-center text-red-500 text-xl p-10">
        حدث خطأ أثناء تحميل البيانات
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="text-center text-gray-500 text-xl p-10">
        لا يوجد أي مشرفين حالياً
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto mt-6 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-4">نقاط المشرفين</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((sup: UserSupervisor) => (
          <Card key={sup.id} className="border shadow-sm p-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{sup.username}</span>
                <Badge variant={sup.role === "ADMIN" ? "default" : "outline"}>
                  {sup.role === "ADMIN" ? "مدير" : "مشرف"}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {sup.players.length === 0 ? (
                <div className="text-gray-500 text-sm text-center">
                  لا يوجد لاعبين مرتبطين
                </div>
              ) : (
                // -------------------------- تجميع غرف اللاعب تحت كل غرفة --------------------------
                (() => {
                  // HashMap => roomId → { roomName, scores: [] }
                  const roomsMap: Record<
                    string,
                    {
                      name: string;
                      players: { username: string; score: number }[];
                    }
                  > = {};

                  sup.players.forEach((player) => {
                    player.roomScores.forEach((rs) => {
                      if (!roomsMap[rs.room.id]) {
                        roomsMap[rs.room.id] = {
                          name: rs.room.name,
                          players: [],
                        };
                      }
                      roomsMap[rs.room.id].players.push({
                        username: player.username,
                        score: rs.totalScore,
                      });
                    });
                  });

                  const rooms = Object.values(roomsMap);

                  return rooms.map((room) => (
                    <div
                      key={room.name}
                      className="p-2 border rounded-lg bg-muted/30 space-y-2"
                    >
                      <div className="font-semibold text-sm text-primary">
                        الغرفة: {room.name}
                      </div>

                      {room.players.length === 0 ? (
                        <div className="text-gray-500 text-xs">
                          لا يوجد نقاط بعد
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {room.players
                            .sort((a, b) => b.score - a.score)
                            .map((p, i) => (
                              <div
                                key={i}
                                className="flex justify-between bg-white dark:bg-gray-800 p-1 px-2 rounded text-xs"
                              >
                                <span>{p.username}</span>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {p.score} نقطة
                                </Badge>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ));
                })()
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
