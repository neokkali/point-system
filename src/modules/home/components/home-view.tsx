"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalScores } from "@/hooks/use-global-scores";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Copy, Trophy, Users } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { DotLoader } from "../../../components/app-loader";

// ---------------------- Types ----------------------
type Player = {
  username: string;
  totalScore: number;
};

type Room = {
  roomId: string;
  roomName: string;
  roomType: "ARTICLE" | "QUIZ";
  players: Player[];
};

export default function HomeView() {
  const [expandedRooms, setExpandedRooms] = useState<{
    [roomId: string]: boolean;
  }>({});
  const [isCopied, setIsCopied] = useState<{ [roomId: string]: boolean }>({});
  const { data, isLoading, error } = useGlobalScores();

  // ---------------------- Helper: Copy Function ----------------------
  const handleCopyPoints = (roomId: string, players: Player[]) => {
    const sortedPlayers = [...players].sort(
      (a, b) => b.totalScore - a.totalScore,
    );
    if (!sortedPlayers.length) return;

    const formatted = sortedPlayers
      .map((p) => `${p.username}: ${p.totalScore}`)
      .join(" | ");

    // استخدم Clipboard API مباشرة على النص الجاهز
    navigator.clipboard
      .writeText(formatted)
      .then(() => {
        setIsCopied((prev) => ({ ...prev, [roomId]: true }));
        setTimeout(
          () => setIsCopied((prev) => ({ ...prev, [roomId]: false })),
          2000,
        );
      })
      .catch((err) => console.error("Copy failed:", err));
  };

  // ---------------------- States ----------------------
  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col justify-center items-center">
        <DotLoader size="lg" text="جاري التحميل" color="primary" />
      </div>
    );
  }

  if (error)
    return (
      <div className="h-[80vh] flex flex-col justify-center items-center text-red-500">
        حدث خطأ في جلب البيانات
      </div>
    );

  const allRoomsEmpty =
    !data ||
    data.length === 0 ||
    data.every((r: Room) => r.players.length === 0);
  if (allRoomsEmpty)
    return (
      <div className="text-center text-muted-foreground p-10">
        لا توجد نقاط حالياً
      </div>
    );

  if (!data) return null;

  // 2. الفرز باستخدام نسخة آمنة تتعامل مع المصفوفات الفارغة أو غير المعرفة
  const sortedRooms = [...data].sort((a, b) => {
    // نستخدم 0 كقيمة افتراضية إذا لم يكن هناك لاعبين
    const getTopScore = (room: Room) => {
      if (!room.players || room.players.length === 0) return 0;
      // بدلاً من السبريد (...) الذي قد يسبب مشاكل في المصفوفات الكبيرة، نستخدم reduce
      return room.players.reduce((max, p) => Math.max(max, p.totalScore), 0);
    };

    return getTopScore(b) - getTopScore(a);
  });

  return (
    <div className="max-w-400 mx-auto py-8 px-0 sm:px-4 space-y-6">
      {" "}
      {/* تم تكبير max-w ليتناسب مع 4 أعمدة */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base md:text-2xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          لوحة النقاط
        </h2>
        <span className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          تحديث مباشر
        </span>
      </div>
      {/* 2. تعديل الشبكة لتظهر 4 في الشاشات الكبيرة جداً */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedRooms.map((room: Room) => {
          const hasPlayers = room.players?.length > 0;
          const sortedPlayers = [...(room.players || [])].sort(
            (a, b) => b.totalScore - a.totalScore,
          );
          const maxScore = sortedPlayers[0]?.totalScore || 1;

          // 3. تحديد اللاعبين المعروضين (أول 10 أو الكل)
          const isExpanded = expandedRooms[room.roomId];
          const displayedPlayers = isExpanded
            ? sortedPlayers
            : sortedPlayers.slice(0, 10);

          return (
            <motion.div key={room.roomId} layout>
              <Card className="h-full border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0 border-b border-border/40 bg-muted/20">
                  <CardTitle className="text-base font-bold truncate">
                    {room.roomName}
                  </CardTitle>
                  {hasPlayers && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() =>
                        handleCopyPoints(room.roomId, room.players)
                      }
                    >
                      {isCopied[room.roomId] ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="p-4 pt-3 space-y-3 flex-grow">
                  {!hasPlayers ? (
                    <div className="text-center py-6 text-sm text-muted-foreground flex flex-col items-center gap-2 opacity-60">
                      <Users className="w-8 h-8 stroke-1" />
                      <span>الغرفة فارغة</span>
                    </div>
                  ) : (
                    <>
                      {displayedPlayers.map((player, idx) => {
                        const rank = idx + 1;
                        const isFirst = rank === 1;
                        const progress = (player.totalScore / maxScore) * 100;

                        return (
                          <div key={idx} className="group relative">
                            <div className="flex justify-between items-center text-sm mb-1.5 z-10 relative">
                              <div className="flex items-center gap-3">
                                <div className="w-6 flex justify-center">
                                  {isFirst ? (
                                    <Image
                                      alt="top"
                                      src="/icons/crown_king.gif"
                                      width={24}
                                      height={24}
                                    />
                                  ) : (
                                    <span
                                      className={cn(
                                        "text-xs font-bold",
                                        rank <= 3
                                          ? "text-slate-400"
                                          : "text-muted-foreground",
                                      )}
                                    >
                                      #{rank}
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "font-medium truncate max-w-[100px]",
                                    isFirst && "text-primary font-bold",
                                  )}
                                >
                                  {player.username}
                                </span>
                              </div>
                              <span className="font-mono text-xs font-semibold bg-secondary px-2 py-0.5 rounded">
                                {player.totalScore}
                              </span>
                            </div>
                            <div className="h-1 w-full bg-secondary/30 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className={cn(
                                  "h-full rounded-full",
                                  isFirst ? "bg-yellow-500" : "bg-primary/70",
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}

                      {/* زر إظهار المزيد */}
                      {sortedPlayers.length > 10 && (
                        <Button
                          variant="ghost"
                          className="w-full text-xs text-muted-foreground hover:text-primary mt-2"
                          onClick={() =>
                            setExpandedRooms((prev) => ({
                              ...prev,
                              [room.roomId]: !isExpanded,
                            }))
                          }
                        >
                          {isExpanded
                            ? "إظهار أقل"
                            : `إظهار ${sortedPlayers.length - 10} لاعبين إضافيين`}
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      {/* <SuperViewPublic /> */}
    </div>
  );
}

