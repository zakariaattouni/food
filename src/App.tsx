/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Apple, Award, ArrowLeftRight, HeartPulse, Download, X, Smartphone, Share2, PlusSquare, Sparkles } from "lucide-react";
import DashboardHeader from "./components/DashboardHeader";
import DailyTipWidget from "./components/DailyTipWidget";
import FoodSearchTab from "./components/FoodSearchTab";
import NutrientSearchTab from "./components/NutrientSearchTab";
import ComparisonTab from "./components/ComparisonTab";

type TabType = "food" | "nutrient" | "compare";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("food");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [showAndroidInstructions, setShowAndroidInstructions] = useState(false);
  const [isInApp, setIsInApp] = useState(false);

  useEffect(() => {
    // Determine platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const isAndroidDevice = /android/.test(userAgent);

    const detectInApp = (ua: string) => {
      return (
        ua.includes("instagram") ||
        ua.includes("fban") ||
        ua.includes("fbav") ||
        ua.includes("gsa") || // Google Search App
        ua.includes("whatsapp") ||
        ua.includes("line") ||
        ua.includes("snapchat") ||
        ua.includes("telegram") ||
        ua.includes("webview") ||
        ua.includes("wv")
      );
    };

    const inApp = detectInApp(userAgent);
    setIsInApp(inApp);

    // Check if app is already running as PWA (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    // Check localStorage to see if user has dismissed the banner in this session
    const isDismissed = sessionStorage.getItem("pwa_install_dismissed") === "true";

    if (!isStandalone && !isDismissed) {
      // For iOS or Android-In-App, we show the banner proactively because they won't trigger beforeinstallprompt
      if (isIosDevice || isAndroidDevice || inApp) {
        setShowInstallBanner(true);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone && !isDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      }
    } else {
      // Fallback if prompt is not available (e.g. inside an in-app browser or Chrome blocked it)
      setShowAndroidInstructions(true);
    }
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  const forceUpdateApp = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (let key of keys) {
          await caches.delete(key);
        }
      }
      sessionStorage.removeItem("pwa_install_dismissed");
      alert("تم مسح الذاكرة المؤقتة بنجاح! سيتم الآن إعادة تحميل الصفحة لتنشيط أحدث نسخة من التطبيق وتفعيل أيقونة التثبيت.");
      window.location.reload();
    } catch (err) {
      console.error("Error updating app:", err);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 pt-6 px-4 relative" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Modern Dashboard Header */}
        <DashboardHeader />

        {/* PWA Premium Installation Banner */}
        <AnimatePresence>
          {showInstallBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-emerald-900 to-teal-950 border border-emerald-500/30 text-white rounded-2xl p-4.5 shadow-xl relative overflow-hidden"
            >
              {/* Background glowing touch */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Apple className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">تثبيت تطبيق دليل الغذاء والمغذيات الذكي</h3>
                    <p className="text-xs text-emerald-200/80 mt-0.5">ثبّت التطبيق على شاشة هاتفك الرئيسية لتصل إليه بلمسة واحدة كأنه تطبيق أصلي، وبشكل فوري!</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تثبيت الآن</span>
                  </button>
                  <button
                    onClick={handleDismissBanner}
                    className="p-2.5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all cursor-pointer shrink-0"
                    title="تجاهل"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* IOS Interactive Installation Instructions Dialog */}
        <AnimatePresence>
          {showIOSInstructions && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 text-slate-800"
              >
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-2">
                    <Apple className="text-emerald-600 w-5 h-5" />
                    <h3 className="font-black text-slate-900 text-base">تثبيت التطبيق على آيفون / آيباد</h3>
                  </div>
                  <button
                    onClick={() => setShowIOSInstructions(false)}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    متصفح Safari على نظام iOS لا يدعم التثبيت التلقائي مباشرة، ولكن يمكنك تثبيته بكل سهولة عبر الخطوات البسيطة التالية:
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3.5">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</span>
                      <p className="text-xs sm:text-sm text-slate-700 font-bold flex items-center gap-1.5 flex-wrap">
                        اضغط على أيقونة المشاركة في شريط السفاري بالأسفل 
                        <span className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-emerald-700 font-extrabold shadow-sm">
                          <Share2 className="w-3.5 h-3.5" /> مشاركة (Share)
                        </span>
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</span>
                      <p className="text-xs sm:text-sm text-slate-700 font-bold flex items-center gap-1.5 flex-wrap">
                        قم بالتمرير للأسفل واختر 
                        <span className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-emerald-700 font-extrabold shadow-sm">
                          <PlusSquare className="w-3.5 h-3.5" /> إضافة إلى الشاشة الرئيسية
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowIOSInstructions(false)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-sm transition-all shadow-sm shadow-emerald-600/10 active:scale-[0.98] cursor-pointer"
                  >
                    فهمت، سأقوم بالتثبيت الآن
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Android Interactive Installation Instructions Dialog */}
        <AnimatePresence>
          {showAndroidInstructions && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 text-slate-800"
              >
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-2">
                    <Smartphone className="text-emerald-600 w-5 h-5" />
                    <h3 className="font-black text-slate-900 text-base">تثبيت التطبيق على أندرويد</h3>
                  </div>
                  <button
                    onClick={() => setShowAndroidInstructions(false)}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {isInApp ? (
                    <>
                      <p className="text-xs sm:text-sm text-amber-700 bg-amber-50 border border-amber-100 p-3.5 rounded-xl font-bold leading-relaxed">
                        ⚠️ تنبيه: أنت تتصفح التطبيق من داخل متصفح تطبيق آخر (مثل واتساب أو تلغرام). هذه المتصفحات تمنع التثبيت وتخفي أيقونة التطبيق الأصلية!
                      </p>
                      
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3.5">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</span>
                          <p className="text-xs sm:text-sm text-slate-700 font-bold">
                            اضغط على زر <span className="text-emerald-600">النقاط الثلاث (⋮)</span> أو زر المشاركة في الزاوية العلوية للمتصفح الحالي.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</span>
                          <p className="text-xs sm:text-sm text-slate-700 font-bold">
                            اختر <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">الفتح في المتصفح (Open in Browser)</span> أو <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">الفتح في كروم (Open in Chrome)</span>.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">3</span>
                          <p className="text-xs sm:text-sm text-slate-700 font-bold">
                            بعد الفتح في متصفح Chrome، ستتمكن من تثبيته فوراً بأيقونة التفاحة الخضراء المميزة!
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        إذا لم تظهر لك نافذة التثبيت التلقائي، يمكنك تثبيت التطبيق يدوياً بأيقونة التفاحة الخضراء خلال ثوانٍ معدودة:
                      </p>

                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3.5">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</span>
                          <p className="text-xs sm:text-sm text-slate-700 font-bold">
                            اضغط على زر <span className="text-emerald-600 font-black">النقاط الثلاث (⋮)</span> في أعلى يسار متصفح Google Chrome.
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</span>
                          <p className="text-xs sm:text-sm text-slate-700 font-bold flex items-center gap-1.5 flex-wrap">
                            قم بالتمرير لأسفل القائمة واختر 
                            <span className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-emerald-700 font-extrabold shadow-sm">
                              إضافة للشاشة الرئيسية (Add to Home screen)
                            </span>
                            أو
                            <span className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-emerald-700 font-extrabold shadow-sm">
                              تثبيت التطبيق (Install App)
                            </span>
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">3</span>
                          <p className="text-xs sm:text-sm text-slate-700 font-bold">
                            وافق على التثبيت، وسيظهر التطبيق على شاشتك بأيقونته الصحية فوراً!
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => setShowAndroidInstructions(false)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-sm transition-all shadow-sm shadow-emerald-600/10 active:scale-[0.98] cursor-pointer"
                  >
                    فهمت، سأقوم بالتثبيت الآن
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Daily Tip Widget */}
        <DailyTipWidget />

        {/* Custom Premium Tab Bar */}
        <div className="bg-white border border-slate-100 rounded-2xl p-2.5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 w-full sm:w-auto">
            
            {/* Food Search Tab Button */}
            <button
              onClick={() => setActiveTab("food")}
              className={`relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === "food"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/10"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Apple className="w-4 h-4 shrink-0" />
              <span>البحث في الأغذية</span>
            </button>

            {/* Nutrient Search Tab Button */}
            <button
              onClick={() => setActiveTab("nutrient")}
              className={`relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === "nutrient"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/10"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span>دليل المغذيات والفيتامينات</span>
            </button>

            {/* Food Comparison Tab Button */}
            <button
              onClick={() => setActiveTab("compare")}
              className={`relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === "compare"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/10"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 shrink-0" />
              <span>مقارنة الأغذية</span>
            </button>

          </div>

          {/* Quick Branding Tag */}
          <div className="hidden md:flex items-center gap-2 pl-3 text-xs text-emerald-700 bg-emerald-50 rounded-xl px-3.5 py-2 border border-emerald-100/40 shrink-0 font-bold">
            <HeartPulse className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>صحتك تبدأ بمعرفتك</span>
          </div>
        </div>

        {/* Active Tab Screen Area */}
        <main className="min-h-[400px]">
          {activeTab === "food" && <FoodSearchTab />}
          {activeTab === "nutrient" && <NutrientSearchTab />}
          {activeTab === "compare" && <ComparisonTab />}
        </main>

        {/* Humble, clean footer with PWA refresh help */}
        <footer className="text-center pt-8 border-t border-slate-100 text-slate-400 text-xs font-semibold flex flex-col items-center gap-3">
          <p>دليل الغذاء والمغذيات الذكي © 2026 • مدعوم بالكامل بتقنيات الذكاء الاصطناعي للاستخدام الشخصي والصحي.</p>
          <button
            onClick={forceUpdateApp}
            className="text-emerald-600 hover:text-emerald-700 font-extrabold hover:underline cursor-pointer flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-100/60 transition-all text-[11px] shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>تحديث يدوي وتطهير الذاكرة المؤقتة (لإصلاح وتفعيل أيقونة التثبيت)</span>
          </button>
        </footer>

      </div>
    </div>
  );
}
