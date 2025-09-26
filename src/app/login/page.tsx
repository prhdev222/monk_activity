"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/fetch";
import LineLogin from "@/app/(components)/LineLogin";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [lineError, setLineError] = useState<string | null>(null);

  useEffect(() => {
    // Check for LINE login callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const lineLogin = urlParams.get('lineLogin');
    const userId = urlParams.get('userId');
    const smokes = urlParams.get('smokes');
    const errorParam = urlParams.get('error');

    if (lineLogin === 'success' && userId) {
      // LINE login successful
      localStorage.setItem("currentUserId", userId);
      localStorage.setItem("currentUserSmokes", smokes || 'false');
      localStorage.setItem("hasAccount", "true");
      localStorage.setItem("authProvider", "line");
      window.location.href = "/dashboard";
    } else if (errorParam === 'line_login_failed') {
      setLineError("การเข้าสู่ระบบผ่าน LINE ล้มเหลว กรุณาลองใหม่อีกครั้ง");
    }
  }, []);

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
      localStorage.setItem("authProvider", "local");
      window.location.href = "/dashboard";
    } catch {
      setError("เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  const handleLineLoginSuccess = (user: { id: string; displayName: string; pictureUrl?: string }) => {
    console.log("LINE login successful:", user);
  };

  const handleLineLoginError = (error: string) => {
    setLineError(error);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">เข้าสู่ระบบ</h1>
        <p className="text-sm text-gray-600">เลือกวิธีการเข้าสู่ระบบ</p>
      </div>

      {/* LINE Login */}
      <div className="sm:max-w-sm">
        <LineLogin 
          onSuccess={handleLineLoginSuccess}
          onError={handleLineLoginError}
          className="mb-4"
        />
        {lineError && <div className="text-sm text-red-600 mt-2">{lineError}</div>}
      </div>

      {/* Divider */}
      <div className="sm:max-w-sm flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="px-4 text-sm text-gray-500">หรือ</div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Traditional Login */}
      <form onSubmit={submit} className="grid gap-3 sm:max-w-sm rounded-lg border bg-white p-4 shadow-sm">
        <div className="text-sm font-medium text-gray-700 mb-2">เข้าสู่ระบบด้วยเบอร์โทร</div>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">เบอร์โทร</span>
          <input 
            className="border rounded px-3 py-2" 
            value={form.phone} 
            onChange={(e) => setForm({ ...form, phone: e.target.value })} 
            placeholder="กรอกเบอร์โทรศัพท์"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">รหัสผ่าน</span>
          <input 
            type="password" 
            className="border rounded px-3 py-2" 
            value={form.password} 
            onChange={(e) => setForm({ ...form, password: e.target.value })} 
            placeholder="กรอกรหัสผ่าน"
          />
        </label>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button className="btn-primary rounded px-4 py-2 disabled:opacity-50" disabled={loading}>
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </div>
  );
}


