import React, { useState, useEffect } from 'react';
import { 
  Home, Calendar, CheckSquare, User, MapPin, 
  Bell, ExternalLink, Settings, Edit3, Save,
  Plane, Coffee, Store, Link as LinkIcon, PlusCircle, Trash2, Shield, TrendingUp, Star, ArrowUp, ArrowDown
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

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
  announcement: "小提醒～9:50記得帶著展覽票在Hall 2集合喔！",
  activeEvent: null,
  itinerary: {
    1: { date: "9/29", weekday: "週二", title: "抵達日本・入住飯店", events: [
      { time: "9:45", endTime: "", icon: "pin", title: "桃園機場集合", subtitle: "T2華航 團體報到櫃檯", note: "請攜帶護照", mapUrl: "https://maps.google.com", attachmentUrl: "" },
      { time: "12:15", endTime: "16:35", icon: "plane", title: "CI104 台北 → 成田", subtitle: "TPE → NRT", note: "抵達後搭乘中巴前往飯店", mapUrl: "", attachmentUrl: "" }
    ]},
    2: { date: "9/30", weekday: "週三", title: "PCB / CCL專家", events: [] },
    3: { date: "10/1", weekday: "週四", title: "展覽參訪", events: [] },
    4: { date: "10/2", weekday: "週五", title: "展覽參訪", events: [] }
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
  contact: {
    name: "Lowgeliu",
    title: "sales",
    fields: [
      { label: "LINE ID", value: "mike_line_0907" }
    ]
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
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

  const [userChecklist, setUserChecklist] = useState(() => {
    const saved = localStorage.getItem('tour_user_checklist');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('tour_user_checklist', JSON.stringify(userChecklist));
  }, [userChecklist]);

  const toggleCheck = (id) => {
    setUserChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveToCloud = async () => {
    try {
      await setDoc(doc(db, 'tourConfig', 'mainContent'), editData);
      setIsAdmin(false);
      alert('【Institutional System】數據已成功同步至全體終端。');
    } catch (error) {
      alert('更新失敗，請檢查網路連線。');
    }
  };

  const handleAdminLogin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      return;
    }
    const pwd = prompt("請輸入外資分析管理密碼：\n(提示: 預設為 1234)");
    if (pwd === "1234") {
      setIsAdmin(true);
      alert("✅ 權限解鎖：管理員模式已啟用");
    } else if (pwd !== null) {
      alert("❌ 密碼錯誤");
    }
  };

  const handleEventChange = (day, index, field, value) => {
    setEditData(prev => {
      const updatedEvents = [...prev.itinerary[day].events];
      updatedEvents[index] = { ...updatedEvents[index], [field]: value };
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const addEvent = (day) => {
    setEditData(prev => {
      const updatedEvents = [...prev.itinerary[day].events];
      updatedEvents.push({ time: "12:00", endTime: "", icon: "pin", title: "新增研究議程", subtitle: "", note: "", mapUrl: "", attachmentUrl: "" });
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const removeEvent = (day, index) => {
    if(window.confirm('確定要移除此項議程？')){
      setEditData(prev => {
        const updatedEvents = [...prev.itinerary[day].events];
        updatedEvents.splice(index, 1);
        let newActive = prev.activeEvent;
        if (newActive && newActive.day === day && newActive.index === index) {
          newActive = null;
        } else if (newActive && newActive.day === day && newActive.index > index) {
          newActive = { ...newActive, index: newActive.index - 1 };
        }
        return {
          ...prev,
          activeEvent: newActive,
          itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
        };
      });
    }
  };

  // 調整行程順序 (往上或往下)
  const moveEvent = (day, index, direction) => {
    setEditData(prev => {
      const updatedEvents = [...prev.itinerary[day].events];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= updatedEvents.length) return prev;

      // 交換位置
      const temp = updatedEvents[index];
      updatedEvents[index] = updatedEvents[targetIndex];
      updatedEvents[targetIndex] = temp;

      // 追蹤並更新「現在行程」的指標
      let newActive = prev.activeEvent;
      if (newActive && newActive.day === day) {
        if (newActive.index === index) {
          newActive = { ...newActive, index: targetIndex };
        } else if (newActive.index === targetIndex) {
          newActive = { ...newActive, index: index };
        }
      }

      return {
        ...prev,
        activeEvent: newActive,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const setActiveEvent = (dayNum, eventIndex) => {
    setEditData(prev => ({
      ...prev,
      activeEvent: prev.activeEvent && prev.activeEvent.day === dayNum && prev.activeEvent.index === eventIndex ? null : { day: dayNum, index: eventIndex }
    }));
  };

  const addDay = () => {
    setEditData(prev => {
      const daysCount = Object.keys(prev.itinerary).length + 1;
      return {
        ...prev,
        itinerary: {
          ...prev.itinerary,
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
    if (window.confirm(`確定要刪除 DAY ${dayNum} 及其所有議程？`)) {
      setEditData(prev => {
        const newItin = { ...prev.itinerary };
        delete newItin[dayNum];
        return { ...prev, itinerary: newItin };
      });
      setSelectedDay(1);
    }
  };

  const handleChecklistChange = (index, value) => {
    setEditData(prev => {
      const newCl = [...prev.checklist];
      newCl[index] = { ...newCl[index], label: value };
      return { ...prev, checklist: newCl };
    });
  };

  const addChecklistItem = () => {
    setEditData(prev => ({
      ...prev,
      checklist: [...prev.checklist, { id: Date.now().toString(), label: '新增裝備項目' }]
    }));
  };

  const removeChecklistItem = (index) => {
    setEditData(prev => {
      const newCl = [...prev.checklist];
      newCl.splice(index, 1);
      return { ...prev, checklist: newCl };
    });
  };

  const handleContactFieldChange = (index, field, value) => {
    setEditData(prev => {
      const newFields = [...(prev.contact.fields || [])];
      newFields[index] = { ...newFields[index], [field]: value };
      return { ...prev, contact: { ...prev.contact, fields: newFields } };
    });
  };

  const addContactField = () => {
    setEditData(prev => ({
      ...prev,
      contact: { 
        ...prev.contact, 
        fields: [...(prev.contact.fields || []), { label: "聯絡項目", value: "詳細資訊" }] 
      }
    }));
  };

  const removeContactField = (index) => {
    setEditData(prev => {
      const newFields = [...prev.contact.fields];
      newFields.splice(index, 1);
      return { ...prev, contact: { ...prev.contact, fields: newFields } };
    });
  };

  const getEventIcon = (type) => {
    switch(type) {
      case 'plane': return <Plane size={18} />;
      case 'coffee': return <Coffee size={18} />;
      case 'store': return <Store size={18} />;
      default: return <MapPin size={18} />;
    }
  };

  const displayData = isAdmin ? editData : appData;
  const currentDay = displayData.itinerary[selectedDay] || displayData.itinerary[1];

  let currentEventObj = null;
  let nextEventObj = null;

  if (displayData.activeEvent) {
    const { day, index } = displayData.activeEvent;
    if (displayData.itinerary[day] && displayData.itinerary[day].events[index]) {
      currentEventObj = displayData.itinerary[day].events[index];
      if (displayData.itinerary[day].events[index + 1]) {
        nextEventObj = displayData.itinerary[day].events[index + 1];
      } else {
        const nextDayNum = Number(day) + 1;
        if (displayData.itinerary[nextDayNum] && displayData.itinerary[nextDayNum].events.length > 0) {
          nextEventObj = displayData.itinerary[nextDayNum].events[0];
        }
      }
    }
  }

  if (!currentEventObj) {
    const firstDayEvents = displayData.itinerary[1]?.events || [];
    if (firstDayEvents.length > 0) {
      nextEventObj = firstDayEvents[0];
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-4 space-y-4 animate-in fade-in duration-300">
            <div className="bg-[#1A2332] text-[#E2E8F0] p-6 rounded shadow-md border-l-4 border-[#3B82F6] relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-[10px] tracking-widest text-[#60A5FA] font-mono mb-1">EQUITY RESEARCH // 2026</div>
                <h2 className="text-2xl font-black tracking-tight whitespace-pre-line font-mono">{appData.eventTitle}</h2>
                <div className="flex items-center text-xs opacity-80 mt-4 font-mono">
                  <MapPin size={14} className="mr-1 text-[#60A5FA] min-w-[14px]" />
                  <span>{appData.eventLocation}</span>
                </div>
                <div className="text-xs opacity-70 mt-1 font-mono">{appData.eventDate}</div>
              </div>
            </div>
            
            {isAdmin ? (
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-5 rounded shadow-sm">
                <div className="flex items-center text-[#1E293B] font-bold mb-4 text-sm font-mono">
                  <Edit3 size={18} className="mr-2 text-[#2563EB]" /> 終端管理員控制台 (首頁)
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded border border-[#CBD5E1] space-y-3">
                    <div className="text-xs font-bold text-[#334155] border-b border-[#F1F5F9] pb-2 mb-2 font-mono">📌 核心參數設定</div>
                    <div><label className="text-[10px] font-bold text-gray-500 mb-1 block">機構代號 / 品牌</label><input className="w-full p-2 border border-gray-300 rounded text-xs bg-[#F8FAFC] font-mono" value={editData.brandName} onChange={(e) => setEditData({...editData, brandName: e.target.value})} /></div>
                    <div><label className="text-[10px] font-bold text-gray-500 mb-1 block">活動大標題</label><textarea className="w-full p-2 border border-gray-300 rounded text-xs bg-[#F8FAFC] font-mono font-bold" rows="2" value={editData.eventTitle} onChange={(e) => setEditData({...editData, eventTitle: e.target.value})} /></div>
                    <div><label className="text-[10px] font-bold text-gray-500 mb-1 block">地點</label><input className="w-full p-2 border border-gray-300 rounded text-xs bg-[#F8FAFC]" value={editData.eventLocation} onChange={(e) => setEditData({...editData, eventLocation: e.target.value})} /></div>
                    <div><label className="text-[10px] font-bold text-gray-500 mb-1 block">日期</label><input className="w-full p-2 border border-gray-300 rounded text-xs bg-[#F8FAFC]" value={editData.eventDate} onChange={(e) => setEditData({...editData, eventDate: e.target.value})} /></div>
                  </div>
                  <div className="bg-white p-4 rounded border border-[#CBD5E1] space-y-3">
                    <div className="text-xs font-bold text-[#334155] border-b border-[#F1F5F9] pb-2 mb-2 font-mono">⚡ 研究部即時廣播</div>
                    <div><label className="text-[10px] font-bold text-gray-500 mb-1 block">公告內容</label><textarea className="w-full p-2 border border-gray-300 rounded text-xs bg-[#F8FAFC]" rows="2" value={editData.announcement} onChange={(e) => setEditData({...editData, announcement: e.target.value})} /></div>
                  </div>
                  <button onClick={handleSaveToCloud} className="w-full bg-[#1E293B] text-white font-bold py-3 rounded text-xs tracking-wider font-mono hover:bg-[#0F172A] transition-colors shadow flex items-center justify-center">
                    <Save size={16} className="mr-2" /> 部署並同步至全體終端
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-4 rounded flex items-start shadow-sm">
                  <div className="bg-[#DBEAFE] p-2 rounded mr-3 shrink-0 text-[#1E40AF]">
                    <Bell size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#1E40AF] font-bold font-mono uppercase tracking-wider mb-0.5">RESEARCH FLASH // 研究快訊</div>
                    <div className="text-xs text-[#1E293B] font-medium leading-relaxed whitespace-pre-line">{appData.announcement}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1E293B] text-white p-4 rounded shadow-sm border-l-2 border-[#3B82F6]">
                    <div className="text-[10px] font-mono opacity-80 mb-1">現在行程</div>
                    {currentEventObj ? (
                      <>
                        <div className="text-lg font-bold mb-1 font-mono">{currentEventObj.time}</div>
                        <div className="text-xs font-bold truncate">{currentEventObj.title}</div>
                        {currentEventObj.subtitle && <div className="text-[10px] opacity-70 truncate mt-0.5">{currentEventObj.subtitle}</div>}
                      </>
                    ) : (
                      <>
                        <div className="text-base font-bold mb-1 font-mono">行前準備中</div>
                        <div className="text-xs opacity-70">尚未指定現在行程</div>
                      </>
                    )}
                  </div>

                  <div className="bg-white border border-[#CBD5E1] p-4 rounded shadow-sm">
                    <div className="text-[10px] font-mono text-[#64748B] mb-1">NEXT // 下一站</div>
                    {nextEventObj ? (
                      <>
                        <div className="text-xl font-black text-[#0F172A] mb-1 font-mono">{nextEventObj.time}</div>
                        <div className="text-xs font-bold text-[#334155] truncate">{nextEventObj.title}</div>
                        {nextEventObj.subtitle && <div className="text-[10px] text-gray-500 mt-2 flex items-center truncate"><MapPin size={10} className="mr-1 shrink-0 text-[#2563EB]" /> {nextEventObj.subtitle}</div>}
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 mt-2 font-mono">目前無後續行程</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'itinerary':
        return (
          <div className="p-4 animate-in fade-in duration-300">
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-3 rounded flex items-center shadow-sm mb-4">
              <div className="bg-[#DBEAFE] p-1.5 rounded mr-3 shrink-0 text-[#1E40AF]">
                <Bell size={16} />
              </div>
              <div className="truncate">
                <div className="text-[9px] text-[#1E40AF] font-bold font-mono">FLASH</div>
                <div className="text-xs text-[#1E293B] truncate">{displayData.announcement}</div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-[10px] font-mono text-[#2563EB] font-bold tracking-widest">TIMELINE</div>
                <h2 className="text-xl font-black text-[#0F172A] font-mono">行程議程總覽</h2>
              </div>
              {isAdmin && (
                <button onClick={handleSaveToCloud} className="bg-[#2563EB] text-white font-bold text-[11px] px-3 py-1.5 rounded font-mono shadow-sm hover:bg-[#1D4ED8] flex items-center">
                  <Save size={13} className="mr-1" /> 儲存議程
                </button>
              )}
            </div>
            
            <p className="text-[11px] text-gray-500 mb-4 font-mono">
              {isAdmin ? "🔧 管理員模式：可使用上下箭頭調整順序、點擊星號設定「現在行程」。" : "點擊下方日期檢視當日詳細參訪與會議安排。"}
            </p>

            <div className="bg-[#F1F5F9] rounded p-1.5 flex items-center mb-5 overflow-x-auto shadow-inner gap-1 border border-[#CBD5E1]">
              {Object.keys(displayData.itinerary).map((dayNumStr) => {
                const dayNum = Number(dayNumStr);
                const dayInfo = displayData.itinerary[dayNum];
                return (
                  <div key={dayNum} className="relative group shrink-0">
                    <button onClick={() => setSelectedDay(dayNum)} className={`flex flex-col items-center py-2 px-3 rounded transition-all font-mono ${selectedDay === dayNum ? 'bg-[#1E293B] text-white shadow' : 'text-[#475569] hover:text-[#0F172A]'}`}>
                      <span className="text-[9px] opacity-80 mb-0.5">D-{dayNum}</span>
                      {isAdmin ? (
                        <div className="space-y-0.5 text-center">
                          <input className="w-10 text-center text-[11px] font-black bg-white border rounded text-[#1E293B]" value={dayInfo.date} onChange={(e) => {
                            const newItin = {...editData.itinerary};
                            newItin[dayNum].date = e.target.value;
                            setEditData({...editData, itinerary: newItin});
                          }} />
                          <input className="w-10 text-center text-[8px] bg-white border rounded text-gray-500" value={dayInfo.weekday} onChange={(e) => {
                            const newItin = {...editData.itinerary};
                            newItin[dayNum].weekday = e.target.value;
                            setEditData({...editData, itinerary: newItin});
                          }} />
                        </div>
                      ) : (
                        <>
                          <span className="text-xs font-black">{dayInfo.date}</span>
                          <span className="text-[9px] opacity-70">{dayInfo.weekday}</span>
                        </>
                      )}
                    </button>
                    {isAdmin && dayNum !== 1 && (
                      <button onClick={() => removeDay(dayNum)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                );
              })}

              {isAdmin && (
                <button onClick={addDay} className="flex flex-col items-center justify-center py-3 px-3 rounded text-[#334155] bg-white/70 hover:bg-white border border-dashed border-[#2563EB] shrink-0 font-mono">
                  <PlusCircle size={16} />
                  <span className="text-[8px] font-bold mt-0.5">+ 天數</span>
                </button>
              )}
            </div>

            <div className="text-center border-b border-[#CBD5E1] pb-4 mb-5">
              <span className="bg-[#1E293B] text-white font-mono text-[9px] font-bold px-2.5 py-0.5 rounded mb-1.5 inline-block tracking-wider">DAY {selectedDay}</span>
              {isAdmin ? (
                <input className="w-3/4 mx-auto text-center text-base font-bold text-[#0F172A] border-b border-dashed border-gray-400 bg-transparent focus:outline-none block font-mono" value={currentDay.title} onChange={(e) => {
                  const newItin = {...editData.itinerary};
                  newItin[selectedDay].title = e.target.value;
                  setEditData({...editData, itinerary: newItin});
                }} placeholder="輸入行程主題" />
              ) : (
                <h3 className="text-base font-bold text-[#0F172A] font-mono">{currentDay.title}</h3>
              )}
            </div>

            <div className="relative">
              {currentDay.events && currentDay.events.length > 0 ? currentDay.events.map((ev, idx) => {
                const isActive = displayData.activeEvent && displayData.activeEvent.day === selectedDay && displayData.activeEvent.index === idx;
                return (
                  <div key={idx} className="flex mb-5 relative group font-mono">
                    {idx !== currentDay.events.length - 1 && <div className="absolute left-[66px] top-6 bottom-[-24px] w-[2px] bg-[#CBD5E1] z-0"></div>}
                    
                    <div className="w-14 shrink-0 text-right pr-2.5 pt-3">
                      {isAdmin ? (
                        <div className="space-y-1">
                          <input className="w-full text-right text-xs font-black text-[#0F172A] border border-gray-300 rounded px-1 bg-white" value={ev.time} onChange={(e) => handleEventChange(selectedDay, idx, 'time', e.target.value)} placeholder="09:00" />
                          <input className="w-full text-right text-[9px] text-gray-500 border border-gray-300 rounded px-1 bg-white" value={ev.endTime} onChange={(e) => handleEventChange(selectedDay, idx, 'endTime', e.target.value)} placeholder="結束" />
                        </div>
                      ) : (
                        <>
                          <div className="text-xs font-black text-[#0F172A]">{ev.time}</div>
                          {ev.endTime && <div className="text-[9px] text-gray-500">— {ev.endTime}</div>}
                        </>
                      )}
                    </div>
                    
                    <div className="w-4 flex justify-center pt-3.5 relative z-10 shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full border-2 ${isActive ? 'bg-amber-500 border-amber-600' : 'border-[#2563EB] bg-white'}`}></div>
                    </div>
                    
                    <div className={`flex-1 ml-2.5 bg-white border ${isActive ? 'border-2 border-amber-500 shadow-md' : isAdmin ? 'border-[#2563EB]' : 'border-[#CBD5E1]'} rounded p-3.5 shadow-sm relative`}>
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          {/* 排序按鈕 (往上 / 往下) */}
                          <div className="flex bg-gray-100 rounded border border-gray-300 overflow-hidden">
                            <button 
                              onClick={() => moveEvent(selectedDay, idx, 'up')} 
                              disabled={idx === 0}
                              title="往上移"
                              className="p-1 hover:bg-gray-200 text-gray-700 disabled:opacity-30 border-r border-gray-300"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button 
                              onClick={() => moveEvent(selectedDay, idx, 'down')} 
                              disabled={idx === currentDay.events.length - 1}
                              title="往下移"
                              className="p-1 hover:bg-gray-200 text-gray-700 disabled:opacity-30"
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>

                          <button 
                            onClick={() => setActiveEvent(selectedDay, idx)} 
                            title="設為現在行程"
                            className={`p-1 rounded text-xs flex items-center gap-1 font-bold ${isActive ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-amber-100'}`}
                          >
                            <Star size={13} fill={isActive ? "white" : "none"} /> {isActive ? "現正進行" : "設為現在"}
                          </button>
                          <button onClick={() => removeEvent(selectedDay, idx)} className="text-red-600 hover:text-red-800 p-1 bg-red-50 rounded">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}

                      <div className="flex items-start">
                        <div className="bg-[#F1F5F9] text-[#1E293B] p-2 rounded mr-2.5 shrink-0">
                          {isAdmin ? (
                            <select className="bg-transparent text-xs text-[#1E293B] focus:outline-none font-mono" value={ev.icon} onChange={(e) => handleEventChange(selectedDay, idx, 'icon', e.target.value)}>
                              <option value="pin">📍 地標</option><option value="plane">✈️ 班機</option>
                              <option value="coffee">☕️ 餐飲</option><option value="store">🏢 展館</option>
                            </select>
                          ) : getEventIcon(ev.icon)}
                        </div>
                        
                        <div className="flex-1 w-full mr-3">
                          {isAdmin ? (
                            <div className="space-y-1.5 w-full pt-8">
                              <input className="w-full font-bold text-[#0F172A] border-b border-gray-200 bg-[#F8FAFC] px-1 text-xs" value={ev.title} onChange={(e) => handleEventChange(selectedDay, idx, 'title', e.target.value)} placeholder="主標題" />
                              <input className="w-full text-[11px] text-gray-600 border-b border-gray-200 bg-[#F8FAFC] px-1" value={ev.subtitle} onChange={(e) => handleEventChange(selectedDay, idx, 'subtitle', e.target.value)} placeholder="副標題" />
                              <input className="w-full text-[10px] text-gray-500 border-b border-gray-200 bg-[#F8FAFC] px-1" value={ev.note} onChange={(e) => handleEventChange(selectedDay, idx, 'note', e.target.value)} placeholder="備註" />
                              <div className="pt-1.5 mt-1.5 border-t border-dashed border-gray-200 space-y-1">
                                <input className="w-full text-[10px] border border-gray-300 rounded px-1.5 py-0.5 bg-white" value={ev.mapUrl} onChange={(e) => handleEventChange(selectedDay, idx, 'mapUrl', e.target.value)} placeholder="Google Maps 連結" />
                                <input className="w-full text-[10px] border border-gray-300 rounded px-1.5 py-0.5 bg-white" value={ev.attachmentUrl} onChange={(e) => handleEventChange(selectedDay, idx, 'attachmentUrl', e.target.value)} placeholder="附件網址" />
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-[#0F172A] text-xs">{ev.title}</div>
                                {isActive && <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">現在行程</span>}
                              </div>
                              {ev.subtitle && <div className="text-[11px] text-gray-600 mt-0.5">{ev.subtitle}</div>}
                              {ev.note && <div className="text-[10px] text-[#2563EB] mt-1 font-sans">{ev.note}</div>}
                            </>
                          )}
                        </div>
                      </div>
                      
                      {!isAdmin && (ev.mapUrl || ev.attachmentUrl) && (
                        <div className="flex flex-wrap gap-2 mt-2.5 pt-2.5 border-t border-[#F1F5F9] font-sans">
                          {ev.mapUrl && <a href={ev.mapUrl} target="_blank" rel="noreferrer" className="flex items-center text-[10px] font-bold text-[#1E293B] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-2.5 py-1 rounded transition-colors"><MapPin size={11} className="mr-1 text-[#2563EB]" /> Google Maps</a>}
                          {ev.attachmentUrl && <a href={ev.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center text-[10px] font-bold text-[#1E293B] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-2.5 py-1 rounded transition-colors"><LinkIcon size={11} className="mr-1 text-[#2563EB]" /> 相關附件</a>}
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
                  <button onClick={() => addEvent(selectedDay)} className="flex items-center text-xs font-bold text-[#1E293B] bg-[#F1F5F9] px-3.5 py-2 rounded border border-[#2563EB] border-dashed hover:bg-[#E2E8F0]">
                    <PlusCircle size={15} className="mr-1.5 text-[#2563EB]" /> 增加研究議程
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'checklist':
        return (
          <div className="p-4 animate-in fade-in duration-300 font-mono">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-[10px] text-[#2563EB] font-bold tracking-widest mb-1">COMPLIANCE & CHECK</div>
                <h2 className="text-xl font-black text-[#0F172A]">行前裝備清單</h2>
              </div>
              {isAdmin && (
                <button onClick={handleSaveToCloud} className="bg-[#2563EB] text-white font-bold text-[11px] px-3 py-1.5 rounded font-mono shadow-sm hover:bg-[#1D4ED8] flex items-center">
                  <Save size={13} className="mr-1" /> 儲存清單
                </button>
              )}
            </div>
            
            <p className="text-[11px] text-gray-500 mb-4">勾選狀態僅保留在當前終端裝置，管理員可編輯項目。</p>

            {isAdmin && (
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded mb-4 space-y-2">
                <div className="text-xs font-bold text-[#334155] mb-2">🔧 管理員：編輯裝備項目</div>
                {displayData.checklist.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center gap-2">
                    <input 
                      className="flex-1 text-xs border border-gray-300 rounded p-1.5 bg-white" 
                      value={item.label} 
                      onChange={(e) => handleChecklistChange(idx, e.target.value)} 
                    />
                    <button onClick={() => removeChecklistItem(idx)} className="text-red-600 p-1 bg-red-50 rounded hover:bg-red-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button onClick={addChecklistItem} className="flex items-center text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1.5 rounded border border-blue-200 border-dashed mt-2">
                  <PlusCircle size={14} className="mr-1" /> 新增裝備項目
                </button>
              </div>
            )}

            <div className="bg-white rounded shadow-sm border border-[#CBD5E1] overflow-hidden">
               {displayData.checklist.map((item) => (
                 <div key={item.id} onClick={() => toggleCheck(item.id)} className="flex items-center p-3.5 border-b border-[#F1F5F9] last:border-b-0 cursor-pointer hover:bg-[#F8FAFC]">
                   <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${userChecklist[item.id] ? 'border-[#1E293B] bg-[#1E293B]' : 'border-[#CBD5E1]'}`}>
                     {userChecklist[item.id] && <CheckSquare size={13} className="text-white" />}
                   </div>
                   <span className={`text-xs font-medium ${userChecklist[item.id] ? 'text-gray-400 line-through' : 'text-[#0F172A]'}`}>{item.label}</span>
                 </div>
               ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-4 space-y-4 animate-in fade-in duration-300 flex flex-col h-[75vh] font-mono">
            <div className="flex justify-between items-center mb-1">
              <div>
                <div className="text-[10px] text-[#2563EB] font-bold tracking-widest mb-1">COMMUNICATION</div>
                <h2 className="text-xl font-black text-[#0F172A]">通訊與聯絡窗口</h2>
              </div>
              {isAdmin && (
                <button onClick={handleSaveToCloud} className="bg-[#2563EB] text-white font-bold text-[11px] px-3 py-1.5 rounded font-mono shadow-sm hover:bg-[#1D4ED8] flex items-center">
                  <Save size={13} className="mr-1" /> 儲存聯絡人
                </button>
              )}
            </div>

            {isAdmin && (
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded space-y-3 text-xs">
                <div className="font-bold text-[#334155] mb-1">🔧 管理員：自訂聯絡窗口與欄位</div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-0.5">負責人姓名</label>
                  <input className="w-full border rounded p-1.5 bg-white text-xs font-bold" value={editData.contact.name} onChange={(e) => setEditData({...editData, contact: {...editData.contact, name: e.target.value}})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-0.5">職稱 / 團隊</label>
                  <input className="w-full border rounded p-1.5 bg-white text-xs" value={editData.contact.title} onChange={(e) => setEditData({...editData, contact: {...editData.contact, title: e.target.value}})} />
                </div>

                <div className="border-t border-gray-200 pt-2 mt-2">
                  <label className="text-[10px] font-bold text-blue-600 block mb-2">自訂通訊欄位 (可隨意改為 LINE ID、電話等)</label>
                  <div className="space-y-2">
                    {(editData.contact.fields || []).map((field, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input 
                          className="w-1/3 border rounded p-1 bg-white text-[11px] font-bold text-gray-700" 
                          value={field.label} 
                          onChange={(e) => handleContactFieldChange(idx, 'label', e.target.value)} 
                          placeholder="欄位名(如LINE ID)" 
                        />
                        <input 
                          className="flex-1 border rounded p-1 bg-white text-[11px]" 
                          value={field.value} 
                          onChange={(e) => handleContactFieldChange(idx, 'value', e.target.value)} 
                          placeholder="內容" 
                        />
                        <button onClick={() => removeContactField(idx)} className="text-red-600 p-1 bg-red-50 rounded hover:bg-red-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addContactField} className="flex items-center text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1.5 rounded border border-blue-200 border-dashed mt-2">
                    <PlusCircle size={14} className="mr-1" /> 新增聯絡欄位
                  </button>
                </div>
              </div>
            )}

            <div className="bg-[#1A2332] text-white rounded shadow-md overflow-hidden border-t-2 border-[#3B82F6]">
              <div className="p-4 flex items-center border-b border-[#2D3748]">
                <div className="bg-[#2563EB] text-white rounded p-2.5 mr-3"><User size={20} /></div>
                <div>
                  <div className="text-[9px] opacity-70 tracking-widest">{displayData.contact.title}</div>
                  <div className="text-base font-bold">{displayData.contact.name}</div>
                </div>
              </div>
              <div className="p-4 space-y-3 bg-[#111827] text-xs">
                {displayData.contact.fields && displayData.contact.fields.map((f, i) => (
                  <div key={i}>
                    <div className="text-[9px] opacity-60 uppercase">{f.label}</div>
                    <div className="font-bold tracking-wider mt-0.5">{f.value}</div>
                  </div>
                ))}
              </div>
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
    <div className="max-w-md mx-auto bg-[#F8FAFC] min-h-screen pb-24 font-sans shadow-2xl relative border-x border-[#CBD5E1]">
      <div className="bg-white text-center py-3.5 border-b border-[#CBD5E1] shadow-sm sticky top-0 z-20 flex justify-center items-center px-4">
        <div className="text-[#0F172A] font-black text-xs md:text-sm tracking-widest font-mono flex items-center">
          <TrendingUp size={16} className="mr-1.5 text-[#2563EB]" /> {appData.brandName}
        </div>
        {isAdmin && <span className="absolute right-4 text-[9px] bg-[#2563EB] text-white px-2 py-0.5 rounded font-mono font-bold tracking-widest">ADMIN</span>}
      </div>
      
      {renderContent()}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#CBD5E1] flex justify-around p-1.5 pb-7 max-w-md mx-auto z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        {[
          { id: 'home', icon: Home, label: '首頁' },
          { id: 'itinerary', icon: Calendar, label: '行程' },
          { id: 'checklist', icon: CheckSquare, label: '裝備' },
          { id: 'contact', icon: User, label: '通訊' }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center p-1.5 w-16 transition-colors font-mono ${activeTab === tab.id ? 'text-[#2563EB]' : 'text-gray-400 hover:text-gray-600'}`}>
            <tab.icon size={20} className="mb-0.5" />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}