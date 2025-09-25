import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { activityPayloadSchema } from "@/types/schemas";

const MET: Record<string, number> = {
  SITTING_MEDITATION: 1.0,
  CHANTING: 1.8,
  ALMS_WALK: 3.0,
  TEMPLE_WALK: 2.5,
  TEMPLE_SWEEPING: 3.5,
  TEMPLE_CHORES: 3.0,
  ARM_SWING: 2.8,
  WALKING_MEDITATION: 2.5,
  DRINK_PANA_ZERO_CAL: 0.0,
};

function estimateCalories(activityType: string, durationMin?: number | null, weightKg?: number | null) {
  if (!durationMin || durationMin <= 0) return 0;
  const met = MET[activityType] ?? 1.5;
  const wt = weightKg ?? 65; // สมมติถ้าไม่ทราบน้ำหนัก
  // แคลอรี่ ≈ MET × น้ำหนัก(kg) × ชั่วโมง
  return Math.round(met * wt * (durationMin / 60));
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  const oneHundredEightyDaysAgo = new Date();
  oneHundredEightyDaysAgo.setDate(oneHundredEightyDaysAgo.getDate() - 180);
  const items = await prisma.activity.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    take: 200,
  });
  // ลบข้อมูลเก่ากว่า 90 วัน แบบลาซีภายหลัง
  await prisma.activity.deleteMany({ where: { userId, date: { lt: oneHundredEightyDaysAgo } } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = activityPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  const calories = estimateCalories(data.activityType, data.durationMin, user?.weightKg ?? null);
  const created = await prisma.activity.create({
    data: {
      userId: data.userId,
      activityType: data.activityType,
      date: data.date ?? new Date(),
      durationMin: data.durationMin,
      intensity: data.intensity,
      caloriesBurned: calories,
      notes: data.notes,
    },
  });
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  try {
    await prisma.activity.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}


