"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/fetch";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    password: "",
    monkName: "",
    firstName: "",
    lastName: "",
    hn: "",
    templeName: "",
    weightKg: "",
    heightCm: "",
    smokes: false,
    consentPdpa: false,
  });
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError(null);
      const user = await apiFetch<{ id: string; smokes: boolean }>("/api/users", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          weightKg: form.weightKg ? Number(form.weightKg) : undefined,
          heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        }),
      });
      localStorage.setItem("currentUserId", user.id);
      localStorage.setItem("currentUserSmokes", String(user.smokes));
      localStorage.setItem("hasAccount", "true");
      window.location.href = "/dashboard";
    } catch {
      setError("ลงทะเบียนไม่สำเร็จ กรุณาตรวจสอบข้อมูลหรือเบอร์ซ้ำ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ลงทะเบียนผู้ใช้</h1>
        <p className="text-sm text-gray-600">กรอกข้อมูลพื้นฐานก่อนเริ่มใช้งาน</p>
      </div>

      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 rounded-lg border bg-white p-4 shadow-sm">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">เบอร์โทร</span>
          <input className="border rounded px-3 py-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">รหัสผ่าน</span>
          <input type="password" className="border rounded px-3 py-2" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs text-gray-600">ฉายาพระ</span>
          <input className="border rounded px-3 py-2" value={form.monkName} onChange={(e) => setForm({ ...form, monkName: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">น้ำหนัก (กก.)</span>
          <input className="border rounded px-3 py-2" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">ส่วนสูง (ซม.)</span>
          <input className="border rounded px-3 py-2" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">ชื่อ</span>
          <input className="border rounded px-3 py-2" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">นามสกุล</span>
          <input className="border rounded px-3 py-2" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">HN (ถ้ามี)</span>
          <input className="border rounded px-3 py-2" value={form.hn} onChange={(e) => setForm({ ...form, hn: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">วัด (ถ้ามี)</span>
          <input className="border rounded px-3 py-2" value={form.templeName} onChange={(e) => setForm({ ...form, templeName: e.target.value })} />
        </label>
        <label className="flex items-center gap-2 sm:col-span-2">
          <input type="checkbox" checked={form.smokes} onChange={(e) => setForm({ ...form, smokes: e.target.checked })} />
          <span className="text-sm">สูบบุหรี่</span>
        </label>

        <div className="sm:col-span-2 text-xs text-gray-600 rounded border p-3 bg-orange-50/40">
          การใช้งานนี้จะจัดเก็บข้อมูลส่วนบุคคลเพื่อการติดตามสุขภาพเป็นเวลาไม่เกิน 90 วัน
          หลังจากนั้นข้อมูลจะถูกลบอัตโนมัติ คุณสามารถถอนความยินยอมได้ทุกเมื่อ
        </div>
        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.consentPdpa}
            onChange={(e) => setForm({ ...form, consentPdpa: e.target.checked })}
          />
          <span className="text-sm">ข้าพเจ้ายินยอมให้เก็บและประมวลผลข้อมูลส่วนบุคคล (PDPA)</span>
        </label>

        {error && <div className="text-sm text-red-600 sm:col-span-2">{error}</div>}
        <button className="btn-primary rounded px-4 py-2 disabled:opacity-50 sm:col-span-2" disabled={loading}>
          เริ่มใช้งาน
        </button>
      </form>
    </div>
  );
}


