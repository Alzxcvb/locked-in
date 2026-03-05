import { db } from "@/lib/db";
import { getOverallTier, CheckInData } from "@/lib/tiers";
import LockedInCard from "@/components/LockedInCard";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await db.snapshot.findUnique({
    where: { id },
    include: { checkIn: true, user: true },
  });
  if (!snapshot) return { title: "Not found" };

  const overall = getOverallTier(snapshot.checkIn as CheckInData);
  const name = snapshot.user.name;
  return {
    title: `${overall.emoji} ${overall.label} — ${name ? `${name} on ` : ""}Locked In`,
    description: `Score: ${Math.round(overall.score)}/100`,
  };
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await db.snapshot.findUnique({
    where: { id },
    include: { checkIn: true, user: true },
  });

  if (!snapshot) notFound();

  const checkIn = snapshot.checkIn as CheckInData;
  const overall = getOverallTier(checkIn);
  const userName = snapshot.user.name;
  const date = new Date(snapshot.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-black text-white mb-1">🔐 Locked In</h1>
        <p className="text-zinc-500 text-sm">
          {userName ? `${userName} shared their score` : "Someone shared their score"}
        </p>
      </div>

      <LockedInCard
        data={checkIn}
        overall={overall}
        name={userName}
        date={date}
        shareUrl={`locked-in.app/share/${id}`}
      />

      <a
        href="/"
        className="text-violet-400 hover:text-violet-300 text-sm underline transition-colors"
      >
        Check your own score →
      </a>
    </div>
  );
}
