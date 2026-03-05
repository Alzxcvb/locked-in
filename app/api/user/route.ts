import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("uid")?.value;
  if (!userId) return NextResponse.json({ name: null, leaderboardOptIn: false });

  const user = await db.user.findUnique({ where: { id: userId } });
  return NextResponse.json({
    name: user?.name ?? null,
    leaderboardOptIn: user?.leaderboardOptIn ?? false,
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const cookieStore = await cookies();
  const userId = cookieStore.get("uid")?.value;
  if (!userId) return NextResponse.json({ error: "No user" }, { status: 401 });

  const data: { name?: string | null; leaderboardOptIn?: boolean } = {};
  if ("name" in body) data.name = body.name?.trim() || null;
  if ("leaderboardOptIn" in body) data.leaderboardOptIn = body.leaderboardOptIn;

  const user = await db.user.update({ where: { id: userId }, data });
  return NextResponse.json({ name: user.name, leaderboardOptIn: user.leaderboardOptIn });
}
