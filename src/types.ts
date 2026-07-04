/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FoodNutrient {
  name: string;
  amount: string;
  percentageDV?: string;
  role: string;
}

export interface Benefit {
  title: string;
  description: string;
}

export interface FoodReport {
  name: string;
  category: string;
  description: string;
  servingSize: string;
  calories: number;
  macros: {
    protein: number; // in grams
    carbs: number;   // in grams
    fat: number;     // in grams
    fiber: number;   // in grams
    sugar: number;   // in grams
    water: number;   // in grams
  };
  micronutrients: FoodNutrient[];
  benefits: Benefit[];
  funFact: string;
  warning?: string;
  healthyCombos: string[];
  imagePrompt: string;
}

export interface FoodSource {
  foodName: string;
  amountPer100g: string;
  dvPercentage: number;
  notes: string;
}

export interface NutrientReport {
  name: string;
  alternativeNames: string[];
  description: string;
  roleInBody: string;
  recommendedDailyAllowance: string;
  availabilityAndSources: string; // أين نجده وتوفره في الأطعمة ومصادره المختلفة
  deficiencySymptoms: string[];
  toxicitySymptoms: string[];
  topFoods: FoodSource[];
  absorptionTips: string;
}

export interface ComparisonReport {
  foodA: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  foodB: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  keyDifferences: string[];
  winnerForGoals: {
    weightLoss: { winner: string; reason: string };
    muscleBuilding: { winner: string; reason: string };
    digestiveHealth: { winner: string; reason: string };
    quickEnergy: { winner: string; reason: string };
  };
  summary: string;
}

export interface DailyTip {
  title: string;
  tip: string;
  category: 'general' | 'vitamin' | 'hydration' | 'habit' | 'food';
}
