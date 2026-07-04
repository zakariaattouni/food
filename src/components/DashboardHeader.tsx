/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Calendar, Sparkles, Apple, ShieldAlert, Award } from "lucide-react";

export default function DashboardHeader() {
  const arabicDate = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <header className="relative bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 md:p-8 overflow-hidden shadow-xl mb-8">
      {/* Decorative blurred blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl -translate-y-12 translate-x-12" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl translate-y-12 -translate-x-12" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          {/* Top Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/20 text-emerald-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مدعوم بالذكاء الاصطناعي (Gemini 3.5)</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            دليل الغذاء والمغذيات
          </h1>
          <p className="text-emerald-100 text-sm md:text-base max-w-2xl font-light leading-relaxed">
            استكشف الأسرار الكامنة خلف الأطعمة التي تتناولها! ابحث عن العناصر الغذائية للفواكه، الخضروات، ومصادرها الطبيعية، أو قارن بينها بدقة متناهية.
          </p>
        </div>

        {/* Date Card */}
        <div className="flex flex-col items-start md:items-end gap-2 bg-black/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 self-start md:self-auto shrink-0">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
            <Calendar className="w-4 h-4" />
            <span>تاريخ اليوم</span>
          </div>
          <span className="text-sm font-bold text-white tracking-wide">
            {arabicDate}
          </span>
        </div>
      </div>

      {/* Mini Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2.5 text-xs text-emerald-100 bg-white/5 rounded-xl p-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <Apple className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white">تحليل تفصيلي</p>
            <p className="text-emerald-200/70">للأغذية ومكوناتها</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-emerald-100 bg-white/5 rounded-xl p-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white">دليل الفيتامينات</p>
            <p className="text-emerald-200/70">وأين توجد ومحاذيرها</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-emerald-100 bg-white/5 rounded-xl p-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white">مقارنات ذكية</p>
            <p className="text-emerald-200/70">لتحديد الخيار الأفضل لصحتك</p>
          </div>
        </div>
      </div>
    </header>
  );
}
