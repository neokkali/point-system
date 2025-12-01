"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Trophy, Users, Zap } from "lucide-react";
import { useState } from "react";
import { DotLoader } from "./app-loader";

// تعريفات الأنواع
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
  ADMIN: "مدير النظام",
  MODERATOR: "مشرف",
  USER: "مستخدم",
};

// دالة مساعدة لحساب مجموع النقاط الإجمالي للمشرف
const calculateSupervisorTotalScore = (supervisor: UserSupervisor) => {
  return supervisor.players.reduce((supTotal, player) => {
    const playerTotal = player.roomScores.reduce(
      (pTotal, rs) => pTotal + rs.totalScore,
      0
    );
    return supTotal + playerTotal;
  }, 0);
};

// 🌟 دالة مساعدة لعرض الغرف
const renderSupervisorRooms = (
  sup: UserSupervisor,
  expandedRooms: Record<string, boolean>,
  toggleRoom: (supervisorId: string, roomId: string) => void
) => {
  // 1. تجميع النتائج حسب الغرف (منطق المعالجة)
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

  // 2. العرض (الـ JSX)
  return rooms.map(([roomId, room]) => {
    const roomKey = `${sup.id}-${roomId}`;
    const isExpanded = expandedRooms[roomKey];
    const roomTotalScore = room.players.reduce((sum, p) => sum + p.score, 0);

    return (
      <div
        key={roomKey}
        // تصميم بسيط بحدود رمادية خفيفة
        className="rounded-lg overflow-hidden border transition-shadow duration-300"
      >
        {/* زر الغرفة بتصميم أحادي اللون */}
        <button
          onClick={() => toggleRoom(sup.id, roomId)}
          className={`w-full flex justify-between items-center p-3 transition-colors duration-200 border-b dark:border-gray-700
            ${
              isExpanded
                ? // الخلفية تكون رمادية أغمق قليلاً عند التوسيع
                  "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-50 font-medium border-gray-300 dark:border-gray-600"
                : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/80 border-transparent"
            }
          `}
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold">{room.name}</span>
            {/* شارة إجمالي نقاط الغرفة - لون ثانوي هادئ */}
            <Badge
              variant="outline"
              className="text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            >
              {roomTotalScore} نقطة
            </Badge>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>

        {/* محتوى اللاعبين */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded
              ? "max-h-96 opacity-100 p-2 overflow-y-auto"
              : "max-h-0 opacity-0 p-0"
          }`}
        >
          {room.players.length === 0 ? (
            <div className="text-gray-400 text-xs text-center p-2">
              لا يوجد نقاط بعد في هذه الغرفة.
            </div>
          ) : (
            <div className="space-y-1">
              {room.players
                .sort((a, b) => b.score - a.score)
                .map((p, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center rounded text-sm transition-colors duration-150 p-2 
                      ${
                        i === 0
                          ? // تمييز المتصدر بخلفية رمادية فاتحة جداً
                            "bg-gray-100 dark:bg-gray-700 font-medium"
                          : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }
                    `}
                  >
                    <span className="text-gray-800 dark:text-gray-200 truncate flex-1">
                      <span className="text-gray-500 dark:text-gray-400 mr-2 min-w-5 inline-block text-right">
                        #{i + 1}
                      </span>{" "}
                      {p.username}
                    </span>
                    {/* شارة النقاط - تصميم أحادي اللون */}
                    <Badge
                      variant="outline"
                      className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 min-w-[70px] justify-center"
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

export default function SuperScores() {
  const { data, isLoading, isError } = useQuery<UserSupervisor[]>({
    queryKey: ["supervisors"],
    queryFn: async () => {
      const res = await api.get("/super");
      const supervisors = res.data.users || [];
      return supervisors.sort(
        (a: UserSupervisor, b: UserSupervisor) =>
          calculateSupervisorTotalScore(b) - calculateSupervisorTotalScore(a)
      );
    },
    refetchInterval: 5000,
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
      <div className="h-[80vh] flex flex-col justify-center items-center">
        <DotLoader size="lg" text="جاري تحميل نقاط المشرفين" color="primary" />
      </div>
    );
  }

  if (isError)
    return (
      <div className="text-center text-red-500 text-xl p-10">
        <Zap className="inline-block w-6 h-6 mr-2" />
        حدث خطأ أثناء تحميل البيانات
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="text-center text-gray-500 text-xl p-10">
        <Users className="inline-block w-6 h-6 mr-2" />
        لا يوجد أي مشرفين حالياً لعرض نقاطهم.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-8 p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border dark:border-gray-800">
      <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-gray-50 flex items-center justify-center space-x-3">
        {/* أيقونة باللون الرمادي الهادئ */}
        <Trophy className="w-8 h-8 text-gray-500 transform rotate-[-15deg]" />
        <span>لوحة متصدرين المشرفين</span>
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        تعرض هذه اللوحة مجموع النقاط التي حققها اللاعبون التابعون لكل مشرف.
      </p>

      {/* 🔴 تخطيط Grid: md:grid-cols-2 (عمودين على الشاشات المتوسطة والكبيرة)، grid-cols-1 (عمود واحد على الهاتف) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {data.map((sup: UserSupervisor) => {
          const totalScore = calculateSupervisorTotalScore(sup);
          const rank = data.indexOf(sup) + 1;
          const isTopSupervisor = rank === 1;

          return (
            <Card
              key={sup.id}
              className={`
                shadow-md transition-all duration-300 hover:shadow-lg
                border-t-4 border-b-2
                ${
                  isTopSupervisor
                    ? // تمييز المتصدر بالرمادي الداكن بدلاً من الأصفر
                      "border-gray-500 dark:border-gray-400 shadow-gray-200/50 dark:shadow-gray-700/50"
                    : "border-gray-300 dark:border-gray-600"
                }
                bg-white dark:bg-gray-800 h-full
              `}
            >
              <CardHeader className="p-4 border-b dark:border-gray-700">
                <CardTitle className="flex flex-col items-center space-y-2 text-lg">
                  {/* اسم المشرف والمركز */}
                  <div className="flex items-center space-x-2">
                    {isTopSupervisor && (
                      <Trophy className="w-5 h-5 text-gray-500" />
                    )}
                    <span className="font-bold text-xl text-gray-900 dark:text-gray-50">
                      {sup.username}
                    </span>
                  </div>

                  {/* مجموع النقاط الإجمالي - لون أحادي */}
                  <div className="flex items-center justify-center w-full mt-2">
                    <Badge
                      className={`
                        text-sm font-semibold py-1 px-3 bg-gray-700 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-500
                      `}
                    >
                      {totalScore} نقطة إجمالية
                    </Badge>
                  </div>

                  {/* الدور - لون أحادي هادئ */}
                  <Badge
                    variant={sup.role === "ADMIN" ? "destructive" : "secondary"}
                    className="text-xs mt-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-none"
                  >
                    {userRoles[sup.role]}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 p-4">
                {sup.players.length === 0 ? (
                  <div className="text-gray-400 text-sm text-center italic">
                    لا يوجد لاعبين مرتبطين بعد.
                  </div>
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
