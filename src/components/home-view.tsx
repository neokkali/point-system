"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalScores } from "@/hooks/use-global-scores";
import { cn } from "@/lib/utils";
import BestWpmCard from "@/modules/home/components/best-wpm-card";
import { motion } from "framer-motion";
import { Check, Copy, Crown, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { DotLoader } from "./app-loader";

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

    navigator.clipboard.writeText(formatted);
    setIsCopied((prev) => ({ ...prev, [roomId]: true }));
    setTimeout(
      () => setIsCopied((prev) => ({ ...prev, [roomId]: false })),
      2000,
    );
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

  return (
    <div className="max-w-5xl mx-auto py-8 px-0 sm:px-4 space-y-6">
      <BestWpmCard />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base md:text-2xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          لوحة النقاط
        </h2>
        <span className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          تحديث مباشر
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {data.map((room: Room) => {
          const hasPlayers = room.players?.length > 0;
          const sortedPlayers = [...(room.players || [])].sort(
            (a, b) => b.totalScore - a.totalScore,
          );
          const maxScore = sortedPlayers[0]?.totalScore || 1;

          return (
            <motion.div
              key={room.roomId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden">
                {/* Compact Header */}
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0 border-b border-border/40 bg-muted/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold truncate max-w-[150px] sm:max-w-[200px]">
                        {room.roomName}
                      </CardTitle>
                    </div>
                  </div>

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

                {/* Compact Content */}
                <CardContent className="p-4 pt-3 space-y-3">
                  {!hasPlayers ? (
                    <div className="text-center py-6 text-sm text-muted-foreground flex flex-col items-center gap-2 opacity-60">
                      <Users className="w-8 h-8 stroke-1" />
                      <span>الغرفة فارغة</span>
                    </div>
                  ) : (
                    sortedPlayers.map((player, idx) => {
                      const rank = idx + 1;
                      const isFirst = rank === 1;
                      const progress = (player.totalScore / maxScore) * 100;

                      return (
                        <div key={idx} className="group relative">
                          <div className="flex justify-between items-center text-sm mb-1.5 z-10 relative">
                            <div className="flex items-center gap-3">
                              {/* Rank Indicator */}
                              <div
                                className={cn(
                                  "w-5 text-center font-bold text-xs",
                                  isFirst
                                    ? "text-yellow-500"
                                    : rank === 2
                                      ? "text-slate-400"
                                      : rank === 3
                                        ? "text-amber-700"
                                        : "text-muted-foreground",
                                )}
                              >
                                {isFirst ? (
                                  <Crown className="w-4 h-4 inline" />
                                ) : (
                                  `#${rank}`
                                )}
                              </div>

                              <span
                                className={cn(
                                  "font-medium truncate max-w-[120px]",
                                  isFirst && "text-primary font-bold",
                                )}
                              >
                                {player.username}
                              </span>
                            </div>

                            <span className="font-mono text-xs font-semibold bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                              {player.totalScore}
                            </span>
                          </div>

                          {/* Ultra Slim Progress Bar */}
                          <div className="h-1 w-full bg-secondary/30 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={cn(
                                "h-full rounded-full",
                                isFirst ? "bg-yellow-500" : "bg-primary/70",
                              )}
                            />
                          </div>
                        </div>
                      );
                    })
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
