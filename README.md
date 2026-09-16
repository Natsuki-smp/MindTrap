# ตอบคำถามแบบจัดอันดับ 😎 (Elite Logic Ranking)

เว็บเกมประเมินตรรกะ การคิดวิเคราะห์ขั้นสูง และการจัดอันดับระดับพรีเมียม (ไม่ใช่ Mockup เป็นระบบ Full-Stack ใช้งานจริง พร้อม Deploy บน Netlify)

---

## 🌟 ฟีเจอร์หลัก (Core Capabilities)

1. **ธีม Black/White + Futuristic/Premium**: ดีไซน์ล้ำสมัย สีดำสนิทตัดสีเงินและขาว มีเส้นสายโฮโลแกรมและแอนิเมชันลื่นไหล รองรับ PC และ Mobile 100%
2. **2 โหมดความยากขั้นสูง**:
   - **HARD (10 ข้อ)**: ข้อสอบตรรกะและกับดักความคิดที่มีความลึกและซับซ้อนมาก
   - **EXTREME (20 ข้อ)**: โจทย์วิเคราะห์หลายตัวแปรระดับยากพิเศษ
3. **ระบบ No-Repeat (คำถามไม่ซ้ำตลอดไป)**:
   - คำถามที่ถูกแจกแล้ว จะถูกบันทึกใน `questionAllocations` อย่างถาวร และ **ไม่ถูกนำกลับมาใช้ซ้ำกับผู้เล่นคนใดอีกตลอดไป**
   - มีชุดคำถามเริ่มต้น **200+ ข้อ** ในฐานข้อมูล พร้อมระบบตรวจจับข้อสอบซ้ำ (Duplicate Detection) และระบบ AI Auto-Replenishment เติมคำถามอัตโนมัติเมื่อคลังใกล้หมด
4. **Backend Authoritative Scoring**:
   - Client ไม่มีสิทธิ์ส่งคะแนนหรือรู้เฉลยล่วงหน้า
   - Backend ตรวจคำตอบแบบเรียลไทม์ พร้อมส่งคำอธิบายเจาะลึก (Explanation) และระบุประเภทกับดักความคิด (Trap Reason)
5. **Replay Lock & Resume**:
   - ผูกมัดเซสชันด้วย Device ID
   - เล่นจบแล้ว **ห้าม Replay** โดยเด็ดขาด
   - หากเล่นค้างอยู่และรีเฟรชหน้าจอ ระบบจะ **Resume** ข้อเดิมให้เล่นต่อได้ทันที
   - การปลดล็อกต้องได้รับอนุมัติจาก Admin ผ่าน Backend เท่านั้น
6. **Leaderboard**:
   - แยกตารางอันดับ HARD และ EXTREME ชัดเจน
   - จัดเรียงตาม คะแนนสูงสุด → และหากคะแนนเท่ากัน ตัดสินด้วยเวลาที่ทำเสร็จเร็วกว่า
7. **ประเมินค่า IQ จากเกม**:
   - แสดงช่วงประเมิน เช่น HARD ≥ 7 หรือ EXTREME ≥ 14 จะได้ช่วง **100–120+**
   - มีคำเตือนมาตรฐาน: *“เป็นค่าประเมินเพื่อความสนุก ไม่ใช่ IQ จริงหรือการทดสอบมาตรฐาน”*
8. **🎬 Video Reward (วิดีโอของรางวัล)**:
   - เล่นอัตโนมัติแบบ Loop ตลอดเวลา พร้อมเสียง
   - ไม่มีปุ่ม Pause / Skip / Seek ป้องกันการกดข้าม
   - ปฏิบัติตาม Browser Autoplay Policy อย่างถูกต้อง (มีระบบตรวจจับและปุ่ม Unmute หากเบราว์เซอร์ต้องการ User Interaction)
   - Admin สามารถเพิ่ม/แก้ไข/ลบ และตั้งค่าช่วงคะแนนของวิดีโอได้อิสระ โดยมีระบบตรวจสอบไม่ให้ช่วงคะแนนซ้อนทับกัน
9. **🔐 Admin Dashboard**:
   - เข้าสู่ระบบที่ด้านล่างสุดของหน้าแรก ด้วยรหัสผ่าน: `plmokn098!?`
   - มี **ตัวชี้วัดสถานะการเชื่อมต่อฐานข้อมูล (Database Connection Status)** ดูได้ทันทีว่าเชื่อมต่อ Firestore แล้วหรือยัง
   - จัดการคำถาม (เพิ่ม/ลบ/แก้ไข/ตรวจข้อซ้ำ/สุ่มสร้างโจทย์ใหม่ด้วย AI)
   - ดูรายชื่อผู้เล่น, เซสชัน, ประวัติการเล่น, และปลดล็อก Replay Lock
   - จัดการตารางคะแนน Leaderboard และวิดีโอของรางวัล

---

## 🚀 การ Deploy บน Netlify

### 1. ไฟล์ที่เตรียมพร้อมแล้วสำหรับ Netlify:
- `netlify.toml`: กำหนดค่า Build command, Directory `dist`, และ Redirects API
- `functions/api.ts`: Netlify Serverless Function รองรับ Endpoint `/api/*`
- `firestore.rules`: กฎความปลอดภัย Firestore ระดับ Zero-Trust
- `firestore.indexes.json`: ดัชนี Composite สำหรับ Leaderboard

### 2. ขั้นตอนการนำขึ้น Netlify:
1. Push โปรเจกต์นี้ขึ้น GitHub Repository
2. เข้าสู่ [Netlify](https://app.netlify.com/) แล้วเลือก **Add new site > Import an existing project**
3. เลือก GitHub repo ของคุณ
4. ตรวจสอบการตั้งค่า:
   - **Build Command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `functions`
5. ในแท็บ **Site configuration > Environment variables** ให้เพิ่ม:
   - `GEMINI_API_KEY`: API Key ของคุณ
   - `VITE_FIREBASE_PROJECT_ID`: ID โครงการ Firebase ของคุณ
   - `ADMIN_PASSWORD`: `plmokn098!?`
6. คลิก **Deploy Site**

---

## 🔒 Firebase Collections

- `players`: ข้อมูลผู้เล่นและ Device ID
- `questions`: คลังคำถามตรรกะ (ซ่อน correctIndex จาก Client)
- `questionAllocations`: ประวัติการแจกคำถามแบบถาวร (No-Repeat)
- `sessions`: สถานะการเล่น คะแนน และเวลา
- `leaderboard`: สรุปอันดับคะแนน
- `videoRewards`: กฎและลิงก์วิดีโอของรางวัลตามระดับคะแนน
