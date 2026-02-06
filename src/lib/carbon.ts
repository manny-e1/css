// Assumptions for transport multipliers:
// - Local: same country => 1.0
// - Regional: same coarse region grouping => 1.1
// - Overseas: otherwise => 1.25
//
// Region groupings here are minimal and directional (not exhaustive). This is for MVP context.
const REGION_GROUPS: Record<string, string> = {
  // Africa (sample)
  Ethiopia: "Africa",
  Kenya: "Africa",
  Tanzania: "Africa",
  Uganda: "Africa",
  Rwanda: "Africa",
  Nigeria: "Africa",
  "South Africa": "Africa",
  Ghana: "Africa",
  // Europe (sample)
  Germany: "Europe",
  France: "Europe",
  Italy: "Europe",
  Spain: "Europe",
  "United Kingdom": "Europe",
  // Asia (sample)
  China: "Asia",
  India: "Asia",
  Japan: "Asia",
  "South Korea": "Asia",
  // Americas (sample)
  "United States": "Americas",
  Canada: "Americas",
  Mexico: "Americas",
  Brazil: "Americas",
};

export function computeTransportMultiplier(
  projectCountry: string,
  originCountry: string,
): number {
  const a = (projectCountry || "").trim();
  const b = (originCountry || "").trim();
  if (!a || !b) return 1.25;
  if (a.toLowerCase() === b.toLowerCase()) return 1.0;
  const ra = REGION_GROUPS[a];
  const rb = REGION_GROUPS[b];
  if (ra && rb && ra === rb) return 1.1;
  return 1.25;
}

export function computeMaterialCarbon(
  quantity: number,
  factorPerUnit: number,
  transportMultiplier: number,
): number {
  return quantity * factorPerUnit * transportMultiplier;
}

export function computeCostRange(
  quantity: number,
  unitPriceMin: number,
  unitPriceMax: number,
): { min: number; max: number } {
  return {
    min: quantity * unitPriceMin,
    max: quantity * unitPriceMax,
  };
}

// Baseline per category: directional constants for comparison.
// Values represent per-unit embodied carbon factor and price range.
export const BASELINE: Record<
  "cement" | "steel" | "timber" | "blocks" | "finishes",
  { factorPerUnit: number; unitPriceMin: number; unitPriceMax: number }
> = {
  cement: { factorPerUnit: 0.9, unitPriceMin: 80, unitPriceMax: 120 },
  steel: { factorPerUnit: 1.8, unitPriceMin: 700, unitPriceMax: 1000 },
  timber: { factorPerUnit: 0.5, unitPriceMin: 300, unitPriceMax: 500 },
  blocks: { factorPerUnit: 0.2, unitPriceMin: 0.5, unitPriceMax: 1.2 },
  finishes: { factorPerUnit: 0.1, unitPriceMin: 5, unitPriceMax: 20 },
};

export function compareToBaseline(params: {
  category: "cement" | "steel" | "timber" | "blocks" | "finishes";
  quantity: number;
  factorPerUnit: number;
  unitPriceMin: number;
  unitPriceMax: number;
}) {
  const base = BASELINE[params.category];

  // Handle case where category doesn't exist in baseline
  if (!base) {
    return {
      carbonDiffAbs: 0,
      carbonDiffPct: 0,
      costMidDiffAbs: 0,
      costMidDiffPct: 0,
    };
  }

  const materialCarbonPerUnit = params.factorPerUnit;
  const baselineCarbonPerUnit = base.factorPerUnit;
  const carbonDiffAbs =
    (materialCarbonPerUnit - baselineCarbonPerUnit) * params.quantity;
  const carbonDiffPct =
    baselineCarbonPerUnit > 0
      ? (materialCarbonPerUnit - baselineCarbonPerUnit) / baselineCarbonPerUnit
      : 0;

  const materialCostMidPerUnit =
    (params.unitPriceMin + params.unitPriceMax) / 2;
  const baselineCostMidPerUnit = (base.unitPriceMin + base.unitPriceMax) / 2;
  const costMidDiffAbs =
    (materialCostMidPerUnit - baselineCostMidPerUnit) * params.quantity;
  const costMidDiffPct =
    baselineCostMidPerUnit > 0
      ? (materialCostMidPerUnit - baselineCostMidPerUnit) /
        baselineCostMidPerUnit
      : 0;

  return {
    carbonDiffAbs,
    carbonDiffPct,
    costMidDiffAbs,
    costMidDiffPct,
  };
}

export function calculateCarbonScore(
  factorPerUnit: number,
  category: string,
): {
  score: number;
  grade: "A" | "B" | "C" | "D";
  color: string;
} {
  const base = BASELINE[category as keyof typeof BASELINE] || BASELINE.finishes;

  // Following cssmap.txt logic:
  // score = ((value - min) / (max - min)) * 100
  // Let's assume min is 0.2 * baseline and max is 2.0 * baseline
  const min = base.factorPerUnit * 0.2;
  const max = base.factorPerUnit * 2.0;

  let score = Math.round(((factorPerUnit - min) / (max - min)) * 100);
  score = Math.max(0, Math.min(100, score));

  let grade: "A" | "B" | "C" | "D" = "D";
  let color = "bg-red-500"; // 81-100: Red

  if (score <= 30) {
    grade = "A";
    color = "bg-green-500";
  } else if (score <= 60) {
    grade = "B";
    color = "bg-lime-500";
  } else if (score <= 80) {
    grade = "C";
    color = "bg-yellow-500";
  }

  return { score, grade, color };
}
