export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="text-center space-y-4 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-orange-700">พระสุขภาพดี</h1>
        <p className="text-lg text-gray-700">แพลตฟอร์มช่วยพระสงฆ์ดูแลสุขภาพ ด้วยกิจกรรมที่เหมาะสมกับวัตรปฏิบัติ</p>
        <p className="text-gray-600">บันทึกกิจกรรมประจำวัน คำนวณแคลอรี่จาก MET ตามน้ำหนัก ติดตามการเลิกบุหรี่ และดูรายงานความก้าวหน้าอย่างง่าย</p>
        <div className="flex justify-center gap-3 pt-2">
          <a href="/onboarding" className="btn-primary rounded px-5 py-2">ลงทะเบียนใช้งาน</a>
          <a href="/login" className="border rounded px-5 py-2 hover:bg-gray-50">เข้าสู่ระบบ</a>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="font-medium mb-2 text-orange-700">กิจกรรมเหมาะกับพระ</h3>
          <p className="text-sm text-gray-700">ตัวเลือกกิจกรรมทั้งเดินจงกรม นั่งสมาธิ กวาดลานวัด แกว่งแขน ฯลฯ บันทึกได้สะดวก และกำหนดเวลา/ความเข้มข้นได้</p>
        </article>
        <article className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="font-medium mb-2 text-orange-700">คำนวณแคลอรี่อัตโนมัติ</h3>
          <p className="text-sm text-gray-700">ระบบคำนวณพลังงานที่ใช้จากค่า MET และน้ำหนักของผู้ใช้ เพื่อประเมินผลการเผาผลาญต่อวัน</p>
        </article>
        <article className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="font-medium mb-2 text-orange-700">เลิกบุหรี่ด้วยสติ</h3>
          <p className="text-sm text-gray-700">บันทึกจำนวนมวนและระดับความอยาก (0–10) ต่อวัน สรุปรวมเป็นรายวัน และมีปุ่มลบทั้งวัน</p>
        </article>
        <article className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="font-medium mb-2 text-orange-700">รายงานความก้าวหน้า</h3>
          <p className="text-sm text-gray-700">ดูกราฟแคลอรี่ จำนวนมวน ระดับความอยาก และสัดส่วนกิจกรรม เพื่อวางแผนสุขภาพระยะยาว</p>
        </article>
        <article className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="font-medium mb-2 text-orange-700">โปรไฟล์และน้ำหนัก</h3>
          <p className="text-sm text-gray-700">ปรับปรุงน้ำหนัก/ส่วนสูงได้ตลอด เพื่อให้การคำนวณแคลอรี่แม่นยำยิ่งขึ้น</p>
        </article>
        <article className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="font-medium mb-2 text-orange-700">คุ้มครองข้อมูล (PDPA)</h3>
          <p className="text-sm text-gray-700">ขอความยินยอมก่อนเก็บข้อมูล และลบข้อมูลเก่ากว่า 6 เดือนอัตโนมัติ</p>
        </article>
      </section>

      <section className="mt-10 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="font-semibold mb-3 text-orange-700">วิธีเริ่มต้น</h2>
        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
          <li>กด “ลงทะเบียนใช้งาน” ใส่เบอร์โทร รหัสผ่าน ชื่อ-นามสกุล (HN/วัด ใส่ได้ตามสะดวก) และระบุว่าสูบบุหรี่หรือไม่</li>
          <li>เข้าสู่ระบบ ระบบจะเปิดเมนูทั้งหมด และแนะนำให้บันทึกกิจกรรมแรก</li>
          <li>แก้ไขโปรไฟล์เพื่อใส่น้ำหนัก/ส่วนสูงสำหรับคำนวณแคลอรี่</li>
          <li>บันทึกกิจกรรมและการสูบบุหรี่ได้ทุกวัน ดูรายงานความก้าวหน้าในเมนู “รายงาน”</li>
        </ol>
      </section>
    </main>
  );
}
