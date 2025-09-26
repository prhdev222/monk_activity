# การตั้งค่า Environment Variables

## ไฟล์ที่ต้องสร้าง
สร้างไฟล์ `.env.local` ในโฟลเดอร์ root ของโปรเจค

## ตัวแปรที่จำเป็น

### 1. Database Configuration
```env
DATABASE_URL="postgresql://username:password@localhost:5432/monk_activity"
```

### 2. LINE Login Configuration
```env
NEXT_PUBLIC_LINE_CHANNEL_ID="your_line_channel_id_here"
LINE_CHANNEL_SECRET="your_line_channel_secret_here"
NEXT_PUBLIC_LINE_LIFF_ID="your_liff_id_here"
NEXT_PUBLIC_LINE_REDIRECT_URI="http://localhost:3000/api/auth/line/callback"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. Gmail SMTP Configuration (Optional)
```env
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-character-app-password"
```

### 4. Next.js Configuration
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

## สำหรับ Production (Vercel)

### 1. Database
- ใช้ Vercel Postgres หรือ Supabase
- ตั้งค่า `DATABASE_URL` ใน Vercel Environment Variables

### 2. LINE Login
- อัปเดต `NEXT_PUBLIC_LINE_REDIRECT_URI` เป็น production URL
- อัปเดต `NEXT_PUBLIC_BASE_URL` เป็น production URL

### 3. Gmail SMTP
- ตั้งค่า `SMTP_USER` และ `SMTP_PASS` ใน Vercel Environment Variables

## วิธีตั้งค่า

1. คัดลอกไฟล์นี้เป็น `.env.local`
2. แทนที่ค่าต่างๆ ด้วยค่าจริง
3. รีสตาร์ท development server
4. ทดสอบการทำงาน

## หมายเหตุ
- ไฟล์ `.env.local` จะไม่ถูก commit ไปยัง Git
- ตรวจสอบให้แน่ใจว่าได้ตั้งค่า Callback URL ใน LINE Developers Console
- สำหรับ production ให้ตั้งค่า environment variables ใน Vercel Dashboard
