"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/fetch";

interface UserData {
  id: string;
  phone: string;
  firstName: string;
  lastName?: string;
  hn?: string;
  templeName?: string;
  weightKg?: number;
  heightCm?: number;
  smokes: boolean;
  consentPdpa: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [form, setForm] = useState({ 
    phone: "", 
    password: "", 
    firstName: "", 
    lastName: "", 
    hn: "", 
    templeName: "", 
    weightKg: "", 
    heightCm: "", 
    smokes: false 
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"view" | "edit">("view");

  useEffect(() => {
    // ตั้งค่า userId จาก localStorage หลังจาก component mount
    setUserId(localStorage.getItem("currentUserId"));
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      try {
        const u = await apiFetch<UserData>(`/api/users/${userId}`);
        setUserData(u);
        setForm({
          phone: u.phone,
          password: "",
          firstName: u.firstName,
          lastName: u.lastName || "",
          hn: u.hn || "",
          templeName: u.templeName || "",
          weightKg: u.weightKg ? String(u.weightKg) : "",
          heightCm: u.heightCm ? String(u.heightCm) : "",
          smokes: u.smokes,
        });
      } catch {}
    };
    run();
  }, [userId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setMsg(null);
    try {
      const updateData: Partial<{
        phone: string;
        firstName: string;
        lastName: string;
        hn: string;
        templeName: string;
        weightKg: number;
        heightCm: number;
        smokes: boolean;
      }> = {
        phone: form.phone,
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        hn: form.hn || undefined,
        templeName: form.templeName || undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        smokes: form.smokes,
      };
      
      // เพิ่ม password เฉพาะเมื่อมีการกรอก
      if (form.password.trim()) {
        updateData.password = form.password;
      }
      
      const updated = await apiFetch(`/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
      
      setUserData(updated);
      setMsg("บันทึกโปรไฟล์เรียบร้อย");
      setActiveTab("view");
    } catch {
      setMsg("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  // แสดง loading state จนกว่า userId จะถูกโหลด
  if (userId === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">โปรไฟล์</h1>
          <p className="text-sm text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">โปรไฟล์</h1>
          <p className="text-sm text-gray-600">กรุณาเข้าสู่ระบบก่อน</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">โปรไฟล์</h1>
        <p className="text-sm text-gray-600">ดูและแก้ไขข้อมูลส่วนตัว</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "view" 
              ? "text-orange-600 border-b-2 border-orange-600" 
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("view")}
        >
          ดูข้อมูล
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "edit" 
              ? "text-orange-600 border-b-2 border-orange-600" 
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("edit")}
        >
          แก้ไขข้อมูล
        </button>
      </div>

      {activeTab === "view" && userData && (
        <div className="grid gap-4 sm:max-w-md rounded-lg border bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-600">เบอร์โทร</span>
              <div className="text-sm font-medium">{userData.phone}</div>
            </div>
            <div>
              <span className="text-xs text-gray-600">ชื่อ</span>
              <div className="text-sm font-medium">{userData.firstName} {userData.lastName}</div>
            </div>
            {userData.hn && (
              <div>
                <span className="text-xs text-gray-600">HN</span>
                <div className="text-sm font-medium">{userData.hn}</div>
              </div>
            )}
            {userData.templeName && (
              <div>
                <span className="text-xs text-gray-600">วัด</span>
                <div className="text-sm font-medium">{userData.templeName}</div>
              </div>
            )}
            <div>
              <span className="text-xs text-gray-600">น้ำหนัก</span>
              <div className="text-sm font-medium">{userData.weightKg ? `${userData.weightKg} กก.` : "ไม่ระบุ"}</div>
            </div>
            <div>
              <span className="text-xs text-gray-600">ส่วนสูง</span>
              <div className="text-sm font-medium">{userData.heightCm ? `${userData.heightCm} ซม.` : "ไม่ระบุ"}</div>
            </div>
            <div>
              <span className="text-xs text-gray-600">สูบบุหรี่</span>
              <div className="text-sm font-medium">{userData.smokes ? "ใช่" : "ไม่"}</div>
            </div>
            <div>
              <span className="text-xs text-gray-600">สมัครเมื่อ</span>
              <div className="text-sm font-medium">{new Date(userData.createdAt).toLocaleDateString('th-TH')}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "edit" && (
        <form onSubmit={submit} className="grid gap-4 sm:max-w-md rounded-lg border bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-600">เบอร์โทร *</span>
              <input 
                className="border rounded px-3 py-2" 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-600">รหัสผ่านใหม่</span>
              <input 
                type="password"
                className="border rounded px-3 py-2" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="เว้นว่างไว้ถ้าไม่เปลี่ยน"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-600">ชื่อ *</span>
              <input 
                className="border rounded px-3 py-2" 
                value={form.firstName} 
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-600">นามสกุล</span>
              <input 
                className="border rounded px-3 py-2" 
                value={form.lastName} 
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-600">HN</span>
              <input 
                className="border rounded px-3 py-2" 
                value={form.hn} 
                onChange={(e) => setForm({ ...form, hn: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-600">วัด</span>
              <input 
                className="border rounded px-3 py-2" 
                value={form.templeName} 
                onChange={(e) => setForm({ ...form, templeName: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-600">น้ำหนัก (กก.)</span>
              <input 
                type="number"
                className="border rounded px-3 py-2" 
                value={form.weightKg} 
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-600">ส่วนสูง (ซม.)</span>
              <input 
                type="number"
                className="border rounded px-3 py-2" 
                value={form.heightCm} 
                onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
              />
            </label>
          </div>
          
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={form.smokes} 
              onChange={(e) => setForm({ ...form, smokes: e.target.checked })} 
            />
            <span className="text-sm">สูบบุหรี่</span>
          </label>

          {msg && (
            <div className={`text-sm ${msg.includes('เรียบร้อย') ? 'text-green-700' : 'text-red-700'}`}>
              {msg}
            </div>
          )}
          
          <div className="flex gap-2">
            <button 
              type="submit"
              className="btn-primary rounded px-4 py-2 disabled:opacity-50 flex-1" 
              disabled={loading}
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button 
              type="button"
              className="border rounded px-4 py-2 hover:bg-gray-50" 
              onClick={() => setActiveTab("view")}
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}
    </div>
  );
}


