import React, { useState, useEffect } from 'react';
import { 
  Home, Calendar, Map, CheckSquare, User, MapPin, 
  ChevronRight, Bell, ExternalLink, Settings, Edit3, Save,
  Plane, Coffee, Store, Link as LinkIcon
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

// 1. Firebase 金鑰
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
  brandName: "FUTUREPNP",
  eventTitle: "Highly-functional\nMaterial Week 2026",
  eventLocation: "幕張メッセ (Makuhari Messe)",
  eventDate: "2026.09.29 — 10.03",
  announcement: "小提醒～9:50記得帶著展覽票在Hall 1 集合哦😊",
  nextTime: "9:45",
  nextLocation: "桃園機場集合",
  nextDetail: "T2華航 團體報到櫃檯"
};

// --- 每日行程資料 (您可以在這裡自由新增、修改行程與附件按鈕) ---
const itineraryData = {
  1: {
    date: "9/29", weekday: "週二", title: "抵達日本・入住飯店",
    events: [
      {
        time: "9:45", endTime: "", icon: 'pin',
        title: "桃園機場集合", subtitle: "T2華航 團體報到櫃檯", note: "請攜帶護照",
        buttons: [{ type: 'map', text: 'Google Maps', link: '#' }]
      },
      {
        time: "12:15", endTime: "16:35", icon: 'plane',
        title: "CI104 台北 → 成田", subtitle: "TPE → NRT", note: "抵達後搭乘中巴前往飯店",
        buttons: []
      },
      {
        time: "17:50", endTime: "", icon: 'pin',
        title: "入住 Hotel New Otani Makuhari", subtitle: "千葉幕張新大谷", note: "",
        buttons: [{ type: 'map', text: 'Google Maps', link: '#' }]
      }
    ]
  },
  2: {
    date: "9/30", weekday: "週三", title: "PCB / CCL專家",
    events: [
      {
        time: "06:30", endTime: "09:40", icon: 'coffee',
        title: "早餐", subtitle: "飯店 1 樓 | SATSUKI", note: "",
        buttons: []
      },
      {
        time: "09:50", endTime: "", icon: 'store',
        title: "展覽館東入口 / Hall 8 側集合", subtitle: "飯店2樓走空橋到展覽館", note: "",
        buttons: [
          { type: 'map', text: 'Google Maps', link: '#' },
          { type: 'link', text: '查看移動路線', link: '#' }
        ]
      },
      {
        time: "10:00", endTime: "12:00", icon: 'store',
        title: "帶看展", subtitle: "幕張展覽館", note: "",
        buttons: [{ type: 'link', text: '查看導覽攤位', link: '#' }]
      },
      {
        time: "12:00", endTime: "14:00", icon: 'coffee',
        title: "午餐 | 千羽鶴（鰻魚飯）", subtitle: "飯店 1 樓", note: "走空橋回飯店 1 樓",
        buttons: [{ type: 'map', text: 'Google Maps', link: '#' }]
      }
    ]
  },
  3: { date: "10/1", weekday: "週四", title: "展覽參訪", events: [] },
  4: { date: "10/2", weekday: "週五", title: "展覽參訪", events: [] },
  5: { date: "10/3", weekday: "週六", title: "賦歸", events: [] }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('itinerary'); // 為了方便您測試，預設先開在行程頁
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [appData, setAppData] = useState(defaultData);
  const [editData, setEditData] = useState(defaultData);

  useEffect(() => {
    const docRef = doc(db, 'tourConfig', 'mainContent');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const serverData = docSnap.data();
        setAppData({ ...defaultData, ...serverData });
        setEditData({ ...defaultData, ...serverData }); 
      } else {
        setDoc(docRef, defaultData);
      }
    });
    return () => unsubscribe();
  }, []);

  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('tour_checklist');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('tour_checklist', JSON.stringify(checklist));
  }, [checklist]);

  const toggleCheck = (id) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveToCloud = async () => {
    try {
      await setDoc(doc(db, 'tourConfig', 'mainContent'), editData);
      setIsAdmin(false);
      alert('更新成功！所有客戶的畫面已同步。');
    } catch (error) {
      alert('更新失敗，請檢查網路連線。');
    }
  };

  const handleAdminLogin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      return;
    }
    const pwd = prompt("請輸入主辦方管理密碼：\n(提示: 預設為 1234)");
    if (pwd === "1234") {
      setIsAdmin(true);
      alert("✅ 登入成功！請切換到「首頁」進行修改。");
    } else if (pwd !== null) {
      alert("❌ 密碼錯誤");
    }
  };

  // 取得行程小圖示
  const getEventIcon = (type) => {
    switch(type) {
      case 'plane': return <Plane size={18} />;
      case 'coffee': return <Coffee size={18} />;
      case 'store': return <Store size={18} />;
      default: return <MapPin size={18} />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-4 space-y-4 animate-in fade-in duration-300">
            <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold italic mb-2 tracking-tight whitespace-pre-line">
                  {appData.eventTitle}
                </h2>
                <div className="flex items-center text-sm opacity-90 mt-4">
                  <MapPin size={16} className="mr-1 min-w-[16px]" />
                  <span>{appData.eventLocation}</span>
                </div>
                <div className="text-sm opacity-90 mt-1">{appData.eventDate}</div>
              </div>
            </div>
            
            {isAdmin ? (
              <div className="bg-yellow-50 border-2 border-yellow-400 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center text-yellow-700 font-bold mb-4 text-lg">
                  <Edit3 size={20} className="mr-2" /> 管理員編輯模式
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-yellow-200 shadow-sm space-y-3">
                    <div className="text-sm font-bold text-yellow-800 border-b border-yellow-100 pb-2 mb-2">📌 大會基本資訊</div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">頂部品牌名稱</label>
                      <input className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 font-bold" value={editData.brandName} onChange={(e) => setEditData({...editData, brandName: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">活動大標題 (可換行)</label>
                      <textarea className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 font-bold" rows="2" value={editData.eventTitle} onChange={(e) => setEditData({...editData, eventTitle: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">展覽地點</label>
                      <input className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50" value={editData.eventLocation} onChange={(e) => setEditData({...editData, eventLocation: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">活動日期</label>
                      <input className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50" value={editData.eventDate} onChange={(e) => setEditData({...editData, eventDate: e.target.value})} />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-yellow-200 shadow-sm space-y-3">
                    <div className="text-sm font-bold text-yellow-800 border-b border-yellow-100 pb-2 mb-2">🚀 即時動態與行程</div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">重要公告</label>
                      <textarea className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50" rows="2" value={editData.announcement} onChange={(e) => setEditData({...editData, announcement: e.target.value})} />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-1/3">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">時間</label>
                        <input className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 font-bold" value={editData.nextTime} onChange={(e) => setEditData({...editData, nextTime: e.target.value})} />
                      </div>
                      <div className="w-2/3">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">下一站地點</label>
                        <input className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 font-bold" value={editData.nextLocation} onChange={(e) => setEditData({...editData, nextLocation: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">地點補充說明 (選填)</label>
                      <input className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 text-gray-500" value={editData.nextDetail} onChange={(e) => setEditData({...editData, nextDetail: e.target.value})} />
                    </div>
                  </div>
                  
                  <button onClick={handleSaveToCloud} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center hover:bg-blue-700 shadow-md">
                    <Save size={24} className="mr-2" /> 發佈並同步給所有客戶
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-orange-200 p-2 rounded-xl mr-4">
                      <Bell size={20} className="text-orange-700" />
                    </div>
                    <div>
                      <div className="text-xs text-orange-800 font-bold mb-1">重要公告</div>
                      <div className="text-sm text-gray-800 font-medium whitespace-pre-line">{appData.announcement}</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-md">
                    <div className="text-xs opacity-80 mb-2">目前行程</div>
                    <div className="text-xl font-bold mb-1">出發前預覽</div>
                    <div className="text-sm opacity-90">行程尚未開始</div>
                  </div>
                  <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                    <div className="text-xs text-gray-500 mb-2">下一個行程</div>
                    <div className="text-2xl font-black text-gray-800 mb-1">{appData.nextTime}</div>
                    <div className="text-sm font-bold text-gray-600">{appData.nextLocation}</div>
                    {appData.nextDetail && (
                      <div className="text-xs text-gray-400 mt-2 flex items-center">
                        <MapPin size={12} className="mr-1 min-w-[12px]" /> {appData.nextDetail}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'itinerary':
        const currentDay = itineraryData[selectedDay];
        return (
          <div className="p-4 animate-in fade-in duration-300">
            {/* 頂部同步公告 */}
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center shadow-sm mb-6">
              <div className="bg-orange-200 p-2 rounded-xl mr-4 shrink-0">
                <Bell size={20} className="text-orange-700" />
              </div>
              <div>
                <div className="text-xs text-orange-800 font-bold mb-1">重要公告</div>
                <div className="text-sm text-gray-800 font-medium whitespace-pre-line">{appData.announcement}</div>
                <div className="text-[10px] text-gray-400 mt-1">與首頁同步更新</div>
              </div>
            </div>

            <div className="text-[10px] font-bold text-blue-500 tracking-wider mb-1">TRIP SCHEDULE</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">每日行程</h2>
            <p className="text-xs text-gray-500 mb-4">點選日期查看全天安排、集合地點及地圖。</p>

            {/* 日期選擇器 */}
            <div className="bg-gray-100 rounded-2xl p-1 flex justify-between mb-8 overflow-x-auto shadow-inner">
              {[1, 2, 3, 4, 5].map((dayNum) => (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`flex flex-col items-center py-2 px-4 rounded-xl min-w-[64px] transition-all ${
                    selectedDay === dayNum ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span className="text-[10px] font-bold mb-0.5">DAY {dayNum}</span>
                  <span className={`text-sm font-black ${selectedDay === dayNum ? 'text-blue-600' : 'text-gray-600'}`}>
                    {itineraryData[dayNum].date}
                  </span>
                  <span className="text-[10px]">{itineraryData[dayNum].weekday}</span>
                </button>
              ))}
            </div>

            {/* 每日標題 */}
            <div className="flex justify-between items-end border-b border-gray-200 pb-3 mb-6">
              <div>
                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full mb-2 inline-block">DAY {selectedDay}</span>
                <h3 className="text-xl font-bold text-gray-800">{currentDay.title}</h3>
              </div>
              <div className="text-sm font-bold text-gray-500">
                {currentDay.date} ({currentDay.weekday})
              </div>
            </div>

            {/* 時間軸與行程卡片 */}
            <div className="relative">
              {currentDay.events.length > 0 ? currentDay.events.map((ev, idx) => (
                <div key={idx} className="flex mb-6 relative">
                  {/* 時間軸的直線 (最後一個項目不顯示) */}
                  {idx !== currentDay.events.length - 1 && (
                    <div className="absolute left-[70px] top-8 bottom-[-30px] w-[2px] bg-blue-100 z-0"></div>
                  )}
                  
                  {/* 左側時間 */}
                  <div className="w-16 shrink-0 text-right pr-3 pt-4">
                    <div className="text-sm font-black text-blue-900">{ev.time}</div>
                    {ev.endTime && <div className="text-[10px] text-gray-400">— {ev.endTime}</div>}
                  </div>
                  
                  {/* 圓點 */}
                  <div className="w-4 flex justify-center pt-[22px] relative z-10 shrink-0">
                    <div className="w-3 h-3 rounded-full border-[2.5px] border-blue-500 bg-white"></div>
                  </div>
                  
                  {/* 右側卡片 */}
                  <div className="flex-1 ml-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="bg-blue-50 text-blue-500 p-2.5 rounded-xl mr-3 shrink-0">
                        {getEventIcon(ev.icon)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{ev.title}</div>
                        {ev.subtitle && <div className="text-xs text-gray-500 mt-1">{ev.subtitle}</div>}
                        {ev.note && <div className="text-[10px] text-gray-400 mt-2">{ev.note}</div>}
                      </div>
                    </div>
                    
                    {/* 動作按鈕 (附件/連結) */}
                    {ev.buttons && ev.buttons.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-50">
                        {ev.buttons.map((btn, i) => (
                          <a key={i} href={btn.link} target="_blank" rel="noreferrer" className="flex items-center text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                            {btn.type === 'map' ? <MapPin size={12} className="mr-1" /> : <LinkIcon size={12} className="mr-1" />}
                            {btn.text}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-gray-400">
                  <Calendar size={48} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">尚無行程資料</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'checklist':
        return (
          // ... 為了版面簡潔省略，行前準備程式碼與之前完全相同 ...
          <div className="p-4 animate-in fade-in duration-300">
             <h2 className="text-xl font-bold mb-2 text-gray-800 flex items-center">出發前確認</h2>
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
                {[
                  { id: '1', label: '護照' }, { id: '2', label: '入境申請 Visit Japan Web' },
                  { id: '3', label: '網路 / 漫遊' }, { id: '4', label: '少量日幣現金' },
                  { id: '5', label: '信用卡' }, { id: '6', label: '行動電源' }
                ].map((item) => (
                  <div key={item.id} onClick={() => toggleCheck(item.id)} className="flex items-center p-4 border-b border-gray-50 last:border-b-0 cursor-pointer">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${checklist[item.id] ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                      {checklist[item.id] && <CheckSquare size={14} className="text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${checklist[item.id] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.label}</span>
                  </div>
                ))}
             </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-4 space-y-4 animate-in fade-in duration-300 flex flex-col h-[75vh]">
            <div className="bg-blue-600 text-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-5 flex items-center border-b border-blue-500/50">
                <div className="bg-white text-blue-600 rounded-full p-3 mr-4"><User size={24} /></div>
                <div><div className="text-xs opacity-80 mb-1">第一聯絡人</div><div className="text-xl font-bold">Mike Chiang</div></div>
              </div>
              <div className="p-5 space-y-4 bg-blue-700/30">
                <div><div className="text-xs opacity-70 mb-1">LINE</div><div className="font-bold flex justify-between"><span>開啟 LINE 聯絡</span><ExternalLink size={16} /></div></div>
              </div>
            </div>
            <div className="mt-auto pt-10 pb-4 text-center">
              <button onClick={handleAdminLogin} className="text-gray-300 hover:text-gray-500 flex items-center justify-center w-full text-xs font-bold">
                <Settings size={14} className="mr-1" />{isAdmin ? '登出管理模式' : '主辦方登入'}
              </button>
            </div>
          </div>
        );
      default:
        return <div className="p-10 text-center text-gray-400"><p>建置中...</p></div>;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24 font-sans shadow-2xl relative">
      <div className="bg-white text-center py-4 border-b border-gray-100 shadow-sm sticky top-0 z-20 flex justify-center items-center">
        <div className="text-blue-700 font-black text-xl tracking-tight">{appData.brandName}</div>
        {isAdmin && <span className="absolute right-4 text-[10px] bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-bold">編輯模式</span>}
      </div>
      
      {renderContent()}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-2 pb-8 max-w-md mx-auto z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
        {[
          { id: 'home', icon: Home, label: '首頁' },
          { id: 'itinerary', icon: Calendar, label: '行程' },
          { id: 'checklist', icon: CheckSquare, label: '行前準備' },
          { id: 'contact', icon: User, label: '聯絡資訊' }
        ].map((tab) => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id)} 
            className={`flex flex-col items-center p-2 w-16 transition-colors ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <tab.icon size={22} className="mb-1" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}