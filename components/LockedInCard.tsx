import { CheckInData, METRICS, OverallTier, getTier } from "@/lib/tiers";

type Props = {
  data: CheckInData;
  overall: OverallTier;
  name?: string | null;
  date?: string;
  shareUrl?: string;
};

export default function LockedInCard({ data, overall, name, date, shareUrl }: Props) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        {name && (
          <p className="text-white font-bold text-base mb-0.5">{name}</p>
        )}
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
          {date ?? "Today"}
        </p>
        <div className={`text-4xl font-black mb-1 ${overall.color}`}>
          {overall.emoji} {overall.label}
        </div>
        <p className="text-zinc-500 text-sm">Score: {Math.round(overall.score)}/100</p>
        {/* Overall bar */}
        <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-amber-500 rounded-full"
            style={{ width: `${overall.score}%` }}
          />
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {METRICS.map((m) => {
          const tier = getTier(m.key, data[m.key]);
          return (
            <div key={m.key} className="bg-zinc-900 rounded-xl p-3">
              <p className="text-xs text-zinc-500 mb-0.5">{m.label}</p>
              <p className={`text-sm font-bold ${tier.color}`}>
                {tier.emoji} {tier.label}
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">
                {data[m.key]} {m.unit}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-zinc-600">
          🔐 locked-in.app
          {shareUrl && (
            <> &nbsp;·&nbsp; <span className="text-zinc-500">{shareUrl}</span></>
          )}
        </p>
      </div>
    </div>
  );
}
