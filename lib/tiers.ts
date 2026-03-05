export type Tier = {
  label: string;
  emoji: string;
  score: number; // 0–100 for overall calculation
  color: string; // tailwind color class
};

export type MetricKey =
  | "tokensM"
  | "burnStreak"
  | "deepWorkHrs"
  | "learnPages"
  | "cleanMeals";

export type Category = "Earn" | "Learn" | "Burn" | "Fuel";

export type MetricConfig = {
  key: MetricKey;
  label: string;
  category: Category;
  unit: string;
  description: string;
  max: number;
  step: number;
  tiers: { min: number; tier: Tier }[];
};

const TIER_COLORS = {
  god: "text-amber-400",
  elite: "text-purple-400",
  high: "text-blue-400",
  mid: "text-green-400",
  low: "text-zinc-400",
  base: "text-zinc-500",
};

export const METRICS: MetricConfig[] = [
  {
    key: "deepWorkHrs",
    label: "Deep Work",
    category: "Earn",
    unit: "hrs / day",
    description: "Hours of focused, uninterrupted work today",
    max: 12,
    step: 0.5,
    tiers: [
      {
        min: 8,
        tier: { label: "Deep in the Matrix", emoji: "🧠", score: 100, color: TIER_COLORS.god },
      },
      {
        min: 6,
        tier: { label: "Locked In", emoji: "🔒", score: 80, color: TIER_COLORS.elite },
      },
      {
        min: 4,
        tier: { label: "Focused Mode", emoji: "🎯", score: 60, color: TIER_COLORS.high },
      },
      {
        min: 2,
        tier: { label: "Warming Up", emoji: "☕", score: 35, color: TIER_COLORS.mid },
      },
      {
        min: 0,
        tier: { label: "Scattered", emoji: "📱", score: 10, color: TIER_COLORS.low },
      },
    ],
  },
  {
    key: "tokensM",
    label: "AI Tokens",
    category: "Earn",
    unit: "M / day",
    description: "Daily AI token usage in millions",
    max: 300,
    step: 1,
    tiers: [
      {
        min: 300,
        tier: { label: "Cracked Engineer", emoji: "🔥", score: 100, color: TIER_COLORS.god },
      },
      {
        min: 100,
        tier: { label: "Staff Engineer", emoji: "⚡", score: 80, color: TIER_COLORS.elite },
      },
      {
        min: 10,
        tier: { label: "Senior Engineer", emoji: "💪", score: 60, color: TIER_COLORS.high },
      },
      {
        min: 1,
        tier: { label: "Getting There", emoji: "📈", score: 40, color: TIER_COLORS.mid },
      },
      {
        min: 0,
        tier: { label: "Just Starting", emoji: "🌱", score: 20, color: TIER_COLORS.low },
      },
    ],
  },
  {
    key: "learnPages",
    label: "Learning",
    category: "Learn",
    unit: "pages / day",
    description: "Pages read or equivalent learning units today",
    max: 100,
    step: 1,
    tiers: [
      {
        min: 50,
        tier: { label: "Insatiable", emoji: "📚", score: 100, color: TIER_COLORS.god },
      },
      {
        min: 30,
        tier: { label: "Voracious", emoji: "📖", score: 80, color: TIER_COLORS.elite },
      },
      {
        min: 10,
        tier: { label: "Consistent", emoji: "📝", score: 60, color: TIER_COLORS.high },
      },
      {
        min: 1,
        tier: { label: "Dipping In", emoji: "👀", score: 30, color: TIER_COLORS.mid },
      },
      {
        min: 0,
        tier: { label: "Off Today", emoji: "💤", score: 5, color: TIER_COLORS.low },
      },
    ],
  },
  {
    key: "burnStreak",
    label: "Burn Streak",
    category: "Burn",
    unit: "days",
    description: "Consecutive days you've worked out",
    max: 31,
    step: 1,
    tiers: [
      {
        min: 20,
        tier: { label: "Untouchable", emoji: "🏆", score: 100, color: TIER_COLORS.god },
      },
      {
        min: 10,
        tier: { label: "Burning It Up", emoji: "🔥", score: 80, color: TIER_COLORS.elite },
      },
      {
        min: 5,
        tier: { label: "Consistent", emoji: "💪", score: 60, color: TIER_COLORS.high },
      },
      {
        min: 1,
        tier: { label: "Getting Started", emoji: "👟", score: 30, color: TIER_COLORS.mid },
      },
      {
        min: 0,
        tier: { label: "Rest Day", emoji: "🛋️", score: 10, color: TIER_COLORS.base },
      },
    ],
  },
  {
    key: "cleanMeals",
    label: "Fuel",
    category: "Fuel",
    unit: "clean meals (0–3)",
    description: "How many meals today were clean — 3 is optimal",
    max: 3,
    step: 1,
    tiers: [
      {
        min: 3,
        tier: { label: "Clean Machine", emoji: "🥗", score: 100, color: TIER_COLORS.god },
      },
      {
        min: 2,
        tier: { label: "Pretty Locked", emoji: "✅", score: 70, color: TIER_COLORS.high },
      },
      {
        min: 1,
        tier: { label: "Getting There", emoji: "⚖️", score: 40, color: TIER_COLORS.mid },
      },
      {
        min: 0,
        tier: { label: "Cheat Day", emoji: "🍕", score: 10, color: TIER_COLORS.low },
      },
    ],
  },
];

export const CATEGORY_ORDER: Category[] = ["Earn", "Learn", "Burn", "Fuel"];

export const CATEGORY_LABELS: Record<Category, { emoji: string; color: string }> = {
  Earn: { emoji: "💰", color: "text-amber-400" },
  Learn: { emoji: "📖", color: "text-blue-400" },
  Burn: { emoji: "🔥", color: "text-red-400" },
  Fuel: { emoji: "🥗", color: "text-green-400" },
};

export function getTier(key: MetricKey, value: number): Tier {
  const metric = METRICS.find((m) => m.key === key)!;
  for (const { min, tier } of metric.tiers) {
    if (value >= min) return tier;
  }
  return metric.tiers[metric.tiers.length - 1].tier;
}

export type CheckInData = {
  tokensM: number;
  burnStreak: number;
  deepWorkHrs: number;
  learnPages: number;
  cleanMeals: number;
};

export type OverallTier = {
  label: string;
  emoji: string;
  score: number;
  color: string;
};

export function getOverallTier(data: CheckInData): OverallTier {
  const scores = METRICS.map((m) => getTier(m.key, data[m.key]).score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  if (avg >= 90) return { label: "LOCKED IN", emoji: "🔐", score: avg, color: "text-amber-400" };
  if (avg >= 70) return { label: "Dialed In", emoji: "⚡", score: avg, color: "text-purple-400" };
  if (avg >= 50) return { label: "Getting There", emoji: "📈", score: avg, color: "text-blue-400" };
  if (avg >= 30) return { label: "Touch Grass Mode", emoji: "🌿", score: avg, color: "text-green-400" };
  return { label: "Log Off", emoji: "📴", score: avg, color: "text-zinc-400" };
}
