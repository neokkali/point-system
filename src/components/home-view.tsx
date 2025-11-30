"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalScores } from "@/hooks/use-global-scores";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

// ---------------------- Component ----------------------
export default function HomeView() {
  const { data, isLoading, error } = useGlobalScores();

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-6">
        حدث خطأ أثناء تحميل النقاط
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 p-6">
        لا توجد نقاط الملك حاليا في أي غرفة
      </div>
    );
  }

  // ---------------------- Function to copy points ----------------------
  const handleCopyPoints = (players: Player[]) => {
    const sortedPlayers = [...players].sort(
      (a, b) => b.totalScore - a.totalScore
    );
    if (sortedPlayers.length === 0) {
      toast.error("لا يوجد نقاط لنسخها!");
      return;
    }
    const formatted = sortedPlayers
      .map((p) => `${p.username}: ${p.totalScore}`)
      .join(" | ");
    navigator.clipboard.writeText(formatted);
    toast.success("تم نسخ النقاط بنجاح!");
  };

  // تحقق هل كل الغرف فارغة
  const allRoomsEmpty = data.every((room: Room) => room.players.length === 0);

  if (allRoomsEmpty) {
    return (
      <div className="text-center text-gray-500 p-6 text-xl font-semibold">
        لا توجد نقاط الملك حاليا في أي غرفة
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-8">
      <h2 className="text-3xl font-bold text-center mb-6">
        ترتيب الملوك حسب الغرف
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((room: Room) => {
          if (!room.players || room.players.length === 0) {
            return (
              <Card
                key={room.roomId}
                className="border shadow-sm dark:border-gray-700"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    {room.roomName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-gray-500 font-medium">
                  لا يوجد نقاط في هذه الغرفة
                </CardContent>
              </Card>
            );
          }

          const maxScore = Math.max(...room.players.map((p) => p.totalScore));

          return (
            <Card
              key={room.roomId}
              className="border shadow-sm dark:border-gray-700"
            >
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold">
                  {room.roomName}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => handleCopyPoints(room.players)}
                >
                  <Copy className="w-4 h-4" />
                  نسخ النقاط
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {room.players
                  .slice()
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .map((player, idx) => {
                    const isKing = player.totalScore === maxScore;
                    const progressPercent = Math.min(
                      (player.totalScore / maxScore) * 100,
                      100
                    );

                    return (
                      <div
                        key={`${player.username}-${idx}`}
                        className="space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">
                            {player.username}
                          </span>
                          {isKing && (
                            <Badge variant="destructive">الملك 👑</Badge>
                          )}
                          <span className="text-gray-600 dark:text-gray-300 font-medium">
                            {player.totalScore} نقطة
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full relative">
                          <div
                            className="h-2 bg-yellow-400 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
