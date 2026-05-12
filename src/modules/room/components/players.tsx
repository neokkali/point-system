"use client";

import { DotLoader } from "@/components/app-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useDeletePlayer } from "@/hooks/use-delete-player";
import { usePlayers } from "@/hooks/use-players";
import { useUpdatePlayers } from "@/hooks/use-update-players";
import {
  Check,
  Copy,
  Loader2,
  ChevronDown,
  ChevronsUp,
  Eye,
} from "lucide-react";
import { useEffect, useState } from "react";
import ClearRoomButton from "./clear-room-button";

interface Player {
  id: string;
  username: string;
  totalScore: number;
}

interface NewPlayer {
  id?: string;
  username: string;
  points: string;
}

interface RoomPageProps {
  roomId: string;
}

export default function Players({ roomId }: RoomPageProps) {
  useAuthGuard(["OWNER", "ADMIN", "MODERATOR"], "/auth", "/");
  const [isCopied, setIsCopied] = useState(false);

  // حالة التحكم في عدد اللاعبين المعروضين
  const [visibleCount, setVisibleCount] = useState(10);

  const { data: players, isLoading, error } = usePlayers(roomId);
  const deleteMutation = useDeletePlayer(roomId);
  const updateMutation = useUpdatePlayers(roomId);

  const [newPlayers, setNewPlayers] = useState<NewPlayer[]>([]);

  useEffect(() => {
    if (players && players.length) {
      setNewPlayers(
        players.map((p: Player) => ({
          id: p.id,
          username: p.username,
          points: String(p.totalScore),
        })),
      );
    } else {
      setNewPlayers([]);
    }
  }, [players]);

  const handleChange = (
    index: number,
    field: "username" | "points",
    value: string,
  ) => {
    setNewPlayers((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // تعديل: إضافة لاعب وزيادة العداد ليظهر الصف الجديد فوراً
  const addNewRow = () => {
    setNewPlayers((prev) => {
      const updated = [...prev, { username: "", points: "" }];
      // إذا كان اللاعب الجديد خارج نطاق العرض الحالي، نزيد العرض ليظهر
      if (updated.length > visibleCount) {
        setVisibleCount(updated.length);
      }
      return updated;
    });
  };

  const removeRow = (index: number) =>
    setNewPlayers((prev) => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    const sanitizedPlayers = newPlayers.map((p) => ({
      id: p.id,
      username: p.username,
      points: p.points === "" ? 0 : Number(p.points),
    }));
    updateMutation.mutate(sanitizedPlayers);
  };

  const handleRemovePlayer = (player: { id?: string }, index: number) => {
    if (!player.id) return removeRow(index);
    deleteMutation.mutate(player.id, { onSuccess: () => removeRow(index) });
  };

  const handleCopyPoints = (players: Player[]) => {
    const sortedPlayers = [...players].sort(
      (a, b) => b.totalScore - a.totalScore,
    );
    if (!sortedPlayers.length) return;
    const formatted = sortedPlayers
      .map((p) => `${p.username}: ${p.totalScore}`)
      .join(" | ");
    navigator.clipboard.writeText(formatted);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center">
        <DotLoader size="lg" text="جاري التحميل" color="primary" />
      </div>
    );
  }

  if (error)
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        حدث خطأ أثناء جلب اللاعبين
      </div>
    );

  return (
    <Card className="max-w-3xl mx-auto mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>إدارة اللاعبين للغرفة</CardTitle>
        {players && players.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => handleCopyPoints(players)}
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 mb-0.5" />
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* عرض اللاعبين بناءً على العدد المسموح به */}
        {newPlayers.slice(0, visibleCount).map((p, idx) => (
          <div key={p.id ?? `new-${idx}`} className="flex gap-2 items-center">
            <Input
              placeholder="اسم اللاعب"
              value={p.username}
              onChange={(e) => handleChange(idx, "username", e.target.value)}
              className="flex-1 text-sm md:text-lg"
            />
            <Input
              type="number"
              placeholder="النقاط"
              value={p.points}
              onChange={(e) => handleChange(idx, "points", e.target.value)}
              className="w-18 md:w-24 text-base md:text-lg"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRemovePlayer(p, idx)}
            >
              إزالة
            </Button>
          </div>
        ))}

        <div className="flex flex-col gap-2 w-full">
          {/* أزرار التحكم في العرض */}
          {newPlayers.length > 10 && (
            <div className="flex flex-row gap-2 w-full mb-1">
              {visibleCount < newPlayers.length && (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 text-[10px] md:text-xs h-8 px-1"
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                  >
                    <ChevronDown className="w-3 h-3 ml-1" />
                    عرض 10
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-[10px] md:text-xs h-8 px-1"
                    onClick={() => setVisibleCount(newPlayers.length)}
                  >
                    <Eye className="w-3 h-3 ml-1" />
                    عرض الكل
                  </Button>
                </>
              )}
              {visibleCount > 10 && (
                <Button
                  variant="outline"
                  className="flex-1 text-[10px] md:text-xs h-8 px-1 text-orange-500 hover:text-orange-600"
                  onClick={() => setVisibleCount(10)}
                >
                  <ChevronsUp className="w-3 h-3 ml-1" />
                  إخفاء
                </Button>
              )}
            </div>
          )}

          <Button
            onClick={addNewRow}
            className="w-full"
            disabled={updateMutation.isPending}
          >
            إضافة لاعب جديد
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                جاري حفظ التغييرات
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              </>
            ) : (
              <>حفظ التغييرات</>
            )}
          </Button>
          {players && players.length > 2 && (
            <ClearRoomButton
              roomId={roomId}
              disabled={updateMutation.isPending}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
