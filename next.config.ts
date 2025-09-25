import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ระบุ root ที่แท้จริงของโปรเจกต์เพื่อให้ Turbopack อ่านไฟล์ .env ในโฟลเดอร์นี้เสมอ
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
