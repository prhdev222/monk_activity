# LINE Login และ LIFF Setup Guide

## ขั้นตอนการตั้งค่า LINE Login และ LIFF

### 1. สร้าง LINE Developers Account
1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. เข้าสู่ระบบด้วยบัญชี LINE ของคุณ
3. สร้าง Provider ใหม่ (ถ้ายังไม่มี)

### 2. สร้าง LINE Login Channel
1. ใน LINE Developers Console คลิก "Create a new channel"
2. เลือก "LINE Login"
3. กรอกข้อมูลต่อไปนี้:
   - **Channel name**: พระสุขภาพดี
   - **Channel description**: แพลตฟอร์มช่วยพระสงฆ์ดูแลสุขภาพ
   - **App type**: Web app
   - **Email address**: อีเมลของคุณ
   - **Privacy policy URL**: URL ของ Privacy Policy (ถ้ามี)
   - **Terms of use URL**: URL ของ Terms of Use (ถ้ามี)
4. คลิก "Create"

### 3. ตั้งค่า LINE Login Channel
1. ไปที่แท็บ "LINE Login"
2. ใน "Callback URL" เพิ่ม:
   - `http://localhost:3000/api/auth/line/callback` (สำหรับ development)
   - `https://monk-activity.vercel.app/api/auth/line/callback` (สำหรับ production)
3. ใน "Scopes" เลือก:
   - `profile`
   - `openid`

### 4. สร้าง LIFF App
1. ไปที่แท็บ "LIFF"
2. คลิก "Add"
3. กรอกข้อมูล:
   - **LIFF app name**: พระสุขภาพดี
   - **Size**: Full
   - **Endpoint URL**: 
     - `http://localhost:3000` (สำหรับ development)
     - `https://monk-activity.vercel.app` (สำหรับ production)
   - **Scope**: `profile`
   - **Bot link feature**: Aggressive (ถ้าต้องการ)
4. คลิก "Add"

### 5. ตั้งค่า Environment Variables

#### สำหรับ Development (.env.local):
```env
# LINE Login Configuration
NEXT_PUBLIC_LINE_CHANNEL_ID="your_channel_id_here"
LINE_CHANNEL_SECRET="your_channel_secret_here"
NEXT_PUBLIC_LINE_LIFF_ID="your_liff_id_here"
NEXT_PUBLIC_LINE_REDIRECT_URI="http://localhost:3000/api/auth/line/callback"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

#### สำหรับ Production (Vercel Environment Variables):
```env
# LINE Login Configuration
NEXT_PUBLIC_LINE_CHANNEL_ID="your_channel_id_here"
LINE_CHANNEL_SECRET="your_channel_secret_here"
NEXT_PUBLIC_LINE_LIFF_ID="your_liff_id_here"
NEXT_PUBLIC_LINE_REDIRECT_URI="https://monk-activity.vercel.app/api/auth/line/callback"
NEXT_PUBLIC_BASE_URL="https://monk-activity.vercel.app"
```

### 6. หาค่า Configuration
1. **Channel ID**: ไปที่ "Basic settings" ของ LINE Login Channel
2. **Channel Secret**: ไปที่ "Basic settings" ของ LINE Login Channel
3. **LIFF ID**: ไปที่แท็บ "LIFF" และคัดลอก LIFF ID

### 7. ทดสอบการทำงาน
1. รัน development server: `npm run dev`
2. ไปที่ `http://localhost:3000/login`
3. คลิกปุ่ม "เข้าสู่ระบบด้วย LINE"
4. ทดสอบการ login ผ่าน LINE

## Features ที่รองรับ

### LINE Login
- ✅ เข้าสู่ระบบผ่าน LINE OAuth
- ✅ ดึงข้อมูล Profile จาก LINE
- ✅ สร้างบัญชีผู้ใช้อัตโนมัติ
- ✅ รองรับทั้ง Web และ Mobile

### LIFF (LINE Front-end Framework)
- ✅ เข้าสู่ระบบผ่าน LIFF SDK
- ✅ ตรวจสอบว่าทำงานใน LINE App หรือไม่
- ✅ ส่งข้อความไปยัง LINE Chat
- ✅ Share ข้อความผ่าน Share Target Picker
- ✅ ปิดหน้าต่าง LIFF

## Database Schema
ระบบจะเพิ่มฟิลด์ต่อไปนี้ในตาราง `users`:

```sql
-- LINE Login fields
line_user_id VARCHAR UNIQUE,
line_display_name VARCHAR,
line_picture_url VARCHAR,
line_status_message VARCHAR,
auth_provider VARCHAR DEFAULT 'local'
```

## API Endpoints

### POST /api/auth/line/login
สร้าง LINE Login URL

### GET /api/auth/line/callback
รับ callback จาก LINE Login

### POST /api/auth/line/callback
รับ access token จาก LIFF และทำการ authenticate

## การใช้งาน Components

### LineLogin Component
```tsx
import LineLogin from "@/app/(components)/LineLogin";

<LineLogin 
  onSuccess={(user) => console.log("Login success:", user)}
  onError={(error) => console.error("Login error:", error)}
/>
```

### LIFF Provider
```tsx
import { useLiff } from "@/app/(components)/LiffProvider";

const { liffReady, isLoggedIn, isInLineApp } = useLiff();
```

## Troubleshooting

### ปัญหาที่พบบ่อย
1. **LIFF initialization failed**: ตรวจสอบ LIFF ID ใน environment variables
2. **LINE login failed**: ตรวจสอบ Channel ID และ Channel Secret
3. **Callback URL mismatch**: ตรวจสอบ Callback URL ใน LINE Developers Console

### การ Debug
1. เปิด Developer Tools ใน browser
2. ดู Console สำหรับ error messages
3. ตรวจสอบ Network tab สำหรับ API calls

## Production Deployment
1. อัพเดท Callback URL ใน LINE Developers Console
2. อัพเดท LIFF Endpoint URL
3. ตั้งค่า environment variables ใน production server
4. ทดสอบการทำงานใน production environment