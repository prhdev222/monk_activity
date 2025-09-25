"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/fetch";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await apiFetch<{ id: string; smokes: boolean }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      localStorage.setItem("currentUserId", user.id);
      localStorage.setItem("currentUserSmokes", String(user.smokes));
      localStorage.setItem("hasAccount", "true");
      window.location.href = "/dashboard";
    } catch {
      setError("เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">เข้าสู่ระบบ</h1>
        <p className="text-sm text-gray-600">กรอกเบอร์โทรและรหัสผ่าน</p>
      </div>

      <form onSubmit={submit} className="grid gap-3 sm:max-w-sm rounded-lg border bg-white p-4 shadow-sm">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">เบอร์โทร</span>
          <input className="border rounded px-3 py-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">รหัสผ่าน</span>
          <input type="password" className="border rounded px-3 py-2" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button className="btn-primary rounded px-4 py-2 disabled:opacity-50" disabled={loading}>เข้าสู่ระบบ</button>
      </form>
    </div>
  );
}


