"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useDeletePlayer } from "@/hooks/use-delete-player";
import { usePlayers } from "@/hooks/use-players";
import { useUpdatePlayers } from "@/hooks/use-update-players";
import { useAuth } from "@/providers/auth-provider";
import { Copy, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  useAuthGuard(["ADMIN", "MODERATOR"], "/auth", "/");
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";

  const { data: players, isLoading, error } = usePlayers(roomId);
  const deleteMutation = useDeletePlayer(roomId);
  const updateMutation = useUpdatePlayers(roomId);

  const [newPlayers, setNewPlayers] = useState<NewPlayer[]>([]);

  // تحديث اللاعبين عند جلبهم
  useEffect(() => {
    if (players && players.length) {
      setNewPlayers(
        players.map((p: Player) => ({
          id: p.id,
          username: p.username,
          points: String(p.totalScore),
        }))
      );
    } else {
      setNewPlayers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]);

  const handleChange = (
    index: number,
    field: "username" | "points",
    value: string
  ) => {
    setNewPlayers((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addNewRow = () =>
    setNewPlayers((prev) => [...prev, { username: "", points: "" }]);
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

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        حدث خطأ أثناء جلب اللاعبين
      </div>
    );

  return (
    <Card className="max-w-3xl mx-auto mt-6">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>إدارة اللاعبين للغرفة</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => handleCopyPoints(players)}
        >
          <Copy className="w-4 h-4" />
          نسخ النقاط
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {newPlayers.map((p, idx) => (
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
            {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
          {isAuthenticated && isAdmin && <ClearRoomButton roomId={roomId} />}
        </div>
      </CardContent>
    </Card>
  );
}
