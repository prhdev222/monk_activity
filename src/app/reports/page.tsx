"use client";

import { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { apiFetch } from "@/lib/fetch";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

interface ActivityData {
  date: string;
  caloriesBurned: number;
  activityType: string;
}

interface SmokingData {
  date: string;
  cigarettesCount: number;
  cravingLevel?: number;
  cravingLevelSum?: number;
  entries?: number;
}
// แปลงชื่อกิจกรรมเป็นภาษาไทยให้ตรงกับ dropdown
const ACTIVITY_LABEL_BY_VALUE: Record<string, string> = {
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

export default function ReportsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [smoking, setSmoking] = useState<SmokingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingClinic, setSendingClinic] = useState(false);
  const [userSmokes, setUserSmokes] = useState<boolean>(false);

  useEffect(() => {
    setUserId(localStorage.getItem("currentUserId"));
    setUserSmokes(localStorage.getItem("currentUserSmokes") === "true");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      try {
        const [activitiesData, smokingData] = await Promise.all([
          apiFetch<ActivityData[]>(`/api/activities?userId=${userId}`),
          userSmokes ? apiFetch<SmokingData[]>(`/api/smoking?userId=${userId}`) : Promise.resolve([])
        ]);
        
        setActivities(activitiesData);
        setSmoking(smokingData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, userSmokes]);

  // Prepare data for charts
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const caloriesData = last7Days.map(date => {
    const dayActivities = activities.filter(activity => 
      activity.date.startsWith(date)
    );
    return dayActivities.reduce((sum, activity) => sum + (activity.caloriesBurned || 0), 0);
  });

  const cigarettesData = last7Days.map(date => {
    const daySmoking = smoking.find(s => s.date.startsWith(date));
    return daySmoking?.cigarettesCount || 0;
  });

  const cravingData = last7Days.map(date => {
    const daySmoking = smoking.find(s => s.date.startsWith(date));
    if (!daySmoking) return 0;
    if (daySmoking.entries && daySmoking.entries > 0 && typeof daySmoking.cravingLevelSum === 'number') {
      return daySmoking.cravingLevelSum / daySmoking.entries;
    }
    return daySmoking.cravingLevel ?? 0;
  });

  // Activity type distribution
  const activityTypes = activities.reduce((acc, activity) => {
    acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activityTypeData = {
    labels: Object.keys(activityTypes).map(k => ACTIVITY_LABEL_BY_VALUE[k] ?? k),
    datasets: [{
      data: Object.values(activityTypes),
      backgroundColor: [
        '#FF6B35', // ส้มเข้ม
        '#1F77B4', // น้ำเงิน
        '#2CA02C', // เขียว
        '#D62728', // แดง
        '#9467BD', // ม่วง
        '#8C564B', // น้ำตาล
        '#E377C2', // ชมพู
        '#17BECF', // ฟ้าอมเขียว
        '#BCBD22', // เขียวมะนาว
        '#FF7F0E', // ส้มสด
      ],
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverBorderColor: '#000000',
      hoverBorderWidth: 2,
    }]
  };

  const caloriesChartData = {
    labels: last7Days.map(date => new Date(date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'แคลอรี่ที่เผาผลาญ',
      data: caloriesData,
      borderColor: '#FF6B35',
      backgroundColor: 'rgba(255, 107, 53, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const smokingChartData = {
    labels: last7Days.map(date => new Date(date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'จำนวนมวน',
      data: cigarettesData,
      backgroundColor: '#F7931E',
      borderColor: '#F7931E',
      borderWidth: 1
    }]
  };

  const cravingChartData = {
    labels: last7Days.map(date => new Date(date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'ระดับความอยาก (0-10)',
      data: cravingData,
      borderColor: '#8338EC',
      backgroundColor: 'rgba(131, 56, 236, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (userId === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">รายงาน & สถิติ</h1>
          <p className="text-sm text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">รายงาน & สถิติ</h1>
          <p className="text-sm text-gray-600">กรุณาเข้าสู่ระบบก่อน</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">รายงาน & สถิติ</h1>
          <p className="text-sm text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // สร้างข้อมูลสรุป 1 เดือน
  const generateMonthlySummary = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyActivities = activities.filter(activity => 
      new Date(activity.date) >= thirtyDaysAgo
    );
    
    const monthlySmoking = smoking.filter(s => 
      new Date(s.date) >= thirtyDaysAgo
    );
    
    const totalCalories = monthlyActivities.reduce((sum, activity) => sum + (activity.caloriesBurned || 0), 0);
    const totalCigarettes = monthlySmoking.reduce((sum, s) => sum + (s.cigarettesCount || 0), 0);
    const avgCraving = monthlySmoking.length > 0 
      ? monthlySmoking.reduce((sum, s) => {
          const craving = s.entries && s.entries > 0 && typeof s.cravingLevelSum === 'number'
            ? s.cravingLevelSum / s.entries
            : s.cravingLevel ?? 0;
          return sum + craving;
        }, 0) / monthlySmoking.length
      : 0;
    
    return {
      totalCalories,
      totalCigarettes,
      avgCraving: avgCraving.toFixed(1),
      totalActivities: monthlyActivities.length,
      activityTypes: Object.keys(activityTypes).map(k => ({
        name: ACTIVITY_LABEL_BY_VALUE[k] ?? k,
        count: activityTypes[k] || 0
      }))
    };
  };

  const monthlySummary = generateMonthlySummary();

  // สร้าง CSV
  const generateCSV = () => {
    const csvSections = [];
    
    // ตารางกิจกรรม
    if (activities.length > 0) {
      csvSections.push('=== ตารางกิจกรรม ===');
      csvSections.push('วันที่,กิจกรรม,แคลอรี่,ระยะเวลา(นาที),ความเข้มข้น');
      
      activities.forEach(activity => {
        csvSections.push([
          activity.date.split('T')[0],
          ACTIVITY_LABEL_BY_VALUE[activity.activityType] ?? activity.activityType,
          activity.caloriesBurned || 0,
          activity.durationMin || 0,
          activity.intensity || ''
        ].join(','));
      });
      
      csvSections.push(''); // บรรทัดว่าง
    }
    
    // ตารางเลิกบุหรี่ (ถ้ามีข้อมูล)
    if (smoking.length > 0) {
      csvSections.push('=== ตารางเลิกบุหรี่ ===');
      csvSections.push('วันที่,จำนวนมวน,ระดับความอยาก(0-10)');
      
      smoking.forEach(s => {
        const craving = s.entries && s.entries > 0 && typeof s.cravingLevelSum === 'number'
          ? (s.cravingLevelSum / s.entries).toFixed(1)
          : s.cravingLevel?.toFixed(1) || '0';
        
        csvSections.push([
          s.date.split('T')[0],
          s.cigarettesCount || 0,
          craving
        ].join(','));
      });
    }
    
    return csvSections.join('\n');
  };

  // สร้าง HTML รายงาน
  const generateHTMLReport = () => {
    const currentDate = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>รายงานสุขภาพพระ - ${currentDate}</title>
    <style>
        body { font-family: 'Sarabun', sans-serif; margin: 20px; background: #f9f9f9; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #ea580c; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: #fff7ed; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #ea580c; }
        .stat-number { font-size: 24px; font-weight: bold; color: #ea580c; }
        .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        .section { margin: 25px 0; }
        .section h3 { color: #ea580c; border-bottom: 2px solid #fed7aa; padding-bottom: 5px; }
        .activity-list { list-style: none; padding: 0; }
        .activity-item { background: #fef3c7; margin: 5px 0; padding: 10px; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>รายงานสุขภาพพระ</h1>
            <p>สรุปข้อมูล 30 วันล่าสุด (${currentDate})</p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-number">${monthlySummary.totalCalories.toLocaleString()}</div>
                <div class="stat-label">แคลอรี่รวม (kcal)</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${monthlySummary.totalCigarettes.toLocaleString()}</div>
                <div class="stat-label">มวนบุหรี่รวม</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${monthlySummary.avgCraving}</div>
                <div class="stat-label">ความอยากเฉลี่ย/10</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${monthlySummary.totalActivities}</div>
                <div class="stat-label">กิจกรรมทั้งหมด</div>
            </div>
        </div>
        
        <div class="section">
            <h3>ประเภทกิจกรรมที่ทำ</h3>
            <ul class="activity-list">
                ${monthlySummary.activityTypes.map(activity => 
                  `<li class="activity-item">${activity.name}: ${activity.count} ครั้ง</li>`
                ).join('')}
            </ul>
        </div>
        
        <div class="footer">
            <p>สร้างโดยระบบพระสุขภาพดี - ${currentDate}</p>
        </div>
    </div>
</body>
</html>`;
  };

  // ดาวน์โหลด CSV
  const downloadCSV = () => {
    try {
      const csv = generateCSV();
      // เพิ่ม UTF-8 BOM เพื่อให้อ่านภาษาไทยได้
      const csvWithBOM = '\uFEFF' + csv;
      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `รายงานสุขภาพพระ_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว!');
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด CSV');
      console.error('CSV download error:', error);
    }
  };

  // ดาวน์โหลด HTML
  const downloadHTML = () => {
    try {
      const html = generateHTMLReport();
      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `รายงานสุขภาพพระ_${new Date().toISOString().split('T')[0]}.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('ดาวน์โหลดไฟล์ HTML เรียบร้อยแล้ว!');
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด HTML');
      console.error('HTML download error:', error);
    }
  };

  // ส่งอีเมล
  const sendEmail = async () => {
    if (sendingEmail) return; // ป้องกันการส่งซ้ำ
    
    const email = prompt('กรุณาใส่อีเมลที่ต้องการส่งรายงาน:');
    if (!email) return;
    
    setSendingEmail(true);
    try {
      const response = await apiFetch('/api/reports/send-email', {
        method: 'POST',
        body: JSON.stringify({
          email,
          userId,
          monthlySummary,
          htmlReport: generateHTMLReport()
        })
      });
      
      // แสดงข้อความสำเร็จ
      alert(`ส่งรายงานไปยังอีเมลเรียบร้อยแล้ว!\n\nอีเมล: ${email}\n\nไฟล์ CSV แนบมาด้วย`);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการส่งอีเมล');
      console.error('Email error:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  // ส่งไปคลินิก
  const sendToClinic = async () => {
    if (sendingClinic) return; // ป้องกันการส่งซ้ำ
    
    if (!confirm('ต้องการส่งรายงานไปยังคลินิกหรือไม่?')) return;
    
    setSendingClinic(true);
    try {
      const response = await apiFetch('/api/reports/send-email', {
        method: 'POST',
        body: JSON.stringify({
          email: 'clinic', // ใช้ keyword 'clinic' เพื่อระบุว่าเป็นคลินิก
          userId,
          monthlySummary,
          htmlReport: generateHTMLReport()
        })
      });
      
      // แสดงข้อความสำเร็จ
      alert(`ส่งรายงานไปยังคลินิกเรียบร้อยแล้ว!\n\nอีเมลคลินิก: prhmed222@gmail.com\n\nไฟล์ CSV แนบมาด้วย`);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการส่งอีเมลไปคลินิก');
      console.error('Clinic email error:', error);
    } finally {
      setSendingClinic(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">รายงาน & สถิติ</h1>
          <p className="text-sm text-gray-600">กราฟความก้าวหน้าและการเปรียบเทียบช่วงเวลา</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={downloadCSV}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            📊 ดาวน์โหลด CSV
          </button>
          <button
            onClick={downloadHTML}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            📄 ดาวน์โหลด HTML
          </button>
          <button
            onClick={sendEmail}
            disabled={sendingEmail}
            className={`px-4 py-2 text-sm rounded ${
              sendingEmail 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {sendingEmail ? '⏳ กำลังส่ง...' : '📧 ส่งอีเมล'}
          </button>
          <button
            onClick={sendToClinic}
            disabled={sendingClinic}
            className={`px-4 py-2 text-sm rounded ${
              sendingClinic 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {sendingClinic ? '⏳ กำลังส่ง...' : '🏥 ส่งไปคลินิก'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* แคลอรี่ที่เผาผลาญ */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">แคลอรี่ที่เผาผลาญ (7 วันล่าสุด)</h3>
          <div className="h-64">
            <Line data={caloriesChartData} options={chartOptions} />
          </div>
        </div>

        {/* จำนวนมวนบุหรี่ - แสดงเฉพาะถ้าสูบบุหรี่ */}
        {userSmokes && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">จำนวนมวนบุหรี่ (7 วันล่าสุด)</h3>
            <div className="h-64">
              <Bar data={smokingChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* ระดับความอยาก - แสดงเฉพาะถ้าสูบบุหรี่ */}
        {userSmokes && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">ระดับความอยาก (7 วันล่าสุด)</h3>
            <div className="h-64">
              <Line data={cravingChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* ประเภทกิจกรรม */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">ประเภทกิจกรรมที่ทำ</h3>
          <div className="h-64">
            <Doughnut 
              data={activityTypeData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }} 
            />
          </div>
        </div>
      </div>

      {/* สรุปสถิติ 7 วัน */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">แคลอรี่รวม (7 วัน)</div>
          <div className="text-2xl font-semibold text-orange-600">
            {caloriesData.reduce((sum, cal) => sum + cal, 0).toLocaleString()} kcal
          </div>
        </div>
        {userSmokes && (
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">มวนบุหรี่รวม (7 วัน)</div>
            <div className="text-2xl font-semibold text-orange-600">
              {cigarettesData.reduce((sum, cig) => sum + cig, 0).toLocaleString()} มวน
            </div>
          </div>
        )}
        {userSmokes && (
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">ระดับความอยากเฉลี่ย</div>
            <div className="text-2xl font-semibold text-orange-600">
              {cravingData.filter(c => c > 0).length > 0 
                ? (cravingData.filter(c => c > 0).reduce((sum, c) => sum + c, 0) / cravingData.filter(c => c > 0).length).toFixed(1)
                : '0'
              } / 10
            </div>
          </div>
        )}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-xs text-gray-500">กิจกรรมทั้งหมด</div>
          <div className="text-2xl font-semibold text-orange-600">
            {activities.length.toLocaleString()} ครั้ง
          </div>
        </div>
      </div>

      {/* สรุปสถิติ 30 วัน */}
      <div className="rounded-lg border bg-orange-50 p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4 text-orange-700">สรุปข้อมูล 30 วันล่าสุด</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-500">แคลอรี่รวม (30 วัน)</div>
            <div className="text-2xl font-semibold text-orange-600">
              {monthlySummary.totalCalories.toLocaleString()} kcal
            </div>
          </div>
          {userSmokes && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500">มวนบุหรี่รวม (30 วัน)</div>
              <div className="text-2xl font-semibold text-orange-600">
                {monthlySummary.totalCigarettes.toLocaleString()} มวน
              </div>
            </div>
          )}
          {userSmokes && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500">ความอยากเฉลี่ย (30 วัน)</div>
              <div className="text-2xl font-semibold text-orange-600">
                {monthlySummary.avgCraving} / 10
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-500">กิจกรรมทั้งหมด (30 วัน)</div>
            <div className="text-2xl font-semibold text-orange-600">
              {monthlySummary.totalActivities.toLocaleString()} ครั้ง
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


