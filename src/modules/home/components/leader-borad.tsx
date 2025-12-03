"use client";

import { DotLoader } from "@/components/app-loader";
import { useTopScores } from "@/hooks/use-top-scores";
import { motion } from "framer-motion";

const medalIcons = ["🏆", "✨", "⭐"]; // للأفضل 3

export default function Leaderboard() {
  const { data: topScores, isLoading } = useTopScores();

  if (isLoading) return <DotLoader text="جاري جلب افضل عشره كاتبين" />;

  if (!topScores || topScores.length === 0)
    return (
      <p className="text-center text-muted-foreground">لا يوجد نتائج بعد.</p>
    );

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4 bg-card rounded-xl border border-border shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-foreground text-center">
        أفضل 10 لاعبين
      </h2>

      <ol className="space-y-2">
        {topScores.map((score, idx) => {
          const isTop3 = idx < 3;
          const icon = isTop3 ? medalIcons[idx] : null;

          return (
            <motion.li
              key={score.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-4 bg-background border border-border rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground font-mono">
                  #{idx + 1}
                </span>
                {icon && <span className="text-primary text-xl">{icon}</span>}
                <span className="text-foreground font-medium">
                  {score.user.username}
                </span>
              </div>
              <span className="text-foreground font-semibold">
                {score.wpm} WPM
              </span>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
