"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface DotLoaderProps {
  /**
   * هل يغطي الشاشة بالكامل؟ (مثال: عند تحميل الموقع لأول مرة)
   * @default false
   */
  fullScreen?: boolean;
  /**
   * حجم النقاط
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * نص اختياري يظهر تحت التحميل
   */
  text?: string;
  /**
   * لون النقاط
   * @default "primary"
   */
  color?: "primary" | "secondary" | "white" | "muted" | "gray-500";
  /**
   * كلاسات إضافية للتخصيص
   */
  className?: string;
}

export const DotLoader = ({
  fullScreen = false,
  size = "md",
  text,
  color = "primary",
  className,
}: DotLoaderProps) => {
  // تعريف أحجام النقاط
  const dotSizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  // تعريف ألوان النقاط
  const dotColorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    white: "bg-white",
    muted: "bg-muted-foreground",
    "gray-500": "bg-gray-500",
  };

  // خصائص حاوية النقاط
  const containerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2, // تأخير ظهور كل نقطة
      },
    },
    end: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // خصائص حركة النقطة الواحدة
  const dotVariants = {
    start: {
      y: "0%", // تبدأ من نقطة الصفر
    },
    end: {
      y: "100%", // ترتفع وتنزل
    },
  };

  const containerClasses = cn(
    "flex flex-col items-center justify-center z-50",
    fullScreen
      ? "fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
      : "w-full h-full min-h-[100px]",
    className
  );

  return (
    <AnimatePresence>
      <motion.div
        key="dot-loader-key"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={containerClasses}
      >
        <motion.div
          className="flex space-x-1"
          variants={containerVariants}
          initial="start"
          animate="end"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.span
              key={i}
              className={cn(
                "block rounded-full",
                dotSizeClasses[size],
                dotColorClasses[color]
              )}
              variants={dotVariants}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse", // الحركة ذهاباً وإياباً
                ease: "easeInOut",
                delay: i * 0.1, // تأخير بسيط لكل نقطة لإنشاء تأثير الموجة
              }}
            />
          ))}
        </motion.div>

        {text && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm font-medium text-muted-foreground animate-pulse"
          >
            {text}
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
