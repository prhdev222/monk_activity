import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { smokingPayloadSchema } from "@/types/schemas";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  const oneHundredEightyDaysAgo = new Date();
  oneHundredEightyDaysAgo.setDate(oneHundredEightyDaysAgo.getDate() - 180);
  // รวมยอดต่อวัน: ใช้ groupBy ตามวันที่ (ตัดเวลาออก)
  const entries = await prisma.smokingTracking.findMany({
    where: { userId, date: { gte: oneHundredEightyDaysAgo } },
    orderBy: { date: "desc" },
    take: 2000,
  });
  await prisma.smokingTracking.deleteMany({ where: { userId, date: { lt: oneHundredEightyDaysAgo } } });
  const byDay = new Map<string, { date: string; cigarettesCount: number; cravingLevelSum: number; entries: number }>();
  for (const e of entries) {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString();
    const row = byDay.get(key) ?? { date: key, cigarettesCount: 0, cravingLevelSum: 0, entries: 0 };
    row.cigarettesCount += e.cigarettesCount ?? 0;
    if (e.cravingLevel != null) {
      row.cravingLevelSum += e.cravingLevel;
      row.entries += 1;
    }
    byDay.set(key, row);
  }
  const items = Array.from(byDay.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = smokingPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  // บันทึกโดยตัดเวลาออก (เก็บเป็นเวลา 00:00) เพื่อให้ต่อวันอย่างเดียว
  const d = new Date(data.date);
  d.setHours(0, 0, 0, 0);
  const created = await prisma.smokingTracking.create({
    data: {
      userId: data.userId,
      date: d,
      cigarettesCount: data.cigarettesCount,
      cravingLevel: data.cravingLevel,
    },
  });
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const userId = req.nextUrl.searchParams.get("userId");
  const dateParam = req.nextUrl.searchParams.get("date");
  try {
    if (id) {
      await prisma.smokingTracking.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }
    if (userId && dateParam) {
      const start = new Date(dateParam);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const res = await prisma.smokingTracking.deleteMany({
        where: { userId, date: { gte: start, lt: end } },
      });
      return NextResponse.json({ ok: true, deleted: res.count });
    }
    return NextResponse.json({ error: "id or (userId+date) required" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}


