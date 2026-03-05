"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { METRICS, getTier, getOverallTier, CheckInData, MetricKey, CATEGORY_ORDER, CATEGORY_LABELS } from "@/lib/tiers";
import MetricCard from "@/components/MetricCard";
import LockedInCard from "@/components/LockedInCard";

const DEFAULTS: CheckInData = {
  tokensM: 0,
  burnStreak: 0,
  deepWorkHrs: 0,
  learnPages: 0,
  cleanMeals: 0,
};

type HistoryItem = CheckInData & { id: string; date: string };

export default function Home() {
  const [data, setData] = useState<CheckInData>(DEFAULTS);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [lastCheckInId, setLastCheckInId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameLoaded, setNameLoaded] = useState(false);
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);

  useEffect(() => {
    fetch("/api/checkin")
      .then((r) => r.json())
      .then(({ checkIns }) => setHistory(checkIns ?? []));

    fetch("/api/user")
      .then((r) => r.json())
      .then(({ name, leaderboardOptIn }) => {
        if (name) setName(name);
        else setEditingName(true);
        setLeaderboardOptIn(leaderboardOptIn ?? false);
        setNameLoaded(true);
      });
  }, []);

  async function toggleLeaderboard() {
    const next = !leaderboardOptIn;
    setLeaderboardOptIn(next);
    await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaderboardOptIn: next }),
    });
  }

  const overall = getOverallTier(data);

  function update(key: MetricKey, val: number) {
    setData((prev) => ({ ...prev, [key]: val }));
  }

  async function saveName() {
    await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setEditingName(false);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setLastCheckInId(json.checkInId);
    setSubmitted(true);
    setSaving(false);

    const h = await fetch("/api/checkin").then((r) => r.json());
    setHistory(h.checkIns ?? []);
  }

  async function handleShare() {
    if (!lastCheckInId) return;
    setSharing(true);
    const res = await fetch("/api/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkInId: lastCheckInId }),
    });
    const { shareId } = await res.json();
    const url = `${window.location.origin}/share/${shareId}`;
    setShareUrl(url);
    await navigator.clipboard.writeText(url).catch(() => {});
    setSharing(false);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black tracking-tight mb-2">
            🔐 Locked In
          </h1>

          {/* Name section */}
          {nameLoaded && (
            <div className="mt-3">
              {editingName ? (
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveName()}
                    placeholder="Your name"
                    maxLength={40}
                    autoFocus
                    className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 w-48"
                  />
                  <button
                    onClick={saveName}
                    className="bg-violet-600 hover:bg-violet-500 px-3 py-2 rounded-xl text-sm font-bold transition-colors"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="text-zinc-400 hover:text-white text-sm transition-colors"
                >
                  {name ? `👤 ${name}` : "＋ Add your name"}
                </button>
              )}
            </div>
          )}

          <p className="text-zinc-500 text-sm mt-3">How locked in are you today?</p>
        </div>

        {/* Live overall score */}
        <div className="text-center mb-8">
          <div className={`text-3xl font-black mb-1 ${overall.color}`}>
            {overall.emoji} {overall.label}
          </div>
          <p className="text-zinc-500 text-sm">Overall score: {Math.round(overall.score)}/100</p>
          <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${overall.score}%` }}
            />
          </div>
        </div>

        {/* Metrics grouped by Earn / Learn / Burn / Fuel */}
        <div className="space-y-6 mb-8">
          {CATEGORY_ORDER.map((cat) => {
            const catMetrics = METRICS.filter((m) => m.category === cat);
            const { emoji, color } = CATEGORY_LABELS[cat];
            return (
              <div key={cat}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${color}`}>
                  {emoji} {cat}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {catMetrics.map((m) => (
                    <MetricCard
                      key={m.key}
                      metric={m}
                      value={data[m.key]}
                      tier={getTier(m.key, data[m.key])}
                      onChange={(val) => update(m.key, val)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        {!submitted ? (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900 rounded-2xl font-bold text-lg transition-colors"
          >
            {saving ? "Saving..." : "Save Today's Check-in"}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center gap-4">
              <p className="text-green-400 font-bold">✓ Saved!</p>
              <LockedInCard data={data} overall={overall} name={name || null} />
            </div>
            {!shareUrl ? (
              <button
                onClick={handleShare}
                disabled={sharing}
                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-2xl font-bold transition-colors"
              >
                {sharing ? "Generating link..." : "📤 Create Shareable Card"}
              </button>
            ) : (
              <div className="bg-zinc-900 border border-green-800 rounded-2xl p-4 text-center">
                <p className="text-green-400 text-sm font-bold mb-1">Link copied to clipboard!</p>
                <a href={shareUrl} className="text-violet-400 text-sm underline break-all">
                  {shareUrl}
                </a>
              </div>
            )}
            <button
              onClick={() => { setSubmitted(false); setShareUrl(null); setLastCheckInId(null); }}
              className="w-full py-3 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
            >
              ← Edit
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold mb-4 text-zinc-300">Recent Check-ins</h2>
            <div className="space-y-3">
              {history.slice(0, 7).map((item) => {
                const itemOverall = getOverallTier(item);
                return (
                  <div
                    key={item.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className={`font-bold ${itemOverall.color}`}>
                        {itemOverall.emoji} {itemOverall.label}
                      </p>
                      <p className="text-xs text-zinc-600">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <p className="text-zinc-400 font-mono text-sm">
                      {Math.round(itemOverall.score)}/100
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Leaderboard section */}
        {nameLoaded && (
          <div className="mt-10 pt-8 border-t border-zinc-800 flex items-center justify-between">
            <div>
              <Link
                href="/leaderboard"
                className="text-white font-bold hover:text-violet-400 transition-colors"
              >
                🏆 Leaderboard →
              </Link>
              <p className="text-xs text-zinc-600 mt-0.5">See how others are doing</p>
            </div>
            <button
              onClick={toggleLeaderboard}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl border transition-colors ${
                leaderboardOptIn
                  ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                  : "bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${leaderboardOptIn ? "bg-violet-400" : "bg-zinc-600"}`} />
              {leaderboardOptIn ? "Showing on board" : "Join leaderboard"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
