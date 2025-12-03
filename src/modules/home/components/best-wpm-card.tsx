"use client";

import { DotLoader } from "@/components/app-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBestWpm } from "@/hooks/use-best-wpm";
import { motion } from "framer-motion";
import { Crown, Gauge } from "lucide-react";

export default function BestWpmCard() {
  const { data, isLoading, error } = useBestWpm();

  // ---------------- Loading Skeleton ----------------
  if (isLoading) {
    return <DotLoader text="جاري جلب ملك مدرب الطباعة" />;
  }

  // ---------------- Error ----------------
  if (error || !data?.bestWpm) {
    return (
      <Card className="w-full max-w-6xl mx-auto p-6 text-center text-red-500">
        حدث خطأ في جلب أعلى WPM
      </Card>
    );
  }

  const best = data.bestWpm;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-6xl mx-auto border border-border/60 shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader className="pb-2 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <CardTitle className="text-lg font-bold">
            أعلى نتيجة في مدرب الطباعة
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-3">
          <div className="flex items-center justify-between bg-muted/30 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-3">
              <Crown className="w-7 h-7 text-yellow-500" />
              <div>
                <p className="text-base font-semibold">{best.user.username}</p>
                <p className="text-sm text-muted-foreground">المركز الأول</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-secondary px-4 py-1.5 rounded-lg">
              <Gauge className="w-4 h-4" />
              <span className="font-mono text-sm font-bold">
                {best.wpm} WPM
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
