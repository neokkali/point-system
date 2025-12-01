"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";

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

const userRoles: Record<string, string> = {
  ADMIN: "مدير",
  MODERATOR: "مشرف",
  USER: "مستخدم",
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

  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>(
    {}
  );

  const toggleRoom = (roomId: string) => {
    setExpandedRooms((prev) => ({ ...prev, [roomId]: !prev[roomId] }));
  };

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
                  {userRoles[sup.role]}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {sup.players.length === 0 ? (
                <div className="text-gray-500 text-sm text-center">
                  لا يوجد لاعبين مرتبطين
                </div>
              ) : (
                (() => {
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

                  const rooms = Object.entries(roomsMap);

                  return rooms.map(([roomId, room]) => (
                    <div
                      key={roomId}
                      className="border rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleRoom(roomId)}
                        className="w-full flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <span className="font-semibold">{room.name}</span>
                        {expandedRooms[roomId] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      <div
                        className={`transition-all duration-300 overflow-hidden ${
                          expandedRooms[roomId] ? "max-h-96 p-2" : "max-h-0 p-0"
                        }`}
                      >
                        {room.players.length === 0 ? (
                          <div className="text-gray-500 text-xs text-center">
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
