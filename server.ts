/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Helper to check if API key exists and throw clear error if not
 */
function getAiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
  }
  return ai;
}

/**
 * Dynamic fallback images map for common foods to ensure lovely visuals even if image generation is unavailable
 */
const fallbackImages: Record<string, string> = {
  "تفاح": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
  "apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
  "موز": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
  "banana": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
  "برتقال": "https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop&q=80",
  "orange": "https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop&q=80",
  "تمر": "https://images.unsplash.com/photo-1569870499705-504209102bd6?w=600&auto=format&fit=crop&q=80",
  "dates": "https://images.unsplash.com/photo-1569870499705-504209102bd6?w=600&auto=format&fit=crop&q=80",
  "بيض": "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600&auto=format&fit=crop&q=80",
  "egg": "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600&auto=format&fit=crop&q=80",
  "حليب": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80",
  "milk": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80",
  "شوفان": "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&auto=format&fit=crop&q=80",
  "oats": "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&auto=format&fit=crop&q=80",
  "لوز": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&auto=format&fit=crop&q=80",
  "almonds": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&auto=format&fit=crop&q=80"
};

/**
 * Attempt to generate a food image via gemini-3.1-flash-lite-image.
 * Falls back to generic modern food/diet image if it fails.
 */
async function generateFoodImage(englishPrompt: string, query: string): Promise<string> {
  try {
    const gemini = getAiClient();
    console.log(`Generating image for: ${englishPrompt}`);
    const response = await gemini.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: `A professional close-up photograph of ${englishPrompt}, beautiful food styling, warm studio light, depth of field` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error) {
    console.warn("Gemini image generation failed or not allowed on this tier key, using Unsplash fallback.", error);
  }

  // Fallback to Unsplash
  const cleanQuery = query.trim().toLowerCase();
  for (const [key, url] of Object.entries(fallbackImages)) {
    if (cleanQuery.includes(key)) {
      return url;
    }
  }

  // Default elegant abstract green/healthy food photo
  return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80";
}

// ==========================================
// API Endpoints
// ==========================================

// 1. Food Search Endpoint
app.post("/api/gemini/food-search", async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: "الرجاء إدخال اسم الغذاء المطلوب البحث عنه" });
      return;
    }

    const gemini = getAiClient();
    const prompt = `أعطني تقريراً مفصلاً جداً وبصيغة JSON عن الغذاء التالي: "${query}". يجب ملء كافة الحقول باللغة العربية الفصحى بدقة متناهية وبشكل علمي موثوق.`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "أنت خبير تغذية وأخصائي حميات محترف وموثوق. يرجى تزويد المستخدم بتقرير غذائي غني ومبسط بالعربية وبصيغة JSON تطابق المخطط المطلوب تماماً. تأكد من دقة الأرقام الخاصة بالسعرات الحرارية والمغذيات الكبرى للحصة (مثلاً لكل 100 غرام أو حصة شائعة).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "اسم الغذاء باللغة العربية الفصحى، مثال: تفاح" },
            category: { type: Type.STRING, description: "تصنيف الغذاء بالعربية، مثل: فواكه، خضار، حبوب، لحوم، ألبان" },
            description: { type: Type.STRING, description: "تقرير وصفي رائع ومفصل عن الغذاء وأهميته وفوائده العامة (3-4 أسطر)" },
            servingSize: { type: Type.STRING, description: "حجم الحصة الافتراضية للتقرير، مثل: 100 جرام" },
            calories: { type: Type.INTEGER, description: "عدد السعرات الحرارية كعدد صحيح" },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.NUMBER, description: "البروتين بالجرام" },
                carbs: { type: Type.NUMBER, description: "الكربوهيدرات بالجرام" },
                fat: { type: Type.NUMBER, description: "الدهون بالجرام" },
                fiber: { type: Type.NUMBER, description: "الألياف بالجرام" },
                sugar: { type: Type.NUMBER, description: "السكريات بالجرام" },
                water: { type: Type.NUMBER, description: "الماء بالجرام أو النسبة المئوية" }
              },
              required: ["protein", "carbs", "fat", "fiber", "sugar", "water"]
            },
            micronutrients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "اسم الفيتامين أو المعدن بالعربية، مثل: فيتامين سي (C)" },
                  amount: { type: Type.STRING, description: "الكمية، مثل: 4.6 ملغ" },
                  percentageDV: { type: Type.STRING, description: "النسبة اليومية الموصى بها إن أمكن، مثل: 8%" },
                  role: { type: Type.STRING, description: "أهمية هذا العنصر بالتحديد وصالح لمن في الجسم" }
                },
                required: ["name", "amount", "role"]
              }
            },
            benefits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "عنوان جانبي للفائدة، مثل: صحة القلب" },
                  description: { type: Type.STRING, description: "شرح تفصيلي علمي شيق للفائدة" }
                },
                required: ["title", "description"]
              }
            },
            funFact: { type: Type.STRING, description: "معلومة غريبة أو طريفة تاريخية أو علمية عن هذا الغذاء" },
            warning: { type: Type.STRING, description: "تحذير صحي أو تنبيه لمن يعانون من حالات خاصة أو حساسية إن وجد" },
            healthyCombos: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "أغذية أخرى يوصى بتناولها معه لامتصاص أفضل أو تكامل غذائي"
            },
            imagePrompt: { type: Type.STRING, description: "A simple English prompt representing this food for image generation, e.g. 'fresh ripe red apple'" }
          },
          required: ["name", "category", "description", "servingSize", "calories", "macros", "micronutrients", "benefits", "funFact", "healthyCombos", "imagePrompt"]
        }
      }
    });

    const reportText = response.text;
    if (!reportText) {
      throw new Error("No text returned from Gemini API");
    }

    const reportJson = JSON.parse(reportText.trim());

    // Generate food image based on returned imagePrompt
    const imageUrl = await generateFoodImage(reportJson.imagePrompt || query, query);
    reportJson.imageUrl = imageUrl;

    res.json(reportJson);
  } catch (error: any) {
    console.error("Food search API error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء معالجة البحث عن الغذاء. الرجاء المحاولة مجدداً.", details: error.message });
  }
});

// 2. Nutrient Search Endpoint
app.post("/api/gemini/nutrient-search", async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: "الرجاء إدخال اسم العنصر الغذائي المطلوب البحث عنه (مثل: فيتامين د، الحديد)" });
      return;
    }

    const gemini = getAiClient();
    const prompt = `أعطني تقريراً مفصلاً وبصيغة JSON عن العنصر أو المغذي التالي: "${query}". يجب ملء كافة الحقول باللغة العربية الفصحى بدقة متناهية وبشكل علمي موثوق.`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "أنت مرجع علمي للتغذية البشرية. يرجى توفير تقرير شامل ومبسط بالعربية وبصيغة JSON تطابق المخطط الهيكلي تماماً.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "اسم العنصر أو المغذي بالعربية، مثل: فيتامين سي (ج)" },
            alternativeNames: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "أسماء بديلة أو علمية مرادفة مثل: حمض الأسكوربيك"
            },
            description: { type: Type.STRING, description: "تعريف شامل وممتع بالعنصر وفوائده الكبرى (3-4 أسطر)" },
            roleInBody: { type: Type.STRING, description: "وظيفة العنصر الحيوية في الخلايا والأعضاء بالتفصيل" },
            recommendedDailyAllowance: { type: Type.STRING, description: "الكمية اليومية الموصى بها لمختلف الفئات بشكل مبسط" },
            availabilityAndSources: { type: Type.STRING, description: "أين نجد هذا العنصر وتوفره العام ومدى توفره في الأطعمة الشائعة سواء الحيوانية أو النباتية أو الطبيعية وصعوبة/سهولة الحصول عليه" },
            deficiencySymptoms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "قائمة بأعراض النقص في الجسم"
            },
            toxicitySymptoms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "قائمة بأعراض التسمم أو الجرعات الزائدة"
            },
            topFoods: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  foodName: { type: Type.STRING, description: "اسم الغذاء الغني جداً بهذا العنصر" },
                  amountPer100g: { type: Type.STRING, description: "الكمية التقريبية المتواجدة فيه لكل 100 جرام" },
                  dvPercentage: { type: Type.INTEGER, description: "النسبة اليومية المئوية المحققة من 100 جرام من هذا الغذاء" },
                  notes: { type: Type.STRING, description: "ملاحظة صحية أو ميزة لتناول هذا الغذاء كمصدر" }
                },
                required: ["foodName", "amountPer100g", "dvPercentage", "notes"]
              }
            },
            absorptionTips: { type: Type.STRING, description: "نصائح وإرشادات لضمان امتصاص أفضل لهذا العنصر (مثال: فيتامين سي مع الحديد)" }
          },
          required: ["name", "alternativeNames", "description", "roleInBody", "recommendedDailyAllowance", "availabilityAndSources", "deficiencySymptoms", "toxicitySymptoms", "topFoods", "absorptionTips"]
        }
      }
    });

    const reportText = response.text;
    if (!reportText) {
      throw new Error("No text returned from Gemini API");
    }

    const reportJson = JSON.parse(reportText.trim());
    res.json(reportJson);
  } catch (error: any) {
    console.error("Nutrient search API error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء البحث عن العنصر الغذائي. الرجاء المحاولة مجدداً.", details: error.message });
  }
});

// 3. Compare Foods Endpoint
app.post("/api/gemini/nutrition-compare", async (req: Request, res: Response): Promise<void> => {
  try {
    const { foodA, foodB } = req.body;
    if (!foodA || !foodB) {
      res.status(400).json({ error: "الرجاء تحديد كلا الغذاءين للمقارنة" });
      return;
    }

    const gemini = getAiClient();
    const prompt = `أجرِ مقارنة غذائية شاملة ومفصلة بصيغة JSON بين "${foodA}" و "${foodB}". املأ الحقول بدقة باللغة العربية الفصحى.`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "أنت خبير في التقييم والمقارنة الغذائية. قارن بشكل موضوعي وممتع بالعربية وبصيغة JSON مطابقة تماماً للمخطط.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodA: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "اسم الغذاء الأول" },
                calories: { type: Type.INTEGER, description: "السعرات لكل 100 غرام" },
                protein: { type: Type.NUMBER, description: "البروتين بالجرام لكل 100 غرام" },
                carbs: { type: Type.NUMBER, description: "الكربوهيدرات بالجرام لكل 100 غرام" },
                fat: { type: Type.NUMBER, description: "الدهون بالجرام لكل 100 غرام" },
                fiber: { type: Type.NUMBER, description: "الألياف بالجرام لكل 100 غرام" }
              },
              required: ["name", "calories", "protein", "carbs", "fat", "fiber"]
            },
            foodB: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "اسم الغذاء الثاني" },
                calories: { type: Type.INTEGER, description: "السعرات لكل 100 غرام" },
                protein: { type: Type.NUMBER, description: "البروتين بالجرام لكل 100 غرام" },
                carbs: { type: Type.NUMBER, description: "الكربوهيدرات بالجرام لكل 100 غرام" },
                fat: { type: Type.NUMBER, description: "الدهون بالجرام لكل 100 غرام" },
                fiber: { type: Type.NUMBER, description: "الألياف بالجرام لكل 100 غرام" }
              },
              required: ["name", "calories", "protein", "carbs", "fat", "fiber"]
            },
            keyDifferences: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "نقاط الاختلاف الرئيسية الملحوظة بينهما غذائياً"
            },
            winnerForGoals: {
              type: Type.OBJECT,
              properties: {
                weightLoss: {
                  type: Type.OBJECT,
                  properties: {
                    winner: { type: Type.STRING, description: "الغذاء الأفضل لإنقاص الوزن" },
                    reason: { type: Type.STRING, description: "السبب العلمي بوضوح" }
                  },
                  required: ["winner", "reason"]
                },
                muscleBuilding: {
                  type: Type.OBJECT,
                  properties: {
                    winner: { type: Type.STRING, description: "الغذاء الأفضل لبناء العضلات" },
                    reason: { type: Type.STRING, description: "السبب العلمي بوضوح" }
                  },
                  required: ["winner", "reason"]
                },
                digestiveHealth: {
                  type: Type.OBJECT,
                  properties: {
                    winner: { type: Type.STRING, description: "الغذاء الأفضل لصحة الجهاز الهضمي" },
                    reason: { type: Type.STRING, description: "السبب العلمي بوضوح" }
                  },
                  required: ["winner", "reason"]
                },
                quickEnergy: {
                  type: Type.OBJECT,
                  properties: {
                    winner: { type: Type.STRING, description: "الغذاء الأفضل للحصول على طاقة سريعة" },
                    reason: { type: Type.STRING, description: "السبب العلمي بوضوح" }
                  },
                  required: ["winner", "reason"]
                }
              },
              required: ["weightLoss", "muscleBuilding", "digestiveHealth", "quickEnergy"]
            },
            summary: { type: Type.STRING, description: "خلاصة المقارنة وتوصية ذكية لاستهلاكهما" }
          },
          required: ["foodA", "foodB", "keyDifferences", "winnerForGoals", "summary"]
        }
      }
    });

    const reportText = response.text;
    if (!reportText) {
      throw new Error("No text returned from Gemini API");
    }

    const reportJson = JSON.parse(reportText.trim());
    res.json(reportJson);
  } catch (error: any) {
    console.error("Compare Foods API error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء إجراء المقارنة الغذائية.", details: error.message });
  }
});

// 4. Daily Healthy Tip Endpoint
app.get("/api/gemini/daily-tip", async (req: Request, res: Response): Promise<void> => {
  try {
    const gemini = getAiClient();
    const prompt = "أعطني نصيحة غذائية مفيدة جداً وعملية اليوم باللغة العربية الفصحى بصيغة JSON تطابق المخطط تماماً.";

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "أنت مرشد صحي يقدم نصائح غذائية ممتازة وبسيطة لحياة يومية مفعمة بالحيوية باللغة العربية الفصحى.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "عنوان النصيحة الشيق، بحد أقصى 5 كلمات" },
            tip: { type: Type.STRING, description: "محتوى النصيحة المفيدة والعملية، أسلوب جذاب ولطيف (سطرين)" },
            category: { type: Type.STRING, description: "التصنيف من بين: general, vitamin, hydration, habit, food" }
          },
          required: ["title", "tip", "category"]
        }
      }
    });

    const reportText = response.text;
    if (!reportText) {
      throw new Error("No text returned from Gemini API");
    }

    const reportJson = JSON.parse(reportText.trim());
    res.json(reportJson);
  } catch (error: any) {
    console.error("Daily Tip API error:", error);
    // Provide a neat pre-baked fallback tip to avoid any API crashes
    const fallbackTips: any[] = [
      {
        title: "روعة شرب الماء صباحاً",
        tip: "ابدأ يومك بكوب كبير من الماء الفاتر لتنشيط أعضاء الجسم الداخلية، وتحفيز عملية التمثيل الغذائي بعد ساعات من الصيام أثناء النوم.",
        category: "hydration"
      },
      {
        title: "قوة الألوان في طبقك",
        tip: "اجعل طبقك ملوناً كال قوس قزح؛ فكل لون في الخضار والفواكه يمثل مضاد أكسدة فريد ومغذيات حيوية مختلفة تدعم مناعتك.",
        category: "food"
      },
      {
        title: "فيتامين سي والحديد",
        tip: "لتحقيق أقصى استفادة من الحديد النباتي المتواجد في السبانخ أو البقوليات، اعصر عليها قليلاً من الليمون؛ ففيتامين سي يضاعف امتصاص الحديد.",
        category: "vitamin"
      }
    ];
    const randomTip = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
    res.json(randomTip);
  }
});


// ==========================================
// Vite Dev Server / Static Files
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving compiled production build from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
