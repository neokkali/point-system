"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { articleText } from "@/lib/speed-type-text";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RefreshCcw, Timer, Trophy, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// --- Helpers for Unicode-aware grapheme + diacritics handling ---
const getGraphemes = (s: string): string[] => {
  if (!s) return [];
  const SegmenterCtor = (
    Intl as unknown as { Segmenter?: typeof Intl.Segmenter }
  ).Segmenter;
  if (typeof SegmenterCtor === "function") {
    const seg = new SegmenterCtor(undefined, { granularity: "grapheme" });
    const iter = seg.segment(s) as Iterable<{ segment: string }>;
    return Array.from(iter, (part) => part.segment);
  }
  return Array.from(s.normalize("NFC"));
};

const normalizeArabicText = (str: string): string => {
  if (!str) return "";
  const spaceNormalized = str.replace(
    /\u00A0|\u200B|\u200C|\u200D|\u200E|\u200F/g,
    " "
  );
  const removedMarks = spaceNormalized
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\u0640/g, "");
  return removedMarks;
};

const GAME_DURATION = 60; // seconds
const WORDS_PER_GAME = 60; // عدد الكلمات لكل لعبة

export default function SpeedType({
  duration = GAME_DURATION,
}: {
  duration?: number;
}) {
  // --- state ---
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 0 });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(getRandomText()); // ✅ اختر النص العشوائي فقط على العميل
  }, []);

  // --- دوال مساعدة ---
  function getRandomText(): string {
    const words = articleText.split(/\s+/);
    if (words.length <= WORDS_PER_GAME) return articleText.trim();

    const startIndex = Math.floor(
      Math.random() * (words.length - WORDS_PER_GAME)
    );
    return words.slice(startIndex, startIndex + WORDS_PER_GAME).join(" ");
  }

  const graphemes = getGraphemes(text);
  const normalizedUser = normalizeArabicText(userInput);
  const normalizedUserChars = Array.from(normalizedUser);

  const calculateResults = () => {
    const totalChars = normalizedUserChars.length;
    let correctChars = 0;
    const expectedChars: string[] = [];
    for (const g of graphemes) {
      const base = normalizeArabicText(g);
      if (base.length > 0) expectedChars.push(...Array.from(base));
    }
    for (let i = 0; i < totalChars; i++) {
      if (normalizedUserChars[i] === expectedChars[i]) correctChars++;
    }
    const accuracy =
      totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
    const timeSpentSeconds = duration - timeLeft;
    const timeInMinutes =
      timeSpentSeconds === 0 ? duration / 60 : timeSpentSeconds / 60;
    const standardWordCount = correctChars / 5;
    const wpm =
      timeInMinutes > 0 ? Math.round(standardWordCount / timeInMinutes) : 0;
    setStats({ wpm, accuracy });
  };

  const finishGame = () => {
    setIsActive(false);
    setIsFinished(true);
    calculateResults();
    inputRef.current?.blur();
  };

  useEffect(() => {
    if (!isFinished) inputRef.current?.focus();
  }, [isFinished, isActive]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      finishGame();
    }
    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isActive && !isFinished) setIsActive(true);
    if (isFinished) return;
    const cleaned = value.replace(/\u200B|\u200C|\u200D/g, "");
    setUserInput(cleaned);

    const expectedBaseCount = graphemes.reduce((acc, g) => {
      const base = normalizeArabicText(g);
      return acc + (base.length > 0 ? Array.from(base).length : 0);
    }, 0);

    if (normalizeArabicText(cleaned).length >= expectedBaseCount) {
      setTimeout(() => finishGame(), 50);
    }
  };

  const resetGame = () => {
    setText(getRandomText()); // ✅ النص الجديد عند إعادة الضبط
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(duration);
    setUserInput("");
    setStats({ wpm: 0, accuracy: 0 });
    setTimeout(() => inputRef.current?.focus(), 40);
  };

  const renderText = () => {
    const normalizedUserCharsLocal = normalizedUserChars;
    let normalizedIndex = 0;
    return graphemes.map((cluster, idx) => {
      const baseNormalized = normalizeArabicText(cluster);
      const isBase = baseNormalized.length > 0;
      const expected = isBase ? Array.from(baseNormalized)[0] : "";
      let status: "untyped" | "correct" | "incorrect" = "untyped";
      if (isBase && normalizedIndex < normalizedUserCharsLocal.length) {
        const userChar = normalizedUserCharsLocal[normalizedIndex];
        status = userChar === expected ? "correct" : "incorrect";
      }
      const showCursor =
        isBase &&
        normalizedIndex === normalizedUserCharsLocal.length &&
        !isFinished &&
        isActive;
      if (isBase) normalizedIndex++;
      const colorClass =
        status === "correct"
          ? "text-foreground"
          : status === "incorrect"
          ? "text-destructive bg-destructive/10"
          : "text-muted-foreground/50";
      const cursorClass = showCursor
        ? "border-r-2 border-primary/90 animate-pulse"
        : "";
      return (
        <span
          key={idx}
          className={cn(
            "text-xl md:text-3xl leading-relaxed transition-colors duration-75",
            colorClass,
            cursorClass
          )}
        >
          {cluster}
        </span>
      );
    });
  };

  return (
    <div className="mt-5">
      <h1 className="text-xl md:text-3xl font-bold text-center">
        مدرب الطباعة
      </h1>
      <div className="w-full max-w-7xl mx-auto mb-8" dir="rtl">
        {isFinished ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-8 py-10"
          >
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              <div className="flex flex-col items-center justify-center p-8 bg-card rounded-xl border border-border min-w-[180px] shadow-lg">
                <span className="text-muted-foreground text-sm font-medium mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" /> السرعة
                  (كلمة/دقيقة)
                </span>
                <span className="text-7xl font-bold text-primary tracking-tighter">
                  {stats.wpm}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-8 bg-card rounded-xl border border-border min-w-[180px] shadow-lg">
                <span className="text-muted-foreground text-sm font-medium mb-2 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" /> الدقة
                </span>
                <span className="text-7xl font-bold text-primary tracking-tighter">
                  {stats.accuracy}%
                </span>
              </div>
            </div>
            <div className="text-center space-y-6">
              <p className="text-slate-400 text-lg">
                {stats.wpm > 80
                  ? "أداء ممتاز! 🚀"
                  : "محاولة جيدة! استمر في التدريب 💪"}
              </p>
              <Button
                onClick={resetGame}
                size="lg"
                className="gap-2 px-10 py-6 text-lg rounded-full"
              >
                <RefreshCcw className="w-5 h-5" /> اختبار جديد
              </Button>
            </div>
          </motion.div>
        ) : (
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center justify-between px-4 py-2  w-fit mx-auto md:w-full md:mx-0">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-primary flex items-center gap-1">
                    <Timer className="w-7 h-7 mb-2" />
                    <span>{timeLeft}</span>
                  </div>
                  <span className="text-xs text-muted-foreground hidden md:inline">
                    ثانية
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetGame}
                  className="text-muted-foreground hover:text-foreground gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />{" "}
                  <span className="hidden md:inline">إعادة ضبط</span>
                </Button>
              </div>
              <div
                className="relative min-h-[200px] bg-muted/30 rounded-2xl p-6 md:p-10 leading-loose shadow-inner border border-border cursor-text group transition-colors"
                onClick={() => inputRef.current?.focus()}
              >
                {!isActive && userInput.length === 0 && (
                  <div className="absolute top-2 left-3 pointer-events-none">
                    <span className="text-muted-foreground/50 text-base animate-pulse">
                      اضغط هنا وابدأ الكتابة...
                    </span>
                  </div>
                )}
                <div
                  dir="rtl"
                  className="wrap-break-word whitespace-pre-wrap"
                  style={{ textAlign: "justify" }}
                >
                  {renderText()}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="text"
                  value={userInput}
                  onChange={handleInputChange}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-label="أدخل النص هنا"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                السرعة تحسب بناءً على الأحرف الصحيحة المكتوبة (مع تجاهل
                التشكيل).
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
