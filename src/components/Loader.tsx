/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Salad } from "lucide-react";

const FOOD_FACTS = [
  "البروكلي يحتوي على نسبة فيتامين C تفوق البرتقال بالنسبة للحجم!",
  "التفاح يساعد في تنظيف الأسنان وتحفيز اللثة بفضل أليافه المتينة.",
  "الموز غني بالبوتاسيوم وهو مثالي للوقاية من التشنجات العضلية بعد التمرين.",
  "السبانخ تمد الجسم بالحديد النباتي، ويفضل تناولها مع الليمون لمضاعفة امتصاصه.",
  "التمر مصدر خارق للطاقة الفورية والألياف، ويحتوي على معادن هامة كالمغنيسيوم.",
  "الأفوكادو غني بالأحماض الدهنية الأحادية غير المشبعة والمفيدة جداً لصحة الدماغ والقلب.",
  "الشوفان غني ببيتا-جلوكان، وهو نوع من الألياف القابلة للذوبان والتي تخفض الكوليسترول الضار.",
  "اللوز مصدر ممتاز لفيتامين E، وهو مضاد أكسدة قوي يدعم صحة البشرة والمناعة.",
  "البيض يحتوي على بروتين كامل عالي الجودة مع كافة الأحماض الأمينية الأساسية التسعة."
];

interface LoaderProps {
  message?: string;
}

export default function Loader({ message = "جاري استشارة الذكاء الاصطناعي..." }: LoaderProps) {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FOOD_FACTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
      <div className="relative mb-6">
        {/* Animated glowing rings */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 border-b-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Salad className="w-8 h-8 text-emerald-600 animate-pulse" />
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg font-bold text-slate-800 mb-4"
      >
        {message}
      </motion.p>

      {/* Food Trivia box */}
      <div className="max-w-md bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="text-xs font-bold text-emerald-700 tracking-wider mb-2 uppercase flex items-center justify-center gap-1">
          <span>💡</span> هل تعلم؟
        </div>
        <div className="min-h-[48px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-slate-600 leading-relaxed font-medium"
            >
              {FOOD_FACTS[factIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
