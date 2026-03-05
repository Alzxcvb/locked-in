import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("uid")?.value;
  if (!userId) return NextResponse.json({ name: null });

  const user = await db.user.findUnique({ where: { id: userId } });
  return NextResponse.json({ name: user?.name ?? null });
}

export async function PUT(req: NextRequest) {
  const { name } = await req.json();
  const cookieStore = await cookies();
  const userId = cookieStore.get("uid")?.value;
  if (!userId) return NextResponse.json({ error: "No user" }, { status: 401 });

  const user = await db.user.update({
    where: { id: userId },
    data: { name: name?.trim() || null },
  });

  return NextResponse.json({ name: user.name });
}
