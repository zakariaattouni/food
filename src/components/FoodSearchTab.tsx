/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  Apple,
  Award,
  AlertTriangle,
  Lightbulb,
  Heart,
  Droplet,
  ArrowLeftRight,
  Sparkles,
  Utensils
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { FoodReport } from "../types";
import Loader from "./Loader";

const QUICK_SUGGESTIONS = ["تفاح", "بيض", "تمر", "أفوكادو", "شوفان", "لوز", "برتقال", "حليب"];

export default function FoodSearchTab() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foodData, setFoodData] = useState<FoodReport | null>(null);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gemini/food-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchTerm }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "فشل جلب تفاصيل الغذاء");
      }

      const data = await res.json();
      setFoodData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ غير متوقع أثناء البحث.");
    } finally {
      setLoading(false);
    }
  };

  const getPieData = (report: FoodReport) => {
    return [
      { name: "بروتين", value: report.macros.protein, color: "#10b981" }, // emerald-500
      { name: "كربوهيدرات", value: report.macros.carbs, color: "#f59e0b" }, // amber-500
      { name: "دهون", value: report.macros.fat, color: "#ef4444" } // red-500
    ].filter(item => item.value > 0);
  };

  const macroTotal = foodData ? (foodData.macros.protein + foodData.macros.carbs + foodData.macros.fat) : 0;

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
              <Apple className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                البحث والتحليل التفصيلي للغذاء
              </h2>
              <p className="text-xs md:text-sm text-emerald-200/70 font-medium leading-relaxed mt-1">
                اكتب اسم أي غذاء (خضار، فواكه، وجبات، مكسرات...) لتحصل على تقرير فوري ودقيق بمكوناته ومغذياته الكبرى والدقيقة بالذكاء الاصطناعي.
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
                placeholder="مثال: تفاح أحمر، سلمون مشوي، بذور الشيا..."
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
              <span>حلّل الآن</span>
            </button>
          </div>

          {/* Suggestions */}
          <div className="mt-5 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-emerald-300/80 font-bold ml-2">اقتراحات سريعة:</span>
            {QUICK_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                onClick={() => {
                  setQuery(sug);
                  handleSearch(sug);
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
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main output */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <Loader message={`جاري تجميع وتحليل البيانات الغذائية لـ "${query || "الغذاء المطلوب"}"...`} />
        </div>
      ) : (
        foodData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Food Core Info Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                
                {/* Visual / Image section */}
                <div className="lg:col-span-5 relative h-64 lg:h-auto min-h-[250px] bg-slate-100">
                  <img
                    src={foodData.imageUrl || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80"}
                    alt={foodData.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {/* Category overlay */}
                  <div className="absolute top-4 right-4 bg-emerald-600/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow">
                    {foodData.category}
                  </div>
                  {/* Serving size overlay */}
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
                    الحصة: {foodData.servingSize}
                  </div>
                </div>

                {/* Text overview section */}
                <div className="lg:col-span-7 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <h2 className="text-2xl font-extrabold text-slate-800">
                        {foodData.name}
                      </h2>
                      {/* Calories Circle */}
                      <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
                        <span className="text-2xl font-black text-emerald-700 leading-none">
                          {foodData.calories}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">
                          سعرة
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                      {foodData.description}
                    </p>
                  </div>

                  {/* Macronutrients Grid summary */}
                  <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                    <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/30 text-center">
                      <span className="block text-xs text-slate-400 font-bold mb-0.5">بروتين</span>
                      <span className="text-base font-extrabold text-emerald-600">{foodData.macros.protein} غ</span>
                    </div>
                    <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/30 text-center">
                      <span className="block text-xs text-slate-400 font-bold mb-0.5">كربوهيدرات</span>
                      <span className="text-base font-extrabold text-amber-600">{foodData.macros.carbs} غ</span>
                    </div>
                    <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100/30 text-center">
                      <span className="block text-xs text-slate-400 font-bold mb-0.5">دهون</span>
                      <span className="text-base font-extrabold text-red-500">{foodData.macros.fat} غ</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Layout details: Left column (charts and micronutrients), Right column (benefits, pairings, etc.) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left Side: Nutrition breakdown & Charts */}
              <div className="space-y-6">
                
                {/* Macros Chart Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    المغذيات الكبرى وتوزيعها
                  </h3>

                  {macroTotal > 0 ? (
                    <div className="flex flex-col md:flex-row items-center justify-around gap-4 min-h-[180px]">
                      {/* Pie chart */}
                      <div className="w-full max-w-[180px] h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getPieData(foodData)}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {getPieData(foodData).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} جرام`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Legend details */}
                      <div className="space-y-2 flex-1">
                        {getPieData(foodData).map((item) => (
                          <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                              <span className="text-slate-600">{item.name}</span>
                            </div>
                            <span className="text-slate-800 font-bold">
                              {item.value} غ ({macroTotal > 0 ? Math.round((item.value / macroTotal) * 100) : 0}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-6">هذا الغذاء لا يحتوي على بروتينات، دهون أو كربوهيدرات (مثل الماء الصافي).</p>
                  )}

                  {/* Secondary macros bar indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                        <span>ألياف غذائية</span>
                        <span className="text-slate-700">{foodData.macros.fiber} غ</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(foodData.macros.fiber * 10, 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                        <span>سكريات طبيعية</span>
                        <span className="text-slate-700">{foodData.macros.sugar} غ</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(foodData.macros.sugar * 4, 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                        <span>نسبة الماء</span>
                        <span className="text-slate-700">{foodData.macros.water} غ</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-full rounded-full" style={{ width: `${Math.min(foodData.macros.water, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Micronutrients report */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    الفيتامينات والمعادن الهامة (الميكرو)
                  </h3>
                  
                  {foodData.micronutrients.length > 0 ? (
                    <div className="space-y-3.5">
                      {foodData.micronutrients.map((micro) => (
                        <div key={micro.name} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col gap-1.5 hover:bg-slate-50 transition-all">
                          <div className="flex items-center justify-between text-xs md:text-sm font-extrabold text-slate-800">
                            <span className="text-emerald-700 font-bold">{micro.name}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs">{micro.amount}</span>
                              {micro.percentageDV && (
                                <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs">DV: {micro.percentageDV}</span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            {micro.role}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-6">لم يتم العثور على فيتامينات أو معادن هامة بنسب مؤثرة في هذا الغذاء.</p>
                  )}
                </div>

              </div>

              {/* Right Side: Benefits, warnings, healthy combos & fun fact */}
              <div className="space-y-6">

                {/* Benefits */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-emerald-600" />
                    أهم الفوائد الصحية المثبتة
                  </h3>
                  
                  <div className="space-y-4">
                    {foodData.benefits.map((benefit, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 border border-emerald-100">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 mb-0.5">
                            {benefit.title}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Healthy Combinations */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-emerald-600" />
                    تكاملات غذائية مفيدة
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">تناول هذا الغذاء مع الأغذية التالية يعزز امتصاص المغذيات ويحقق تكاملاً حيوياً:</p>
                  <div className="flex flex-wrap gap-2">
                    {foodData.healthyCombos.map((combo, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-bold px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-100 rounded-lg"
                      >
                        👍 {combo}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Warning (if any) */}
                {foodData.warning && (
                  <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-800 mb-1">
                        تنبيه ومحاذير صحية
                      </h4>
                      <p className="text-xs text-amber-700 leading-relaxed font-semibold">
                        {foodData.warning}
                      </p>
                    </div>
                  </div>
                )}

                {/* Fun Fact */}
                <div className="bg-emerald-800 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-700/50 rounded-full flex items-center justify-center" />
                  <div className="relative flex items-start gap-3">
                    <div className="p-2 bg-emerald-700/60 rounded-xl shrink-0">
                      <Lightbulb className="w-5 h-5 text-emerald-200" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-emerald-200 mb-1">معلومة طريفة</h4>
                      <p className="text-xs text-emerald-50 leading-relaxed font-light">
                        {foodData.funFact}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )
      )}
    </div>
  );
}
