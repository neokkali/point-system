"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRooms } from "@/hooks/use-rooms";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Room } from "../../../../generated/prisma/browser";

const TabNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: rooms, isLoading, error } = useRooms();

  // 👈 استخراج الغرفة الحالية من URL
  const currentRoomId = pathname.split("/").pop();

  useEffect(() => {
    if (!rooms || rooms.length === 0) return;

    // إذا لا يوجد غرفة في URL (مثل /rooms فقط)
    if (!currentRoomId || currentRoomId === "rooms") {
      const lastRoom = localStorage.getItem("last_room");

      if (lastRoom && rooms.some((r: Room) => r.id === lastRoom)) {
        router.replace(`/rooms/${lastRoom}`);
      } else {
        router.replace(`/rooms/${rooms[0].id}`);
      }
    }
  }, [rooms, currentRoomId, router]);

  if (isLoading)
    return (
      <div className="max-w-3xl mx-auto mt-6">
        <Skeleton className="h-10 w-full mb-4 rounded-lg" />
      </div>
    );
  if (error) return <div>حدث خطأ أثناء جلب الغرف</div>;
  if (!rooms.length) return <div>لا توجد غرف</div>;

  const handleTabChange = (roomId: string) => {
    localStorage.setItem("last_room", roomId); // 🔥 تخزين آخر غرفة
    router.push(`/rooms/${roomId}`);
  };

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <Tabs
        value={currentRoomId}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-full">
          {rooms.map((room: Room) => (
            <TabsTrigger
              key={room.id}
              value={room.id}
              className="cursor-pointer text-sm lg:text-lg"
            >
              {room.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TabNavigation;
