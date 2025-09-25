"use client";

import { useEffect, useState } from "react";

export default function ClientNav() {
  const [userId, setUserId] = useState<string | null>(null);
  const [smokes, setSmokes] = useState<boolean>(false);
  const [hasAccount, setHasAccount] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    const id = localStorage.getItem("currentUserId");
    const s = localStorage.getItem("currentUserSmokes") === "true";
    const h = localStorage.getItem("hasAccount") === "true";
    setUserId(id);
    setSmokes(s);
    setHasAccount(h);
    setReady(true);
  }, []);

  const logout = () => {
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentUserSmokes");
    window.location.href = "/login";
  };

  const AnonLinks = (
    <>
      <a href="/onboarding" className="px-3 py-1.5 rounded hover:bg-white/10">ลงทะเบียน</a>
      {hasAccount && (
        <a href="/login" className="px-3 py-1.5 rounded hover:bg-white/10">เข้าสู่ระบบ</a>
      )}
    </>
  );

  const AuthedLinks = (
    <>
      <a href="/dashboard" className="px-3 py-1.5 rounded hover:bg-white/10">แดชบอร์ด</a>
      <a href="/checklist" className="px-3 py-1.5 rounded hover:bg-white/10">กิจกรรม</a>
      {smokes && <a href="/smoking" className="px-3 py-1.5 rounded hover:bg-white/10">เลิกบุหรี่</a>}
      <a href="/reports" className="px-3 py-1.5 rounded hover:bg-white/10">รายงาน</a>
      <a href="/profile" className="px-3 py-1.5 rounded hover:bg-white/10">โปรไฟล์</a>
      <button onClick={logout} className="px-3 py-1.5 rounded hover:bg-white/10">ออกจากระบบ</button>
    </>
  );

  const Links = userId ? AuthedLinks : AnonLinks;

  if (!ready) return null;

  return (
    <>
      {/* Desktop */}
      <nav className="hidden sm:flex gap-1 text-sm">
        {Links}
      </nav>
      {/* Mobile - Hamburger */}
      <div className="sm:hidden">
        <button
          aria-label="เปิดเมนู"
          className="px-3 py-2 rounded hover:bg-white/10"
          onClick={() => setOpen(!open)}
        >
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>
        {open && (
          <div className="absolute left-0 right-0 mt-2 rounded bg-orange-600 text-white shadow-md p-2 flex flex-col gap-1 text-sm">
            {Links}
          </div>
        )}
      </div>
    </>
  );
}


