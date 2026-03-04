import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const { checkInId } = await req.json();

  const cookieStore = await cookies();
  const userId = cookieStore.get("uid")?.value;
  if (!userId) return NextResponse.json({ error: "No user" }, { status: 401 });

  // Verify ownership
  const checkIn = await db.checkIn.findUnique({ where: { id: checkInId } });
  if (!checkIn || checkIn.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Reuse existing snapshot if one exists
  const existing = await db.snapshot.findUnique({ where: { checkInId } });
  if (existing) return NextResponse.json({ shareId: existing.id });

  const shareId = nanoid(8);
  await db.snapshot.create({
    data: { id: shareId, checkInId, userId },
  });

  return NextResponse.json({ shareId });
}
