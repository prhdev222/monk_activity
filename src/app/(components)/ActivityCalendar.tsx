"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/fetch";

interface ActivityData {
  date: string;
  caloriesBurned: number;
  activityType: string;
  durationMin?: number;
  intensity?: string;
}

interface SmokingData {
  date: string;
  cigarettesCount: number;
  cravingLevel?: number;
}

interface CalendarProps {
  userId: string;
  userSmokes: boolean;
}

// แปลงชื่อกิจกรรมเป็นภาษาไทย
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

export default function ActivityCalendar({ userId, userSmokes }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [smoking, setSmoking] = useState<SmokingData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesData, smokingData] = await Promise.all([
          apiFetch<ActivityData[]>(`/api/activities?userId=${userId}`),
          userSmokes ? apiFetch<SmokingData[]>(`/api/smoking?userId=${userId}`) : Promise.resolve([])
        ]);
        
        setActivities(activitiesData);
        setSmoking(smokingData);
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, userSmokes]);

  // สร้างปฏิทิน
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // ฟังก์ชันช่วยสำหรับการแปลงวันที่
  const parseDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00');
  };

  // ตรวจสอบว่าวันนั้นมีกิจกรรมหรือไม่
  const getDayData = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayActivities = activities.filter(activity => 
      activity.date.startsWith(dateStr)
    );
    const daySmoking = smoking.find(s => s.date.startsWith(dateStr));
    
    const totalCalories = dayActivities.reduce((sum, activity) => sum + (activity.caloriesBurned || 0), 0);
    const totalCigarettes = daySmoking?.cigarettesCount || 0;
    
    return {
      date: dateStr,
      activities: dayActivities,
      smoking: daySmoking,
      totalCalories,
      totalCigarettes,
      hasData: dayActivities.length > 0 || totalCigarettes > 0
    };
  };

  // เปลี่ยนเดือน
  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const calendarDays = generateCalendar();
  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">ปฏิทินกิจกรรม</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-medium mb-4">ปฏิทินกิจกรรม</h3>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ←
        </button>
        <h4 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        <button
          onClick={() => changeMonth('next')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => {
          const dayData = getDayData(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = selectedDate === dayData.date;
          
          return (
            <button
              key={index}
              onClick={() => setSelectedDate(dayData.date)}
              className={`
                p-2 text-sm rounded relative min-h-[40px] flex flex-col items-center justify-center
                transition-colors duration-200
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}
                ${isToday && !isSelected ? 'bg-orange-100 text-orange-700 font-semibold' : ''}
                ${isSelected ? 'bg-orange-200 text-orange-800 font-semibold border-2 border-orange-500' : ''}
                ${dayData.hasData && !isSelected ? 'border border-orange-300' : ''}
              `}
            >
              <span>{day.getDate()}</span>
              {dayData.hasData && !isSelected && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="border-t pt-4">
          <h5 className="font-medium mb-2">
            วันที่ {parseDate(selectedDate).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h5>
          
          {(() => {
            const dayData = getDayData(parseDate(selectedDate));
            
            if (!dayData.hasData) {
              return (
                <p className="text-gray-500 text-sm">ไม่มีข้อมูลกิจกรรมในวันนี้</p>
              );
            }
            
            return (
              <div className="space-y-3">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-orange-50 p-2 rounded">
                    <div className="text-orange-700 font-medium">แคลอรี่</div>
                    <div className="text-orange-800">{dayData.totalCalories} kcal</div>
                  </div>
                  {userSmokes && (
                    <div className="bg-red-50 p-2 rounded">
                      <div className="text-red-700 font-medium">บุหรี่</div>
                      <div className="text-red-800">{dayData.totalCigarettes} มวน</div>
                    </div>
                  )}
                </div>
                
                {/* Activities List */}
                {dayData.activities.length > 0 && (
                  <div>
                    <h6 className="font-medium text-sm mb-2">กิจกรรมที่ทำ:</h6>
                    <div className="space-y-1">
                      {dayData.activities.map((activity, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                          <div className="font-medium">
                            {ACTIVITY_LABEL_BY_VALUE[activity.activityType] || activity.activityType}
                          </div>
                          <div className="text-gray-600">
                            {activity.caloriesBurned} kcal
                            {activity.durationMin && ` • ${activity.durationMin} นาที`}
                            {activity.intensity && ` • ${activity.intensity}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Smoking Details */}
                {userSmokes && dayData.smoking && (
                  <div>
                    <h6 className="font-medium text-sm mb-2">ข้อมูลบุหรี่:</h6>
                    <div className="bg-red-50 p-2 rounded text-sm">
                      <div>จำนวนมวน: {dayData.smoking.cigarettesCount} มวน</div>
                      {dayData.smoking.cravingLevel && (
                        <div>ระดับความอยาก: {dayData.smoking.cravingLevel}/10</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
