export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-700">นโยบายความเป็นส่วนตัว</h1>
      
      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold mb-4">ข้อมูลที่เรารวบรวม</h2>
        <p className="mb-4">
          เราเก็บรวบรวมข้อมูลส่วนบุคคลที่จำเป็นสำหรับการให้บริการดูแลสุขภาพ ได้แก่:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>ข้อมูลโปรไฟล์จาก LINE (ชื่อ, รูปภาพ)</li>
          <li>ข้อมูลสุขภาพ (น้ำหนัก, ส่วนสูง, กิจกรรม)</li>
          <li>ข้อมูลการติดตามการสูบบุหรี่</li>
          <li>ข้อมูลกิจกรรมประจำวัน</li>
        </ul>

        <h2 className="text-xl font-semibold mb-4">การใช้งานข้อมูล</h2>
        <p className="mb-4">
          เราใช้ข้อมูลเพื่อ:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>ให้บริการคำนวณแคลอรี่และติดตามสุขภาพ</li>
          <li>ส่งการแจ้งเตือนและคำแนะนำ</li>
          <li>สร้างรายงานความก้าวหน้า</li>
          <li>ปรับปรุงคุณภาพการบริการ</li>
        </ul>

        <h2 className="text-xl font-semibold mb-4">การปกป้องข้อมูล</h2>
        <p className="mb-4">
          เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของคุณ
          และไม่เปิดเผยข้อมูลให้กับบุคคลที่สามโดยไม่ได้รับความยินยอม
        </p>

        <h2 className="text-xl font-semibold mb-4">สิทธิ์ของคุณ</h2>
        <p className="mb-4">
          คุณมีสิทธิ์ขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของคุณได้ตลอดเวลา
          โดยติดต่อเราผ่านช่องทางที่ระบุไว้
        </p>

        <h2 className="text-xl font-semibold mb-4">การเปลี่ยนแปลงนโยบาย</h2>
        <p className="mb-4">
          เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว และจะแจ้งให้ทราบผ่านเว็บไซต์
        </p>

        <p className="text-sm text-gray-600 mt-8">
          อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}
        </p>
      </div>
    </div>
  );
}
