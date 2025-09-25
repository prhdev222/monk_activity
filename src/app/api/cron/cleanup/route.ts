import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ลบข้อมูลเก่ากว่า 180 วัน ของทุกผู้ใช้ (เรียกโดย Vercel Cron)
export async function GET() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 180);
  try {
    const [a, s] = await Promise.all([
      prisma.activity.deleteMany({ where: { date: { lt: cutoff } } }),
      prisma.smokingTracking.deleteMany({ where: { date: { lt: cutoff } } }),
    ]);
    return NextResponse.json({ ok: true, deleted: { activities: a.count, smoking: s.count }, cutoff });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}


