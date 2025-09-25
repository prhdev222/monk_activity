import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, userId, monthlySummary, htmlReport } = await req.json();

    if (!email || !userId) {
      return NextResponse.json({ error: "Email and userId required" }, { status: 400 });
    }

    // ตรวจสอบว่าเป็นอีเมลคลินิกหรือไม่
    const targetEmail = email === 'clinic' ? process.env.CLINIC_EMAIL || 'prhmed222@gmail.com' : email;

    const currentDate = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // ตรวจสอบว่าผู้ใช้สูบบุหรี่หรือไม่
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { smokes: true }
    });
    
    const userSmokes = user?.smokes || false;
    
    // ดึงข้อมูลบุหรี่สำหรับคำนวณสถิติ
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const smokingData = await prisma.smokingTracking.findMany({
      where: { 
        userId,
        date: { gte: thirtyDaysAgo }
      }
    });
    
    // คำนวณสถิติบุหรี่ (เฉลี่ยจากจำนวนวันที่มีข้อมูลจริง)
    const actualDays = smokingData.length > 0 ? smokingData.length : 1; // ป้องกันการหารด้วย 0
    const avgCigarettesPerDay = monthlySummary.totalCigarettes > 0 
      ? (monthlySummary.totalCigarettes / actualDays).toFixed(1)
      : '0';
    
    // สร้างข้อความสรุปสำหรับอีเมล
    const emailText = `
รายงานสุขภาพพระ - ${currentDate}

สรุปข้อมูล 30 วันล่าสุด:
• แคลอรี่รวม: ${monthlySummary.totalCalories.toLocaleString()} kcal
• กิจกรรมทั้งหมด: ${monthlySummary.totalActivities.toLocaleString()} ครั้ง
${userSmokes ? `• มวนบุหรี่รวม: ${monthlySummary.totalCigarettes.toLocaleString()} มวน/เดือน` : ''}
${userSmokes ? `• เฉลี่ย: ${avgCigarettesPerDay} มวน/วัน (จาก ${actualDays} วันที่มีข้อมูล)` : ''}
${userSmokes ? `• ความอยากเฉลี่ย: ${monthlySummary.avgCraving}/10` : ''}

ประเภทกิจกรรมที่ทำ:
${monthlySummary.activityTypes.map((activity: { name: string; count: number }) => 
  `• ${activity.name}: ${activity.count} ครั้ง`
).join('\n')}

ข้อแนะนำ:
${monthlySummary.totalCalories > 0 ? '• กิจกรรมดีมาก! ควรทำต่อเนื่อง' : '• ลองเพิ่มกิจกรรมเพื่อสุขภาพ'}
${userSmokes ? (
  monthlySummary.totalCigarettes > 0 
    ? '• พยายามลดการสูบบุหรี่' 
    : '• ดีมาก! ไม่สูบบุหรี่'
) : ''}
${userSmokes && parseFloat(monthlySummary.avgCraving) > 5 ? '• ความอยากยังสูง ลองหาวิธีผ่อนคลาย' : ''}
${userSmokes && parseFloat(monthlySummary.avgCraving) <= 5 ? '• ความอยากอยู่ในระดับดี' : ''}

สร้างโดยระบบพระสุขภาพดี
    `.trim();

    // ตรวจสอบว่ามีการตั้งค่า Gmail SMTP หรือไม่
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      // ถ้าไม่ได้ตั้งค่า SMTP ให้แสดงข้อมูลที่จะส่ง
      console.log('Gmail SMTP not configured. Email would be sent to:', email);
      console.log('Email content:', emailText);
      
      return NextResponse.json({ 
        message: "รายงานส่งไปยังอีเมลเรียบร้อยแล้ว (จำลอง)",
        email,
        date: currentDate,
        content: emailText,
        note: "กรุณาตั้งค่า Gmail SMTP ใน .env เพื่อส่งอีเมลจริง"
      });
    }

    // สร้าง transporter สำหรับ Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // App Password
      },
    });

    // สร้าง CSV สำหรับแนบ
    const generateCSVForEmail = async () => {
      // ดึงข้อมูลจริงจาก database
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [activities, smokingData] = await Promise.all([
        prisma.activity.findMany({
          where: { 
            userId,
            date: { gte: thirtyDaysAgo }
          },
          orderBy: { date: 'asc' }
        }),
        prisma.smokingTracking.findMany({
          where: { 
            userId,
            date: { gte: thirtyDaysAgo }
          },
          orderBy: { date: 'asc' }
        })
      ]);
      
      const csvSections = [];
      
      // ตารางกิจกรรม
      if (activities.length > 0) {
        csvSections.push('=== ตารางกิจกรรม ===');
        csvSections.push('วันที่,กิจกรรม,แคลอรี่,ระยะเวลา(นาที),ความเข้มข้น');
        
        activities.forEach(activity => {
          const activityLabels: { [key: string]: string } = {
            SITTING_MEDITATION: "นั่งสมาธิ",
            CHANTING: "สวดมนต์",
            ALMS_WALK: "เดินบิณฑบาต",
            TEMPLE_WALK: "เดินรอบวัด",
            TEMPLE_SWEEPING: "กวาดลานวัด",
            TEMPLE_CHORES: "งานในวัด",
            ARM_SWING: "แกว่งแขน",
            WALKING_MEDITATION: "เดินจงกรม",
            DRINK_PANA_ZERO_CAL: "ฉันน้ำปานะไม่มีแคลอรี่ (IF หลังเที่ยง)",
          };
          
          csvSections.push([
            activity.date.toISOString().split('T')[0],
            activityLabels[activity.activityType] || activity.activityType,
            activity.caloriesBurned || 0,
            activity.durationMin || 0,
            activity.intensity || ''
          ].join(','));
        });
        
        csvSections.push(''); // บรรทัดว่าง
      }
      
      // ตารางเลิกบุหรี่ (ถ้ามีข้อมูล)
      if (smokingData.length > 0) {
        csvSections.push('=== ตารางเลิกบุหรี่ ===');
        csvSections.push('วันที่,จำนวนมวน,ระดับความอยาก(0-10)');
        
        smokingData.forEach(smoking => {
          csvSections.push([
            smoking.date.toISOString().split('T')[0],
            smoking.cigarettesCount || 0,
            smoking.cravingLevel || 0
          ].join(','));
        });
      }
      
      return csvSections.join('\n');
    };

    const csvContent = await generateCSVForEmail();

    // ตั้งค่าอีเมล
    const subject = email === 'clinic' 
      ? `รายงานสุขภาพพระ - ส่งจากผู้ป่วย - ${currentDate}`
      : `รายงานสุขภาพพระ - ${currentDate}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: targetEmail,
      subject: subject,
      text: emailText,
      html: htmlReport,
      attachments: [
        {
          filename: `รายงานสุขภาพพระ_${new Date().toISOString().split('T')[0]}.csv`,
          content: Buffer.from('\uFEFF' + csvContent, 'utf8'), // เพิ่ม BOM สำหรับ UTF-8
          contentType: 'text/csv; charset=utf-8',
          encoding: 'base64'
        }
      ]
    };

    // ส่งอีเมล
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return NextResponse.json({ 
      message: email === 'clinic' ? "รายงานส่งไปยังคลินิกเรียบร้อยแล้ว" : "รายงานส่งไปยังอีเมลเรียบร้อยแล้ว",
      email: targetEmail,
      date: currentDate,
      messageId: info.messageId
    });

  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งอีเมล", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
