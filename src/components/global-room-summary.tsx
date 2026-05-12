"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Fingerprint, LayoutGrid, Star } from "lucide-react";
import useRoomSummary from "@/hooks/use-room-summary";
import { Skeleton } from "@/components/ui/skeleton";

type GlobalRoomSummaryTypes = {
  roomId: string;
  roomName: string;
  totalPoints: string;
  updatedAt: string;
};

export const GlobalRoomSummary = () => {
  const { data, isLoading, error } = useRoomSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || !data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {data.map((room: GlobalRoomSummaryTypes) => (
        <Card
          key={room.roomId}
          className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:border-primary/40 transition-colors"
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-[12px] sm:text-sm lg:text-base truncate max-w-30">
                  {room.roomName}
                </h3>
              </div>
              <Badge
                variant="secondary"
                className="font-mono font-black text-yellow-600 dark:text-yellow-400 bg-yellow-500/10"
              >
                <Star className="w-3 h-3 ml-1 fill-current" />
                {room.totalPoints.toLocaleString()}
              </Badge>
            </div>

            <div className="flex flex-col gap-1 mt-3 border-t pt-2 border-border/40">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <CalendarDays className="w-3 h-3" />
                <span>آخر تحديث:</span>
                <span className="font-medium text-foreground/80">
                  {new Date(room.updatedAt).toLocaleDateString("ar-SA", {
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/60 font-mono italic">
                <Fingerprint className="w-2.5 h-2.5" />
                <span>ID: {room.roomId}...</span>
              </div>
            </div>
          </CardContent>

          {/* Decorative Background Icon */}
          <Star className="absolute -bottom-2 -right-2 w-12 h-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12" />
        </Card>
      ))}
    </div>
  );
};
