"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeletePlayer } from "@/hooks/use-deletet-player";
import { usePlayers } from "@/hooks/use-players";
import api from "@/lib/axiosClient";
import { useAuth } from "@/providers/auth-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
  points: string; // نخزن كـ string أثناء الكتابة
}

interface RoomPageProps {
  roomId: string;
}

export default function Players({ roomId }: RoomPageProps) {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const queryClient = useQueryClient();
  const { data: players, isLoading, error } = usePlayers(roomId);

  const [newPlayers, setNewPlayers] = useState<NewPlayer[]>([]);

  // ✅ تحديث newPlayers عند تغيّر roomId أو players
  useEffect(() => {
    if (players && players.length) {
      setNewPlayers(
        players.map((p: Player) => ({
          id: p.id,
          username: p.username,
          points: String(p.totalScore), // نخزن كـ string
        }))
      );
    } else {
      setNewPlayers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, roomId]);

  // Mutation لحفظ اللاعبين
  const mutation = useMutation({
    mutationFn: async (playersToUpdate: NewPlayer[]) => {
      // تحويل النقاط من string إلى number فقط إذا موجودة
      const sanitizedPlayers = playersToUpdate.map((p) => ({
        id: p.id,
        username: p.username,
        points: p.points === "" ? undefined : Number(p.points),
      }));
      await api.post(`/room/${roomId}/players`, { players: sanitizedPlayers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", roomId] });
    },
  });

  // Mutation لحذف لاعب
  const deleteMutation = useDeletePlayer(roomId);

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

  const handleSave = () => mutation.mutate(newPlayers);

  const handleRemovePlayer = (player: { id?: string }, index: number) => {
    if (!player.id) {
      // لو بدون ID → حذف من الواجهة فقط
      removeRow(index);
      return;
    }

    // لو يوجد ID → حذف من قاعدة البيانات أولاً
    deleteMutation.mutate(player.id, {
      onSuccess: () => {
        removeRow(index); // تحديث الواجهة بعد نجاح الحذف
      },
    });
  };

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
              className="flex-1 text-lg!"
            />
            <Input
              type="number"
              placeholder="النقاط"
              value={p.points}
              onChange={(e) => handleChange(idx, "points", e.target.value)}
              className="w-24 text-lg!"
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
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={addNewRow}
              className="w-full"
              disabled={mutation.isPending}
            >
              إضافة لاعب جديد
            </Button>
            {mutation.isPending ? (
              <Button
                variant={"secondary"}
                className="text-sm text-gray-500 w-full"
                disabled={mutation.isPending}
              >
                جاري الحفظ
                <Loader2 className="animate-spin" />
              </Button>
            ) : (
              <Button
                variant={"secondary"}
                onClick={handleSave}
                className="w-full"
              >
                حفظ التغييرات
              </Button>
            )}
          </div>
          {isAuthenticated && isAdmin && <ClearRoomButton roomId={roomId} />}
        </div>
      </CardContent>
    </Card>
  );
}
