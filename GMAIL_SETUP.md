# วิธีตั้งค่า Gmail SMTP สำหรับส่งอีเมล

## ขั้นตอนการตั้งค่า

### 1. เปิด 2-Factor Authentication
1. ไปที่ [Google Account Security](https://myaccount.google.com/security)
2. เปิด "2-Step Verification"
3. ทำตามขั้นตอนการยืนยันตัวตน

### 2. สร้าง App Password
1. ไปที่ [App Passwords](https://myaccount.google.com/apppasswords)
2. เลือก "Mail" และอุปกรณ์ที่ใช้
3. คัดลอกรหัส 16 ตัวอักษรที่ได้

### 3. ตั้งค่า Environment Variables
เพิ่มในไฟล์ `.env`:

```env
# Gmail SMTP Configuration
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

### 4. ตัวอย่างการตั้งค่า
```env
SMTP_USER=phrasukkhaphapdee@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

## ข้อจำกัด Gmail SMTP
- **ฟรี**: 500 อีเมล/วัน
- **ฟรี**: 2,000 อีเมล/เดือน
- **เหมาะสำหรับ**: โปรเจคเล็ก-กลาง

## การทดสอบ
1. ตั้งค่า environment variables
2. รีสตาร์ท development server
3. ไปที่หน้า "รายงาน & สถิติ"
4. กดปุ่ม "📧 ส่งอีเมล"
5. ใส่อีเมลที่ต้องการส่ง

## หมายเหตุ
- ใช้ App Password ไม่ใช่รหัสผ่านปกติ
- App Password จะเป็น 16 ตัวอักษร (มีช่องว่าง)
- ถ้าไม่ได้ตั้งค่า ระบบจะแสดงข้อมูลที่จะส่งแทน
