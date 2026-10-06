import React, { useState, useEffect } from 'react';
import { 
  Home, Calendar, CheckSquare, User, MapPin, 
  Bell, ExternalLink, Settings, Edit3, Save,
  Plane, Coffee, Store, Link as LinkIcon, PlusCircle, Trash2, Wrench, Shield
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
  brandName: "FUTUREPNP // IND.",
  eventTitle: "Highly-functional\nMaterial Week 2026",
  eventLocation: "幕張メッセ (Makuhari Messe)",
  eventDate: "2026.09.29 — 10.03",
  announcement: "工業風小提醒：9:50請務必配戴識別證於 Hall 1 集合。",
  nextTime: "09:45",
  nextLocation: "桃園機場第一航廈",
  nextDetail: "T2華航 團體報到櫃檯",
  itinerary: {
    1: { date: "9/29", weekday: "週二", title: "抵達日本・營運據點部署", events: [
      { time: "09:45", endTime: "", icon: "pin", title: "桃園機場集合", subtitle: "T2華航 團體報到櫃檯", note: "請攜帶護照與通行證", mapUrl: "https://maps.google.com", attachmentUrl: "" }
    ]},
    2: { date: "9/30", weekday: "週三", title: "PCB / CCL 專項技術參訪", events: [] },
    3: { date: "10/1", weekday: "週四", title: "核心展區深度交流", events: [] },
    4: { date: "10/2", weekday: "週五", title: "商務洽談與會場考察", events: [] },
    5: { date: "10/3", weekday: "週六", title: "賦歸・行程結束", events: [] }
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('itinerary');
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
      alert('【系統提示】更新成功，全體終端同步完畢。');
    } catch (error) {
      alert('更新失敗，請檢查網路連線。');
    }
  };

  const handleAdminLogin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      return;
    }
    const pwd = prompt("請輸入工業管理密碼：\n(提示: 預設為 1234)");
    if (pwd === "1234") {
      setIsAdmin(true);
      alert("✅ 管理員權限解鎖");
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
      updatedEvents.push({ time: "12:00", endTime: "", icon: "pin", title: "新增排程項目", subtitle: "", note: "", mapUrl: "", attachmentUrl: "" });
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const removeEvent = (day, index) => {
    if(window.confirm('確定要移除此項排程？')){
      setEditData(prev => {
        const updatedEvents = [...prev.itinerary[day].events];
        updatedEvents.splice(index, 1);
        return {
          ...prev,
          itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
        };
      });
    }
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
    if (window.confirm(`確定要刪除 DAY ${dayNum} 及其所有排程？`)) {
      setEditData(prev => {
        const newItin = { ...prev.itinerary };
        delete newItin[dayNum];
        return { ...prev, itinerary: newItin };
      });
      setSelectedDay(1);
    }
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

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-4 space-y-4 animate-in fade-in duration-300">
            {/* 工業風主視覺看板 */}
            <div className="bg-[#2C2A29] text-[#EFECE6] p-6 rounded-lg shadow-md border-l-4 border-[#A3704C] relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-[10px] tracking-widest text-[#A3704C] font-mono mb-1">LOGISTICS SYSTEM // 2026</div>
                <h2 className="text-2xl font-black tracking-tight whitespace-pre-line font-mono">{appData.eventTitle}</h2>
                <div className="flex items-center text-xs opacity-80 mt-4 font-mono">
                  <MapPin size={14} className="mr-1 text-[#A3704C] min-w-[14px]" />
                  <span>{appData.eventLocation}</span>
                </div>
                <div className="text-xs opacity-70 mt-1 font-mono">{appData.eventDate}</div>
              </div>
            </div>
            
            {isAdmin ? (
              <div className="bg-[#F4F1EA] border border-[#D3C7B4] p-5 rounded-lg shadow-sm">
                <div className="flex items-center text-[#5A4D41] font-bold mb-4 text-sm font-mono">
                  <Edit3 size={18} className="mr-2 text-[#A3704C]" /> 終端管理員控制台 (首頁)
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded border border-[#D3C7B4] space-y-3">
                    <div className="text-xs font-bold text-[#5A4D41] border-b border-[#EFECE6] pb-2 mb-2 font-mono">📌 核心參數設定</div>
                    <div><label className="text-[10px] font-bold text-gray-500 mb-1 block">系統代號 / 品牌</label><input className="w-full p-2 border border-gray-300 rounded text-xs bg-[#F9F8F6] font-mono" value={editData.brandName} onChange={(e) => setEditData({...editData, brandName: e.target.value})} /></div>
                    <div><label className="text-[10px] font-bold text-gray-500 mb-1 block">活動大標題</label><textarea className="w-full p-2 border border-gray-300 rounded text-xs bg-[#F9F8F6] font-mono font-bold" rows="2" value={editData.eventTitle} onChange={(e) => setEditData({...editData, eventTitle: e.target.value})} /></div>
                    <div><label className="text-[10px] font-bold text-gray-500 mb-1 block">地點</label><input className="w-full p-2 border border-gray-300 rounded text-xs bg-[#F9F8F6]" value={editData.eventLocation} onChange={(e) => setEditData({...editData, eventLocation: e.target.value})} /></div>
                    <div><label className="text-[10px] font-bold text-gray-500 mb-1 block">日期</label><input className="w-full p-2 border border-gray-300 rounded text-xs bg-[#F9F8F6]" value={editData.eventDate} onChange={(e) => setEditData({...editData, eventDate: e.target.value})} /></div>
                  </div>
                  <div className="bg-white p-4 rounded border border-[#D3C7B4] space-y-3">
                    <div className="text-xs font-bold text-[#5A4D41] border-b border-[#EFECE6] pb-2 mb-2 font-mono">⚡ 即時廣播與動態</div>
                    <div><label className="text-[10px] font-bold text-gray-500 mb-1 block">公告內容</label><textarea className="w-full p-2 border border-gray-300 rounded text-xs bg-[#F9F8F6]" rows="2" value={editData.announcement} onChange={(e) => setEditData({...editData, announcement: e.target.value})} /></div>
                    <div className="flex gap-2">
                      <div className="w-1/3"><label className="text-[10px] font-bold text-gray-500 mb-1 block">時間</label><input className="w-full p-2 border border-gray-300 rounded text-xs bg-[#F9F8F6] font-mono" value={editData.nextTime} onChange={(e) => setEditData({...editData, nextTime: e.target.value})} /></div>
                      <div className="w-2/3"><label className="text-[10px] font-bold text-gray-500 mb-1 block">次要行程目標</label><input className="w-full p-2 border border-gray-300 rounded text-xs bg-[#F9F8F6] font-mono" value={editData.nextLocation} onChange={(e) => setEditData({...editData, nextLocation: e.target.value})} /></div>
                    </div>
                    <div><label className="text-[10px] font-bold text-gray-500 mb-1 block">備註說明</label><input className="w-full p-2 border border-gray-300 rounded text-xs bg-[#F9F8F6] text-gray-500" value={editData.nextDetail} onChange={(e) => setEditData({...editData, nextDetail: e.target.value})} /></div>
                  </div>
                  <button onClick={handleSaveToCloud} className="w-full bg-[#5A4D41] text-[#EFECE6] font-bold py-3 rounded text-xs tracking-wider font-mono hover:bg-[#3E352C] transition-colors shadow flex items-center justify-center">
                    <Save size={16} className="mr-2" /> 部署並同步至全體終端
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 公告欄 */}
                <div className="bg-[#EFECE6] border border-[#D3C7B4] p-4 rounded-lg flex items-start shadow-sm">
                  <div className="bg-[#D3C7B4] p-2 rounded mr-3 shrink-0 text-[#3E352C]">
                    <Bell size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8C7A6B] font-bold font-mono uppercase tracking-wider mb-0.5">ANNOUNCEMENT // 廣播</div>
                    <div className="text-xs text-[#3E352C] font-medium leading-relaxed whitespace-pre-line">{appData.announcement}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#475245] text-[#EFECE6] p-4 rounded-lg shadow-sm border-l-2 border-[#8A9A86]">
                    <div className="text-[10px] font-mono opacity-80 mb-1">STATUS // 狀態</div>
                    <div className="text-base font-bold mb-1 font-mono">預備部署</div>
                    <div className="text-xs opacity-70">尚未正式啟動</div>
                  </div>
                  <div className="bg-white border border-[#D3C7B4] p-4 rounded-lg shadow-sm">
                    <div className="text-[10px] font-mono text-[#8C7A6B] mb-1">NEXT // 下一站</div>
                    <div className="text-xl font-black text-[#2C2A29] mb-1 font-mono">{appData.nextTime}</div>
                    <div className="text-xs font-bold text-[#5A4D41] truncate">{appData.nextLocation}</div>
                    {appData.nextDetail && (
                      <div className="text-[10px] text-gray-500 mt-2 flex items-center truncate">
                        <MapPin size={10} className="mr-1 shrink-0 text-[#A3704C]" /> {appData.nextDetail}
                      </div>
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
            {/* 頂部同步公告 */}
            <div className="bg-[#EFECE6] border border-[#D3C7B4] p-3 rounded-lg flex items-center shadow-sm mb-4">
              <div className="bg-[#D3C7B4] p-1.5 rounded mr-3 shrink-0 text-[#3E352C]">
                <Bell size={16} />
              </div>
              <div className="truncate">
                <div className="text-[9px] text-[#8C7A6B] font-bold font-mono">BROADCAST</div>
                <div className="text-xs text-[#3E352C] truncate">{displayData.announcement}</div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-[10px] font-mono text-[#A3704C] font-bold tracking-widest">TIMELINE</div>
                <h2 className="text-xl font-black text-[#2C2A29] font-mono">每日行程排程</h2>
              </div>
              {isAdmin && (
                <button onClick={handleSaveToCloud} className="bg-[#A3704C] text-white font-bold text-[11px] px-3 py-1.5 rounded font-mono shadow-sm hover:bg-[#8B5E3D] flex items-center">
                  <Save size={13} className="mr-1" /> 儲存排程
                </button>
              )}
            </div>
            
            <p className="text-[11px] text-gray-500 mb-4 font-mono">點擊下方日期檢視當日詳細作業與定位資訊。</p>

            {/* 日期導覽列 */}
            <div className="bg-[#EFECE6] rounded-lg p-1.5 flex items-center mb-5 overflow-x-auto shadow-inner gap-1 border border-[#D3C7B4]">
              {Object.keys(displayData.itinerary).map((dayNumStr) => {
                const dayNum = Number(dayNumStr);
                const dayInfo = displayData.itinerary[dayNum];
                return (
                  <div key={dayNum} className="relative group shrink-0">
                    <button onClick={() => setSelectedDay(dayNum)} className={`flex flex-col items-center py-2 px-3 rounded transition-all font-mono ${selectedDay === dayNum ? 'bg-[#2C2A29] text-[#EFECE6] shadow' : 'text-[#6B5B4B] hover:text-[#2C2A29]'}`}>
                      <span className="text-[9px] opacity-80 mb-0.5">D-{dayNum}</span>
                      {isAdmin ? (
                        <div className="space-y-0.5 text-center">
                          <input className="w-10 text-center text-[11px] font-black bg-white border rounded text-[#2C2A29]" value={dayInfo.date} onChange={(e) => {
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
                      <button onClick={() => removeDay(dayNum)} className="absolute -top-1 -right-1 bg-red-700 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                );
              })}

              {isAdmin && (
                <button onClick={addDay} className="flex flex-col items-center justify-center py-3 px-3 rounded text-[#5A4D41] bg-white/50 hover:bg-white border border-dashed border-[#A3704C] shrink-0 font-mono">
                  <PlusCircle size={16} />
                  <span className="text-[8px] font-bold mt-0.5">+ 天數</span>
                </button>
              )}
            </div>

            {/* 置中大標題 */}
            <div className="text-center border-b border-[#D3C7B4] pb-4 mb-5">
              <span className="bg-[#5A4D41] text-[#EFECE6] font-mono text-[9px] font-bold px-2.5 py-0.5 rounded mb-1.5 inline-block tracking-wider">DAY {selectedDay}</span>
              {isAdmin ? (
                <input className="w-3/4 mx-auto text-center text-base font-bold text-[#2C2A29] border-b border-dashed border-gray-400 bg-transparent focus:outline-none block font-mono" value={currentDay.title} onChange={(e) => {
                  const newItin = {...editData.itinerary};
                  newItin[selectedDay].title = e.target.value;
                  setEditData({...editData, itinerary: newItin});
                }} placeholder="輸入行程主題" />
              ) : (
                <h3 className="text-base font-bold text-[#2C2A29] font-mono">{currentDay.title}</h3>
              )}
            </div>

            {/* 時間軸清單 */}
            <div className="relative">
              {currentDay.events && currentDay.events.length > 0 ? currentDay.events.map((ev, idx) => (
                <div key={idx} className="flex mb-5 relative group font-mono">
                  {idx !== currentDay.events.length - 1 && <div className="absolute left-[66px] top-6 bottom-[-24px] w-[2px] bg-[#D3C7B4] z-0"></div>}
                  
                  <div className="w-14 shrink-0 text-right pr-2.5 pt-3">
                    {isAdmin ? (
                      <div className="space-y-1">
                        <input className="w-full text-right text-xs font-black text-[#2C2A29] border border-gray-300 rounded px-1 bg-white" value={ev.time} onChange={(e) => handleEventChange(selectedDay, idx, 'time', e.target.value)} placeholder="09:00" />
                        <input className="w-full text-right text-[9px] text-gray-500 border border-gray-300 rounded px-1 bg-white" value={ev.endTime} onChange={(e) => handleEventChange(selectedDay, idx, 'endTime', e.target.value)} placeholder="結束" />
                      </div>
                    ) : (
                      <>
                        <div className="text-xs font-black text-[#2C2A29]">{ev.time}</div>
                        {ev.endTime && <div className="text-[9px] text-gray-500">— {ev.endTime}</div>}
                      </>
                    )}
                  </div>
                  
                  <div className="w-4 flex justify-center pt-3.5 relative z-10 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-none rotate-45 border-2 border-[#5A4D41] bg-[#F4F1EA]"></div>
                  </div>
                  
                  <div className={`flex-1 ml-2.5 bg-white border ${isAdmin ? 'border-[#A3704C]' : 'border-[#D3C7B4]'} rounded-lg p-3.5 shadow-sm relative`}>
                    {isAdmin && (
                      <button onClick={() => removeEvent(selectedDay, idx)} className="absolute top-2 right-2 text-red-600 hover:text-red-800 p-1 bg-red-50 rounded">
                        <Trash2 size={13} />
                      </button>
                    )}

                    <div className="flex items-start">
                      <div className="bg-[#EFECE6] text-[#5A4D41] p-2 rounded mr-2.5 shrink-0">
                        {isAdmin ? (
                          <select className="bg-transparent text-xs text-[#5A4D41] focus:outline-none font-mono" value={ev.icon} onChange={(e) => handleEventChange(selectedDay, idx, 'icon', e.target.value)}>
                            <option value="pin">📍 地標</option><option value="plane">✈️ 班機</option>
                            <option value="coffee">☕️ 餐飲</option><option value="store">🏢 展館</option>
                          </select>
                        ) : getEventIcon(ev.icon)}
                      </div>
                      
                      <div className="flex-1 w-full mr-3">
                        {isAdmin ? (
                          <div className="space-y-1.5 w-full">
                            <input className="w-full font-bold text-[#2C2A29] border-b border-gray-200 bg-[#F9F8F6] px-1 text-xs" value={ev.title} onChange={(e) => handleEventChange(selectedDay, idx, 'title', e.target.value)} placeholder="主標題" />
                            <input className="w-full text-[11px] text-gray-600 border-b border-gray-200 bg-[#F9F8F6] px-1" value={ev.subtitle} onChange={(e) => handleEventChange(selectedDay, idx, 'subtitle', e.target.value)} placeholder="副標題" />
                            <input className="w-full text-[10px] text-gray-500 border-b border-gray-200 bg-[#F9F8F6] px-1" value={ev.note} onChange={(e) => handleEventChange(selectedDay, idx, 'note', e.target.value)} placeholder="備註" />
                            <div className="pt-1.5 mt-1.5 border-t border-dashed border-gray-200 space-y-1">
                              <input className="w-full text-[10px] border border-gray-300 rounded px-1.5 py-0.5 bg-white" value={ev.mapUrl} onChange={(e) => handleEventChange(selectedDay, idx, 'mapUrl', e.target.value)} placeholder="Google Maps 連結" />
                              <input className="w-full text-[10px] border border-gray-300 rounded px-1.5 py-0.5 bg-white" value={ev.attachmentUrl} onChange={(e) => handleEventChange(selectedDay, idx, 'attachmentUrl', e.target.value)} placeholder="附件網址" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="font-bold text-[#2C2A29] text-xs">{ev.title}</div>
                            {ev.subtitle && <div className="text-[11px] text-gray-600 mt-0.5">{ev.subtitle}</div>}
                            {ev.note && <div className="text-[10px] text-[#A3704C] mt-1 font-sans">{ev.note}</div>}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {!isAdmin && (ev.mapUrl || ev.attachmentUrl) && (
                      <div className="flex flex-wrap gap-2 mt-2.5 pt-2.5 border-t border-[#EFECE6] font-sans">
                        {ev.mapUrl && <a href={ev.mapUrl} target="_blank" rel="noreferrer" className="flex items-center text-[10px] font-bold text-[#5A4D41] bg-[#EFECE6] hover:bg-[#D3C7B4] px-2.5 py-1 rounded transition-colors"><MapPin size={11} className="mr-1 text-[#A3704C]" /> Google Maps</a>}
                        {ev.attachmentUrl && <a href={ev.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center text-[10px] font-bold text-[#5A4D41] bg-[#EFECE6] hover:bg-[#D3C7B4] px-2.5 py-1 rounded transition-colors"><LinkIcon size={11} className="mr-1 text-[#A3704C]" /> 相關附件</a>}
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400 font-mono text-xs">尚無建立排程</div>
              )}
              
              {isAdmin && (
                <div className="ml-[72px] mt-2 font-mono">
                  <button onClick={() => addEvent(selectedDay)} className="flex items-center text-xs font-bold text-[#5A4D41] bg-[#EFECE6] px-3.5 py-2 rounded border border-[#A3704C] border-dashed hover:bg-[#D3C7B4]">
                    <PlusCircle size={15} className="mr-1.5 text-[#A3704C]" /> 增加排程項目
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'checklist':
        return (
          <div className="p-4 animate-in fade-in duration-300 font-mono">
             <div className="text-[10px] text-[#A3704C] font-bold tracking-widest mb-1">PRE-FLIGHT CHECK</div>
             <h2 className="text-xl font-black text-[#2C2A29] mb-1">行前裝備清單</h2>
             <p className="text-[11px] text-gray-500 mb-4">勾選狀態僅保留在當前終端裝置。</p>
             <div className="bg-white rounded-lg shadow-sm border border-[#D3C7B4] overflow-hidden">
                {[ { id: '1', label: '護照 / 證件' }, { id: '2', label: 'Visit Japan Web 登錄證明' }, { id: '3', label: '行動網路 / 漫遊開通' }, { id: '4', label: '日幣現金 (應急)' }, { id: '5', label: '國際信用卡' }, { id: '6', label: '大容量行動電源' }, { id: '7', label: '商務名片 (充足)' }, { id: '8', label: '展覽入場 QR Code' } ].map((item) => (
                  <div key={item.id} onClick={() => toggleCheck(item.id)} className="flex items-center p-3.5 border-b border-[#EFECE6] last:border-b-0 cursor-pointer hover:bg-[#F9F8F6]">
                    <div className={`w-5 h-5 rounded-none border-2 flex items-center justify-center mr-3 transition-colors ${checklist[item.id] ? 'border-[#5A4D41] bg-[#5A4D41]' : 'border-[#D3C7B4]'}`}>
                      {checklist[item.id] && <CheckSquare size={13} className="text-[#EFECE6]" />}
                    </div>
                    <span className={`text-xs font-medium ${checklist[item.id] ? 'text-gray-400 line-through' : 'text-[#2C2A29]'}`}>{item.label}</span>
                  </div>
                ))}
             </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-4 space-y-4 animate-in fade-in duration-300 flex flex-col h-[75vh] font-mono">
            <div className="bg-[#2C2A29] text-[#EFECE6] rounded-lg shadow-md overflow-hidden border-t-2 border-[#A3704C]">
              <div className="p-4 flex items-center border-b border-[#3E352C]">
                <div className="bg-[#A3704C] text-[#EFECE6] rounded p-2.5 mr-3"><User size={20} /></div>
                <div><div className="text-[9px] opacity-70 tracking-widest">COMMANDER // 總召</div><div className="text-base font-bold">Mike Chiang</div></div>
              </div>
              <div className="p-4 space-y-3 bg-[#22201F] text-xs">
                <div><div className="text-[9px] opacity-60">LINE CONTACT</div><div className="font-bold flex justify-between items-center mt-0.5"><span>開啟通訊通道</span><ExternalLink size={14} className="text-[#A3704C]" /></div></div>
                <div><div className="text-[9px] opacity-60">WECHAT ID</div><div className="font-bold tracking-wider mt-0.5">mike_chiang_0907</div></div>
              </div>
            </div>
            <div className="mt-auto pt-10 pb-4 text-center">
              <button onClick={handleAdminLogin} className="text-[#6B5B4B] hover:text-[#2C2A29] flex items-center justify-center w-full text-xs font-bold transition-colors">
                <Shield size={14} className="mr-1 text-[#A3704C]" />{isAdmin ? '登出後台管理' : '系統後台解鎖'}
              </button>
            </div>
          </div>
        );
      default:
        return <div className="p-10 text-center text-gray-400 font-mono">系統建置中...</div>;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#F4F1EA] min-h-screen pb-24 font-sans shadow-2xl relative border-x border-[#D3C7B4]">
      {/* 頂部導覽列 */}
      <div className="bg-white text-center py-3 border-b border-[#D3C7B4] shadow-sm sticky top-0 z-20 flex justify-center items-center px-4">
        <div className="text-[#2C2A29] font-black text-base tracking-widest font-mono flex items-center">
          <Wrench size={16} className="mr-1.5 text-[#A3704C]" /> {appData.brandName}
        </div>
        {isAdmin && <span className="absolute right-4 text-[9px] bg-[#A3704C] text-white px-2 py-0.5 rounded font-mono font-bold tracking-widest">ADMIN</span>}
      </div>
      
      {renderContent()}

      {/* 底部導覽列 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D3C7B4] flex justify-around p-1.5 pb-7 max-w-md mx-auto z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        {[
          { id: 'home', icon: Home, label: '首頁' },
          { id: 'itinerary', icon: Calendar, label: '行程' },
          { id: 'checklist', icon: CheckSquare, label: '裝備' },
          { id: 'contact', icon: User, label: '通訊' }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center p-1.5 w-16 transition-colors font-mono ${activeTab === tab.id ? 'text-[#A3704C]' : 'text-gray-400 hover:text-gray-600'}`}>
            <tab.icon size={20} className="mb-0.5" />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}