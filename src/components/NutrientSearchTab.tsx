/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  Award,
  ShieldAlert,
  Flame,
  Activity,
  Heart,
  Sparkles,
  BookmarkCheck,
  Zap,
  CheckCircle2,
  MapPin
} from "lucide-react";
import { NutrientReport } from "../types";
import Loader from "./Loader";

const NUTRIENT_SUGGESTIONS = [
  "فيتامين سي (C)",
  "الحديد",
  "الزنك",
  "فيتامين د (D)",
  "المغنيسيوم",
  "فيتامين ب12",
  "الكالسيوم",
  "البوتاسيوم"
];

export default function NutrientSearchTab() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutrientData, setNutrientData] = useState<NutrientReport | null>(null);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gemini/nutrient-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchTerm }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "فشل جلب تفاصيل العنصر الغذائي");
      }

      const data = await res.json();
      setNutrientData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ غير متوقع أثناء البحث.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input Box - Ultra Distinctive & Premium Design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-6 md:p-8 shadow-xl border border-emerald-800/40">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                البحث عن الفيتامينات والمعادن (أين توجد؟)
              </h2>
              <p className="text-xs md:text-sm text-emerald-200/70 font-medium leading-relaxed mt-1">
                تبحث عن فيتامين معين أو معدن كـ (الزنك، فيتامين ب12، المغنيسيوم...) وتريد معرفة أهم الأطعمة الغنية به، جرعته اليومية، وأعراض نقصه؟ اكتبه بالأسفل الآن.
              </p>
            </div>
          </div>

          {/* Input bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-3xl">
            <div className="relative flex-1">
              <input
                type="text"
                dir="rtl"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(query);
                }}
                placeholder="مثال: فيتامين سي، المغنيسيوم، الحديد..."
                className="w-full pl-4 pr-12 py-3.5 bg-white border border-emerald-500/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/30 text-slate-900 text-sm md:text-base font-bold transition-all placeholder:text-slate-400 shadow-inner"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 w-5.5 h-5.5" />
            </div>
            <button
              onClick={() => handleSearch(query)}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/35 active:scale-[0.98] transition-all text-sm md:text-base flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>ابحث الآن</span>
            </button>
          </div>

          {/* Suggestions */}
          <div className="mt-5 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-emerald-300/80 font-bold ml-2">اقتراحات سريعة:</span>
            {NUTRIENT_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                onClick={() => {
                  const cleanName = sug.split(" (")[0]; // remove brackets if any
                  setQuery(cleanName);
                  handleSearch(cleanName);
                }}
                className="text-xs font-extrabold px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl transition-all cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-sm font-medium flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main output */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <Loader message={`جاري استكشاف وتحليل مصادر وخصائص "${query || "العنصر المطلوب"}" بالذكاء الاصطناعي...`} />
        </div>
      ) : (
        nutrientData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Core Nutrient overview */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h2 className="text-2xl font-extrabold text-slate-800">
                      {nutrientData.name}
                    </h2>
                    {nutrientData.alternativeNames.map((alt, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold">
                        {alt}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 font-semibold">
                    تصنيف: مغذيات دقيقة حيوية
                  </p>
                </div>

                {/* RDA Card */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 px-4 text-right shrink-0">
                  <span className="block text-[11px] font-extrabold text-emerald-600 mb-0.5">الاحتياج اليومي المقدر (RDA)</span>
                  <span className="text-sm font-black text-emerald-800">{nutrientData.recommendedDailyAllowance}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {nutrientData.description}
                </p>
              </div>
            </div>

            {/* Layout details: Left column (biological role & top foods), Right column (symptoms & absorption) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Biological Role & Top Foods (Left, 7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Role in body */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    وظائفه الحيوية وتأثيره في خلايا وأعضاء الجسم
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {nutrientData.roleInBody}
                  </p>
                </div>

                {/* Where to find it and availability */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-100/80 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600 animate-bounce" />
                    أين نجده وتوفره ومصادره الطبيعية الأساسية
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                    {nutrientData.availabilityAndSources}
                  </p>
                </div>

                {/* Top Food Sources */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-emerald-600" />
                    أهم الأغذية الطبيعية الغنية به (لكل 100 جرام)
                  </h3>

                  <div className="space-y-4">
                    {nutrientData.topFoods.map((food, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm">{food.foodName}</h4>
                          </div>
                          
                          {/* Progress bar indicating DV Percentage */}
                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                              <span>النسبة المحققة من الاحتياج اليومي</span>
                              <span className="text-emerald-600">{food.dvPercentage}%</span>
                            </div>
                            <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full"
                                style={{ width: `${Math.min(food.dvPercentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Amount & Notes */}
                        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                          <span className="text-xs font-black text-emerald-700 bg-emerald-100/50 px-2.5 py-1 rounded-md">
                            {food.amountPer100g}
                          </span>
                          <span className="text-xs text-slate-500 max-w-[200px] text-right leading-relaxed font-semibold">
                            {food.notes}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Deficiency/Toxicity Symptoms & Absorption Tips (Right, 5 cols) */}
              <div className="lg:col-span-5 space-y-6">

                {/* Absorption Enhancement tips */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-600/20 rounded-full blur-2xl" />
                  <h3 className="text-sm font-extrabold text-emerald-400 mb-3 flex items-center gap-1.5 relative">
                    <BookmarkCheck className="w-5 h-5" />
                    تحسين الامتصاص الفعال
                  </h3>
                  <p className="text-xs text-emerald-100/90 leading-relaxed font-light relative">
                    {nutrientData.absorptionTips}
                  </p>
                </div>

                {/* Deficiency symptoms (Red box) */}
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2 pb-1.5 border-b border-rose-100/50">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    أعراض وعلامات النقص في الجسم
                  </h3>
                  <ul className="space-y-2">
                    {nutrientData.deficiencySymptoms.map((sym, i) => (
                      <li key={i} className="text-xs text-rose-700 font-semibold flex items-start gap-1.5 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{sym}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Toxicity symptoms (Amber box) */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2 pb-1.5 border-b border-amber-100/50">
                    <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                    أعراض الجرعات المفرطة أو السمية
                  </h3>
                  <ul className="space-y-2">
                    {nutrientData.toxicitySymptoms.map((sym, i) => (
                      <li key={i} className="text-xs text-amber-700 font-semibold flex items-start gap-1.5 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{sym}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          </motion.div>
        )
      )}
    </div>
  );
}
