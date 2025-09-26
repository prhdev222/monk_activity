import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [activitiesCountToday, caloriesAgg, smokingAgg] = await Promise.all([
      prisma.activity.count({
        where: { date: { gte: startOfToday, lte: endOfToday } },
      }),
      prisma.activity.aggregate({
        _sum: { caloriesBurned: true },
        where: { date: { gte: startOfToday, lte: endOfToday } },
      }),
      prisma.smokingTracking.aggregate({
        _sum: { cigarettesCount: true },
        _avg: { cravingLevel: true },
        where: { date: { gte: sevenDaysAgo, lte: endOfToday } },
      }),
    ]);

    const caloriesToday = caloriesAgg._sum.caloriesBurned ?? 0;
    const cigs7 = smokingAgg._sum.cigarettesCount ?? 0;
    const avgCraving = smokingAgg._avg.cravingLevel ?? 0;

    return NextResponse.json({
      activitiesCountToday,
      caloriesToday,
      cigs7,
      avgCraving,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
