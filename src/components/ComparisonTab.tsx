/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeftRight,
  Flame,
  Award,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Check,
  UtensilsCrossed,
  Sparkles
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ComparisonReport } from "../types";
import Loader from "./Loader";

const PRESET_COMPARISONS = [
  { label: "تفاح 🍎 ضد موز 🍌", a: "تفاح", b: "موز" },
  { label: "بيض 🥚 ضد حليب 🥛", a: "بيض", b: "حليب" },
  { label: "شوفان 🌾 ضد أرز أبيض 🍚", a: "شوفان", b: "أرز أبيض" },
  { label: "لوز 🥜 ضد جوز هند 🥥", a: "لوز", b: "جوز هند" }
];

export default function ComparisonTab() {
  const [foodA, setFoodA] = useState("");
  const [foodB, setFoodB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compareData, setCompareData] = useState<ComparisonReport | null>(null);

  const handleCompare = async (a: string, b: string) => {
    if (!a.trim() || !b.trim()) {
      setError("الرجاء تحديد كلا الغذاءين لبدء المقارنة");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gemini/nutrition-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodA: a, foodB: b }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "فشل إجراء المقارنة الغذائية");
      }

      const data = await res.json();
      setCompareData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ غير متوقع أثناء مقارنة الأغذية.");
    } finally {
      setLoading(false);
    }
  };

  const getChartData = (report: ComparisonReport) => {
    return [
      { name: "بروتين", [report.foodA.name]: report.foodA.protein, [report.foodB.name]: report.foodB.protein },
      { name: "كربوهيدرات", [report.foodA.name]: report.foodA.carbs, [report.foodB.name]: report.foodB.carbs },
      { name: "دهون", [report.foodA.name]: report.foodA.fat, [report.foodB.name]: report.foodB.fat },
      { name: "ألياف", [report.foodA.name]: report.foodA.fiber, [report.foodB.name]: report.foodB.fiber }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Input box - Ultra Distinctive & Premium Design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-6 md:p-8 shadow-xl border border-emerald-800/40">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <ArrowLeftRight className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                مقارنة الأغذية الذكية والمفاضلة بينها
              </h2>
              <p className="text-xs md:text-sm text-emerald-200/70 font-medium leading-relaxed mt-1">
                قارن بين أي غذاءين بالتفصيل لتعرف الفروقات الجوهرية في السعرات والبروتين والألياف والدهون، واكتشف الخيار الأفضل لأهدافك البدنية والمناعية بالذكاء الاصطناعي.
              </p>
            </div>
          </div>

          {/* Side-by-side inputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center max-w-4xl mt-6">
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-emerald-300 mb-1.5">الغذاء الأول (أ):</label>
              <input
                type="text"
                dir="rtl"
                value={foodA}
                onChange={(e) => setFoodA(e.target.value)}
                placeholder="مثال: تفاح، صدر دجاج..."
                className="w-full px-4 py-3.5 bg-white border border-emerald-500/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/30 text-slate-900 text-sm md:text-base font-bold transition-all placeholder:text-slate-400 shadow-inner"
              />
            </div>

            <div className="md:col-span-2 flex justify-center pt-5">
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner backdrop-blur-md">
                ضد
              </span>
            </div>

            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-emerald-300 mb-1.5">الغذاء الثاني (ب):</label>
              <input
                type="text"
                dir="rtl"
                value={foodB}
                onChange={(e) => setFoodB(e.target.value)}
                placeholder="مثال: موز، لحم بقري..."
                className="w-full px-4 py-3.5 bg-white border border-emerald-500/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/30 text-slate-900 text-sm md:text-base font-bold transition-all placeholder:text-slate-400 shadow-inner"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between border-t border-emerald-800/40 pt-5">
            {/* Presets */}
            <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
              <span className="text-xs text-emerald-300/80 font-bold ml-2">تجارب شائعة:</span>
              {PRESET_COMPARISONS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setFoodA(preset.a);
                    setFoodB(preset.b);
                    handleCompare(preset.a, preset.b);
                  }}
                  className="text-xs font-extrabold px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl transition-all cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleCompare(foodA, foodB)}
              disabled={loading}
              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/35 active:scale-[0.98] transition-all text-sm md:text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>ابدأ المقارنة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main output */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <Loader message={`جاري مقارنة "${foodA}" مع "${foodB}" وتحليل الفروقات الجوهرية...`} />
        </div>
      ) : (
        compareData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Calories comparison widget */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-600" />
                مقارنة السعرات الحرارية لكل 100 جرام
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Food A Calories */}
                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/30 flex justify-between items-center">
                  <div>
                    <span className="block text-xs font-bold text-slate-400 mb-0.5">الغذاء الأول</span>
                    <span className="text-lg font-black text-slate-800">{compareData.foodA.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-emerald-600">{compareData.foodA.calories}</span>
                    <span className="text-[10px] font-bold text-emerald-500 block">سعرة حرارية</span>
                  </div>
                </div>

                {/* Food B Calories */}
                <div className="bg-teal-50/50 rounded-2xl p-4 border border-teal-100/30 flex justify-between items-center">
                  <div>
                    <span className="block text-xs font-bold text-slate-400 mb-0.5">الغذاء الثاني</span>
                    <span className="text-lg font-black text-slate-800">{compareData.foodB.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-teal-600">{compareData.foodB.calories}</span>
                    <span className="text-[10px] font-bold text-teal-500 block">سعرة حرارية</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Side-by-side grouped Bar Chart & Key Differences layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Grouped Bar Chart (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  مقارنة المغذيات الكبرى (بالجرام لكل 100 غرام)
                </h3>

                <div className="w-full h-[260px] text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getChartData(compareData)}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey={compareData.foodA.name} fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey={compareData.foodB.name} fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Key Differences (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-emerald-600" />
                    الفروقات الرئيسية الجوهرية
                  </h3>
                  <ul className="space-y-3">
                    {compareData.keyDifferences.map((diff, i) => (
                      <li key={i} className="text-xs text-slate-600 font-semibold flex items-start gap-2 leading-relaxed">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{diff}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Micro recommendation card */}
                <div className="mt-6 bg-slate-50 border border-slate-100 rounded-xl p-4 flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    الذكاء الاصطناعي يدعم دمج الأطعمة المتنوعة ضمن نظامك الغذائي للاستفادة من مزايا كلا المصدرين وتجنب الحرمان.
                  </p>
                </div>
              </div>

            </div>

            {/* Goal-Oriented Comparison Matrix (Winners) */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                المفاضلة بينهما بناءً على هدفك الصحي البدني
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Weight Loss */}
                <div className="p-4 rounded-xl border border-slate-100 bg-emerald-50/20 hover:bg-emerald-50/50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">🥗 هدف إنقاص الوزن</span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      الفائز: {compareData.winnerForGoals.weightLoss.winner}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    {compareData.winnerForGoals.weightLoss.reason}
                  </p>
                </div>

                {/* Muscle Building */}
                <div className="p-4 rounded-xl border border-slate-100 bg-sky-50/20 hover:bg-sky-50/50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">💪 هدف بناء العضلات والضخامة</span>
                    <span className="bg-sky-100 text-sky-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      الفائز: {compareData.winnerForGoals.muscleBuilding.winner}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    {compareData.winnerForGoals.muscleBuilding.reason}
                  </p>
                </div>

                {/* Digestive Health */}
                <div className="p-4 rounded-xl border border-slate-100 bg-indigo-50/20 hover:bg-indigo-50/50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">腸️ صحة الهضم والجهاز الهضمي</span>
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      الفائز: {compareData.winnerForGoals.digestiveHealth.winner}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    {compareData.winnerForGoals.digestiveHealth.reason}
                  </p>
                </div>

                {/* Quick Energy */}
                <div className="p-4 rounded-xl border border-slate-100 bg-amber-50/20 hover:bg-amber-50/50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">⚡ الحصول على طاقة سريعة (قبل التمرين)</span>
                    <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      الفائز: {compareData.winnerForGoals.quickEnergy.winner}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    {compareData.winnerForGoals.quickEnergy.reason}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Summary Conclusion */}
            <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-800/50 rounded-full blur-3xl" />
              <div className="relative">
                <h4 className="text-emerald-300 font-extrabold text-sm mb-2 flex items-center gap-1">
                  <span>✨</span> توصية وخلاصة خبير التغذية الاصطناعي
                </h4>
                <p className="text-xs leading-relaxed font-light text-emerald-100">
                  {compareData.summary}
                </p>
              </div>
            </div>

          </motion.div>
        )
      )}
    </div>
  );
}
