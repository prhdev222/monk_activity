import prisma from "@/lib/prisma";

// ธรรมะสอนใจ: อ้างอิงจาก Sanook Horoscope
// แหล่งที่มา: https://www.sanook.com/horoscope/74737/
const DHAMMA_QUOTES: string[] = [
  "ไม่ต้องไปหาความสุข ความสมบูรณ์แบบที่ไหนไกล แค่ใจเราสงบ ชีวิตก็ดีแล้ว",
  "การไม่อยากได้ ไม่อยากมี ไม่อยากเป็นเจ้าของต่อสิ่งใดๆ นั่นแหละทำให้เป็นสุข",
  "เมื่อเริ่มเป็นผู้ให้ คุณก็ยิ่งใหญ่ในสายตาคนอื่น",
  "มองปัญหาเป็นเรื่องธรรมดาที่ต้องพบเจอ แล้วเราจะไม่ทุกข์",
  "หมั่นทำความดี สิ่งดีๆ จะย้อนกลับมาหาเราเอง",
  "ไม่มีใครได้ทุกอย่าง และไม่มีใครพลาดทุกอย่าง",
  "เสริมบุญอย่าให้หมด ส่วนบาปให้ลดอย่าให้เพิ่ม",
  "โชคอยู่ที่การแสวงหา วาสนาอยู่ที่การกระทำ",
  "พึงชนะผู้น้อยด้วยการให้ พึงชนะผู้ใหญ่ด้วยความอ่อนโยน",
  "ความสุขสอนให้เรารักคนอื่น ความทุกข์สอนให้เรารักตัวเอง",
  "อดีตล่วงไปแล้ว อนาคตยังมาไม่ถึง จงทำปัจจุบันให้ดีที่สุด",
  "ปล่อยความทุกข์ทิ้งไป เก็บความสุขใส่ใจดีกว่า",
  "ถ้าทำได้จงช่วยผู้อื่น ถ้าทำไม่ได้อย่างน้อยอย่าทำร้ายผู้อื่น",
  "มุมที่ดีอยู่ที่เรามอง ใจที่ดีอยู่ที่เราเลือก",
  "ยึดมากเป็นทุกข์มาก ยึดน้อยเป็นทุกข์น้อย ไม่ยึดเลยทุกข์ก็ไม่มี",
  "อย่าทุกข์กับสิ่งที่ควบคุมไม่ได้ ทำเต็มที่แล้วให้ปล่อยวาง",
  "ก้อนหินจะหนักก็ต่อเมื่อเราเอาไปแบก",
  "คนอื่นมีสิทธิ์พูดตามที่เขาคิด แต่สิทธิ์สร้างชีวิตเป็นของเรา",
  "เวรย่อมระงับด้วยการไม่จองเวร",
  "ถ้าวันนี้ถูกต้องก็ไม่ต้องกลัวพรุ่งนี้ (พุทธทาสภิกขุ)",
];

function getQuoteOfToday(date: Date): string {
  const dayCount = Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
  const idx = ((dayCount % DHAMMA_QUOTES.length) + DHAMMA_QUOTES.length) % DHAMMA_QUOTES.length;
  return DHAMMA_QUOTES[idx];
}

export default async function DashboardPage() {
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

  const todaysQuote = getQuoteOfToday(now);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">แดชบอร์ด</h1>
        <p className="text-sm text-gray-600">ภาพรวมความก้าวหน้าและคำให้กำลังใจของวัน</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">กิจกรรมวันนี้</div>
          <div className="text-2xl font-semibold">{activitiesCountToday.toLocaleString()}</div>
        </article>
        <article className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">แคลอรี่โดยประมาณ</div>
          <div className="text-2xl font-semibold">{caloriesToday.toLocaleString()} kcal</div>
        </article>
        <article className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">จำนวนมวน (7 วัน)</div>
          <div className="text-2xl font-semibold">{cigs7.toLocaleString()}</div>
        </article>
        <article className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">ระดับความอยากเฉลี่ย</div>
          <div className="text-2xl font-semibold">{avgCraving.toFixed(1)} / 10</div>
        </article>
      </section>
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="text-sm font-medium mb-2">ธรรมะสอนใจประจำวัน</div>
        <p className="text-gray-700">“{todaysQuote}”</p>
        <div className="mt-2 text-xs text-gray-500">อ้างอิง: Sanook Horoscope (<a className="underline" href="https://www.sanook.com/horoscope/74737/" target="_blank" rel="noreferrer">ลิงก์</a>)</div>
      </section>
    </div>
  );
}


