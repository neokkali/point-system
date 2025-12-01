"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import api from "@/lib/axiosClient";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Shield,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { DotLoader } from "./app-loader";

/**
 * Types
 */
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

/**
 * Helper: ترجمة/عرض نص الدور (قابل للتعديل لاحقاً)
 */
const userRoles: Record<string, string> = {
  ADMIN: "مدير النظام",
  MODERATOR: "مشرف",
  USER: "مستخدم",
};

/**
 * حساب مجموع النقاط لمشرف (مجموع كل نقاط لاعبيه عبر كل الغرف)
 */
const calculateSupervisorTotalScore = (supervisor: UserSupervisor) => {
  return supervisor.players.reduce((supTotal, player) => {
    const playerTotal = player.roomScores.reduce(
      (pTotal, rs) => pTotal + rs.totalScore,
      0
    );
    return supTotal + playerTotal;
  }, 0);
};

/**
 * Render rooms per supervisor.
 * - لا يغيّر المنطق، فقط يستخدم تصاميم محايدة (بدون ألوان مخصصة).
 */
const renderSupervisorRooms = (
  sup: UserSupervisor,
  expandedRooms: Record<string, boolean>,
  toggleRoom: (supervisorId: string, roomId: string) => void
) => {
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

  return rooms.map(([roomId, room]) => {
    const roomKey = `${sup.id}-${roomId}`;
    const isExpanded = !!expandedRooms[roomKey];
    const roomTotalScore = room.players.reduce((sum, p) => sum + p.score, 0);

    return (
      <div
        key={roomKey}
        className="rounded-lg overflow-hidden border transition-shadow duration-300"
      >
        <button
          onClick={() => toggleRoom(sup.id, roomId)}
          className={`w-full flex justify-between items-center p-3 transition-colors duration-200 border-b`}
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{room.name}</span>
            <Badge variant="outline" className="text-xs">
              {roomTotalScore} نقطة
            </Badge>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-96 p-2" : "max-h-0 p-0"
          }`}
        >
          {room.players.length === 0 ? (
            <div className="text-sm text-center p-2">
              لا يوجد نقاط بعد في هذه الغرفة.
            </div>
          ) : (
            <div className="space-y-1">
              {room.players
                .sort((a, b) => b.score - a.score)
                .map((p, i) => (
                  <div
                    key={`${roomKey}-player-${i}`}
                    className={`flex justify-between items-center rounded p-2`}
                  >
                    <span className="truncate flex-1 text-sm">
                      <span className="inline-block min-w-9 text-right mr-2">
                        #{i + 1}
                      </span>
                      {p.username}
                    </span>
                    <Badge
                      variant="secondary"
                      className="min-w-16 justify-center"
                    >
                      {p.score} نقطة
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  });
};

/**
 * Component الرئيسي
 */
export default function SuperScores() {
  const { data, isLoading, isError } = useQuery<UserSupervisor[]>({
    queryKey: ["supervisors"],
    queryFn: async () => {
      const res = await api.get("/super");
      const supervisors: UserSupervisor[] = res.data.users || [];
      // ترتيب المشرفين تنازلي حسب نقاطهم الإجمالية
      return supervisors.sort(
        (a: UserSupervisor, b: UserSupervisor) =>
          calculateSupervisorTotalScore(b) - calculateSupervisorTotalScore(a)
      );
    },
    refetchInterval: 5000, // تحديث تلقائي
  });

  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>(
    {}
  );

  const toggleRoom = (supervisorId: string, roomId: string) => {
    const key = `${supervisorId}-${roomId}`;
    setExpandedRooms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <DotLoader size="lg" text="جاري تحميل نقاط المشرفين" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-10">
        <div className="mb-3 inline-flex items-center gap-2">
          <Zap />
          <span className="font-semibold">حدث خطأ أثناء تحميل البيانات</span>
        </div>
        <div>حاول إعادة التحميل أو راجع سجلات الخادم.</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-10">
        <Users />
        <div className="mt-2">لا يوجد أي مشرفين حالياً لعرض نقاطهم.</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-8 p-4 sm:p-6 rounded-xl shadow">
      <header className="text-center">
        <div className="flex items-center justify-center gap-3">
          <Trophy />
          <h2 className="text-2xl font-extrabold">لوحة متصدرين المشرفين</h2>
        </div>
        <p className="mt-2">
          تعرض هذه اللوحة مجموع النقاط التي حققها اللاعبون التابعون لكل مشرف.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((sup) => {
          const totalScore = calculateSupervisorTotalScore(sup);
          const rank = data.indexOf(sup) + 1;
          const isTopSupervisor = rank === 1;

          return (
            <Card key={sup.id} className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="flex items-center gap-2">
                      {isTopSupervisor && <Trophy />}
                      <div className="font-bold text-lg">{sup.username}</div>
                    </div>
                    <div className="mt-1 text-sm">
                      <Badge
                        variant={
                          sup.role === "ADMIN" ? "destructive" : "secondary"
                        }
                      >
                        {(sup.role === "ADMIN" || sup.role === "MODERATOR") && (
                          <Shield className={cn("mb-[3px]")} />
                        )}
                        {userRoles[sup.role]}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Badge>{totalScore} نقطة إجمالية</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {sup.players.length === 0 ? (
                  <div className="text-sm">لا يوجد لاعبين مرتبطين بعد.</div>
                ) : (
                  renderSupervisorRooms(sup, expandedRooms, toggleRoom)
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
