"use client";

import { Loader2, RefreshCcw } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

// --- تكوين اللعبة ---
const CONFIG = {
  initialTime: 30, // مدة الاختبار بالثواني
  wordCount: 50, // عدد الكلمات المبدئي
  apiUrl: "https://api.example.com/v1/results", // رابط الـ API الافتراضي
};

// --- قائمة كلمات عربية شائعة للاختبار ---
const WORD_LIST = [
  "السماء",
  "الأرض",
  "الحياة",
  "العمل",
  "الوقت",
  "النجاح",
  "التعلم",
  "المستقبل",
  "الذكاء",
  "البرمجة",
  "الحاسوب",
  "المعرفة",
  "القراءة",
  "الكتابة",
  "العلم",
  "نحن",
  "هم",
  "كان",
  "يكون",
  "أصبح",
  "جميل",
  "كبير",
  "صغير",
  "سريع",
  "بطيء",
  "قوي",
  "ضعيف",
  "جديد",
  "قديم",
  "ذهب",
  "عاد",
  "قال",
  "يقول",
  "مدرسة",
  "جامعة",
  "طريق",
  "بيت",
  "سيارة",
  "فكرة",
  "مشكلة",
  "حل",
  "صديق",
  "عائلة",
  "حب",
  "سلام",
  "حرب",
  "تاريخ",
  "جغرافيا",
  "لغة",
  "عربي",
  "تقنية",
  "بيانات",
  "شبكة",
  "نظام",
  "تطوير",
  "بحث",
  "نتيجة",
];

// --- دوال مساعدة ---
const generateWords = (count: number) => {
  return new Array(count)
    .fill(0)
    .map(() => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)])
    .join(" ");
};

const calculateWPM = (correctChars: number, timeElapsed: number) => {
  if (timeElapsed === 0) return 0;
  const words = correctChars / 5;
  const minutes = timeElapsed / 60;
  return Math.round(words / minutes);
};

// --- المكون الرئيسي ---
export default function MonkeyTyper() {
  // الحالة (State)
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(CONFIG.initialTime);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [caretPos, setCaretPos] = useState({ top: 0, right: 0 }); // Right for RTL
  const [isSubmitting, setIsSubmitting] = useState(false);

  // المراجع (Refs)
  const inputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. تهيئة اللعبة
  const resetGame = useCallback(() => {
    const newText = generateWords(CONFIG.wordCount);
    setText(newText);
    setUserInput("");
    setTimeLeft(CONFIG.initialTime);
    setIsActive(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    setIsSubmitting(false);
    charRefs.current = []; // تصفير مراجع الأحرف

    // التركيز التلقائي
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // 2. مؤقت اللعبة
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // 3. إنهاء اللعبة وإرسال البيانات
  const finishGame = async () => {
    setIsActive(false);
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // حساب النتائج النهائية
    const timeElapsed = CONFIG.initialTime - timeLeft || CONFIG.initialTime;

    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === text[i]) correctChars++;
    }

    const finalWpm = calculateWPM(correctChars, CONFIG.initialTime);
    const finalAccuracy =
      userInput.length > 0
        ? Math.round((correctChars / userInput.length) * 100)
        : 0;

    setWpm(finalWpm);
    setAccuracy(finalAccuracy);

    // محاكاة إرسال للـ API
    await sendResultsToAPI(finalWpm, finalAccuracy);
  };

  const sendResultsToAPI = async (finalWpm: number, finalAccuracy: number) => {
    setIsSubmitting(true);
    try {
      console.log("Sending results...", {
        wpm: finalWpm,
        accuracy: finalAccuracy,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // هنا يمكنك استخدام دالة fetch الحقيقية لإرسال البيانات
      /*
      await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wpm: finalWpm, accuracy: finalAccuracy, timestamp: new Date() })
      });
      */
      console.log("Results sent successfully!");
    } catch (error) {
      console.error("Failed to send results", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. معالجة الإدخال
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      resetGame();
      return;
    }

    if (isFinished) return;

    if (!isActive && !isFinished && userInput.length === 0) {
      setIsActive(true);
    }
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    const val = e.target.value;

    // التعامل مع الحذف (Backspace)
    if (val.length < userInput.length) {
      setUserInput(val);
      return;
    }

    // السماح بالإدخال حتى بعد نهاية النص الأصلي (لإظهار الأحرف الزائدة)
    // لكن نمنع التجاوز إذا تجاوز المستخدم النص الأصلي بأكثر من اللازم
    if (val.length > text.length + 10) return;

    setUserInput(val);

    const timeElapsed = CONFIG.initialTime - timeLeft;
    if (timeElapsed > 0) {
      let correct = 0;
      for (let i = 0; i < val.length; i++) if (val[i] === text[i]) correct++;
      setWpm(calculateWPM(correct, timeElapsed));
    }
  };

  // 5. تحديث مكان المؤشر
  useEffect(() => {
    const currentIndex = userInput.length;
    let currentCharElement = charRefs.current[currentIndex];
    const container = textContainerRef.current;

    if (!container) return;

    // إذا انتهى النص الأصلي، نستخدم آخر حرف تم كتابته لوضع المؤشر بعده
    if (currentIndex >= text.length) {
      currentCharElement = charRefs.current[text.length - 1];
    }

    // إذا لم يتم كتابة أي شيء، نستخدم أول حرف لوضع المؤشر قبله
    if (currentIndex === 0) {
      currentCharElement = charRefs.current[0];
    }

    if (currentCharElement) {
      const charRect = currentCharElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const relativeTop = charRect.top - containerRect.top;

      let relativeRight;

      if (currentIndex >= text.length) {
        // إذا تجاوزنا النص، نضع المؤشر بعد الحرف الأخير
        relativeRight = containerRect.right - charRect.left;
      } else {
        // نضع المؤشر قبل الحرف الحالي
        relativeRight = containerRect.right - charRect.right;
      }

      setCaretPos({
        top: relativeTop + 4,
        right: relativeRight - 2,
      });
    }

    // إذا تجاوز المستخدم السطر، يجب تمرير النص لأعلى
    // لم يعد هذا المنطق ضرورياً لأن الحاوية ستتمدد، ولكن نتركه في حال تم إضافة حد للارتفاع لاحقًا.
    if (currentCharElement && textContainerRef.current) {
      const container = textContainerRef.current;
      const containerHeight = container.clientHeight;
      const charTop = currentCharElement.offsetTop;
      const charHeight = currentCharElement.offsetHeight;

      // إذا كان الحرف الحالي خارج الجزء السفلي المرئي
      if (charTop + charHeight > container.scrollTop + containerHeight) {
        container.scrollTop = charTop - containerHeight + charHeight * 2;
      }
    }
  }, [userInput, text]);

  return (
    <div
      className="min-h-screen bg-[#323437] font-mono text-[#646669] flex flex-col items-center justify-center p-8 transition-colors duration-300"
      dir="rtl"
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 pointer-events-none"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      {/* Header / Stats */}
      <div className="w-full max-w-4xl flex justify-between items-end mb-12 select-none">
        <div className="flex gap-8 text-2xl">
          <div
            className={`transition-colors duration-200 ${
              isActive ? "text-[#e2b714]" : ""
            }`}
          >
            {timeLeft}
          </div>
          {isActive && <div className="text-[#646669] opacity-50">{wpm}</div>}
        </div>

        <div className="flex gap-4 text-sm font-medium">
          <span className="bg-[#2c2e31] px-3 py-1 rounded text-[#e2b714] cursor-pointer hover:text-white transition-colors">
            العربية
          </span>
          <span className="bg-[#2c2e31] px-3 py-1 rounded hover:text-[#e2b714] cursor-pointer transition-colors">
            {CONFIG.initialTime} ثانية
          </span>
        </div>
      </div>

      {/* Main Game Area */}
      {/* تم إزالة تحديد الارتفاع الأقصى (max-h) للسماح للنص بالظهور بالكامل */}
      <div className="relative w-full max-w-4xl min-h-[120px] overflow-hidden text-3xl leading-relaxed break-all">
        {isFinished && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#323437]/95 backdrop-blur-sm animate-in fade-in zoom-in duration-300 rounded-lg">
            <div className="grid grid-cols-2 gap-12 text-center mb-8">
              <div>
                <div className="text-xl text-[#646669] mb-1">WPM</div>
                <div className="text-6xl font-bold text-[#e2b714]">{wpm}</div>
              </div>
              <div>
                <div className="text-xl text-[#646669] mb-1">الدقة</div>
                <div className="text-6xl font-bold text-[#e2b714]">
                  {accuracy}%
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-6 py-3 bg-[#2c2e31] hover:bg-[#e2b714] hover:text-[#323437] rounded transition-all duration-200"
              >
                <RefreshCcw size={20} />
                <span>إعادة (Tab)</span>
              </button>

              {isSubmitting && (
                <div className="flex items-center gap-2 px-4 py-3 text-[#e2b714]">
                  <Loader2 className="animate-spin" />
                  <span>جار الحفظ...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text Display */}
        {!isFinished && (
          <div
            ref={textContainerRef}
            className="relative select-none outline-none"
          >
            {/* Smooth Caret */}
            {isActive && !isFinished && (
              <div
                className="absolute w-[3px] h-[36px] bg-[#e2b714] rounded-full transition-all duration-100 ease-out will-change-transform z-10"
                style={{
                  top: caretPos.top,
                  right: caretPos.right,
                }}
              >
                <div className="absolute inset-0 bg-[#e2b714] animate-ping opacity-20 rounded-full"></div>
              </div>
            )}

            {/* Letters */}
            {/* 1. عرض النص الأصلي */}
            {text.split("").map((char, index) => {
              const userChar = userInput[index];
              const isTyped = index < userInput.length;

              let colorClass = "text-[#646669]"; // Untyped default
              let content = char;

              if (isTyped) {
                if (userChar === char) {
                  colorClass = "text-[#d1d0c5]"; // Correct
                } else {
                  colorClass = "text-[#ca4754]"; // Incorrect

                  // إذا كان الحرف المطلوب مسافة، والمستخدم كتب شيئاً آخر، نظهر الحرف المكتوب بالخطأ
                  if (char === " " && userChar !== " ") {
                    content = userChar;
                  }
                }
              }

              return (
                <span
                  key={index}
                  ref={(el) => (charRefs.current[index] = el)}
                  className={`${colorClass} relative transition-colors duration-75`}
                >
                  {content}
                  {/* خط تحت الحرف الخطأ */}
                  {isTyped && userChar !== char && char !== " " && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ca4754]/50"></span>
                  )}
                </span>
              );
            })}

            {/* 2. عرض الأحرف الإضافية المكتوبة بعد نهاية النص */}
            {userInput
              .slice(text.length)
              .split("")
              .map((char, index) => (
                <span
                  key={`extra-${index}`}
                  ref={(el) => (charRefs.current[text.length + index] = el)}
                  className="text-[#ca4754] bg-[#ca4754]/20 relative transition-colors duration-75"
                >
                  {char}
                </span>
              ))}
          </div>
        )}
      </div>

      <div className="mt-16 text-[#646669] text-sm flex gap-8 opacity-70 transition-opacity hover:opacity-100">
        <div className="flex items-center gap-2">
          <span className="bg-[#2c2e31] px-2 py-1 rounded text-xs">tab</span>
          <span>لإعادة البدء</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#2c2e31] px-2 py-1 rounded text-xs">esc</span>
          <span>للخروج</span>
        </div>
      </div>
    </div>
  );
}
