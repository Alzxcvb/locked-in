import { db } from "@/lib/db";
import { getOverallTier, CheckInData } from "@/lib/tiers";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getEntries() {
  const users = await db.user.findMany({
    where: { leaderboardOptIn: true },
    include: {
      checkIns: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
  });

  return users
    .filter((u) => u.checkIns.length > 0)
    .map((u) => {
      const checkIn = u.checkIns[0];
      const overall = getOverallTier(checkIn as unknown as CheckInData);
      return {
        name: u.name ?? "Anonymous",
        score: Math.round(overall.score),
        label: overall.label,
        emoji: overall.emoji,
        color: overall.color,
        date: checkIn.date,
      };
    })
    .sort((a, b) => b.score - a.score);
}

const MEDAL = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const entries = await getEntries();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
            ← Back
          </Link>
          <h1 className="text-4xl font-black tracking-tight mt-4 mb-1">🏆 Leaderboard</h1>
          <p className="text-zinc-400 text-sm">Most recent check-in score, opt-in only</p>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-lg mb-2">No one on the board yet.</p>
            <p className="text-zinc-600 text-sm">
              Check in and enable <span className="text-zinc-400">Show on leaderboard</span> from the dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 bg-zinc-900 border rounded-2xl px-5 py-4 ${
                  i === 0 ? "border-amber-500/40" : "border-zinc-800"
                }`}
              >
                {/* Rank */}
                <div className="text-2xl w-8 text-center flex-shrink-0">
                  {MEDAL[i] ?? <span className="text-zinc-500 font-mono text-sm">{i + 1}</span>}
                </div>

                {/* Name + tier */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{entry.name}</p>
                  <p className={`text-sm ${entry.color}`}>
                    {entry.emoji} {entry.label}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-black text-white">{entry.score}</p>
                  <p className="text-xs text-zinc-500">/ 100</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-zinc-700 mt-8">
          Updates every minute · Scores reflect most recent check-in
        </p>
      </div>
    </div>
  );
}
