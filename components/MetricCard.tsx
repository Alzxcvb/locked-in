"use client";

import { MetricConfig, Tier } from "@/lib/tiers";

type Props = {
  metric: MetricConfig;
  value: number;
  tier: Tier;
  onChange?: (val: number) => void;
  readOnly?: boolean;
};

export default function MetricCard({ metric, value, tier, onChange, readOnly }: Props) {
  const pct = Math.min((value / metric.max) * 100, 100);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">{metric.label}</p>
          <p className={`text-lg font-bold mt-0.5 ${tier.color}`}>
            {tier.emoji} {tier.label}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-white">{value}</p>
          <p className="text-xs text-zinc-500">{metric.unit}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-amber-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {!readOnly && onChange && (
        <input
          type="range"
          min={0}
          max={metric.max}
          step={metric.step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full accent-violet-500 cursor-pointer"
        />
      )}

      {!readOnly && (
        <p className="text-xs text-zinc-600">{metric.description}</p>
      )}
    </div>
  );
}
