"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalScores } from "@/hooks/use-global-scores";
import { Loader2 } from "lucide-react";

export default function HomeView() {
  const { data, isLoading, error } = useGlobalScores();

  if (isLoading)
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 p-6">
        حدث خطأ أثناء تحميل النقاط
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="text-center text-gray-500 p-6">لا توجد نقاط بعد</div>
    );

  const maxScore = Math.max(...data.map((p: any) => p.totalScore));

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">ترتيب النقاط العام</h2>

      {data.map((player: any, idx: number) => {
        const isKing = player.totalScore === maxScore;
        const progressPercent = Math.min(
          (player.totalScore / maxScore) * 100,
          100
        );

        return (
          <Card key={idx} className="border shadow-sm dark:border-gray-700">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <span className="font-semibold">{player.username}</span>
                {isKing && <Badge variant="destructive">الملك 👑</Badge>}
              </CardTitle>
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {player.totalScore} نقطة
              </span>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full relative">
                <div
                  className="h-2 bg-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
