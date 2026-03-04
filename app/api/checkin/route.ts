import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tokensM, sleepHrs, burnStreak, deepWorkHrs, learnPages, cleanMeals } = body;

  // Get or create anonymous user ID from cookie
  const cookieStore = await cookies();
  let userId = cookieStore.get("uid")?.value;

  if (!userId) {
    const user = await db.user.create({ data: {} });
    userId = user.id;
  } else {
    // Ensure user exists
    const existing = await db.user.findUnique({ where: { id: userId } });
    if (!existing) {
      const user = await db.user.create({ data: { id: userId } });
      userId = user.id;
    }
  }

  const checkIn = await db.checkIn.create({
    data: { userId, tokensM, sleepHrs, burnStreak, deepWorkHrs, learnPages, cleanMeals },
  });

  const res = NextResponse.json({ ok: true, checkInId: checkIn.id });
  res.cookies.set("uid", userId!, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return res;
}

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("uid")?.value;
  if (!userId) return NextResponse.json({ checkIns: [] });

  const checkIns = await db.checkIn.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 30,
  });

  return NextResponse.json({ checkIns });
}
