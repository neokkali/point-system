"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useClearRoom } from "@/hooks/use-clear-room";
import { useDeletePlayer } from "@/hooks/use-deletet-player";
import { usePlayers } from "@/hooks/use-players";
import api from "@/lib/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ClearRoomButton from "./clear-room-button";

interface Player {
  id: string;
  username: string;
  totalScore: number;
}

interface NewPlayer {
  id?: string; // ← إضافة ID
  username: string;
  points: number;
}

interface RoomPageProps {
  roomId: string;
}

export default function Players({ roomId }: RoomPageProps) {
  const queryClient = useQueryClient();
  const clearRoomMutation = useClearRoom(roomId);
  const { data: players, isLoading, error } = usePlayers(roomId);

  const [newPlayers, setNewPlayers] = useState<NewPlayer[]>([]);

  // ✅ تحديث newPlayers بشكل آمن فقط عند تغيّر roomId أو players
  useEffect(() => {
    if (players && players.length) {
      setNewPlayers(
        players.map((p: Player) => ({
          id: p.id,
          username: p.username,
          points: p.totalScore,
        }))
      );
    } else {
      setNewPlayers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, roomId]); // سيحدث فقط عند تغير roomId أو players

  const mutation = useMutation({
    mutationFn: async (playersToUpdate: NewPlayer[]) => {
      await api.post(`/room/${roomId}/players`, { players: playersToUpdate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", roomId] });
    },
  });

  const handleChange = (
    index: number,
    field: "username" | "points",
    value: string
  ) => {
    setNewPlayers((prev) => {
      const updated = [...prev];
      if (field === "points") updated[index][field] = Number(value);
      else updated[index][field] = value;
      return updated;
    });
  };

  const addNewRow = () =>
    setNewPlayers((prev) => [...prev, { username: "", points: 0 }]);
  const removeRow = (index: number) =>
    setNewPlayers((prev) => prev.filter((_, i) => i !== index));
  const handleSave = () => mutation.mutate(newPlayers);

  const deleteMutation = useDeletePlayer(roomId);
  function handleRemovePlayer(
    player: { id?: string },
    index: number,
    removeRow: (idx: number) => void,
    deleteMutation: ReturnType<typeof useDeletePlayer>
  ) {
    if (!player.id) {
      // لو بدون ID → فقط احذفه من الواجهة
      removeRow(index);
      return;
    }

    // لو يوجد ID → حذف من قاعدة البيانات أولاً
    deleteMutation.mutate(player.id, {
      onSuccess: () => {
        removeRow(index); // تحديث الواجهة بعد نجاح الحذف
      },
    });
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        جاري التحميل...
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
      <CardHeader>
        <CardTitle>إدارة اللاعبين للغرفة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {newPlayers.map((p, idx) => (
          <div key={p.id ?? `new-${idx}`} className="flex gap-2 items-center">
            <Input
              placeholder="اسم اللاعب"
              value={p.username}
              onChange={(e) => handleChange(idx, "username", e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="النقاط"
              value={p.points}
              onChange={(e) => handleChange(idx, "points", e.target.value)}
              className="w-24"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                handleRemovePlayer(p, idx, removeRow, deleteMutation)
              }
            >
              إزالة
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button onClick={addNewRow}>إضافة لاعب جديد</Button>
          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>
          <ClearRoomButton roomId={roomId} />
        </div>
      </CardContent>
    </Card>
  );
}
