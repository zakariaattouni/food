/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Droplet, Heart, Flame, Lightbulb, Salad, RefreshCw } from "lucide-react";
import { DailyTip } from "../types";

export default function DailyTipWidget() {
  const [tipData, setTipData] = useState<DailyTip | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTip = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gemini/daily-tip");
      if (res.ok) {
        const data = await res.json();
        setTipData(data);
      } else {
        throw new Error();
      }
    } catch {
      // Fallback tip in case of failures
      setTipData({
        title: "روعة شرب الماء صباحاً",
        tip: "ابدأ يومك بكوب كبير من الماء الفاتر لتنشيط أعضاء الجسم الداخلية، وتحفيز عملية التمثيل الغذائي بعد ساعات من الصيام أثناء النوم.",
        category: "hydration"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTip();
  }, []);

  const getCategoryDetails = (cat?: string) => {
    switch (cat) {
      case 'hydration':
        return {
          icon: <Droplet className="w-5 h-5 text-blue-600" />,
          bg: "bg-blue-50 border-blue-100",
          badgeBg: "bg-blue-100 text-blue-800",
          label: "ترطيب وسوائل"
        };
      case 'vitamin':
        return {
          icon: <Flame className="w-5 h-5 text-amber-600" />,
          bg: "bg-amber-50 border-amber-100",
          badgeBg: "bg-amber-100 text-amber-800",
          label: "مغذيات وفيتامينات"
        };
      case 'food':
        return {
          icon: <Salad className="w-5 h-5 text-emerald-600" />,
          bg: "bg-emerald-50 border-emerald-100",
          badgeBg: "bg-emerald-100 text-emerald-800",
          label: "أطعمة صحية"
        };
      case 'habit':
        return {
          icon: <Heart className="w-5 h-5 text-rose-600" />,
          bg: "bg-rose-50 border-rose-100",
          badgeBg: "bg-rose-100 text-rose-800",
          label: "عادات ذكية"
        };
      default:
        return {
          icon: <Lightbulb className="w-5 h-5 text-indigo-600" />,
          bg: "bg-indigo-50 border-indigo-100",
          badgeBg: "bg-indigo-100 text-indigo-800",
          label: "نصيحة عامة"
        };
    }
  };

  const details = getCategoryDetails(tipData?.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative border rounded-2xl p-5 shadow-sm transition-all overflow-hidden ${
        loading ? "bg-slate-50 border-slate-100" : details.bg
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          {/* Animated pulsing icon frame */}
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
            {loading ? (
              <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
            ) : (
              details.icon
            )}
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="space-y-2 py-1">
                <div className="h-4 bg-slate-200 rounded w-28 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-full animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-3/4 animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h3 className="font-bold text-slate-800 text-base">
                    {tipData?.title}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${details.badgeBg}`}>
                    {details.label}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {tipData?.tip}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Refresh button */}
        {!loading && (
          <button
            onClick={fetchTip}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-black/5 transition-all self-start"
            title="نصيحة أخرى"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
