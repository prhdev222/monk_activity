"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/fetch";

type Smoking = {
  date: string;
  cigarettesCount: number;
  cravingLevelSum?: number;
  entries?: number;
};

// userId จะถูกโหลดหลัง mount เพื่อหลีกเลี่ยง hydration mismatch
const getNowIsoDate = () => new Date().toISOString().slice(0, 10);

export default function SmokingPage() {
  const smokes = typeof window !== "undefined" ? localStorage.getItem("currentUserSmokes") === "true" : true;
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<Smoking[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    cigarettesCount: "0",
    cravingLevel: "",
  });

  const totalCigs = useMemo(() => items.reduce((s, i) => s + (i.cigarettesCount ?? 0), 0), [items]);

  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dayBg = (d: Date): string => {
    const wd = d.getDay();
    switch (wd) {
      case 1: return "#FFF7CC"; // จันทร์
      case 2: return "#FFE0EB"; // อังคาร
      case 3: return "#E6F7E6"; // พุธ
      case 4: return "#FFE8D6"; // พฤหัส
      case 5: return "#E3F2FD"; // ศุกร์
      case 6: return "#F3E5F5"; // เสาร์
      default: return "#FFE5E5"; // อาทิตย์
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      if (!userId) return;
      const data = await apiFetch<Smoking[]>(`/api/smoking?userId=${userId}`);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUserId(typeof window !== "undefined" ? localStorage.getItem("currentUserId") : null);
  }, []);

  useEffect(() => {
    if (userId) void load();
  }, [userId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!userId) return;
      await apiFetch<Smoking>("/api/smoking", {
        method: "POST",
        body: JSON.stringify({
          userId,
          date: new Date(),
          cigarettesCount: Number(form.cigarettesCount),
          cravingLevel: form.cravingLevel ? Number(form.cravingLevel) : undefined,
        }),
      });
      setForm({ cigarettesCount: "0", cravingLevel: "" });
      await load();
    } finally {
      setLoading(false);
    }
  };

  if (!smokes) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">ติดตามการเลิกบุหรี่</h1>
        <p className="text-sm text-gray-600">คุณระบุว่าไม่สูบบุหรี่ เนื้อหานี้ถูกซ่อน</p>
      </div>
    );
  }

  if (userId === null) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">ติดตามการเลิกบุหรี่</h1>
        <p className="text-sm text-gray-600">กำลังโหลด...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">ติดตามการเลิกบุหรี่</h1>
        <p className="text-sm text-gray-600">กรุณาเข้าสู่ระบบก่อน</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ติดตามการเลิกบุหรี่</h1>
        <p className="text-sm text-gray-600">บันทึกจำนวนมวนต่อวัน</p>
      </div>

      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-4 items-end rounded-lg border bg-white p-4 shadow-sm">

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">จำนวนมวน</span>
          <input
            type="number"
            min={0}
            className="border rounded px-3 py-2"
            value={form.cigarettesCount}
            onChange={(e) => setForm((f) => ({ ...f, cigarettesCount: e.target.value }))}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs text-gray-600">ระดับความอยาก (0–10)</span>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            className="w-full"
            style={{ accentColor: "var(--brand-500)" }}
            value={form.cravingLevel}
            onChange={(e) => setForm((f) => ({ ...f, cravingLevel: e.target.value }))}
          />
          <div className="text-xs text-gray-600">ค่า: {form.cravingLevel || 0} / 10</div>
        </label>

        <button className="btn-primary rounded px-4 py-2 disabled:opacity-50" disabled={loading}>
          บันทึก
        </button>
      </form>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 rounded-t-lg">
          <span className="text-sm">บันทึกล่าสุด</span>
          <span className="text-sm">จำนวนมวนสะสม: {totalCigs.toLocaleString()} มวน</span>
        </div>
        <ul className="divide-y">
          {items
            .filter((i) => new Date(i.date) >= sevenDaysAgo)
            .map((i) => (
            <li key={i.date} className="px-4 py-3 text-sm flex items-center justify-between rounded" style={{ backgroundColor: dayBg(new Date(i.date)) }}>
              <div>
                <div className="font-medium">{new Date(i.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                <div className="text-gray-600">มวนทั้งวัน: {i.cigarettesCount} • ความอยากเฉลี่ย: {i.entries && i.entries > 0 ? (Number(i.cravingLevelSum ?? 0) / i.entries).toFixed(1) : 0}/10</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-gray-800">รวม: {i.cigarettesCount}</div>
                <button
                  className="text-red-600 hover:underline"
                  onClick={async () => {
                    await apiFetch(`/api/smoking?userId=${userId}&date=${encodeURIComponent(i.date)}`, { method: 'DELETE' });
                    await load();
                  }}
                >ลบทั้งวัน</button>
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


