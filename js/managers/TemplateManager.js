/**
 * TemplateManager - built-in templates stored as JSON. Includes funeral
 * templates with black/gold/purple themes as required.
 */
class TemplateManager extends BaseManager {

  static cache = new Map();

  /** Fetches and caches the raw markup of a decorative SVG asset by URL. */
  static async _getSVG(url) {
    if (!this.cache.has(url)) {
      const response = await fetch(url);
      this.cache.set(url, await response.text());
    }
    return this.cache.get(url);
  }

  init() {
    const svgObj = (x, y, width, height, rotation, svgUrl, color) => ({
      type: 'svg', name: 'SVG Object', x, y, width, height, rotation, color: color, colorize: !!color,
      pluginData: {svgUrl},
    });

    this.templates = [
      {
        key: 'funeral-fb', name: 'ไว้อาลัย (ขาว-ดำ)', thumb: '#fff', thumbColor: '#111', thumb: 'images/card1.png',
        doc: {
          width: 1080, height: 1350, name: 'ไว้อาลัย',
          pages: [{
            objects: [
              svgObj(890, 0, 190, 190, 180, 'svg/corner/1532689740.svg'),
              svgObj(890, 1160, 190, 190, 270, 'svg/corner/1532689740.svg'),
              svgObj(0, 1160, 190, 190, 0, 'svg/corner/1532689740.svg'),
              svgObj(0, 0, 190, 190, 90, 'svg/corner/1532689740.svg'),
              {type: 'svg', name: 'กรอบรูป', x: 318, y: 58, width: 444, height: 444, pluginData: {svgUrl: 'svg/photo/3285612.svg'}},
              {type: 'image', name: 'รูปผู้วายชนม์', x: 428, y: 167, width: 230, height: 230, borderRadius: 50, src: 'images/people.png'},
              {type: 'text', text: 'กำหนดการสวดพระอภิธรรมและฌาปนกิจศพ', x: 90, y: 528, width: 900, height: 62, fontSize: 40, color: '#111111', textAlign: 'center', fontWeight: 600, fontFamily: 'Sarabun'},
              {type: 'text', text: 'คุณแม่ สมศรี ใจดี', x: 90, y: 592, width: 900, height: 92, fontSize: 64, color: '#000000', textAlign: 'center', fontWeight: 700, fontFamily: 'Maitree', lineHeight: 1.2},
              {type: 'text', text: 'ณ วัดบางสะแกนอก แขวง ตลาดพลูเขตธนบุรี กรุงเทพฯ', x: 90, y: 688, width: 900, height: 52, fontSize: 32, color: '#1f2937', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'วันพุธ ที่ 15 กรกฎาคม 2569', x: 140, y: 776, width: 800, height: 56, fontSize: 42, color: '#000000', textAlign: 'center', fontWeight: 700, fontFamily: 'Sarabun'},
              {type: 'text', text: 'เวลา 16:00        พิธีรดน้ำศพ\nเวลา 18:00        สวดพระอภิธรรม', x: 190, y: 832, width: 700, height: 92, fontSize: 32, color: '#1f2937', textAlign: 'center', lineHeight: 1.4, fontFamily: 'Sarabun'},
              {type: 'text', text: 'วันพฤหัส ที่ 16 กรกฎาคม 2569', x: 140, y: 940, width: 800, height: 56, fontSize: 42, color: '#000000', textAlign: 'center', fontWeight: 700, fontFamily: 'Sarabun'},
              {type: 'text', text: 'เวลา 18:00        สวดพระอภิธรรม', x: 190, y: 996, width: 700, height: 48, fontSize: 32, color: '#1f2937', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'วันศุกร์ ที่ 17 กรกฎาคม 2569', x: 140, y: 1054, width: 800, height: 56, fontSize: 42, color: '#000000', textAlign: 'center', fontWeight: 700, fontFamily: 'Sarabun'},
              {type: 'text', text: 'เวลา 18:00        สวดพระอภิธรรม', x: 190, y: 1110, width: 700, height: 48, fontSize: 32, color: '#1f2937', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'วันเสาร์ ที่ 18 กรกฎาคม 2569', x: 140, y: 1168, width: 800, height: 56, fontSize: 42, color: '#000000', textAlign: 'center', fontWeight: 700, fontFamily: 'Sarabun'},
              {type: 'text', text: 'เวลา 15:30        ฌาปนกิจ', x: 190, y: 1224, width: 700, height: 48, fontSize: 32, color: '#1f2937', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'ขออภัยหากมิได้เรียนเชิญด้วยตัวเอง', x: 190, y: 1288, width: 700, height: 44, fontSize: 28, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
            ],
          }],
        },
      },
      {
        key: 'funeral-black', name: 'ไว้อาลัย (ขาว-ทอง)', thumb: '#fff', thumbColor: '#b8860b', thumb: 'images/card2.png',
        doc: {
          width: 1500, height: 2100, name: 'ไว้อาลัย',
          pages: [{
            name: 'หน้า 1', background: '#ffffff',
            objects: [
              svgObj(1200, 0, 300, 300, 180, 'svg/corner/LeafyCorner.svg'),
              svgObj(1200, 1800, 300, 300, 270, 'svg/corner/LeafyCorner.svg'),
              svgObj(0, 1800, 300, 300, 0, 'svg/corner/LeafyCorner.svg'),
              svgObj(0, 0, 300, 300, 90, 'svg/corner/LeafyCorner.svg'),
              svgObj(425, 320, 650, 800, 0, 'svg/photo/tischnummer_oval.svg', '#803300'),
              {type: 'image', name: 'รูปผู้วายชนม์', x: 565, y: 447, width: 380, height: 540, borderRadius: 50, src: 'images/people.png'},
              {type: 'text', text: 'ด้วยความอาลัยยิ่ง', x: 100, y: 140, width: 1300, height: 100, fontSize: 60, color: '#803300', textAlign: 'center', fontWeight: 400, fontFamily: 'Prompt'},
              {type: 'text', text: 'คุณแม่ สมศรี ใจดี', x: 100, y: 1180, width: 1300, height: 120, fontSize: 80, color: '#111111', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'เกิด 1 มค. 2530\nถึงแก่กรรม 15 ตุลาคม 2567\nสิริรวมอายุ 100 ปี', x: 100, y: 1350, width: 1300, height: 300, fontSize: 40, color: '#374151', textAlign: 'center', lineHeight: 1.8, fontFamily: 'Sarabun'},
              {type: 'text', text: '"ชีวิตนี้เป็นของเราเพียงชั่วคราว\nความดีที่ทำไว้จะเป็นของเราตลอดไป"', x: 100, y: 1750, width: 1300, height: 200, fontSize: 32, color: '#803300', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.6, fontFamily: 'Sarabun'},
            ],
          }],
        },
      },
      {
        key: 'funeral-purple', name: 'ไว้อาลัย (ขาว-ม่วง)', thumb: '#fff', thumbColor: '#4c1d95', thumb: 'images/card3.png',
        doc: {
          width: 1080, height: 1350, name: 'ไว้อาลัย',
          pages: [{
            name: 'หน้า 1', background: '#ffffff',
            objects: [
              // มุมตกแต่งสีม่วง
              svgObj(890, 0, 190, 190, 180, 'svg/corner/1532689740.svg', '#4c1d95'),
              svgObj(890, 1160, 190, 190, 270, 'svg/corner/1532689740.svg', '#4c1d95'),
              svgObj(0, 1160, 190, 190, 0, 'svg/corner/1532689740.svg', '#4c1d95'),
              svgObj(0, 0, 190, 190, 90, 'svg/corner/1532689740.svg', '#4c1d95'),
              // หัวเรื่อง
              {type: 'text', text: 'ขอน้อมส่งดวงวิญญาณ', x: 90, y: 80, width: 900, height: 56, fontSize: 36, color: '#4c1d95', textAlign: 'center', fontWeight: 600, fontFamily: 'Prompt'},
              // กรอบรูปวงกลม
              svgObj(340, 160, 400, 400, 0, 'svg/photo/1301807.svg', '#4c1d95'),
              {type: 'image', name: 'รูปผู้วายชนม์', x: 400, y: 227, width: 280, height: 280, borderRadius: 50, src: 'images/people.png'},
              // ชื่อ
              {type: 'text', text: 'นางสาวสมหญิง ใจงาม', x: 90, y: 590, width: 900, height: 92, fontSize: 60, color: '#1f1147', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'สิริรวมอายุ 100 ปี', x: 90, y: 690, width: 900, height: 48, fontSize: 32, color: '#4c1d95', textAlign: 'center', fontFamily: 'Sarabun'},
              // สถานที่
              {type: 'text', text: 'ณ วัดบางสะแกนอก ตลาดพลู ธนบุรี กรุงเทพฯ', x: 90, y: 760, width: 900, height: 48, fontSize: 28, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              // กำหนดการ
              {type: 'text', text: 'กำหนดการสวดพระอภิธรรม', x: 140, y: 830, width: 800, height: 48, fontSize: 34, color: '#4c1d95', textAlign: 'center', fontWeight: 600, fontFamily: 'Prompt'},
              {type: 'text', text: 'วันพุธ ที่ 15 กรกฎาคม 2569', x: 140, y: 884, width: 800, height: 44, fontSize: 32, color: '#1f1147', textAlign: 'center', fontWeight: 700, fontFamily: 'Sarabun'},
              {type: 'text', text: 'เวลา 18:00        สวดพระอภิธรรม', x: 190, y: 934, width: 700, height: 44, fontSize: 28, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'วันพฤหัส ที่ 16 กรกฎาคม 2569', x: 140, y: 988, width: 800, height: 44, fontSize: 32, color: '#1f1147', textAlign: 'center', fontWeight: 700, fontFamily: 'Sarabun'},
              {type: 'text', text: 'เวลา 18:00        สวดพระอภิธรรม', x: 190, y: 1042, width: 700, height: 44, fontSize: 28, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'วันศุกร์ ที่ 17 กรกฎาคม 2569', x: 140, y: 1096, width: 800, height: 44, fontSize: 32, color: '#1f1147', textAlign: 'center', fontWeight: 700, fontFamily: 'Sarabun'},
              {type: 'text', text: 'เวลา 15:30        ฌาปนกิจ', x: 190, y: 1150, width: 700, height: 44, fontSize: 28, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'ขออภัยหากมิได้เรียนเชิญด้วยตัวเอง', x: 190, y: 1220, width: 700, height: 40, fontSize: 26, color: '#6b7280', textAlign: 'center', fontStyle: 'italic', fontFamily: 'Sarabun'},
            ],
          }],
        },
      },
      {
        key: 'invitation', name: 'การ์ดเชิญ (งานบวช)', thumb: '#fef3c7', thumbColor: '#78350f', thumb: 'images/card4.png',
        doc: {
          width: 1500, height: 2100, name: 'การ์ดเชิญ',
          pages: [{
            name: 'หน้า 1', background: '#fef3c7',
            objects: [
              // กรอบทองคู่
              {type: 'rectangle', x: 60, y: 60, width: 1380, height: 1980, fill: 'transparent', stroke: '#b8860b', strokeWidth: 6},
              {type: 'rectangle', x: 100, y: 100, width: 1300, height: 1900, fill: 'transparent', stroke: '#b8860b', strokeWidth: 2},
              // หัวเรื่อง
              {type: 'text', text: 'ขอเรียนเชิญ', x: 100, y: 200, width: 1300, height: 100, fontSize: 60, color: '#78350f', textAlign: 'center', fontFamily: 'Prompt'},
              {type: 'text', text: 'ร่วมเป็นเกียรติในพิธีบรรพชาอุปสมบท', x: 100, y: 320, width: 1300, height: 80, fontSize: 44, color: '#92400e', textAlign: 'center', fontFamily: 'Sarabun'},
              // เส้นตกแต่ง
              {type: 'rectangle', x: 550, y: 430, width: 400, height: 3, fill: '#b8860b', stroke: 'transparent', strokeWidth: 0},
              // นาคสามเณร
              {type: 'text', text: 'นาคสามเณร', x: 100, y: 480, width: 1300, height: 60, fontSize: 38, color: '#92400e', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'นาย สมชาย รักการบวช', x: 100, y: 560, width: 1300, height: 140, fontSize: 96, color: '#78350f', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              // บุตรของ
              {type: 'text', text: 'บุตรของ นาย มานะ และ นาง มาลี รักการบวช', x: 100, y: 720, width: 1300, height: 60, fontSize: 34, color: '#6b4423', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'อุปสมบท ณ วัดบางสะแกนอก ธนบุรี กรุงเทพฯ', x: 100, y: 800, width: 1300, height: 56, fontSize: 34, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              // กำหนดการ
              {type: 'text', text: 'กำหนดการ', x: 100, y: 900, width: 1300, height: 60, fontSize: 42, color: '#78350f', textAlign: 'center', fontWeight: 600, fontFamily: 'Prompt'},
              {type: 'rectangle', x: 600, y: 970, width: 300, height: 3, fill: '#b8860b', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: 'วันเสาร์ ที่ 18 กรกฎาคม 2569', x: 100, y: 1000, width: 1300, height: 56, fontSize: 38, color: '#1f1147', textAlign: 'center', fontWeight: 700, fontFamily: 'Sarabun'},
              {type: 'text', text: 'เวลา 06:00        พระอาจารย์นวมนาค', x: 200, y: 1060, width: 1100, height: 50, fontSize: 32, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'เวลา 08:00        พิธีบรรพชา', x: 200, y: 1118, width: 1100, height: 50, fontSize: 32, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'เวลา 09:00        พระอุปัชฌาย์อุปสมบท', x: 200, y: 1176, width: 1100, height: 50, fontSize: 32, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'เวลา 11:00        ฉันภัตตาหาร', x: 200, y: 1234, width: 1100, height: 50, fontSize: 32, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              // เรียนรับ
              {type: 'text', text: 'เรียนรับอาหารกลางวัน', x: 100, y: 1330, width: 1300, height: 56, fontSize: 38, color: '#78350f', textAlign: 'center', fontWeight: 600, fontFamily: 'Prompt'},
              {type: 'text', text: 'ณ ศาลาการเปรียญ วัดบางสะแกนอก', x: 100, y: 1390, width: 1300, height: 48, fontSize: 32, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              // ติดต่อ
              {type: 'rectangle', x: 300, y: 1530, width: 900, height: 2, fill: '#b8860b', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: 'ติดต่อสอบถาม', x: 100, y: 1560, width: 1300, height: 48, fontSize: 34, color: '#78350f', textAlign: 'center', fontWeight: 600, fontFamily: 'Prompt'},
              {type: 'text', text: 'คุณ มานะ รักการบวช  โทร. 081-234-5678', x: 100, y: 1620, width: 1300, height: 48, fontSize: 32, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'คุณ มาลี รักการบวช  โทร. 089-876-5432', x: 100, y: 1680, width: 1300, height: 48, fontSize: 32, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              // ปิดท้าย
              {type: 'rectangle', x: 300, y: 1820, width: 900, height: 2, fill: '#b8860b', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: 'ด้วยความเคารพและขอบคุณ', x: 100, y: 1850, width: 1300, height: 56, fontSize: 36, color: '#92400e', textAlign: 'center', fontStyle: 'italic', fontFamily: 'Sarabun'},
              {type: 'text', text: 'ตระกูล รักการบวช', x: 100, y: 1930, width: 1300, height: 56, fontSize: 32, color: '#6b4423', textAlign: 'center', fontFamily: 'Sarabun'},
            ]
          }],
        },
      },
      {
        key: 'poster', name: 'โปสเตอร์กิจกรรม', thumb: 'linear-gradient(135deg,#6366f1,#ec4899)', thumbColor: '#fff', thumb: 'images/poster.png',
        doc: {
          width: 2000, height: 3000, name: 'โปสเตอร์กิจกรรม',
          pages: [{
            name: 'หน้า 1', background: '#1e1b4b',
            objects: [
              // แถบบน
              {type: 'rectangle', x: 0, y: 0, width: 2000, height: 90, fill: '#fbbf24', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: '★  FESTIVAL  2026  ★', x: 100, y: 20, width: 1800, height: 50, fontSize: 36, color: '#1e1b4b', textAlign: 'center', fontWeight: 700, letterSpacing: 12, fontFamily: 'Prompt'},
              // หัวเรื่องใหญ่
              {type: 'text', text: 'ดนตรี', x: 100, y: 180, width: 1800, height: 300, fontSize: 260, color: '#fff', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: '&  ARTS', x: 100, y: 460, width: 1800, height: 240, fontSize: 200, color: '#fbbf24', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              // คำขวัญ
              {type: 'text', text: 'เทศกาลดนตรีและศิลปะแห่งปี', x: 100, y: 740, width: 1800, height: 80, fontSize: 56, color: '#c7d2fe', textAlign: 'center', fontFamily: 'Sarabun'},
              // กล่องข้อมูลวัน/เวลา/สถานที่
              {type: 'rectangle', x: 200, y: 880, width: 1600, height: 380, fill: '#312e81', stroke: '#fbbf24', strokeWidth: 4},
              {type: 'text', text: 'วันเสาร์-อาทิตย์', x: 200, y: 920, width: 1600, height: 90, fontSize: 72, color: '#fbbf24', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: '12 - 13 ธันวาคม 2569', x: 200, y: 1020, width: 1600, height: 70, fontSize: 56, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'เวลา 16:00 - 24:00 น.', x: 200, y: 1100, width: 1600, height: 60, fontSize: 44, color: '#c7d2fe', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'สวนเบญจสิริ กรุงเทพมหานคร', x: 200, y: 1170, width: 1600, height: 56, fontSize: 40, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              // ศิลปิน
              {type: 'text', text: '— ศิลปินรับเชิญ —', x: 100, y: 1320, width: 1800, height: 60, fontSize: 44, color: '#fbbf24', textAlign: 'center', fontWeight: 600, fontFamily: 'Prompt'},
              {type: 'text', text: 'วง Bodyslam  •  พาราด็อกซ์  •  Slot Machine', x: 100, y: 1400, width: 1800, height: 60, fontSize: 42, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'พองน้ำเงิน  •  TaitosmitH  •  Three Man Down', x: 100, y: 1470, width: 1800, height: 60, fontSize: 42, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: ' safeplanet  •  Yellow City', x: 100, y: 1540, width: 1800, height: 60, fontSize: 42, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              // บัตร
              {type: 'rectangle', x: 300, y: 1680, width: 1400, height: 320, fill: '#fbbf24', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: 'บัตรเข้างาน', x: 300, y: 1720, width: 1400, height: 70, fontSize: 56, color: '#1e1b4b', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'ราคา  650 / 950 / 1,500 บาท', x: 300, y: 1800, width: 1400, height: 70, fontSize: 56, color: '#1e1b4b', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'เริ่มจำหน่าย 1 ตุลาคม 2569', x: 300, y: 1890, width: 1400, height: 56, fontSize: 40, color: '#312e81', textAlign: 'center', fontFamily: 'Sarabun'},
              // ติดต่อ
              {type: 'text', text: 'ติดต่อสอบถาม  02-123-4567  |  www.musicfestival.th', x: 100, y: 2080, width: 1800, height: 56, fontSize: 38, color: '#c7d2fe', textAlign: 'center', fontFamily: 'Sarabun'},
              // แถบล่าง
              {type: 'rectangle', x: 0, y: 2910, width: 2000, height: 90, fill: '#fbbf24', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: '★  FESTIVAL  2026  ★', x: 100, y: 2930, width: 1800, height: 50, fontSize: 36, color: '#1e1b4b', textAlign: 'center', fontWeight: 700, letterSpacing: 12, fontFamily: 'Prompt'},
            ]
          }],
        },
      },
      {
        key: 'flyer', name: 'ใบปลิวโปรโมชั่น', thumb: '#10b981', thumbColor: '#fff', thumb: 'images/promotion.png',
        doc: {
          width: 1400, height: 2000, name: 'ใบปลิวโปรโมชั่น',
          pages: [{
            name: 'หน้า 1', background: '#064e3b',
            objects: [
              // แถบหัว
              {type: 'rectangle', x: 0, y: 0, width: 1400, height: 200, fill: '#10b981', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: 'GRAND  OPENING', x: 100, y: 50, width: 1200, height: 80, fontSize: 64, color: '#fff', textAlign: 'center', fontWeight: 700, letterSpacing: 16, fontFamily: 'Prompt'},
              {type: 'text', text: 'เปิดใหม่มาแรง', x: 100, y: 130, width: 1200, height: 60, fontSize: 40, color: '#064e3b', textAlign: 'center', fontWeight: 600, fontFamily: 'Sarabun'},
              // หัวเรื่อง
              {type: 'text', text: 'ร้านกาแฟ', x: 100, y: 280, width: 1200, height: 160, fontSize: 130, color: '#fff', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: ' BREW  &  CO. ', x: 100, y: 460, width: 1200, height: 130, fontSize: 100, color: '#fde047', textAlign: 'center', fontWeight: 700, letterSpacing: 8, fontFamily: 'Prompt'},
              // ข้อเสนอ
              {type: 'rectangle', x: 200, y: 640, width: 1000, height: 480, fill: '#10b981', stroke: '#fde047', strokeWidth: 4},
              {type: 'text', text: 'โปรพิเศษ', x: 200, y: 670, width: 1000, height: 80, fontSize: 64, color: '#fff', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'ซื้อ 1 แก้ว แถม 1 แก้ว', x: 200, y: 770, width: 1000, height: 110, fontSize: 88, color: '#fde047', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'เฉพาะเครื่องดื่มเย็นทุกแก้ว', x: 200, y: 900, width: 1000, height: 56, fontSize: 38, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'วันนี้ - 31 กรกฎาคม 2569', x: 200, y: 970, width: 1000, height: 60, fontSize: 44, color: '#064e3b', textAlign: 'center', fontWeight: 700, fontFamily: 'Sarabun'},
              {type: 'text', text: 'ทุกสาขา  เวลา 07:00 - 22:00 น.', x: 200, y: 1040, width: 1000, height: 48, fontSize: 36, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              // เมนูแนะนำ
              {type: 'text', text: 'เมนูแนะนำ', x: 100, y: 1180, width: 1200, height: 60, fontSize: 48, color: '#fde047', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'rectangle', x: 300, y: 1260, width: 800, height: 3, fill: '#10b981', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: 'ลาเต้เย็น             55 บาท', x: 200, y: 1300, width: 1000, height: 50, fontSize: 36, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'คาปูชิโน่         60 บาท', x: 200, y: 1360, width: 1000, height: 50, fontSize: 36, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'โมคค่าเย็น      65 บาท', x: 200, y: 1420, width: 1000, height: 50, fontSize: 36, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'เค้กสตรอเบอร์รี่     89 บาท', x: 200, y: 1480, width: 1000, height: 50, fontSize: 36, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              // ติดต่อ
              {type: 'rectangle', x: 200, y: 1600, width: 1000, height: 3, fill: '#fde047', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: 'สาขาใกล้บ้านคุณ', x: 100, y: 1640, width: 1200, height: 60, fontSize: 44, color: '#fde047', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'สาขาสีลม   02-234-5678', x: 100, y: 1720, width: 1200, height: 48, fontSize: 34, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'สาขาสยาม   02-345-6789', x: 100, y: 1770, width: 1200, height: 48, fontSize: 34, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'Line: @brewandco  |  www.brewandco.th', x: 100, y: 1840, width: 1200, height: 48, fontSize: 34, color: '#a7f3d0', textAlign: 'center', fontFamily: 'Sarabun'},
              // แถบล่าง
              {type: 'rectangle', x: 0, y: 1930, width: 1400, height: 70, fill: '#10b981', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: '★  BREW  &  CO.  COFFEE  ★', x: 100, y: 1945, width: 1200, height: 40, fontSize: 28, color: '#064e3b', textAlign: 'center', fontWeight: 700, letterSpacing: 8, fontFamily: 'Prompt'},
            ]
          }]
        },
      },
      {
        key: 'certificate', name: 'ประกาศนียบัตร', thumb: '#fff', thumbColor: '#d4af37', thumb: 'images/cert1.png',
        doc: {
          width: 2970, height: 2100, name: 'ประกาศนียบัตร',
          pages: [{
            name: 'หน้า 1', background: '#ffffff',
            objects: [
              svgObj(0, 0, 2970, 2100, 0, 'svg/frame/147541.svg', '#d4af37'),
              // ชื่อสถาบัน
              {type: 'text', text: 'สถาบันพัฒนาวิชาชีพแห่งประเทศไทย', x: 100, y: 210, width: 2770, height: 80, fontSize: 56, color: '#1a1a1a', textAlign: 'center', fontWeight: 600, fontFamily: 'Prompt'},
              {type: 'text', text: 'PROFESSIONAL  DEVELOPMENT  INSTITUTE', x: 100, y: 300, width: 2770, height: 50, fontSize: 28, color: '#999', textAlign: 'center', letterSpacing: 6, fontFamily: 'Sarabun'},
              // หัวเรื่อง
              {type: 'text', text: 'ประกาศนียบัตร', x: 100, y: 420, width: 2770, height: 200, fontSize: 180, color: '#b8860b', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              // เส้นตกแต่งใต้หัวเรื่อง
              {type: 'rectangle', x: 1085, y: 645, width: 800, height: 4, fill: '#d4af37', stroke: 'transparent', strokeWidth: 0},
              // ข้อความมอบ
              {type: 'text', text: 'ขอมอบประกาศนียบัตรฉบับนี้ให้แก่', x: 100, y: 710, width: 2770, height: 70, fontSize: 48, color: '#333', textAlign: 'center', fontFamily: 'Sarabun'},
              // ชื่อผู้รับ
              {type: 'text', text: 'นาย สมชาย ใจดี', x: 100, y: 820, width: 2770, height: 140, fontSize: 120, color: '#111', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              // เส้นใต้ชื่อผู้รับ
              {type: 'rectangle', x: 885, y: 985, width: 1200, height: 3, fill: '#b8860b', stroke: 'transparent', strokeWidth: 0},
              // รายละเอียดหลักสูตร
              {type: 'text', text: 'เพื่อแสดงว่าท่านได้สำเร็จการฝึกอบรมหลักสูตร', x: 100, y: 1040, width: 2770, height: 60, fontSize: 44, color: '#444', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'หลักสูตรการพัฒนาทักษะดิจิทัลเพื่ออาชีพ', x: 100, y: 1140, width: 2770, height: 90, fontSize: 64, color: '#b8860b', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              // คะแนน
              {type: 'text', text: 'เรียบร้อยด้วยคะแนนเฉลี่ย 90.50 คะแนน', x: 100, y: 1290, width: 2770, height: 60, fontSize: 44, color: '#444', textAlign: 'center', fontFamily: 'Sarabun'},
              // วันที่
              {type: 'text', text: 'ระหว่างวันที่ 1 มิถุนายน - 31 กรกฎาคม 2569', x: 100, y: 1380, width: 2770, height: 56, fontSize: 40, color: '#555', textAlign: 'center', fontFamily: 'Sarabun'},
              // ตราประทับ (กลาง)
              {type: 'circle', x: 1290, y: 1560, width: 380, height: 380, fill: 'transparent', stroke: '#d4af37', strokeWidth: 4},
              {type: 'circle', x: 1340, y: 1610, width: 280, height: 280, fill: 'transparent', stroke: '#d4af37', strokeWidth: 2},
              {type: 'text', text: 'ตราประทับ\nสถาบัน', x: 1290, y: 1650, width: 380, height: 180, fontSize: 38, color: '#b8860b', textAlign: 'center', lineHeight: 1.5, fontWeight: 600, fontFamily: 'Sarabun'},
              // ลายเซ็น (ซ้าย)
              {type: 'rectangle', x: 280, y: 1840, width: 740, height: 3, fill: '#333', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: '(นาย วิชัย รักการเรียน)', x: 150, y: 1860, width: 1000, height: 56, fontSize: 36, color: '#111', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'ผู้อำนวยการสถาบัน', x: 150, y: 1920, width: 1000, height: 48, fontSize: 32, color: '#666', textAlign: 'center', fontFamily: 'Sarabun'},
              // ลายเซ็น (ขวา)
              {type: 'rectangle', x: 1950, y: 1840, width: 740, height: 3, fill: '#333', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: '(นางสาว สมหญิง อาจารย์ดี)', x: 1820, y: 1860, width: 1000, height: 56, fontSize: 36, color: '#111', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'วิทยากรผู้สอนหลักสูตร', x: 1820, y: 1920, width: 1000, height: 48, fontSize: 32, color: '#666', textAlign: 'center', fontFamily: 'Sarabun'},
            ]
          }]
        },
      },
      {
        key: 'social-fb', name: 'Facebook Post', thumb: '#1877f2', thumbColor: '#fff', thumb: 'images/facebook.png',
        doc: {
          width: 1200, height: 630, name: 'Facebook Post',
          pages: [{
            name: 'หน้า 1', background: '#1877f2',
            objects: [
              {type: 'rectangle', x: 0, y: 0, width: 1200, height: 80, fill: '#0b5fcc', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: '★  FLASH  SALE  ★', x: 40, y: 20, width: 1120, height: 40, fontSize: 28, color: '#fff', textAlign: 'center', fontWeight: 700, letterSpacing: 14, fontFamily: 'Prompt'},
              {type: 'text', text: 'ลดราคา 50%', x: 40, y: 120, width: 1120, height: 160, fontSize: 140, color: '#fff', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'ทุกสินค้าในร้าน', x: 40, y: 290, width: 1120, height: 70, fontSize: 56, color: '#fed7aa', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'rectangle', x: 350, y: 380, width: 500, height: 90, fill: '#fbbf24', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: 'วันนี้เท่านั้น', x: 350, y: 395, width: 500, height: 60, fontSize: 44, color: '#1877f2', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'เปิด 10:00 - 22:00 น.  |  ทุกสาขา', x: 40, y: 510, width: 1120, height: 44, fontSize: 32, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'FB: shopfanpage  |  Tel: 02-123-4567', x: 40, y: 565, width: 1120, height: 40, fontSize: 28, color: '#bfdbfe', textAlign: 'center', fontFamily: 'Sarabun'},
            ]
          }]
        },
      },
      {
        key: 'social-ig', name: 'Instagram', thumb: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', thumbColor: '#fff', thumb: 'images/instagram.png',
        doc: {
          width: 1080, height: 1080, name: 'Instagram Post',
          pages: [{
            name: 'หน้า 1', background: '#833ab4',
            objects: [
              {type: 'rectangle', x: 40, y: 40, width: 1000, height: 1000, fill: 'transparent', stroke: '#fff', strokeWidth: 4},
              {type: 'text', text: 'NEW  COLLECTION', x: 40, y: 120, width: 1000, height: 70, fontSize: 50, color: '#fff', textAlign: 'center', fontWeight: 700, letterSpacing: 14, fontFamily: 'Prompt'},
              {type: 'rectangle', x: 400, y: 210, width: 280, height: 3, fill: '#fcb045', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: 'SUMMER', x: 40, y: 280, width: 1000, height: 220, fontSize: 200, color: '#fff', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: '2026', x: 40, y: 510, width: 1000, height: 180, fontSize: 160, color: '#fcb045', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'rectangle', x: 240, y: 740, width: 600, height: 3, fill: '#fff', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: 'เสื้อผ้าและเครื่องประดับฤดูร้อน', x: 40, y: 770, width: 1000, height: 60, fontSize: 44, color: '#fff', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'ลดสูงสุด 40%', x: 40, y: 850, width: 1000, height: 80, fontSize: 64, color: '#fcb045', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'rectangle', x: 340, y: 950, width: 400, height: 60, fill: '#fff', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: '@yourshop', x: 340, y: 960, width: 400, height: 42, fontSize: 32, color: '#833ab4', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
            ]
          }]
        },
      },
      {
        key: 'wedding', name: 'การ์ดแต่งงาน', thumb: '#fff', thumbColor: '#be185d', thumb: 'images/wedding.png',
        doc: {
          width: 1500, height: 2100, name: 'การ์ดแต่งงาน',
          pages: [{
            name: 'หน้า 1', background: '#fff5f7',
            objects: [
              // กรอบสีชมพูคู่
              {type: 'rectangle', x: 60, y: 60, width: 1380, height: 1980, fill: 'transparent', stroke: '#be185d', strokeWidth: 4},
              {type: 'rectangle', x: 100, y: 100, width: 1300, height: 1900, fill: 'transparent', stroke: '#f9a8d4', strokeWidth: 2},
              // มุมตกแต่ง
              svgObj(0, 0, 200, 200, 90, 'svg/corner/1532689740.svg', '#be185d'),
              svgObj(1300, 0, 200, 200, 180, 'svg/corner/1532689740.svg', '#be185d'),
              svgObj(0, 1900, 200, 200, 0, 'svg/corner/1532689740.svg', '#be185d'),
              svgObj(1300, 1900, 200, 200, 270, 'svg/corner/1532689740.svg', '#be185d'),
              // หัวเรื่อง
              {type: 'text', text: 'THE WEDDING OF', x: 100, y: 150, width: 1300, height: 50, fontSize: 32, color: '#9d174d', textAlign: 'center', letterSpacing: 12, fontFamily: 'Sarabun'},
              // ชื่อคู่บ่าวสาว
              {type: 'text', text: 'สมชาย', x: 100, y: 230, width: 1300, height: 180, fontSize: 160, color: '#831843', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: '&', x: 100, y: 430, width: 1300, height: 100, fontSize: 100, color: '#be185d', textAlign: 'center', fontStyle: 'italic', fontFamily: 'Prompt'},
              {type: 'text', text: 'สมหญิง', x: 100, y: 540, width: 1300, height: 180, fontSize: 160, color: '#831843', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              // เส้นตกแต่ง
              {type: 'rectangle', x: 550, y: 770, width: 400, height: 3, fill: '#be185d', stroke: 'transparent', strokeWidth: 0},
              // วันที่
              {type: 'text', text: 'วันเสาร์ที่ 20 ธันวาคม 2569', x: 100, y: 810, width: 1300, height: 70, fontSize: 52, color: '#831843', textAlign: 'center', fontWeight: 600, fontFamily: 'Prompt'},
              // สถานที่
              {type: 'text', text: 'ณ โรงแรม แกรนด์ ไฮแอท เอราวัณ กรุงเทพฯ', x: 100, y: 910, width: 1300, height: 56, fontSize: 38, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'บอลรูม อาทิตย์  ชั้น 22', x: 100, y: 980, width: 1300, height: 48, fontSize: 34, color: '#6b7280', textAlign: 'center', fontFamily: 'Sarabun'},
              // กำหนดการ
              {type: 'text', text: 'กำหนดการ', x: 100, y: 1070, width: 1300, height: 60, fontSize: 44, color: '#be185d', textAlign: 'center', fontWeight: 600, fontFamily: 'Prompt'},
              {type: 'rectangle', x: 600, y: 1160, width: 300, height: 3, fill: '#be185d', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: '16:00 น.        พิธีหมั้นและสู่ขวัญ', x: 200, y: 1190, width: 1100, height: 50, fontSize: 34, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: '17:00 น.        พรีเซนเทชัน', x: 200, y: 1250, width: 1100, height: 50, fontSize: 34, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: '18:00 น.        รับประทานอาหารค่ำ', x: 200, y: 1310, width: 1100, height: 50, fontSize: 34, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: '20:00 น.        ตัดเค้กและถ่ายภาพ', x: 200, y: 1370, width: 1100, height: 50, fontSize: 34, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              // บิดา-มารดา
              {type: 'rectangle', x: 300, y: 1470, width: 900, height: 2, fill: '#be185d', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: 'บิดา-มารดา', x: 100, y: 1510, width: 1300, height: 50, fontSize: 34, color: '#9d174d', textAlign: 'center', fontWeight: 600, fontFamily: 'Prompt'},
              {type: 'text', text: 'นาย วิชัย  •  นาง สมศรี  รักกันดี', x: 100, y: 1600, width: 1300, height: 50, fontSize: 34, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'นาย ประสิทธิ์  •  นาง มาลี  ศรีสุข', x: 100, y: 1660, width: 1300, height: 50, fontSize: 34, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              // ติดต่อ RSVP
              {type: 'rectangle', x: 300, y: 1750, width: 900, height: 2, fill: '#be185d', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: 'ขอเรียนเชิญร่วมแสดงความยินดี', x: 100, y: 1780, width: 1300, height: 56, fontSize: 40, color: '#831843', textAlign: 'center', fontWeight: 600, fontFamily: 'Prompt'},
              {type: 'text', text: 'กรุณายืนยันการเข้าร่วมภายใน 1 ธันวาคม 2569', x: 100, y: 1850, width: 1300, height: 48, fontSize: 32, color: '#6b7280', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'คุณ มาลี  โทร. 081-234-5678', x: 100, y: 1910, width: 1300, height: 48, fontSize: 32, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
            ]
          }]
        },
      },
      {
        key: 'birthday', name: 'การ์ดวันเกิด', thumb: 'linear-gradient(135deg,#fbbf24,#f472b6)', thumbColor: '#fff', thumb: 'images/birthday.png',
        doc: {
          width: 1080, height: 1350, name: 'การ์ดวันเกิด',
          pages: [{
            name: 'หน้า 1', background: '#fdf2f8',
            objects: [
              // กรอบสีสดใส
              {type: 'rectangle', x: 40, y: 40, width: 1000, height: 1270, fill: 'transparent', stroke: '#f472b6', strokeWidth: 6},
              {type: 'rectangle', x: 70, y: 70, width: 940, height: 1210, fill: 'transparent', stroke: '#fbbf24', strokeWidth: 3},
              // ดาวตกแต่ง
              {type: 'star', x: 100, y: 100, width: 80, height: 80, fill: '#fbbf24', stroke: 'transparent', strokeWidth: 0, points: 5},
              {type: 'star', x: 900, y: 100, width: 80, height: 80, fill: '#f472b6', stroke: 'transparent', strokeWidth: 0, points: 5},
              {type: 'star', x: 100, y: 1170, width: 80, height: 80, fill: '#f472b6', stroke: 'transparent', strokeWidth: 0, points: 5},
              {type: 'star', x: 900, y: 1170, width: 80, height: 80, fill: '#fbbf24', stroke: 'transparent', strokeWidth: 0, points: 5},
              // หัวเรื่อง
              {type: 'text', text: 'HAPPY  BIRTHDAY', x: 90, y: 200, width: 900, height: 80, fontSize: 56, color: '#be185d', textAlign: 'center', fontWeight: 700, letterSpacing: 10, fontFamily: 'Prompt'},
              // วงกลมอายุ
              {type: 'circle', x: 340, y: 320, width: 400, height: 400, fill: '#fbbf24', stroke: '#be185d', strokeWidth: 8},
              {type: 'text', text: '8', x: 340, y: 380, width: 400, height: 280, fontSize: 240, color: '#fff', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'ปี', x: 340, y: 600, width: 400, height: 80, fontSize: 56, color: '#fff', textAlign: 'center', fontWeight: 600, fontFamily: 'Prompt'},
              // ชื่อ
              {type: 'text', text: 'น้องส้ม', x: 90, y: 770, width: 900, height: 130, fontSize: 110, color: '#831843', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'วันเกิดวันที่ 15 กรกฎาคม', x: 90, y: 910, width: 900, height: 56, fontSize: 40, color: '#374151', textAlign: 'center', fontFamily: 'Sarabun'},
              // กำหนดการงาน
              {type: 'rectangle', x: 200, y: 990, width: 680, height: 3, fill: '#f472b6', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: 'เชิญร่วมงานเลี้ยงวันเกิด', x: 90, y: 1020, width: 900, height: 56, fontSize: 42, color: '#be185d', textAlign: 'center', fontWeight: 600, fontFamily: 'Prompt'},
              {type: 'text', text: 'วันเสาร์ที่ 18 กรกฎาคม 2569', x: 90, y: 1080, width: 900, height: 48, fontSize: 36, color: '#374151', textAlign: 'center', fontWeight: 600, fontFamily: 'Sarabun'},
              {type: 'text', text: 'เวลา 13:00 - 17:00 น.', x: 90, y: 1130, width: 900, height: 44, fontSize: 32, color: '#6b7280', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'ณ บ้านเลขที่ 123 ซอยสุขุมวิท  Bangkok', x: 90, y: 1180, width: 900, height: 44, fontSize: 30, color: '#6b7280', textAlign: 'center', fontFamily: 'Sarabun'},
              {type: 'text', text: 'RSVP: คุณแม่ 081-234-5678', x: 90, y: 1232, width: 900, height: 40, fontSize: 28, color: '#be185d', textAlign: 'center', fontFamily: 'Sarabun'},
            ]
          }]
        },
      },
      {
        key: 'menu', name: 'เมนูอาหาร', thumb: '#fff', thumbColor: '#92400e', thumb: 'images/menu.png',
        doc: {
          width: 900, height: 1400, name: 'เมนูอาหาร',
          pages: [{
            name: 'หน้า 1', background: '#fffaf0',
            objects: [
              // กรอบ
              {type: 'rectangle', x: 30, y: 30, width: 840, height: 1340, fill: 'transparent', stroke: '#92400e', strokeWidth: 4},
              {type: 'rectangle', x: 50, y: 50, width: 800, height: 1300, fill: 'transparent', stroke: '#b8860b', strokeWidth: 2},
              // หัวเรื่อง
              {type: 'text', text: 'ร้านอาหาร', x: 50, y: 90, width: 800, height: 50, fontSize: 34, color: '#92400e', textAlign: 'center', letterSpacing: 10, fontFamily: 'Sarabun'},
              {type: 'text', text: 'สวนอาหารบางสะแก', x: 50, y: 150, width: 800, height: 100, fontSize: 76, color: '#1a1a1a', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'ตั้งแต่ปี 2535  •  Bangkok', x: 50, y: 260, width: 800, height: 44, fontSize: 28, color: '#6b4423', textAlign: 'center', fontStyle: 'italic', fontFamily: 'Sarabun'},
              {type: 'rectangle', x: 200, y: 320, width: 500, height: 3, fill: '#b8860b', stroke: 'transparent', strokeWidth: 0},
              // หมวดอาหารคาว
              {type: 'text', text: '— อาหารคาว —', x: 50, y: 360, width: 800, height: 60, fontSize: 44, color: '#92400e', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'ผัดไทยกุ้งสด                          89 บาท', x: 80, y: 440, width: 740, height: 48, fontSize: 32, color: '#1a1a1a', textAlign: 'left', fontFamily: 'Sarabun'},
              {type: 'text', text: 'ส้มตำรวมมิตร                       79 บาท', x: 80, y: 495, width: 740, height: 48, fontSize: 32, color: '#1a1a1a', textAlign: 'left', fontFamily: 'Sarabun'},
              {type: 'text', text: 'แกงเขียวหวานไก่                   120 บาท', x: 80, y: 550, width: 740, height: 48, fontSize: 32, color: '#1a1a1a', textAlign: 'left', fontFamily: 'Sarabun'},
              {type: 'text', text: 'ผัดกะเพราเนื้อสับ                 110 บาท', x: 80, y: 605, width: 740, height: 48, fontSize: 32, color: '#1a1a1a', textAlign: 'left', fontFamily: 'Sarabun'},
              {type: 'text', text: 'ทอดมันกุ้ง                           90 บาท', x: 80, y: 660, width: 740, height: 48, fontSize: 32, color: '#1a1a1a', textAlign: 'left', fontFamily: 'Sarabun'},
              // หมวดของหวาน
              {type: 'rectangle', x: 200, y: 750, width: 500, height: 3, fill: '#b8860b', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: '— ของหวาน —', x: 50, y: 780, width: 800, height: 60, fontSize: 44, color: '#92400e', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'ข้าวเหนียวมะม่วง                     85 บาท', x: 80, y: 860, width: 740, height: 48, fontSize: 32, color: '#1a1a1a', textAlign: 'left', fontFamily: 'Sarabun'},
              {type: 'text', text: 'กะทิแช่เย็น                        55 บาท', x: 80, y: 915, width: 740, height: 48, fontSize: 32, color: '#1a1a1a', textAlign: 'left', fontFamily: 'Sarabun'},
              {type: 'text', text: 'ลอดช่องน้ำกะทิ                    50 บาท', x: 80, y: 970, width: 740, height: 48, fontSize: 32, color: '#1a1a1a', textAlign: 'left', fontFamily: 'Sarabun'},
              // เครื่องดื่ม
              {type: 'rectangle', x: 200, y: 1050, width: 500, height: 3, fill: '#b8860b', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: '— เครื่องดื่ม —', x: 50, y: 1080, width: 800, height: 60, fontSize: 44, color: '#92400e', textAlign: 'center', fontWeight: 700, fontFamily: 'Prompt'},
              {type: 'text', text: 'ชาเย็น                             35 บาท', x: 80, y: 1160, width: 740, height: 48, fontSize: 32, color: '#1a1a1a', textAlign: 'left', fontFamily: 'Sarabun'},
              {type: 'text', text: 'น้ำส้มคั้น                         55 บาท', x: 80, y: 1215, width: 740, height: 48, fontSize: 32, color: '#1a1a1a', textAlign: 'left', fontFamily: 'Sarabun'},
              // ท้ายกระดาษ
              {type: 'rectangle', x: 200, y: 1280, width: 500, height: 2, fill: '#b8860b', stroke: 'transparent', strokeWidth: 0},
              {type: 'text', text: 'เปิดบริการ ทุกวัน  10:00 - 22:00 น.', x: 50, y: 1295, width: 800, height: 36, fontSize: 24, color: '#6b4423', textAlign: 'center', fontStyle: 'italic', fontFamily: 'Sarabun'},
            ]
          }]
        },
      },
    ];
  }

  list() {return this.templates.map(({key, name, thumb, thumbColor}) => ({key, name, thumb, thumbColor}));}

  async apply(key) {
    const t = this.templates.find((x) => x.key === key);
    if (!t) return;
    await Promise.all(
      t.doc.pages.flatMap((page) => page.objects)
        .filter((o) => o.pluginData?.svgUrl)
        .map(async (o) => {
          o.pluginData.svg = await TemplateManager._getSVG(o.pluginData.svgUrl);
        })
    );
    this.app.documentManager.loadFromJSON(t.doc);
    this.emit('toast', {message: `ใช้เทมเพลต "${t.name}" แล้ว`, type: 'success'});
  }
}

window.TemplateManager = TemplateManager;
