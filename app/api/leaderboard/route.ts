import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOverallTier, CheckInData } from "@/lib/tiers";

export async function GET() {
  // Get all opted-in users with their most recent check-in
  const users = await db.user.findMany({
    where: { leaderboardOptIn: true },
    include: {
      checkIns: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
  });

  const entries = users
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

  return NextResponse.json({ entries });
}
