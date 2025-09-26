export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-700">ข้อกำหนดและเงื่อนไขการใช้งาน</h1>
      
      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold mb-4">การยอมรับข้อกำหนด</h2>
        <p className="mb-4">
          การใช้งานเว็บไซต์ &quot;พระสุขภาพดี&quot; หมายความว่าคุณยอมรับข้อกำหนดและเงื่อนไขการใช้งานนี้
        </p>

        <h2 className="text-xl font-semibold mb-4">การใช้งานบริการ</h2>
        <p className="mb-4">
          คุณสามารถใช้บริการเพื่อ:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>บันทึกกิจกรรมประจำวัน</li>
          <li>ติดตามการสูบบุหรี่</li>
          <li>ดูรายงานความก้าวหน้า</li>
          <li>รับคำแนะนำการดูแลสุขภาพ</li>
        </ul>

        <h2 className="text-xl font-semibold mb-4">ข้อห้าม</h2>
        <p className="mb-4">
          ห้ามใช้บริการเพื่อ:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>กิจกรรมที่ผิดกฎหมาย</li>
          <li>ส่งข้อมูลเท็จหรือไม่ถูกต้อง</li>
          <li>รบกวนการทำงานของระบบ</li>
          <li>ละเมิดสิทธิ์ของผู้อื่น</li>
        </ul>

        <h2 className="text-xl font-semibold mb-4">ความรับผิดชอบ</h2>
        <p className="mb-4">
          เราไม่รับผิดชอบต่อความเสียหายที่อาจเกิดขึ้นจากการใช้งานบริการ
          และข้อมูลที่แสดงเป็นเพียงคำแนะนำทั่วไปเท่านั้น
        </p>

        <h2 className="text-xl font-semibold mb-4">การเปลี่ยนแปลงบริการ</h2>
        <p className="mb-4">
          เราขอสงวนสิทธิ์ในการปรับปรุงหรือเปลี่ยนแปลงบริการได้ตลอดเวลา
          โดยไม่ต้องแจ้งให้ทราบล่วงหน้า
        </p>

        <h2 className="text-xl font-semibold mb-4">การสิ้นสุดการใช้งาน</h2>
        <p className="mb-4">
          เราสามารถระงับหรือยกเลิกการใช้งานของคุณได้หากพบการละเมิดข้อกำหนดนี้
        </p>

        <h2 className="text-xl font-semibold mb-4">กฎหมายที่ใช้บังคับ</h2>
        <p className="mb-4">
          ข้อกำหนดนี้อยู่ภายใต้กฎหมายไทย และศาลไทยมีอำนาจพิจารณาคดี
        </p>

        <p className="text-sm text-gray-600 mt-8">
          อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}
        </p>
      </div>
    </div>
  );
}
