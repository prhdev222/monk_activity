"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/fetch";

type Activity = {
  id: string;
  userId: string;
  activityType: string;
  date: string;
  durationMin?: number | null;
  intensity?: string | null;
  caloriesBurned?: number | null;
  notes?: string | null;
};

const DEFAULT_USER_ID = typeof window !== "undefined" && localStorage.getItem("currentUserId")
  ? (localStorage.getItem("currentUserId") as string)
  : "demo_user_cuid_replaceme";

const ACTIVITY_OPTIONS = [
  { value: "SITTING_MEDITATION", label: "นั่งสมาธิ" },
  { value: "CHANTING", label: "สวดมนต์" },
  { value: "ALMS_WALK", label: "เดินบิณฑบาต" },
  { value: "TEMPLE_WALK", label: "เดินรอบวัด" },
  { value: "TEMPLE_SWEEPING", label: "กวาดลานวัด" },
  { value: "TEMPLE_CHORES", label: "งานในวัด" },
  { value: "ARM_SWING", label: "แกว่งแขน" },
  { value: "WALKING_MEDITATION", label: "เดินจงกรม" },
  { value: "DRINK_PANA_ZERO_CAL", label: "ฉันน้ำปานะไม่มีแคลอรี่ (IF หลังเที่ยง)" },
];

const ACTIVITY_LABEL_BY_VALUE: Record<string, string> = ACTIVITY_OPTIONS.reduce((acc, cur) => {
  acc[cur.value] = cur.label;
  return acc;
}, {} as Record<string, string>);

const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES_STEP = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

export default function ChecklistPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    activityType: ACTIVITY_OPTIONS[0].value,
    durationMin: "",
    intensity: "",
    notes: "",
    time: (() => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    })(),
  });

  const totalCalories = useMemo(
    () => (items?.reduce((sum, a) => sum + (a.caloriesBurned ?? 0), 0) ?? 0),
    [items]
  );

  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dayBg = (d: Date): string => {
    // 0 = อาทิตย์, 1 = จันทร์, ...
    const wd = d.getDay();
    switch (wd) {
      case 1: // จันทร์ เหลืองอ่อน
        return "#FFF7CC";
      case 2: // อังคาร ชมพูอ่อน
        return "#FFE0EB";
      case 3: // พุธ เขียวอ่อน
        return "#E6F7E6";
      case 4: // พฤหัสบดี ส้มอ่อน
        return "#FFE8D6";
      case 5: // ศุกร์ ฟ้าอ่อน
        return "#E3F2FD";
      case 6: // เสาร์ ม่วงอ่อน
        return "#F3E5F5";
      case 0: // อาทิตย์ แดงอ่อน
      default:
        return "#FFE5E5";
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Activity[]>(`/api/activities?userId=${DEFAULT_USER_ID}`);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const now = new Date();
      // ประกอบเวลาตามที่เลือก โดยใช้วันที่วันนี้
      if (form.time) {
        const [hh, mm] = form.time.split(":");
        now.setHours(Number(hh ?? 0), Number(mm ?? 0), 0, 0);
      }
      const payload = {
        userId: DEFAULT_USER_ID,
        activityType: form.activityType,
        date: now,
        durationMin: form.durationMin ? Number(form.durationMin) : undefined,
        intensity: form.intensity || undefined,
        notes: form.notes || undefined,
      };
      await apiFetch<Activity>("/api/activities", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setForm({
        ...form,
        durationMin: "",
        intensity: "",
        notes: "",
        time: (() => {
          const d = new Date();
          const hh = String(d.getHours()).padStart(2, "0");
          const mm = String(d.getMinutes()).padStart(2, "0");
          return `${hh}:${mm}`;
        })(),
      });
      await load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">กิจกรรม</h1>
        <p className="text-sm text-gray-600">บันทึกกิจกรรมและคำนวณแคลอรี่โดยอัตโนมัติ</p>
      </div>

      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-5 items-end rounded-lg border bg-white p-4 shadow-sm">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs text-gray-600">กิจกรรม</span>
          <select
            className="border rounded px-3 py-2"
            value={form.activityType}
            onChange={(e) => setForm((f) => ({ ...f, activityType: e.target.value }))}
          >
            {ACTIVITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">เวลา (24 ชั่วโมง)</span>
          <div className="flex items-center gap-2">
            <select
              className="border rounded px-3 py-2"
              value={form.time.split(":")[0]}
              onChange={(e) =>
                setForm((f) => ({ ...f, time: `${e.target.value}:${f.time.split(":")[1]}` }))
              }
            >
              {HOURS_24.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span>:</span>
            <select
              className="border rounded px-3 py-2"
              value={form.time.split(":")[1]}
              onChange={(e) =>
                setForm((f) => ({ ...f, time: `${f.time.split(":")[0]}:${e.target.value}` }))
              }
            >
              {MINUTES_STEP.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <button
              type="button"
              className="px-3 py-2 text-xs rounded btn-outline"
              onClick={() =>
                setForm((f) => {
                  const d = new Date();
                  const hh = String(d.getHours()).padStart(2, "0");
                  const mm = String(Math.round(d.getMinutes() / 5) * 5).padStart(2, "0");
                  return { ...f, time: `${hh}:${mm}` };
                })
              }
            >
              เวลาปัจจุบัน
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">ระยะเวลา (นาที)</span>
          <input
            type="number"
            min={0}
            className="border rounded px-3 py-2"
            value={form.durationMin}
            onChange={(e) => setForm((f) => ({ ...f, durationMin: e.target.value }))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">ความเข้มข้น (ถ้ามี)</span>
          <input
            className="border rounded px-3 py-2"
            value={form.intensity}
            onChange={(e) => setForm((f) => ({ ...f, intensity: e.target.value }))}
          />
        </label>

        <button
          className="btn-primary rounded px-4 py-2 disabled:opacity-50"
          disabled={loading}
        >
          บันทึก
        </button>
      </form>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 rounded-t-lg">
          <span className="text-sm">กิจกรรมล่าสุด</span>
          <span className="text-sm">แคลอรี่รวม: {totalCalories.toLocaleString()}</span>
        </div>
        <ul className="divide-y">
          {items
            .filter((a) => new Date(a.date) >= sevenDaysAgo)
            .map((a) => (
            <li key={a.id} className="px-4 py-3 text-sm flex items-center justify-between rounded" style={{ backgroundColor: dayBg(new Date(a.date)) }}>
              <div>
                <div className="font-medium">{ACTIVITY_LABEL_BY_VALUE[a.activityType] ?? a.activityType}</div>
                <div className="text-gray-600">
                  {new Date(a.date).toLocaleString('th-TH', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • {(a.durationMin ?? 0)} นาที • {a.intensity ?? "-"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-gray-800">{a.caloriesBurned ?? 0} kcal</div>
                <button
                  className="text-red-600 hover:underline"
                  onClick={async () => {
                    await apiFetch(`/api/activities?id=${a.id}`, { method: 'DELETE' });
                    await load();
                  }}
                >ลบ</button>
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-gray-600">ยังไม่มีข้อมูล</li>
          )}
        </ul>
      </div>
    </div>
  );
}


