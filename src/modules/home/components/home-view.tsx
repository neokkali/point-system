"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalScores } from "@/hooks/use-global-scores";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Copy, Trophy, Users, Star, Fingerprint } from "lucide-react";
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
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<{ [roomId: string]: boolean }>({});
  const { data, isLoading, error } = useGlobalScores();

  const handleCopyPoints = (roomId: string, players: Player[]) => {
    const sortedPlayers = [...players].sort(
      (a, b) => b.totalScore - a.totalScore,
    );
    if (!sortedPlayers.length) return;
    const formatted = sortedPlayers
      .map((p) => `${p.username}: ${p.totalScore}`)
      .join(" | ");
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

  if (isLoading)
    return (
      <div className="h-[70vh] flex flex-col justify-center items-center">
        <DotLoader size="lg" text="جاري التحميل" color="primary" />
      </div>
    );

  if (error || !data)
    return (
      <div className="h-[70vh] flex flex-col justify-center items-center text-red-500 font-bold">
        {error ? "حدث خطأ في جلب البيانات" : "لا توجد بيانات"}
      </div>
    );

  const sortedRooms = [...data].sort((a, b) => {
    const getTopScore = (room: Room) => room.players?.[0]?.totalScore || 0;
    return getTopScore(b) - getTopScore(a);
  });

  const getPlayerLabel = (count, isChanged = true) => {
    if (count === 1) return isChanged ? "لاعب" : "متسابق";
    if (count === 2) return isChanged ? "لاعبين" : "متسابقين";
    if (count >= 3 && count <= 10) return isChanged ? "لاعبين" : "متسابقين";
    return isChanged ? "لاعب" : "متسابق";
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-2 mb-7">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500 drop-shadow-sm" />
            نقاط رومات التفاعل شات فلة الخليج
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            متابعة نتائج اللاعبين وتصدر الغرف لحظياً
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            تحديث مباشر
          </span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {sortedRooms.map((room: Room) => {
          const hasPlayers = room.players?.length > 0;
          const sortedPlayers = [...(room.players || [])].sort(
            (a, b) => b.totalScore - a.totalScore,
          );
          const maxScore = sortedPlayers[0]?.totalScore || 1;
          const isExpanded = expandedRoomId === room.roomId;

          const totalRoomScore =
            room.players?.reduce((acc, p) => acc + p.totalScore, 0) || 0;
          const displayedPlayers = isExpanded
            ? sortedPlayers
            : sortedPlayers.slice(0, 5);

          return (
            <motion.div
              key={room.roomId}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={cn(
                  "border border-border/50 shadow-sm transition-all duration-500 bg-card/40 backdrop-blur-md overflow-hidden flex flex-col",
                  isExpanded
                    ? "ring-2 ring-primary/20 shadow-xl"
                    : "hover:shadow-lg hover:border-primary/30",
                )}
              >
                <CardHeader className="p-4 space-y-4 bg-muted/10 border-b border-border/40">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base font-bold truncate leading-tight">
                      {room.roomName}
                    </CardTitle>
                    {hasPlayers && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full shrink-0 hover:bg-primary/10 hover:text-primary"
                        onClick={() =>
                          handleCopyPoints(room.roomId, room.players)
                        }
                      >
                        {isCopied[room.roomId] ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {/* سطر البادجات (النقاط يمين، اللاعبين يسار) */}
                    <div className="flex items-center justify-between gap-2">
                      {/* عدد اللاعبين (يسار) */}
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/5 border border-primary/10 text-primary">
                        <Users className="w-3 h-3" />
                        <span className="text-[11px] font-bold">
                          {room.players.length}{" "}
                          {getPlayerLabel(room.players.length)}
                        </span>
                      </div>

                      {/* إجمالي النقاط (يمين) */}
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 shadow-sm">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-[11px] font-black uppercase tracking-tighter">
                          {totalRoomScore.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* سطر الايدي (تحت البادجات) */}
                    <div className="flex items-center gap-1.5 px-1 opacity-40 hover:opacity-100 transition-opacity">
                      <Fingerprint className="w-3 h-3" />
                      <span className="text-[9px] font-mono font-medium tracking-tight truncate">
                        ID: {room.roomId}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {!hasPlayers ? (
                    <div className="text-center py-8 text-muted-foreground/60 flex flex-col items-center gap-2">
                      <Users className="w-10 h-10 stroke-[1.2]" />
                      <p className="text-xs font-medium">
                        لا يوجد متسابقين حالياً
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {displayedPlayers.map((player, idx) => {
                        const rank = idx + 1;
                        const progress = (player.totalScore / maxScore) * 100;

                        return (
                          <div key={idx} className="group">
                            <div className="flex justify-between items-center text-sm mb-1.5">
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="w-5 shrink-0 flex justify-center">
                                  {rank === 1 ? (
                                    <Image
                                      alt="king"
                                      src="/icons/crown_king.gif"
                                      width={20}
                                      height={20}
                                      className="w-5 h-auto"
                                      unoptimized
                                    />
                                  ) : (
                                    <span className="text-[10px] font-bold text-muted-foreground/70">
                                      #{rank}
                                    </span>
                                  )}
                                </div>
                                <span className="font-semibold truncate text-[14px] group-hover:text-primary transition-colors">
                                  {player.username}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono font-bold text-foreground">
                                {player.totalScore.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-1 w-full bg-secondary/40 rounded-full overflow-hidden shadow-inner">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  rank === 1
                                    ? "bg-linear-to-r from-yellow-400 to-orange-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                                    : "bg-primary/80",
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}

                      {sortedPlayers.length > 5 && (
                        <Button
                          variant="secondary"
                          className="w-full h-8 text-[11px] shadow-sm"
                          onClick={() =>
                            setExpandedRoomId(isExpanded ? null : room.roomId)
                          }
                        >
                          {isExpanded
                            ? "طي القائمة"
                            : `+ ${sortedPlayers.length - 5}`}{" "}
                          {getPlayerLabel(sortedPlayers.length, false)}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
