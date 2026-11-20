import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckSquare, Info, MapPin, User,
  Bell, ExternalLink, Settings, Edit3, Save,
  Plane, Coffee, Store, Hotel, CalendarDays, Link as LinkIcon, PlusCircle, Trash2, Shield, TrendingUp, Star, ArrowUp, ArrowDown, X, Gift, PhoneCall, FileText, Image as ImageIcon, Upload, Loader2, Copy, Check, Printer, Table, Flag
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAzO6RTxbdgy1eOUJzWVXa10BD09TBZYCc",
  authDomain: "tourapp-d7926.firebaseapp.com",
  projectId: "tourapp-d7926",
  storageBucket: "tourapp-d7926.firebasestorage.app",
  messagingSenderId: "907439445985",
  appId: "1:907439445985:web:c86296309a31a8c3eea4a0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const defaultData = {
  brandName: "Lowge securities",
  eventTitle: "12月Semicon JP",
  eventLocation: "東京",
  eventDate: "2026.12.1 — 12.03",
  activeEvent: null,
  itinerary: {
    1: { date: "9/13", weekday: "週日", title: "集合出發", events: [
      { time: "09:40", endTime: "13:50", icon: "plane", title: "JL96 台北松山 → 東京羽田", subtitle: "TSA → HND\n日本航空", note: "請攜帶護照 9:45 松山機場集合", mapUrl: "" },
      { time: "13:00", endTime: "", icon: "hotel", title: "東急STAY銀座", subtitle: "飯店入住休息", note: "", mapUrl: "" }
    ]},
    2: { date: "9/14", weekday: "週一", title: "企業參訪", events: [
      { time: "10:00", endTime: "11:00", icon: "pin", title: "FAMIMA PARK 麻布台", subtitle: "東京都港区虎ノ門5丁目2-10", note: "大廳集合", mapUrl: "" },
      { time: "11:30", endTime: "", icon: "coffee", title: "穴子や 神谷町 (星鰻)", subtitle: "東京都港区虎ノ門5-3-10 1F", note: "", mapUrl: "" },
      { time: "13:00", endTime: "", icon: "activity", title: "伊藤忠商事", subtitle: "加藤宏基 / IR部長代行\n意えりか / IR部シニアマネジャー", note: "東京都港区赤坂2丁目17-22", mapUrl: "" },
      { time: "14:30", endTime: "15:30", icon: "activity", title: "泛太平洋國際控股", subtitle: "根本 眞悠", note: "東京都渋谷区道玄坂2-25-12 8F", mapUrl: "" }
    ]},
    3: { date: "9/15", weekday: "週二", title: "企業參訪", events: [
      { time: "10:00", endTime: "11:00", icon: "activity", title: "三住集團", subtitle: "IR室總經理 示野功雄 部長", note: "東京都千代田区九段南1-6-5", mapUrl: "" },
      { time: "11:45", endTime: "", icon: "coffee", title: "美食米門 品川港南", subtitle: "日式定食\n東京都港区港南2-16-3 1F", note: "", mapUrl: "" },
      { time: "13:00", endTime: "", icon: "activity", title: "豐田通商", subtitle: "IR室 室長 高木麻也子\n木下真智子、加藤周平", note: "東京都港区港南2-3-13", mapUrl: "" },
      { time: "14:30", endTime: "15:30", icon: "activity", title: "川崎重工", subtitle: "IR部長の勝野弘之\nIR課長の杉原淳史", note: "東京都港区海岸1-14-5", mapUrl: "" }
    ]},
    4: { date: "9/16", weekday: "週三", title: "企業參訪", events: [
      { time: "10:00", endTime: "11:00", icon: "activity", title: "住友商事", subtitle: "永井 祐介\nインベスターリレーションズ部 部長", note: "大手町プレイス", mapUrl: "" },
      { time: "11:30", endTime: "", icon: "coffee", title: "焼肉会席 ともび", subtitle: "燒肉\n東京都港区西新橋1-1-1 2F", note: "", mapUrl: "" },
      { time: "13:00", endTime: "", icon: "activity", title: "龜甲萬", subtitle: "片桐 大輔 コーポレートコミュニケーション部\n高坂 知世 コーポレートコミュニケーション部", note: "東京都港区西新橋2-1-1", mapUrl: "" },
      { time: "14:30", endTime: "15:30", icon: "activity", title: "兼松", subtitle: "東京都千代田区丸の内2-7-2 16F", note: "", mapUrl: "" }
    ]},
    5: { date: "9/17", weekday: "週四", title: "企業參訪", events: [
      { time: "10:00", endTime: "11:00", icon: "activity", title: "丸紅", subtitle: "IR 関 芳樹、水谷 空良、矢口 諒", note: "大手町1-4-2", mapUrl: "" },
      { time: "11:30", endTime: "", icon: "coffee", title: "Delirium Cafe Tokyo", subtitle: "排餐\n東京都千代田区霞が関3-2-6 1F", note: "", mapUrl: "" },
      { time: "13:30", endTime: "14:30", icon: "activity", title: "雙日控股", subtitle: "IR課 課長 村田千尋\nIR課 上級主任 本間裕大", note: "東京都千代田区内幸町2-1-1", mapUrl: "" }
    ]},
    6: { date: "9/18", weekday: "週五", title: "電玩展參訪", events: [
      { time: "10:00", endTime: "10:30", icon: "guide", title: "東京電玩展 TGS 2026", subtitle: "千葉市美浜区中瀬2-1 幕張メッセ", note: "幕張メッセ", mapUrl: "" },
      { time: "10:30", endTime: "11:30", icon: "guide", title: "CAPCOM 卡普空", subtitle: "攤位07-S01\n(含遊戲試玩30分+攤位導覽)", note: "", mapUrl: "" },
      { time: "12:00", endTime: "", icon: "coffee", title: "會場美食區", subtitle: "會場自由用餐", note: "", mapUrl: "" },
      { time: "13:30", endTime: "14:00", icon: "guide", title: "Gungho 玩和線上娛樂", subtitle: "攤位06-C06", note: "", mapUrl: "" }
    ]}
  },
  checklist: [
    { id: '1', label: '護照 / 證件' },
    { id: '2', label: 'Visit Japan Web 登錄證明' },
    { id: '3', label: '行動網路 / 漫遊開通' },
    { id: '4', label: '日幣現金 (應急)' },
    { id: '5', label: '國際信用卡' },
    { id: '6', label: '大容量行動電源' },
    { id: '7', label: '商務名片 (充足)' },
    { id: '8', label: '展覽入場 QR Code' }
  ],
  infoCards: [
    {
      id: 'contact_main',
      title: "主要聯絡窗口",
      iconType: "user",
      name: "Peter Liu",
      items: [
        { label: "LINE ID", value: "lowgeliu" },
        { label: "電話號碼", value: "+886 976034854" }
      ]
    },
    {
      id: 'driver_info',
      title: "專車司機資訊",
      iconType: "car",
      name: "佐藤 先生 (Sato)",
      items: [
        { label: "司機電話", value: "+81 90-1234-5678" },
        { label: "車牌號碼", value: "東京 500 あ 12-34" }
      ]
    },
    {
      id: 'gift_info',
      title: "推薦伴手禮",
      iconType: "gift",
      name: "人氣採買清單",
      items: [
        { label: "首選推薦", value: "東京車站限定 NY起司餅乾" },
        { label: "機場免稅", value: "白色戀人、薯條三兄弟" }
      ]
    }
  ]
};

export default function App() {
  const getUrlTourId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tour') || 'default';
  };

  const [currentTourId, setCurrentTourId] = useState(getUrlTourId);
  const [availableTours, setAvailableTours] = useState(['default']);
  const [copied, setCopied] = useState(false);

  const [activeTab, setActiveTab] = useState('itinerary');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [appData, setAppData] = useState(defaultData);
  const [editData, setEditData] = useState(defaultData);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const [modalContent, setModalContent] = useState(null);
  const [exportingDm, setExportingDm] = useState(false);
  const [includePngWithDm, setIncludePngWithDm] = useState(false);

  const loadScriptOnce = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`載入失敗：${src}`));
      document.head.appendChild(s);
    });
  };

  const triggerFileDownload = (source, filename) => {
    const a = document.createElement('a');
    if (typeof source === 'string') {
      a.href = source;
    } else {
      a.href = URL.createObjectURL(source);
    }
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof source !== 'string') {
      setTimeout(() => URL.revokeObjectURL(a.href), 2500);
    }
  };

 const handleExportVerticalDm = async () => {
    try {
      setExportingDm(true);
      const srcData = displayData || appData || defaultData;
      const brandName = srcData.brandName || 'Lowge securities';
      const eventTitle = srcData.eventTitle || '機構法人專屬參訪交流';
      const eventDate = srcData.eventDate || '日期待確認';
      const eventLocation = srcData.eventLocation || '詳情洽業務窗口';

      const dayKeys = Object.keys(srcData.itinerary || {})
        .map(Number)
        .sort((a, b) => a - b);

      const flightNotes = [];
      const hotelNotes = [];
      const groupedAgendaRows = [];

      dayKeys.forEach((dNum) => {
        const dObj = srcData.itinerary[dNum];
        const dayLabel = `${dObj?.date || `D${dNum}`}(${dObj?.weekday || ''})`;
        const dayEvents = dObj?.events || [];
        const dayCoreItems = [];

        dayEvents.forEach((ev) => {
          const rawTitle = String(ev?.title || '').trim();
          if (!rawTitle) return;
          const subClean = String(ev?.subtitle || '').replace(/\n+/g, ' / ').trim();

          if (ev?.icon === 'plane' || /航班|機票|航空|機場/.test(rawTitle)) {
            flightNotes.push(subClean ? `${rawTitle}（${subClean}）` : rawTitle);
          }
          if (ev?.icon === 'hotel' || /飯店|酒店|入住|STAY/i.test(rawTitle)) {
            hotelNotes.push(subClean ? `${rawTitle}（${subClean}）` : rawTitle);
          }

          const isExcluded =
            ['plane', 'hotel', 'coffee'].includes(ev?.icon) ||
            /機場|航班|飯店|酒店|入住|星鰻|燒肉|定食|排餐|美食區|自由用餐|午餐|晚餐|早餐/.test(rawTitle);

          if (!isExcluded) {
            dayCoreItems.push(subClean ? `${rawTitle}（${subClean}）` : rawTitle);
          }
        });

        if (dayCoreItems.length > 0) {
          groupedAgendaRows.push({
            day: dayLabel,
            items: dayCoreItems
          });
        }
      });

      (srcData.infoCards || []).forEach((card) => {
        const cTitle = String(card?.title || '');
        const cText = [card?.name, ...(card?.items || []).map((i) => `${i.label} ${i.value}`)]
          .filter(Boolean)
          .join(' / ');
        if (!cText) return;
        if (/機票|航班|航空/.test(cTitle) && flightNotes.length === 0) flightNotes.push(cText);
        if (/飯店|住宿|司機|交通/.test(cTitle) && hotelNotes.length === 0) hotelNotes.push(cText);
      });

      const flightSummary = flightNotes.length > 0 ? flightNotes.slice(0, 2).join('；') : '請填寫航班資訊';
      const hotelSummary = hotelNotes.length > 0 ? hotelNotes.slice(0, 2).join('；') : '請填寫飯店資訊';

      const mainContact =
        (srcData.infoCards || []).find((c) => c.iconType === 'user') ||
        (srcData.infoCards || [])[0];
      const contactInfoText = mainContact
        ? `${mainContact.name || ''}｜${(mainContact.items || [])
            .map((it) => `${it.label} ${it.value}`)
            .join(' / ')}`
        : '請聯繫您的專屬業務窗口';

      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const safeTitle = String(eventTitle).replace(/[\\/:*?"<>|]/g, '_').slice(0, 24) || 'DM';

      // 若勾選「僅匯出圖片 (PNG)」：產出與 A4 PPT 版面完全一致的高解析 PNG 圖片
      if (includePngWithDm) {
        await loadScriptOnce('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
        const stageEl = document.getElementById('vertical-dm-export-stage');
        if (stageEl && window.html2canvas) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          const canvas = await window.html2canvas(stageEl, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#FFFFFF'
          });
          triggerFileDownload(canvas.toDataURL('image/png'), `${safeTitle}_A4行程DM_${stamp}.png`);
        }
        return;
      }

      // 預設未勾選：產出上下置中平衡的直式 A4 可編輯 PPTX（8.27 in x 11.69 in）
      await loadScriptOnce('https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js');
      if (window.PptxGenJS) {
        const pptx = new window.PptxGenJS();
        pptx.defineLayout({ name: 'A4_PORTRAIT_DM', width: 8.27, height: 11.69 });
        pptx.layout = 'A4_PORTRAIT_DM';
        pptx.author = brandName;
        pptx.title = `${brandName} - ${eventTitle}`;

        const fontFace = '微軟正黑體';
        const navyHeader = '0F2C59';
        const goldAccent = 'C8963E';
        const softTint = 'F1F5F9';
        const borderColor = '94A3B8';

        const slide = pptx.addSlide();
        slide.background = { color: 'FFFFFF' };

        // 頂部機構橫幅
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: 8.27, h: 0.56,
          fill: { color: navyHeader }
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0.56, w: 8.27, h: 0.04,
          fill: { color: goldAccent }
        });
        slide.addText(`${brandName}  |  INSTITUTIONAL CORPORATE ACCESS`, {
          x: 0.42, y: 0.1, w: 7.43, h: 0.36,
          fontFace, fontSize: 11, bold: true, color: 'FFFFFF', valign: 'middle'
        });

        // 顯眼活動主標題區（上下置中留白平衡）+ 右上角置中日期地點
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.42, y: 0.82, w: 5.2, h: 0.64,
          fill: { color: 'F8FAFC' }
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.42, y: 0.82, w: 0.1, h: 0.64,
          fill: { color: navyHeader }
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.42, y: 1.43, w: 5.2, h: 0.03,
          fill: { color: goldAccent }
        });
        slide.addText(eventTitle, {
          x: 0.62, y: 0.85, w: 4.92, h: 0.56,
          fontFace, fontSize: 25, bold: true, color: navyHeader, valign: 'middle'
        });
        slide.addText(`${eventDate}\n${eventLocation}`, {
          x: 5.72, y: 0.82, w: 2.13, h: 0.64,
          fontFace, fontSize: 10, bold: true, color: navyHeader,
          align: 'center', valign: 'middle',
          fill: { color: 'FEF3C7' }
        });

        // 一、活動與聯絡資訊
        slide.addText('一、活動與聯絡資訊', {
          x: 0.42, y: 1.66, w: 7.43, h: 0.26,
          fontFace, fontSize: 10.5, bold: true, color: navyHeader
        });

        slide.addTable(
          [
            [
              { text: '活動期間', options: { bold: true, fill: { color: softTint }, color: navyHeader } },
              { text: eventDate, options: { bold: true, fill: { color: 'FFFFFF' } } },
              { text: '考察地點', options: { bold: true, fill: { color: softTint }, color: navyHeader } },
              { text: eventLocation, options: { bold: true, fill: { color: 'FFFFFF' } } }
            ],
            [
              { text: '聯絡窗口', options: { bold: true, fill: { color: softTint }, color: navyHeader } },
              { text: contactInfoText, options: { bold: true, colspan: 3, fill: { color: 'FFFFFF' } } }
            ]
          ],
          {
            x: 0.42, y: 1.94, w: 7.43,
            colW: [1.1, 2.61, 1.1, 2.62],
            rowH: [0.34, 0.34],
            fontFace, fontSize: 9.2, bold: true, color: '0F172A',
            valign: 'middle',
            border: { type: 'solid', pt: 0.75, color: borderColor }
          }
        );

        // 二、導覽重點（留白區供填寫簡介）
        slide.addText('二、導覽重點', {
          x: 0.42, y: 2.84, w: 7.43, h: 0.26,
          fontFace, fontSize: 10.5, bold: true, color: navyHeader
        });

        slide.addTable(
          [
            [
              {
                text: '（請在此填寫本次活動／展會／參訪導覽簡介）',
                options: { bold: true, fill: { color: 'FFFFFF' }, color: '475569', valign: 'top' }
              }
            ]
          ],
          {
            x: 0.42, y: 3.12, w: 7.43,
            colW: [7.43],
            rowH: [1.1],
            fontFace, fontSize: 9.5, bold: true,
            border: { type: 'solid', pt: 0.75, color: borderColor }
          }
        );

        // 三、行程議程明細表
        slide.addText('三、行程議程明細表', {
          x: 0.42, y: 4.44, w: 7.43, h: 0.26,
          fontFace, fontSize: 10.5, bold: true, color: navyHeader
        });

        const agendaRows = [
          [
            { text: '日期', options: { bold: true, align: 'center', fill: { color: navyHeader }, color: 'FFFFFF' } },
            { text: '行程／參訪企業與接洽窗口', options: { bold: true, fill: { color: navyHeader }, color: 'FFFFFF' } }
          ]
        ];

        const activeDays = groupedAgendaRows.slice(0, 6);
        if (activeDays.length === 0) {
          agendaRows.push([
            { text: eventDate, options: { bold: true, align: 'center' } },
            { text: '請填寫參訪企業與接洽窗口', options: { bold: true } }
          ]);
        } else {
          activeDays.forEach((grp, gIdx) => {
            const itemsList = grp.items.slice(0, 4);
            const spanCount = itemsList.length;
            const rowBg = gIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';

            itemsList.forEach((itemText, iIdx) => {
              if (iIdx === 0) {
                agendaRows.push([
                  {
                    text: grp.day,
                    options: {
                      bold: true,
                      align: 'center',
                      valign: 'middle',
                      rowspan: spanCount,
                      fill: { color: rowBg },
                      color: navyHeader
                    }
                  },
                  {
                    text: itemText,
                    options: { bold: true, valign: 'middle', fill: { color: rowBg }, color: '0F172A' }
                  }
                ]);
              } else {
                agendaRows.push([
                  {
                    text: itemText,
                    options: { bold: true, valign: 'middle', fill: { color: rowBg }, color: '0F172A' }
                  }
                ]);
              }
            });
          });
        }

        const totalDataRows = Math.max(agendaRows.length - 1, 1);
        const agendaTableH = 4.32;
        const headerH = 0.3;
        const perDataRowH = Math.max(0.25, (agendaTableH - headerH) / totalDataRows);
        const rowHeights = [headerH, ...Array(totalDataRows).fill(perDataRowH)];

        slide.addTable(agendaRows, {
          x: 0.42, y: 4.72, w: 7.43,
          colW: [1.25, 6.18],
          rowH: rowHeights,
          fontFace, fontSize: 8.8, bold: true,
          valign: 'middle',
          border: { type: 'solid', pt: 0.65, color: borderColor }
        });

        // 四、行程資訊（機票、飯店、預計費用）
        const infoSecY = 9.26;
        slide.addText('四、行程資訊', {
          x: 0.42, y: infoSecY, w: 7.43, h: 0.26,
          fontFace, fontSize: 10.5, bold: true, color: navyHeader
        });

        slide.addTable(
          [
            [
              { text: '機票', options: { bold: true, fill: { color: softTint }, color: navyHeader } },
              { text: flightSummary, options: { bold: true, fill: { color: 'FFFFFF' } } }
            ],
            [
              { text: '飯店', options: { bold: true, fill: { color: softTint }, color: navyHeader } },
              { text: hotelSummary, options: { bold: true, fill: { color: 'FFFFFF' } } }
            ],
            [
              { text: '預計費用', options: { bold: true, fill: { color: softTint }, color: navyHeader } },
              { text: '（請填寫預計費用或分攤說明）', options: { bold: true, fill: { color: 'FFFFFF' }, color: '475569' } }
            ]
          ],
          {
            x: 0.42, y: infoSecY + 0.28, w: 7.43,
            colW: [1.25, 6.18],
            rowH: [0.46, 0.46, 0.46],
            fontFace, fontSize: 9, bold: true, color: '0F172A',
            valign: 'middle',
            border: { type: 'solid', pt: 0.75, color: borderColor }
          }
        );

        // 底部警語（與上方四區塊保持均勻間距）
        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 11.16, w: 8.27, h: 0.53,
          fill: { color: navyHeader }
        });
        slide.addText('*本行程表僅供機構投資人邀約參考，實際拜訪與議程安排以最終確認為準。', {
          x: 0.42, y: 11.23, w: 7.43, h: 0.38,
          fontFace, fontSize: 8.8, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle'
        });

        const pptBlob = await pptx.write({ outputType: 'blob' });
        triggerFileDownload(pptBlob, `${safeTitle}_A4行程DM_${stamp}.pptx`);
      }
    } catch (err) {
      console.error('匯出 DM 失敗：', err);
      alert(`匯出 DM 時發生錯誤：${err.message || err}`);
    } finally {
      setExportingDm(false);
    }
  };




  
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  useEffect(() => {
    if (modalContent || showMatrixModal) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.touchAction = 'auto';
      };
    }
  }, [modalContent, showMatrixModal]);

  useEffect(() => {
    const indexDocRef = doc(db, 'tourConfig', 'tourList');
    const unsubList = onSnapshot(indexDocRef, (snap) => {
      if (snap.exists() && snap.data().list) {
        setAvailableTours(snap.data().list);
      } else {
        setDoc(indexDocRef, { list: ['default'] });
      }
    });
    return () => unsubList();
  }, []);

  useEffect(() => {
    const docPath = currentTourId === 'default' ? ['tourConfig', 'mainContent'] : ['tours', currentTourId];
    const docRef = doc(db, docPath[0], docPath[1]);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const serverData = docSnap.data();
        const mergedData = {
          ...defaultData,
          ...serverData,
          infoCards: (serverData?.infoCards && Array.isArray(serverData.infoCards) && serverData.infoCards.length > 0) 
            ? serverData.infoCards 
            : defaultData.infoCards
        };
        setAppData(mergedData);
        setEditData(mergedData); 
      } else {
        const initialData = {
          ...defaultData,
          eventTitle: currentTourId === 'default' ? defaultData.eventTitle : `新考察行程 (${currentTourId})`
        };
        setDoc(docRef, initialData);
      }
    });
    return () => unsubscribe();
  }, [currentTourId]);

  const handleSwitchTour = (newTourId) => {
    setCurrentTourId(newTourId);
    const url = new URL(window.location);
    if (newTourId === 'default') {
      url.searchParams.delete('tour');
    } else {
      url.searchParams.set('tour', newTourId);
    }
    window.history.pushState({}, '', url);
  };

  const handleCreateNewTour = async () => {
    const newId = prompt("請輸入新行程專屬代碼（限英文與數字，例如：ces-2027）：");
    if (!newId) return;

    const cleanId = newId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanId) {
      alert("請輸入有效的英文/數字代碼！");
      return;
    }

    if (availableTours.includes(cleanId)) {
      alert("此行程代碼已存在，為您切換至該行程。");
      handleSwitchTour(cleanId);
      return;
    }

    const title = prompt("請輸入此行程大標題（例如：2027 美國 CES 科技考察）：", "新考察行程");

    const newTourData = {
      ...defaultData,
      eventTitle: title || "新考察行程",
      brandName: appData.brandName || "Lowge securities"
    };

    try {
      await setDoc(doc(db, 'tours', cleanId), newTourData);
      const updatedList = Array.from(new Set([...availableTours, cleanId]));
      await setDoc(doc(db, 'tourConfig', 'tourList'), { list: updatedList });

      handleSwitchTour(cleanId);
      alert(`✅ 行程「${cleanId}」建立成功並已切換！`);
    } catch (e) {
      console.error(e);
      alert("建立失敗，請檢查網路連線。");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [userChecklist, setUserChecklist] = useState({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`tour_checklist_${currentTourId}`);
      setUserChecklist(saved ? JSON.parse(saved) : {});
    } catch (e) {
      setUserChecklist({});
    }
  }, [currentTourId]);

  const toggleCheck = (id) => {
    setUserChecklist(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(`tour_checklist_${currentTourId}`, JSON.stringify(next));
      return next;
    });
  };

  const handleSaveToCloud = async () => {
    try {
      const docPath = currentTourId === 'default' ? ['tourConfig', 'mainContent'] : ['tours', currentTourId];
      await setDoc(doc(db, docPath[0], docPath[1]), editData);
      setIsAdmin(false);
      alert(`【Institutional System】「${currentTourId}」行程數據已成功同步至全體終端。`);
    } catch (error) {
      alert('更新失敗，請檢查網路連線。');
    }
  };

  const handleAdminLogin = () => {
  if (isAdmin) {
    setIsAdmin(false);
    return;
  }
  setPasswordInput("");
  setShowPasswordModal(true);
};

const handleConfirmAdminPassword = (e) => {
  if (e) e.preventDefault();
  if (passwordInput === "1234") {
    setIsAdmin(true);
    setShowPasswordModal(false);
    setPasswordInput("");
    alert("✅ 權限解鎖：管理員模式已啟用");
  } else {
    alert("❌ 密碼錯誤");
  }
};

  const handleEventChange = (day, index, field, value) => {
    setEditData(prev => {
      const updatedEvents = [...(prev?.itinerary?.[day]?.events || [])];
      updatedEvents[index] = { ...(updatedEvents[index] || {}), [field]: value };
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const handleAttachmentChange = (day, eventIndex, attIndex, field, value) => {
    setEditData(prev => {
      const updatedEvents = [...(prev?.itinerary?.[day]?.events || [])];
      const currentEv = updatedEvents[eventIndex] || {};
      const atts = [...(currentEv?.attachments || [{ name: "", url: "" }])];
      atts[attIndex] = { ...(atts[attIndex] || {}), [field]: value };
      updatedEvents[eventIndex] = { ...currentEv, attachments: atts };
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const addAttachment = (day, eventIndex) => {
    setEditData(prev => {
      const updatedEvents = [...(prev?.itinerary?.[day]?.events || [])];
      const currentEv = updatedEvents[eventIndex] || {};
      const atts = [...(currentEv?.attachments || [{ name: "", url: "" }]), { name: "", url: "" }];
      updatedEvents[eventIndex] = { ...currentEv, attachments: atts };
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const removeAttachment = (day, eventIndex, attIndex) => {
    setEditData(prev => {
      const updatedEvents = [...(prev?.itinerary?.[day]?.events || [])];
      const currentEv = updatedEvents[eventIndex] || {};
      const atts = [...(currentEv?.attachments || [{ name: "", url: "" }])];
      atts.splice(attIndex, 1);
      updatedEvents[eventIndex] = { ...currentEv, attachments: atts.length > 0 ? atts : [{ name: "", url: "" }] };
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.72);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (day, eventIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingIndex(eventIndex);
      const compressedUrl = await compressImage(file);

      setEditData(prev => {
        const updatedEvents = [...(prev?.itinerary?.[day]?.events || [])];
        const currentEv = updatedEvents[eventIndex] || {};
        const files = [...(currentEv?.files || []), { name: file.name, url: compressedUrl }];
        updatedEvents[eventIndex] = { ...currentEv, files: files };
        return {
          ...prev,
          itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
        };
      });
      alert(`✅ 圖片「${file.name}」已成功載入並完成優化！`);
    } catch (err) {
      console.error(err);
      alert('圖片處理失敗，請挑選其他格式的圖片（建議使用 JPG 或 PNG）。');
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeFile = (day, eventIndex, fileIndex) => {
    setEditData(prev => {
      const updatedEvents = [...(prev?.itinerary?.[day]?.events || [])];
      const currentEv = updatedEvents[eventIndex] || {};
      const files = [...(currentEv?.files || [])];
      files.splice(fileIndex, 1);
      updatedEvents[eventIndex] = { ...currentEv, files: files };
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const handleNoteChange = (day, eventIndex, noteIndex, field, value) => {
    setEditData(prev => {
      const updatedEvents = [...(prev?.itinerary?.[day]?.events || [])];
      const currentEv = updatedEvents[eventIndex] || {};
      const notes = [...(currentEv?.notes || [])];
      notes[noteIndex] = { ...(notes[noteIndex] || {}), [field]: value };
      updatedEvents[eventIndex] = { ...currentEv, notes: notes };
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const addNote = (day, eventIndex) => {
    setEditData(prev => {
      const updatedEvents = [...(prev?.itinerary?.[day]?.events || [])];
      const currentEv = updatedEvents[eventIndex] || {};
      const notes = [...(currentEv?.notes || []), { title: "路線指引說明", content: "" }];
      updatedEvents[eventIndex] = { ...currentEv, notes: notes };
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const removeNote = (day, eventIndex, noteIndex) => {
    setEditData(prev => {
      const updatedEvents = [...(prev?.itinerary?.[day]?.events || [])];
      const currentEv = updatedEvents[eventIndex] || {};
      const notes = [...(currentEv?.notes || [])];
      notes.splice(noteIndex, 1);
      updatedEvents[eventIndex] = { ...currentEv, notes: notes };
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const addEvent = (day) => {
    setEditData(prev => {
      const updatedEvents = [...(prev?.itinerary?.[day]?.events || [])];
      let newStartTime = "12:00";
      let newEndTime = "13:00";

      if (updatedEvents.length > 0) {
        const lastEvent = updatedEvents[updatedEvents.length - 1];
        const baseTimeStr = lastEvent.endTime || lastEvent.time || "12:00";
        const parts = baseTimeStr.split(':');
        if (parts.length === 2) {
          let h = parseInt(parts[0], 10);
          let m = parseInt(parts[1], 10) + 30;
          if (m >= 60) {
            h += 1;
            m -= 60;
          }
          if (h >= 24) h = 23;
          const startHStr = String(h).padStart(2, '0');
          const startMStr = String(m).padStart(2, '0');
          newStartTime = `${startHStr}:${startMStr}`;

          let endH = h + 1;
          if (endH >= 24) endH = 23;
          const endHStr = String(endH).padStart(2, '0');
          newEndTime = `${endHStr}:${startMStr}`;
        }
      }

      updatedEvents.push({ 
        time: newStartTime, endTime: newEndTime, icon: "activity", title: "新增活動項目", subtitle: "", note: "", mapUrl: "", 
        attachments: [{ name: "", url: "" }], files: [], notes: [], showResearch: false, researchPoint: "", researchQA: "" 
      });
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const removeEvent = (day, index) => {
    if(window.confirm('確定要移除此項活動？')){
      setEditData(prev => {
        const updatedEvents = [...(prev?.itinerary?.[day]?.events || [])];
        updatedEvents.splice(index, 1);
        return {
          ...prev,
          itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
        };
      });
    }
  };

  const moveEvent = (day, index, direction) => {
    setEditData(prev => {
      const updatedEvents = [...(prev?.itinerary?.[day]?.events || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= updatedEvents.length) return prev;

      const temp = updatedEvents[index];
      updatedEvents[index] = updatedEvents[targetIndex];
      updatedEvents[targetIndex] = temp;

      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const addDay = () => {
    setEditData(prev => {
      const daysCount = Object.keys(prev?.itinerary || {}).length + 1;
      return {
        ...prev,
        itinerary: {
          ...(prev?.itinerary || {}),
          [daysCount]: { date: "10/4", weekday: "週日", title: "延伸考察行程", events: [] }
        }
      };
    });
  };

  const removeDay = (dayNum) => {
    if (dayNum === 1) {
      alert("基底 DAY 1 無法移除");
      return;
    }
    if (window.confirm(`確定要刪除 DAY ${dayNum} 及其所有活動？`)) {
      setEditData(prev => {
        const newItin = { ...(prev?.itinerary || {}) };
        delete newItin[dayNum];
        return { ...prev, itinerary: newItin };
      });
      setSelectedDay(1);
    }
  };

  const handleChecklistChange = (index, value) => {
    setEditData(prev => {
      const newCl = [...(prev?.checklist || [])];
      newCl[index] = { ...(newCl[index] || {}), label: value };
      return { ...prev, checklist: newCl };
    });
  };

  const addChecklistItem = () => {
    setEditData(prev => ({
      ...prev,
      checklist: [...(prev?.checklist || []), { id: Date.now().toString(), label: '新增裝備項目' }]
    }));
  };

  const removeChecklistItem = (index) => {
    setEditData(prev => {
      const newCl = [...(prev?.checklist || [])];
      newCl.splice(index, 1);
      return { ...prev, checklist: newCl };
    });
  };

  const handleInfoCardChange = (cardIdx, field, value) => {
    setEditData(prev => {
      const cards = [...(prev?.infoCards || [])];
      if (!cards[cardIdx]) cards[cardIdx] = {};
      cards[cardIdx] = { ...cards[cardIdx], [field]: value };
      return { ...prev, infoCards: cards };
    });
  };

  const handleInfoItemChange = (cardIdx, itemIdx, field, value) => {
    setEditData(prev => {
      const cards = [...(prev?.infoCards || [])];
      if (!cards[cardIdx]) cards[cardIdx] = {};
      const items = [...(cards[cardIdx]?.items || [])];
      if (!items[itemIdx]) items[itemIdx] = {};
      items[itemIdx] = { ...items[itemIdx], [field]: value };
      cards[cardIdx] = { ...cards[cardIdx], items: items };
      return { ...prev, infoCards: cards };
    });
  };

  const addInfoItem = (cardIdx) => {
    setEditData(prev => {
      const cards = [...(prev?.infoCards || [])];
      if (!cards[cardIdx]) cards[cardIdx] = {};
      const items = [...(cards[cardIdx]?.items || []), { label: "項目名稱", value: "詳細內容" }];
      cards[cardIdx] = { ...cards[cardIdx], items: items };
      return { ...prev, infoCards: cards };
    });
  };

  const removeInfoItem = (cardIdx, itemIdx) => {
    setEditData(prev => {
      const cards = [...(prev?.infoCards || [])];
      if (!cards[cardIdx]) return prev;
      const items = [...(cards[cardIdx]?.items || [])];
      items.splice(itemIdx, 1);
      cards[cardIdx] = { ...cards[cardIdx], items: items };
      return { ...prev, infoCards: cards };
    });
  };

  const addInfoCard = () => {
    setEditData(prev => ({
      ...prev,
      infoCards: [
        ...(prev?.infoCards || []),
        {
          id: Date.now().toString(),
          title: "新增資訊卡片",
          iconType: "info",
          name: "標題名稱",
          items: [{ label: "項目名稱", value: "內容說明" }]
        }
      ]
    }));
  };

  const removeInfoCard = (cardIdx) => {
    if (window.confirm("確定要刪除這張資訊卡片嗎？")) {
      setEditData(prev => {
        const cards = [...(prev?.infoCards || [])];
        cards.splice(cardIdx, 1);
        return { ...prev, infoCards: cards };
      });
    }
  };

  const getEventIcon = (type) => {
    switch(type) {
      case 'activity': return <CalendarDays size={16} />;
      case 'pin': return <MapPin size={16} />;
      case 'coffee': return <Coffee size={16} />;
      case 'hotel': return <Hotel size={16} />;
      case 'plane': return <Plane size={16} />;
      case 'guide': return <Flag size={16} />;
      default: return <CalendarDays size={16} />;
    }
  };

  const getInfoCardIcon = (type) => {
    switch(type) {
      case 'user': return <User size={20} />;
      case 'car': return <Hotel size={20} />;
      case 'gift': return <Gift size={20} />;
      case 'phone': return <PhoneCall size={20} />;
      default: return <Info size={20} />;
    }
  };

  const displayData = isAdmin ? editData : appData;
  const currentDay = displayData?.itinerary?.[selectedDay] || displayData?.itinerary?.[1] || { title: "", events: [] };

  const sortedDayKeys = Object.keys(displayData?.itinerary || {})
    .map(Number)
    .sort((a, b) => a - b);

  const categorizeEventSlot = (ev) => {
    const timeStr = ev.time || "00:00";
    const [h, m] = timeStr.split(':').map(Number);
    const totalMin = h * 60 + (m || 0);

    if (ev.icon === 'coffee' || (totalMin >= 11 * 60 + 15 && totalMin <= 13 * 60)) {
      return 'lunch';
    } else if (totalMin < 11 * 60 + 15) {
      return 'morning';
    } else {
      return 'afternoon';
    }
  };

  // 根據行程標籤指定行程顏色
  const getEventBgColor = (ev) => {
    const icon = ev.icon || 'activity';
    if (['plane', 'coffee', 'hotel'].includes(icon)) {
      return 'bg-[#E4EEF8] border-[#CCE0F3]'; // 藍色
    }
    if (icon === 'guide') {
      return 'bg-[#EBF7EE] border-[#CDEBD4]'; // 綠色
    }
    return 'bg-[#FFF6E5] border-[#FDE5BE]'; // 黃色
  };

  // 取得整份行程中出現的活動類別，動態輸出圖例
  const allEvents = Object.values(displayData?.itinerary || {}).flatMap(d => d.events || []);
  const hasTripEvents = allEvents.some(e => ['plane', 'coffee', 'hotel'].includes(e.icon));
  const hasVisitEvents = allEvents.some(e => ['activity', 'pin', undefined, ''].includes(e.icon));
  const hasGuideEvents = allEvents.some(e => e.icon === 'guide');

  const renderContent = () => {
    switch (activeTab) {
      case 'itinerary':
        return (
          <div className="p-4 animate-in fade-in duration-300 pb-20">
            {isAdmin && (
              <div className="bg-[#F8FAFC] border-2 border-[#2563EB] p-4 rounded mb-6 shadow-sm space-y-3 font-mono">
                <div className="text-xs font-bold text-[#1E293B] border-b border-gray-200 pb-2 flex items-center justify-between">
                  <span className="flex items-center"><Edit3 size={16} className="mr-1.5 text-[#2563EB]" /> 🔧 管理員：展會基本資訊設定</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">目前行程代碼: {currentTourId}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-0.5">品牌名稱</label>
                    <input className="w-full text-xs border rounded p-1 bg-white font-bold" value={editData?.brandName || ""} onChange={(e) => setEditData({...editData, brandName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-0.5">展會日期</label>
                    <input className="w-full text-xs border rounded p-1 bg-white" value={editData?.eventDate || ""} onChange={(e) => setEditData({...editData, eventDate: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-0.5">活動大標題</label>
                  <input className="w-full text-xs border rounded p-1 bg-white font-bold" value={editData?.eventTitle || ""} onChange={(e) => setEditData({...editData, eventTitle: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-0.5">展覽地點</label>
                  <input className="w-full text-xs border rounded p-1 bg-white" value={editData?.eventLocation || ""} onChange={(e) => setEditData({...editData, eventLocation: e.target.value})} />
                </div>
              </div>
            )}

            <div className="bg-[#1A2332] text-[#E2E8F0] p-5 rounded shadow-md border-l-4 border-[#3B82F6] mb-6 relative overflow-hidden font-mono">
              <div className="relative z-10">
                <div className="text-[10px] tracking-widest text-[#60A5FA] mb-1">EQUITY RESEARCH // 2026</div>
                <h2 className="text-xl font-black tracking-tight">{displayData?.eventTitle}</h2>
                <div className="flex items-center text-xs opacity-80 mt-3">
                  <MapPin size={13} className="mr-1 text-[#60A5FA] shrink-0" />
                  <span>{displayData?.eventLocation}</span>
                </div>
                <div className="text-xs opacity-70 mt-0.5">{displayData?.eventDate}</div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-[10px] font-mono text-[#2563EB] font-bold tracking-widest">TIMELINE</div>
                <h2 className="text-xl font-black text-[#0F172A] font-mono">行程議程總覽</h2>
              </div>
            </div>
            
            <p className="text-[11px] text-gray-500 mb-4 font-mono">
              {isAdmin ? "🔧 管理員模式：可編輯標題、用上下箭頭調整順序。" : "點擊下方日期檢視當日詳細參訪與會議安排。"}
            </p>

            {/* 日期列 */}
            <div className="sticky top-14 z-40 bg-[#F8FAFC] border-2 border-[#CBD5E1] rounded-lg p-1.5 flex items-center mb-4 shadow-xl gap-1 overflow-x-auto max-w-full scrollbar-none">
              {Object.keys(displayData?.itinerary || {}).map((dayNumStr) => {
                const dayNum = Number(dayNumStr);
                const dayInfo = displayData?.itinerary?.[dayNum] || {};
                return (
                  <div key={dayNum} className="relative group shrink-0">
                    <button 
                      onClick={() => setSelectedDay(dayNum)} 
                      className={`flex flex-col items-center py-1 px-2.5 rounded transition-all font-mono focus:outline-none focus:ring-0 shrink-0 ${
                        selectedDay === dayNum ? 'bg-[#1E293B] text-white shadow' : 'text-[#475569] hover:text-[#0F172A] bg-white border border-gray-200'
                      }`}
                    >
                      <span className="text-[8px] opacity-80">D-{dayNum}</span>
                      {isAdmin ? (
                        <div className="space-y-0.5 text-center">
                          <input className="w-9 text-center text-[10px] font-black bg-white border rounded text-[#1E293B] focus:outline-none" value={dayInfo.date} onChange={(e) => {
                            const newItin = {...editData.itinerary};
                            newItin[dayNum].date = e.target.value;
                            setEditData({...editData, itinerary: newItin});
                          }} />
                          <input className="w-9 text-center text-[8px] bg-white border rounded text-gray-500 focus:outline-none" value={dayInfo.weekday} onChange={(e) => {
                            const newItin = {...editData.itinerary};
                            newItin[dayNum].weekday = e.target.value;
                            setEditData({...editData, itinerary: newItin});
                          }} />
                        </div>
                      ) : (
                        <>
                          <span className="text-[11px] font-black">{dayInfo?.date}</span>
                          <span className="text-[8px] opacity-70">{dayInfo?.weekday}</span>
                        </>
                      )}
                    </button>
                    {isAdmin && dayNum !== 1 && (
                      <button onClick={() => removeDay(dayNum)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                        <Trash2 size={9} />
                      </button>
                    )}
                  </div>
                );
              })}

              {isAdmin && (
                <button onClick={addDay} className="flex flex-col items-center justify-center py-2 px-2.5 rounded text-[#334155] bg-white hover:bg-gray-50 border border-dashed border-[#2563EB] shrink-0 font-mono shadow-sm">
                  <PlusCircle size={14} />
                  <span className="text-[8px] font-bold mt-0.5">+ 天數</span>
                </button>
              )}
            </div>

            <div className="text-center border-b border-[#CBD5E1] pb-4 mb-5">
              <span className="bg-[#1E293B] text-white font-mono text-[9px] font-bold px-2.5 py-0.5 rounded mb-1.5 inline-block tracking-wider">DAY {selectedDay}</span>
              {isAdmin ? (
                <input className="w-3/4 mx-auto text-center text-base font-bold text-[#0F172A] border-b border-dashed border-gray-400 bg-transparent focus:outline-none block font-mono" value={currentDay?.title || ""} onChange={(e) => {
                  const newItin = {...editData.itinerary};
                  newItin[selectedDay].title = e.target.value;
                  setEditData({...editData, itinerary: newItin});
                }} placeholder="輸入行程主題" />
              ) : (
                <h3 className="text-base font-bold text-[#0F172A] font-mono">{currentDay?.title}</h3>
              )}
            </div>

            <div className="relative">
              {currentDay?.events && currentDay.events.length > 0 ? currentDay.events.map((ev, idx) => {
                return (
                  <div key={idx} className="flex mb-5 relative group font-mono">
                    {idx !== currentDay.events.length - 1 && <div className="absolute left-[66px] top-6 bottom-[-24px] w-[2px] bg-[#CBD5E1] z-0"></div>}
                    
                    <div className="w-14 shrink-0 text-right pr-2.5 pt-3">
                      {isAdmin ? (
                        <div className="space-y-1">
                          <input className="w-full text-right text-xs font-black text-[#0F172A] border border-gray-300 rounded px-1 bg-white" value={ev?.time || ""} onChange={(e) => handleEventChange(selectedDay, idx, 'time', e.target.value)} placeholder="09:00" />
                          <input className="w-full text-right text-[9px] text-gray-500 border border-gray-300 rounded px-1 bg-white" value={ev?.endTime || ""} onChange={(e) => handleEventChange(selectedDay, idx, 'endTime', e.target.value)} placeholder="結束" />
                        </div>
                      ) : (
                        <>
                          <div className="text-xs font-black text-[#0F172A]">{ev?.time}</div>
                          {ev?.endTime && <div className="text-[9px] text-gray-500">— {ev.endTime}</div>}
                        </>
                      )}
                    </div>
                    
                    <div className="w-4 flex justify-center pt-3.5 relative z-10 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-[#2563EB] bg-white"></div>
                    </div>
                    
                    <div className={`flex-1 ml-2.5 bg-white border ${isAdmin ? 'border-[#2563EB]' : 'border-[#CBD5E1]'} rounded p-3.5 shadow-sm relative`}>
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <div className="flex bg-gray-100 rounded border border-gray-300 overflow-hidden">
                            <button onClick={() => moveEvent(selectedDay, idx, 'up')} disabled={idx === 0} title="往上移" className="p-1 hover:bg-gray-200 text-gray-700 disabled:opacity-30 border-r border-gray-300">
                              <ArrowUp size={13} />
                            </button>
                            <button onClick={() => moveEvent(selectedDay, idx)} disabled={idx === currentDay.events.length - 1} title="往下移" className="p-1 hover:bg-gray-200 text-gray-700 disabled:opacity-30">
                              <ArrowDown size={13} />
                            </button>
                          </div>

                          <button onClick={() => removeEvent(selectedDay, idx)} className="text-red-600 hover:text-red-800 p-1 bg-red-50 rounded">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}

                      <div className="flex items-start">
                        <div className="bg-[#F1F5F9] text-[#1E293B] p-2 rounded mr-2.5 shrink-0">
                          {isAdmin ? (
                            <select className="bg-transparent text-xs text-[#1E293B] focus:outline-none font-mono" value={ev?.icon || "activity"} onChange={(e) => handleEventChange(selectedDay, idx, 'icon', e.target.value)}>
                              <option value="activity">📅 活動</option>
                              <option value="pin">📍 地標</option>
                              <option value="coffee">☕ 餐飲</option>
                              <option value="hotel">🏨 飯店</option>
                              <option value="plane">✈️ 班機</option>
                              <option value="guide">🚩 導覽</option>
                            </select>
                          ) : getEventIcon(ev?.icon)}
                        </div>
                        
                        <div className="flex-1 w-full mr-3">
                          {isAdmin ? (
                            <div className="space-y-1.5 w-full pt-8">
                              <input className="w-full font-bold text-[#0F172A] border-b border-gray-200 bg-[#F8FAFC] px-1 text-xs" value={ev?.title || ""} onChange={(e) => handleEventChange(selectedDay, idx, 'title', e.target.value)} placeholder="主標題 (公司/參訪名稱)" />
                              
                              {/* 支援換行排版的副標題 Textarea */}
                              <textarea 
                                className="w-full text-[11px] text-gray-700 border border-gray-300 rounded bg-[#F8FAFC] p-1.5 focus:bg-white focus:outline-none" 
                                rows="2"
                                value={ev?.subtitle || ""} 
                                onChange={(e) => handleEventChange(selectedDay, idx, 'subtitle', e.target.value)} 
                                placeholder="副標題 (可直接按 Enter 換行，例如接洽窗口與職稱)" 
                              />

                              <input className="w-full text-[10px] text-gray-500 border-b border-gray-200 bg-[#F8FAFC] px-1" value={ev?.note || ""} onChange={(e) => handleEventChange(selectedDay, idx, 'note', e.target.value)} placeholder="地址或備註" />
                              
                              <div className="pt-1.5 mt-1.5 border-t border-dashed border-gray-200 space-y-1.5">
                                <input className="w-full text-[10px] border border-gray-300 rounded px-1.5 py-0.5 bg-white" value={ev?.mapUrl || ""} onChange={(e) => handleEventChange(selectedDay, idx, 'mapUrl', e.target.value)} placeholder="Google Maps 連結" />
                                
                                <div className="space-y-1 pt-1">
                                  <div className="text-[10px] font-bold text-[#2563EB]">附件列表：</div>
                                  {(ev?.attachments || [{ name: "", url: "" }]).map((att, attIdx) => (
                                    <div key={attIdx} className="flex items-center gap-1">
                                      <input 
                                        className="w-1/3 text-[10px] border border-gray-300 rounded px-1.5 py-0.5 bg-white font-bold" 
                                        value={att?.name || ""} 
                                        onChange={(e) => handleAttachmentChange(selectedDay, idx, attIdx, 'name', e.target.value)} 
                                        placeholder="預覽名稱 (如手冊)" 
                                      />
                                      <input 
                                        className="flex-1 text-[10px] border border-gray-300 rounded px-1.5 py-0.5 bg-white" 
                                        value={att?.url || ""} 
                                        onChange={(e) => handleAttachmentChange(selectedDay, idx, attIdx, 'url', e.target.value)} 
                                        placeholder="網址" 
                                      />
                                      <button onClick={() => removeAttachment(selectedDay, idx, attIdx)} className="text-red-600 p-0.5 bg-red-50 rounded">
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                  <button onClick={() => addAttachment(selectedDay, idx)} className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 border-dashed mt-1">
                                    + 新增附件
                                  </button>
                                </div>

                                <div className="space-y-1.5 pt-2 border-t border-gray-200">
                                  <div className="text-[10px] font-bold text-[#2563EB]">路線圖 / 照片 (點擊直接選取手機或電腦圖片)：</div>
                                  {(ev?.files || []).map((file, fIdx) => (
                                    <div key={fIdx} className="flex items-center justify-between bg-gray-50 border rounded px-2 py-1 text-[10px]">
                                      <span className="font-bold truncate max-w-[180px]">🖼️ {file.name}</span>
                                      <button onClick={() => removeFile(selectedDay, idx, fIdx)} className="text-red-600 p-0.5 bg-red-50 rounded">
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                  <label className="inline-flex items-center text-[10px] font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition-all">
                                    {uploadingIndex === idx ? (
                                      <>
                                        <Loader2 size={12} className="mr-1.5 animate-spin" /> 優化處理中...
                                      </>
                                    ) : (
                                      <>
                                        <Upload size={12} className="mr-1.5" /> ＋ 選擇圖片自動加入
                                      </>
                                    )}
                                    <input 
                                      type="file" 
                                      accept="image/*"
                                      className="hidden" 
                                      disabled={uploadingIndex !== null}
                                      onChange={(e) => handleFileUpload(selectedDay, idx, e)} 
                                    />
                                  </label>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-gray-200">
                                  <div className="text-[10px] font-bold text-[#2563EB]">路線引導 / 文字筆記：</div>
                                  {(ev?.notes || []).map((note, noteIdx) => (
                                    <div key={noteIdx} className="bg-[#F8FAFC] p-2.5 rounded border border-gray-200 space-y-1.5">
                                      <div className="flex items-center gap-1">
                                        <input 
                                          className="flex-1 text-[11px] font-bold border border-gray-300 rounded px-1.5 py-0.5 bg-white text-[#0F172A]" 
                                          value={note?.title || ""} 
                                          onChange={(e) => handleNoteChange(selectedDay, idx, noteIdx, 'title', e.target.value)} 
                                          placeholder="按鈕名稱 (例如: 接待辦理方式)" 
                                        />
                                        <button onClick={() => removeNote(selectedDay, idx, noteIdx)} className="text-red-600 p-1 bg-red-50 rounded">
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                      <textarea 
                                        className="w-full text-[10px] border border-gray-300 rounded p-1.5 bg-white" 
                                        rows="3"
                                        value={note?.content || ""} 
                                        onChange={(e) => handleNoteChange(selectedDay, idx, noteIdx, 'content', e.target.value)} 
                                        placeholder="輸入詳細文字路線指引說明..." 
                                      />
                                    </div>
                                  ))}
                                  <button onClick={() => addNote(selectedDay, idx)} className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-1 rounded border border-blue-200 border-dashed mt-1">
                                    + 新增路線筆記
                                  </button>
                                </div>

                                <div className="pt-2 border-t border-gray-200 space-y-2">
                                  <label className="flex items-center text-xs font-bold text-[#2563EB] cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      className="mr-1.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                      checked={ev?.showResearch || false}
                                      onChange={(e) => handleEventChange(selectedDay, idx, 'showResearch', e.target.checked)}
                                    />
                                    📌 啟用研究重點與預計 QA 欄位
                                  </label>

                                  {ev?.showResearch && (
                                    <div className="space-y-2 bg-[#F8FAFC] p-2 rounded border border-blue-100">
                                      <div>
                                        <label className="text-[9px] font-bold text-gray-500 block mb-0.5">研究重點內容：</label>
                                        <textarea 
                                          className="w-full text-[11px] border rounded p-1 bg-white" 
                                          rows="2"
                                          value={ev?.researchPoint || ""} 
                                          onChange={(e) => handleEventChange(selectedDay, idx, 'researchPoint', e.target.value)}
                                          placeholder="請輸入重點摘要..."
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[9px] font-bold text-gray-500 block mb-0.5">預計 QA 內容：</label>
                                        <textarea 
                                          className="w-full text-[11px] border rounded p-1 bg-white" 
                                          rows="2"
                                          value={ev?.researchQA || ""} 
                                          onChange={(e) => handleEventChange(selectedDay, idx, 'researchQA', e.target.value)}
                                          placeholder="請輸入預計 QA..."
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="font-bold text-[#0F172A] text-xs">{ev?.title}</div>
                              {ev?.subtitle && <div className="text-[11px] text-gray-600 mt-0.5 whitespace-pre-line leading-relaxed">{ev.subtitle}</div>}
                              {ev?.note && <div className="text-[10px] text-[#2563EB] mt-1 font-sans">{ev.note}</div>}
                            </>
                          )}
                        </div>
                      </div>
                      
                      {!isAdmin && (
                        <div className="flex flex-wrap gap-2 mt-2.5 pt-2.5 border-t border-[#F1F5F9] font-sans items-center">
                          {ev?.mapUrl && (
                            <a href={ev.mapUrl} target="_blank" rel="noreferrer" className="flex items-center text-[10px] font-bold text-[#1E293B] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-2.5 py-1 rounded transition-colors">
                              <MapPin size={11} className="mr-1 text-[#2563EB]" /> Google Maps
                            </a>
                          )}
                          
                          {/* 報告/附件按鈕 */}
                          {ev?.attachments && ev.attachments.map((att, i) => att?.url ? (
                            <button 
                              key={i} 
                              onClick={() => setModalContent({ eventTitle: ev?.title || "行程", title: `📄 ${att.name || '報告連結'}`, webUrl: att.url })}
                              className="flex items-center text-[10px] font-bold text-[#1E293B] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-2.5 py-1 rounded transition-colors"
                            >
                              <LinkIcon size={11} className="mr-1 text-[#2563EB]" /> {att.name || `附件 ${i + 1}`}
                            </button>
                          ) : null)}

                          {/* 路線圖片按鈕 */}
                          {ev?.files && ev.files.map((file, i) => file?.url ? (
                            <button 
                              key={i} 
                              onClick={() => setModalContent({ eventTitle: ev?.title || "行程", title: `🖼️ ${file.name || '路線引導圖'}`, imageUrl: file.url })}
                              className="flex items-center text-[10px] font-bold text-[#1E293B] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors border border-blue-200"
                            >
                              <ImageIcon size={11} className="mr-1 text-[#2563EB]" /> {file.name || `路線圖 ${i + 1}`}
                            </button>
                          ) : null)}

                          {/* 路線文字筆記按鈕 */}
                          {ev?.notes && ev.notes.map((note, i) => note?.title ? (
                            <button 
                              key={i} 
                              onClick={() => setModalContent({ eventTitle: ev?.title || "行程", title: `🗺️ ${note.title}`, text: note.content })}
                              className="flex items-center text-[10px] font-bold text-white bg-slate-700 hover:bg-slate-800 px-3 py-1 rounded-lg shadow-sm transition-all"
                            >
                              🗺️ {note.title}
                            </button>
                          ) : null)}

                          {ev?.showResearch && ev?.researchPoint && (
                            <button 
                              onClick={() => setModalContent({ eventTitle: ev?.title || "行程", title: "📌 研究重點摘要", text: ev.researchPoint })}
                              className="flex items-center text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg shadow-sm transition-all"
                            >
                              📌 研究重點
                            </button>
                          )}

                          {ev?.showResearch && ev?.researchQA && (
                            <button 
                              onClick={() => setModalContent({ eventTitle: ev?.title || "行程", title: "❓ 預計 QA 討論", text: ev.researchQA })}
                              className="flex items-center text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg shadow-sm transition-all"
                            >
                              ❓ 預計 QA
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-gray-400 font-mono text-xs">尚無建立排程</div>
              )}
              
              {isAdmin && (
                <div className="ml-[72px] mt-2 font-mono">
                  <button onClick={() => addEvent(selectedDay)} className="flex items-center text-xs font-bold text-[#1E293B] bg-[#F8FAFC] px-3.5 py-2 rounded border border-[#2563EB] border-dashed hover:bg-[#E2E8F0]">
                    <PlusCircle size={15} className="mr-1.5 text-[#2563EB]" /> 新增活動
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'checklist':
        return (
          <div className="p-4 animate-in fade-in duration-300 font-mono pb-20">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-[10px] text-[#2563EB] font-bold tracking-widest mb-1">COMPLIANCE & CHECK</div>
                <h2 className="text-xl font-black text-[#0F172A]">行前裝備清單</h2>
              </div>
            </div>
            
            <p className="text-[11px] text-gray-500 mb-4">勾選狀態僅保留在當前終端裝置，管理員可編輯項目。</p>

            {isAdmin && (
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded mb-4 space-y-2">
                <div className="text-xs font-bold text-[#334155] mb-2">🔧 管理員：編輯裝備項目</div>
                {(displayData?.checklist || []).map((item, idx) => (
                  <div key={item?.id || idx} className="flex items-center gap-2">
                    <input className="flex-1 text-xs border border-gray-300 rounded p-1.5 bg-white" value={item?.label || ""} onChange={(e) => handleChecklistChange(idx, e.target.value)} />
                    <button onClick={() => removeChecklistItem(idx)} className="text-red-600 p-1 bg-red-50 rounded hover:bg-red-100"><Trash2 size={14} /></button>
                  </div>
                ))}
                <button onClick={addChecklistItem} className="flex items-center text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1.5 rounded border border-blue-200 border-dashed mt-2">
                  <PlusCircle size={14} className="mr-1" /> 新增裝備項目
                </button>
              </div>
            )}

            <div className="bg-white rounded shadow-sm border border-[#CBD5E1] overflow-hidden">
               {(displayData?.checklist || []).map((item) => (
                 <div key={item?.id} onClick={() => toggleCheck(item?.id)} className="flex items-center p-3.5 border-b border-[#F1F5F9] last:border-b-0 cursor-pointer hover:bg-[#F8FAFC]">
                   <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${userChecklist[item?.id] ? 'border-[#1E293B] bg-[#1E293B]' : 'border-[#CBD5E1]'}`}>
                     {userChecklist[item?.id] && <CheckSquare size={13} className="text-white" />}
                   </div>
                   <span className={`text-xs font-medium ${userChecklist[item?.id] ? 'text-gray-400 line-through' : 'text-[#0F172A]'}`}>{item?.label}</span>
                 </div>
               ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-4 space-y-6 animate-in fade-in duration-300 font-mono pb-20">
            <div className="flex justify-between items-center mb-1">
              <div>
                <div className="text-[10px] text-[#2563EB] font-bold tracking-widest mb-1">INFORMATION & CONTACT</div>
                <h2 className="text-xl font-black text-[#0F172A]">資訊與聯絡窗口</h2>
              </div>
            </div>

            {isAdmin && (
              <div className="bg-[#F8FAFC] border-2 border-[#2563EB] p-4 rounded-xl shadow-sm space-y-4 text-xs">
                <div className="font-bold text-[#1E293B] flex items-center justify-between border-b pb-2">
                  <span>🔧 管理員：管理資訊卡片 (自訂圖示與明細)</span>
                  <button onClick={addInfoCard} className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center shadow">
                    <PlusCircle size={13} className="mr-1" /> 新增資訊卡片
                  </button>
                </div>

                {(displayData?.infoCards || []).map((card, cIdx) => (
                  <div key={card?.id || cIdx} className="bg-white border border-gray-300 p-3 rounded-lg space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between gap-2 border-b pb-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input className="border rounded p-1 text-[11px] font-bold" value={card?.title || ""} onChange={(e) => handleInfoCardChange(cIdx, 'title', e.target.value)} placeholder="卡片大標題 (如 主要聯絡窗口)" />
                        <select className="border rounded p-1 text-[10px] bg-white" value={card?.iconType || "info"} onChange={(e) => handleInfoCardChange(cIdx, 'iconType', e.target.value)}>
                          <option value="user">👤 聯絡人</option>
                          <option value="car">🚗 司機/交通</option>
                          <option value="gift">🎁 伴手禮/禮品</option>
                          <option value="info">📌 其他資訊</option>
                        </select>
                      </div>
                      <button onClick={() => removeInfoCard(cIdx)} className="text-red-600 p-1.5 bg-red-50 hover:bg-red-100 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1">
                      <input className="border rounded p-1 text-[11px] font-bold" value={card?.name || ""} onChange={(e) => handleInfoCardChange(cIdx, 'name', e.target.value)} placeholder="主要名稱 (如 Peter Liu)" />
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold text-[#2563EB]">明細欄位 (左邊填標題，右邊填內容)：</div>
                      {(card?.items || []).map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-1.5">
                          <input 
                            className="w-1/3 text-[10px] border border-gray-300 rounded px-1.5 py-1 bg-white font-bold text-gray-700" 
                            value={item?.label || ""} 
                            onChange={(e) => handleInfoItemChange(cIdx, itemIdx, 'label', e.target.value)} 
                            placeholder="標題 (如 LINE ID)" 
                          />
                          <input 
                            className="flex-1 text-[10px] border border-gray-300 rounded px-1.5 py-1 bg-white" 
                            value={item?.value || ""} 
                            onChange={(e) => handleInfoItemChange(cIdx, itemIdx, 'value', e.target.value)} 
                            placeholder="內容 (如 lowgeliu)" 
                          />
                          <button onClick={() => removeInfoItem(cIdx, itemIdx)} className="text-red-600 p-1 bg-red-50 rounded">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addInfoItem(cIdx)} className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-1 rounded border border-blue-200 border-dashed mt-1">
                        + 新增資訊項目
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {(displayData?.infoCards || []).map((card, cIdx) => (
                <div key={card?.id || cIdx} className="bg-[#1A2332] text-white rounded-lg shadow-md overflow-hidden border-t-2 border-[#3B82F6]">
                  <div className="p-4 flex items-center border-b border-[#2D3748]">
                    <div className="bg-[#2563EB] text-white rounded p-2.5 mr-3">
                      {getInfoCardIcon(card?.iconType)}
                    </div>
                    <div>
                      <div className="text-base font-bold">{card?.title}</div>
                      {card?.name && <div className="text-xs opacity-80 mt-0.5">{card?.name}</div>}
                    </div>
                  </div>
                  <div className="p-4 space-y-3 bg-[#111827] text-xs">
                    {(card?.items || []).map((item, itemIdx) => (
                      <div key={itemIdx}>
                        <div className="text-[9px] opacity-60 uppercase">{item?.label}</div>
                        <div className="font-bold tracking-wider mt-0.5">{item?.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6 pb-4 text-center">
              <button onClick={handleAdminLogin} className="text-[#64748B] hover:text-[#0F172A] flex items-center justify-center w-full text-xs font-bold transition-colors">
                <Shield size={14} className="mr-1 text-[#2563EB]" />{isAdmin ? '登出後台管理' : '系統後台解鎖'}
              </button>
            </div>
          </div>
        );
      default:
        return <div className="p-10 text-center text-gray-400 font-mono">系統建置中...</div>;
    }
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: visible !important;
          }
          .app-main-view, .no-print {
            display: none !important;
          }
          .print-target-modal {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: #ffffff !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            align-items: stretch !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            z-index: 999999 !important;
          }
          .print-table-wrapper {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            zoom: 82% !important;
          }
          table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* 網頁主容器 */}
      <div className="app-main-view max-w-md mx-auto bg-[#F8FAFC] min-h-screen pb-28 font-sans shadow-2xl relative border-x border-[#CBD5E1]">
        {/* 頂部導覽列 */}
        <div className="bg-white border-b border-[#CBD5E1] shadow-sm sticky top-0 z-50 px-4 py-2.5">
          <div className="flex justify-between items-center">
            <div className="text-[#0F172A] font-black text-xs md:text-sm tracking-widest font-mono flex items-center">
              <TrendingUp size={16} className="mr-1.5 text-[#2563EB]" /> {appData?.brandName}
            </div>
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] bg-[#2563EB] text-white px-2 py-0.5 rounded font-mono font-bold tracking-widest">ADMIN</span>
              </div>
            ) : (
              currentTourId !== 'default' && (
                <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold border">
                  {currentTourId}
                </span>
              )
            )}
          </div>

          {isAdmin && (
            <div className="mt-2 pt-2 border-t border-gray-100 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-bold shrink-0">行程切換:</span>
                <select 
                  className="flex-1 bg-gray-50 border border-gray-300 rounded px-1.5 py-1 text-[11px] font-bold text-[#0F172A]"
                  value={currentTourId}
                  onChange={(e) => handleSwitchTour(e.target.value)}
                >
                  {availableTours.map((t) => (
                    <option key={t} value={t}>
                      {t === 'default' ? 'default (預設 Semicon JP)' : t}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleCreateNewTour} 
                  title="建立全新行程空間"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-1 rounded text-[10px] shrink-0 shadow-sm"
                >
                  + 新增
                </button>
                <button 
                  onClick={handleCopyLink} 
                  title="複製此行程專屬分享網址"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-1.5 rounded border border-gray-300 shrink-0 flex items-center"
                >
                  {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                </button>
              </div>

              {/* 輸出詳細行程表 + 匯出垂直版 DM 按鈕 */}
              <div className="pt-1 space-y-1">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowMatrixModal(true)}
                    className="w-full bg-[#1E293B] hover:bg-[#0F172A] text-white font-bold py-1.5 px-2 rounded text-[10.5px] flex items-center justify-center shadow transition-colors"
                  >
                    <Table size={12} className="mr-1 text-blue-400 shrink-0" /> 輸出詳細行程表
                  </button>
                  <button
                    type="button"
                    onClick={handleExportVerticalDm}
                    disabled={exportingDm}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold py-1.5 px-2 rounded text-[10.5px] flex items-center justify-center shadow transition-colors"
                  >
                    {exportingDm ? (
                      <><Loader2 size={12} className="mr-1 animate-spin shrink-0" /> 產出中...</>
                    ) : (
                      <><FileText size={12} className="mr-1 shrink-0" /> {includePngWithDm ? '匯出 DM (PNG)' : '匯出 DM (PPT)'}</>
                    )}
                  </button>
                </div>
                <label className="flex items-center justify-end text-[10px] text-gray-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includePngWithDm}
                    onChange={(e) => setIncludePngWithDm(e.target.checked)}
                    className="mr-1 rounded border-gray-300"
                  />
                  僅匯出圖片 (PNG)
                </label>
              </div>
            </div>
          )}
        </div>
        
        {renderContent()}

        {isAdmin && (
          <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-40 pointer-events-none animate-in fade-in duration-200">
            <button 
              onClick={handleSaveToCloud}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 px-4 rounded-xl shadow-xl flex items-center justify-center font-mono text-sm pointer-events-auto border-2 border-white/20 active:scale-95 transition-all"
            >
              <Save size={18} className="mr-2" /> 💾 儲存所有變更並同步至雲端
            </button>
          </div>
        )}

        {/* 底部導覽列 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#CBD5E1] flex justify-around p-1.5 pb-7 max-w-md mx-auto z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          {[
            { id: 'itinerary', icon: Calendar, label: '行程' },
            { id: 'checklist', icon: CheckSquare, label: '裝備' },
            { id: 'contact', icon: Info, label: '資訊' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center p-1.5 w-20 transition-colors font-mono ${activeTab === tab.id ? 'text-[#2563EB]' : 'text-gray-400 hover:text-gray-600'}`}>
              <tab.icon size={20} className="mb-0.5" />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 單一項目彈跳視窗 Modal (no-print) */}
      {modalContent && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 animate-in fade-in duration-200 overscroll-contain no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalContent(null);
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-4 shadow-2xl border border-gray-100 space-y-3 font-mono relative flex flex-col max-h-[88vh] overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b pb-2 shrink-0">
              <div className="pr-6">
                <div className="text-xs font-bold text-[#2563EB] mb-0.5">📍 {modalContent.eventTitle}</div>
                <div className="text-sm font-black text-[#0F172A] truncate max-w-[260px]">{modalContent.title}</div>
              </div>
              <button 
                onClick={() => setModalContent(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 bg-gray-100 rounded-full shrink-0"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y">
              {modalContent.webUrl ? (
                <div className="h-[62vh] flex flex-col space-y-2">
                  <iframe 
                    src={modalContent.webUrl} 
                    title="報告預覽" 
                    className="w-full flex-1 border border-gray-200 rounded-lg shadow-inner bg-white"
                  />
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1 shrink-0">
                    <span>💡 若內容無法載入，可點右側：</span>
                    <a 
                      href={modalContent.webUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-blue-600 underline font-bold flex items-center"
                    >
                      於新視窗開啟 <ExternalLink size={10} className="ml-0.5" />
                    </a>
                  </div>
                </div>
              ) : modalContent.imageUrl ? (
                <div className="text-center space-y-2 py-2">
                  <img src={modalContent.imageUrl} alt="路線引導圖" className="w-full rounded-lg shadow-md mx-auto object-contain bg-white" />
                  <div className="text-[10px] text-gray-400">💡 可於視窗中自由查看清晰路線細節</div>
                </div>
              ) : (
                <div className="text-xs text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
                  {modalContent.text}
                </div>
              )}
            </div>

            <button 
              onClick={() => setModalContent(null)}
              className="w-full bg-[#1E293B] hover:bg-[#0F172A] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shrink-0"
            >
              關閉預覽視窗
            </button>
          </div>
        </div>
      )}

      {/* 自訂密碼輸入 Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPasswordModal(false);
          }}
        >
          <form
            onSubmit={handleConfirmAdminPassword}
            className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-gray-200 space-y-3 font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-black text-[#0F172A]">🔐 外資分析管理解鎖</span>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-[11px] text-gray-500">請輸入管理密碼（預設為 1234）：</p>
            <input
              type="password"
              autoFocus
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="輸入密碼"
              className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-lg text-xs"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-2 rounded-lg text-xs"
              >
                確認解鎖
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 外資矩陣行程總表 Modal */}
      {showMatrixModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 md:p-6 animate-in fade-in duration-200 overscroll-contain print:p-0 print:bg-white"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMatrixModal(false);
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-6xl w-full h-[92vh] shadow-2xl flex flex-col font-sans overflow-hidden border border-gray-200 print-target-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 頂部操作按鈕 (no-print) */}
            <div className="p-3 bg-gray-50 border-b flex justify-between items-center shrink-0 no-print">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-[#0F172A]">📊 外資矩陣行程總表預覽</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
                  {displayData?.eventTitle}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center shadow transition-all cursor-pointer"
                >
                  <Printer size={13} className="mr-1" /> 列印 / 另存 PDF
                </button>
                <button 
                  onClick={() => setShowMatrixModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 表格容器 */}
            <div className="flex-1 overflow-auto p-4 md:p-6 bg-white print:p-0 print:overflow-visible">
              <div className="w-full border border-gray-300 rounded overflow-hidden bg-white print-table-wrapper print:border-gray-400">
                
                {/* 報表大標題與動態圖例 */}
                <div className="px-3 py-2 bg-white border-b border-gray-300 flex justify-between items-center shrink-0">
                  <div className="flex items-baseline space-x-3">
                    <h1 className="text-2xl font-black tracking-tight text-[#003B73] font-serif">行程表</h1>
                    <span className="text-[10px] font-bold text-gray-500 font-mono tracking-wider uppercase">
                      {displayData?.brandName} // {displayData?.eventDate}
                    </span>
                  </div>

                  {/* 動態圖例：根據當前活動是否存在而精準顯示 */}
                  <div className="flex items-center space-x-3 text-[10px] font-bold text-gray-700">
                    {hasTripEvents && (
                      <div className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-[#E4EEF8] border border-[#CCE0F3] mr-1 rounded-xs"></span> 行程
                      </div>
                    )}
                    {hasVisitEvents && (
                      <div className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-[#FFF6E5] border border-[#FDE5BE] mr-1 rounded-xs"></span> 參訪行程
                      </div>
                    )}
                    {hasGuideEvents && (
                      <div className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-[#EBF7EE] border border-[#CDEBD4] mr-1 rounded-xs"></span> 導覽行程
                      </div>
                    )}
                  </div>
                </div>

                {/* 橫向矩陣表格 */}
                <table className="w-full border-collapse text-left text-[10px] table-fixed">
                  <thead>
                    <tr className="bg-[#003B73] text-white">
                      <th className="p-1.5 w-10 text-center border-r border-blue-900 font-bold">時段</th>
                      {sortedDayKeys.map((dayNum) => {
                        const day = displayData?.itinerary?.[dayNum];
                        return (
                          <th key={dayNum} className="p-1.5 border-r border-blue-900 last:border-r-0 text-center font-bold">
                            <div>DAY {dayNum}</div>
                            <div className="text-[9px] opacity-90">{day?.date} ({day?.weekday})</div>
                          </th>
                        );
                      })}
                    </tr>
                    <tr className="bg-[#F8FAFC] border-b border-gray-300 text-gray-700">
                      <th className="p-1 text-center border-r border-gray-300 bg-gray-100 font-bold text-[9px]">集合</th>
                      {sortedDayKeys.map((dayNum) => {
                        const day = displayData?.itinerary?.[dayNum];
                        const firstEventNote = day?.events?.[0]?.note || "大廳集合";
                        return (
                          <td key={dayNum} className="p-1 text-center border-r border-gray-300 last:border-r-0 text-[8.5px] font-bold text-gray-600 truncate">
                            {firstEventNote}
                          </td>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {/* 上午區塊 */}
                    <tr className="border-b border-gray-300">
                      <td className="p-1 text-center font-bold bg-[#F8FAFC] border-r border-gray-300 text-gray-700 align-middle">
                        上午
                      </td>
                      {sortedDayKeys.map((dayNum) => {
                        const day = displayData?.itinerary?.[dayNum];
                        const morningEvents = (day?.events || []).filter(e => categorizeEventSlot(e) === 'morning');
                        return (
                          <td key={dayNum} className="p-1 border-r border-gray-300 last:border-r-0 align-top space-y-1">
                            {morningEvents.map((ev, eIdx) => (
                              <div key={eIdx} className={`p-1.5 rounded border ${getEventBgColor(ev)}`}>
                                <div className="font-bold underline text-[#0F172A] leading-tight">
                                  {ev.time}{ev.endTime ? ` - ${ev.endTime}` : ''} {ev.title}
                                </div>
                                {ev.subtitle && <div className="text-[8.5px] text-gray-600 mt-0.5 leading-tight whitespace-pre-line">{ev.subtitle}</div>}
                                {ev.note && <div className="text-[8px] text-[#2563EB] font-bold mt-0.5">📌 {ev.note}</div>}
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>

                    {/* 午餐區塊 */}
                    <tr className="border-b border-gray-300 bg-[#FAFAFA]">
                      <td className="p-1 text-center font-bold bg-[#F1F5F9] border-r border-gray-300 text-gray-700 align-middle">
                        午餐
                      </td>
                      {sortedDayKeys.map((dayNum) => {
                        const day = displayData?.itinerary?.[dayNum];
                        const lunchEvents = (day?.events || []).filter(e => categorizeEventSlot(e) === 'lunch');
                        return (
                          <td key={dayNum} className="p-1 border-r border-gray-300 last:border-r-0 align-top space-y-1">
                            {lunchEvents.length > 0 ? lunchEvents.map((ev, eIdx) => (
                              <div key={eIdx} className={`p-1.5 rounded border ${getEventBgColor(ev)}`}>
                                <div className="font-bold underline text-[#0F172A] leading-tight">
                                  {ev.time} {ev.title}
                                </div>
                                {ev.subtitle && <div className="text-[8.5px] text-gray-600 mt-0.5 leading-tight whitespace-pre-line">{ev.subtitle}</div>}
                                {ev.note && <div className="text-[8px] text-[#2563EB] font-bold mt-0.5">📌 {ev.note}</div>}
                              </div>
                            )) : (
                              <div className="text-gray-400 text-[8.5px] text-center pt-1.5">會場美食區 / 自理</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* 下午區塊 */}
                    <tr>
                      <td className="p-1 text-center font-bold bg-[#F8FAFC] border-r border-gray-300 text-gray-700 align-middle">
                        下午
                      </td>
                      {sortedDayKeys.map((dayNum) => {
                        const day = displayData?.itinerary?.[dayNum];
                        const afternoonEvents = (day?.events || []).filter(e => categorizeEventSlot(e) === 'afternoon');
                        return (
                          <td key={dayNum} className="p-1 border-r border-gray-300 last:border-r-0 align-top space-y-1">
                            {afternoonEvents.map((ev, eIdx) => (
                              <div key={eIdx} className={`p-1.5 rounded border ${getEventBgColor(ev)}`}>
                                <div className="font-bold underline text-[#0F172A] leading-tight">
                                  {ev.time}{ev.endTime ? ` - ${ev.endTime}` : ''} {ev.title}
                                </div>
                                {ev.subtitle && <div className="text-[8.5px] text-gray-600 mt-0.5 leading-tight whitespace-pre-line">{ev.subtitle}</div>}
                                {ev.note && <div className="text-[8px] text-[#2563EB] font-bold mt-0.5">📌 {ev.note}</div>}
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* 視窗底部列 (no-print) */}
            <div className="p-3 bg-gray-50 border-t flex justify-end shrink-0 no-print">
              <button 
                onClick={() => setShowMatrixModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 隱藏的直式 A4 DM 渲染畫布（827x1169，與匯出之 A4 PPTX 版面 100% 一致） */}
      {(() => {
        const dayKeys = Object.keys(displayData?.itinerary || {})
          .map(Number)
          .sort((a, b) => a - b);

        const flightNotes = [];
        const hotelNotes = [];
        const groupedRows = [];

        dayKeys.forEach((dNum) => {
          const dObj = displayData.itinerary[dNum];
          const dayLabel = `${dObj?.date || `D${dNum}`}(${dObj?.weekday || ''})`;
          const dayCoreItems = [];

          (dObj?.events || []).forEach((ev) => {
            const rawTitle = String(ev?.title || '').trim();
            if (!rawTitle) return;
            const subClean = String(ev?.subtitle || '').replace(/\n+/g, ' / ').trim();

            if (ev?.icon === 'plane' || /航班|機票|航空|機場/.test(rawTitle)) {
              flightNotes.push(subClean ? `${rawTitle}（${subClean}）` : rawTitle);
            }
            if (ev?.icon === 'hotel' || /飯店|酒店|入住|STAY/i.test(rawTitle)) {
              hotelNotes.push(subClean ? `${rawTitle}（${subClean}）` : rawTitle);
            }

            const isExcluded =
              ['plane', 'hotel', 'coffee'].includes(ev?.icon) ||
              /機場|航班|飯店|酒店|入住|星鰻|燒肉|定食|排餐|美食區|自由用餐|午餐|晚餐|早餐/.test(rawTitle);

            if (!isExcluded) {
              dayCoreItems.push(subClean ? `${rawTitle}（${subClean}）` : rawTitle);
            }
          });

          if (dayCoreItems.length > 0) {
            groupedRows.push({
              day: dayLabel,
              items: dayCoreItems.slice(0, 4)
            });
          }
        });

        const flightSummary = flightNotes.length > 0 ? flightNotes.slice(0, 2).join('；') : '請填寫航班資訊';
        const hotelSummary = hotelNotes.length > 0 ? hotelNotes.slice(0, 2).join('；') : '請填寫飯店資訊';
        const mainContact =
          (displayData?.infoCards || []).find((c) => c.iconType === 'user') ||
          (displayData?.infoCards || [])[0];
        const contactInfoText = mainContact
          ? `${mainContact.name || ''}｜${(mainContact.items || [])
              .map((it) => `${it.label} ${it.value}`)
              .join(' / ')}`
          : '請聯繫您的專屬業務窗口';

        const activeDays = groupedRows.slice(0, 6);

        return (
          <div
            id="vertical-dm-export-stage"
            aria-hidden="true"
            className="no-print"
            style={{
              position: 'fixed',
              left: '-9999px',
              top: 0,
              width: '827px',
              height: '1169px',
              backgroundColor: '#FFFFFF',
              fontFamily: '"Microsoft JhengHei", "微軟正黑體", sans-serif',
              fontWeight: 700,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden'
            }}
          >
            {/* 頂部機構橫幅 */}
            <div>
              <div
                style={{
                  backgroundColor: '#0F2C59',
                  color: '#FFFFFF',
                  height: '56px',
                  padding: '0 42px',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '4px solid #C8963E',
                  fontSize: '15px',
                  letterSpacing: '0.5px'
                }}
              >
                {displayData?.brandName || 'Lowge securities'}  |  INSTITUTIONAL CORPORATE ACCESS
              </div>

              {/* 主內容區（上下置中留白平衡） */}
              <div style={{ padding: '24px 42px 16px 42px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 主標題 + 右上角置中日期地點 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', gap: '12px' }}>
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: '#F8FAFC',
                      borderLeft: '10px solid #0F2C59',
                      borderBottom: '3px solid #C8963E',
                      padding: '10px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '32px',
                      color: '#0F2C59',
                      lineHeight: 1.2
                    }}
                  >
                    {displayData?.eventTitle || '機構法人專屬參訪交流'}
                  </div>
                  <div
                    style={{
                      width: '213px',
                      backgroundColor: '#FEF3C7',
                      color: '#0F2C59',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      fontSize: '13.5px',
                      lineHeight: 1.4,
                      padding: '8px'
                    }}
                  >
                    <div>{displayData?.eventDate || '日期待確認'}</div>
                    <div>{displayData?.eventLocation || '詳情洽業務窗口'}</div>
                  </div>
                </div>

                {/* 一、活動與聯絡資訊 */}
                <div>
                  <div style={{ fontSize: '14px', color: '#0F2C59', marginBottom: '5px' }}>一、活動與聯絡資訊</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', color: '#0F172A' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '110px', backgroundColor: '#F1F5F9', color: '#0F2C59', border: '1px solid #94A3B8', padding: '7px 10px' }}>活動期間</td>
                        <td style={{ width: '261px', border: '1px solid #94A3B8', padding: '7px 10px' }}>{displayData?.eventDate || '日期待確認'}</td>
                        <td style={{ width: '110px', backgroundColor: '#F1F5F9', color: '#0F2C59', border: '1px solid #94A3B8', padding: '7px 10px' }}>考察地點</td>
                        <td style={{ border: '1px solid #94A3B8', padding: '7px 10px' }}>{displayData?.eventLocation || '詳情洽業務窗口'}</td>
                      </tr>
                      <tr>
                        <td style={{ backgroundColor: '#F1F5F9', color: '#0F2C59', border: '1px solid #94A3B8', padding: '7px 10px' }}>聯絡窗口</td>
                        <td colSpan={3} style={{ border: '1px solid #94A3B8', padding: '7px 10px' }}>{contactInfoText}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 二、導覽重點 */}
                <div>
                  <div style={{ fontSize: '14px', color: '#0F2C59', marginBottom: '5px' }}>二、導覽重點</div>
                  <div
                    style={{
                      border: '1px solid #94A3B8',
                      height: '104px',
                      padding: '10px 12px',
                      fontSize: '13px',
                      color: '#475569'
                    }}
                  >
                    （請在此填寫本次活動／展會／參訪導覽簡介）
                  </div>
                </div>

                {/* 三、行程議程明細表 */}
                <div>
                  <div style={{ fontSize: '14px', color: '#0F2C59', marginBottom: '5px' }}>三、行程議程明細表</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.8px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0F2C59', color: '#FFFFFF' }}>
                        <th style={{ width: '125px', border: '1px solid #94A3B8', padding: '6px 8px', textAlign: 'center' }}>日期</th>
                        <th style={{ border: '1px solid #94A3B8', padding: '6px 10px', textAlign: 'left' }}>行程／參訪企業與接洽窗口</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeDays.length === 0 ? (
                        <tr>
                          <td style={{ border: '1px solid #94A3B8', padding: '8px', textAlign: 'center', color: '#0F2C59' }}>
                            {displayData?.eventDate || '日期待確認'}
                          </td>
                          <td style={{ border: '1px solid #94A3B8', padding: '8px', color: '#0F172A' }}>
                            請填寫參訪企業與接洽窗口
                          </td>
                        </tr>
                      ) : (
                        activeDays.map((grp, gIdx) => {
                          const rowBg = gIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
                          return grp.items.map((itemText, iIdx) => (
                            <tr key={`${grp.day}-${iIdx}`} style={{ backgroundColor: rowBg }}>
                              {iIdx === 0 && (
                                <td
                                  rowSpan={grp.items.length}
                                  style={{
                                    border: '1px solid #94A3B8',
                                    padding: '6px 8px',
                                    textAlign: 'center',
                                    verticalAlign: 'middle',
                                    color: '#0F2C59'
                                  }}
                                >
                                  {grp.day}
                                </td>
                              )}
                              <td style={{ border: '1px solid #94A3B8', padding: '5.5px 10px', color: '#0F172A' }}>
                                {itemText}
                              </td>
                            </tr>
                          ));
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 四、行程資訊 */}
                <div>
                  <div style={{ fontSize: '14px', color: '#0F2C59', marginBottom: '5px' }}>四、行程資訊</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: '#0F172A' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '125px', backgroundColor: '#F1F5F9', color: '#0F2C59', border: '1px solid #94A3B8', padding: '10px' }}>機票</td>
                        <td style={{ border: '1px solid #94A3B8', padding: '10px' }}>{flightSummary}</td>
                      </tr>
                      <tr>
                        <td style={{ backgroundColor: '#F1F5F9', color: '#0F2C59', border: '1px solid #94A3B8', padding: '10px' }}>飯店</td>
                        <td style={{ border: '1px solid #94A3B8', padding: '10px' }}>{hotelSummary}</td>
                      </tr>
                      <tr>
                        <td style={{ backgroundColor: '#F1F5F9', color: '#0F2C59', border: '1px solid #94A3B8', padding: '10px' }}>預計費用</td>
                        <td style={{ border: '1px solid #94A3B8', padding: '10px', color: '#475569' }}>（請填寫預計費用或分攤說明）</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 底部警語 */}
            <div
              style={{
                backgroundColor: '#0F2C59',
                color: '#FFFFFF',
                height: '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                padding: '0 42px'
              }}
            >
              *本行程表僅供機構投資人邀約參考，實際拜訪與議程安排以最終確認為準。
            </div>
          </div>
        );
      })()}
    </>
  );
}

