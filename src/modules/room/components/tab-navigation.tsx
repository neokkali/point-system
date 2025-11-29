"use client";

import { useRooms } from "@/hooks/use-rooms";
import { useRouter } from "next/navigation";
import { Room } from "../../../../generated/prisma/browser";

const TabNavigation = () => {
  const router = useRouter();
  const { data: rooms, isLoading, error } = useRooms();

  if (isLoading) return <div>جاري التحميل...</div>;
  if (error) return <div>حدث خطأ أثناء جلب الغرف</div>;

  return (
    <div className="flex gap-4">
      {rooms.map((room: Room) => (
        <div
          key={room.id}
          onClick={() => router.push(`/rooms/${room.id}`)}
          className="px-4 py-2 border rounded cursor-pointer hover:bg-gray-200"
        >
          {room.name}
        </div>
      ))}
    </div>
  );
};

export default TabNavigation;
