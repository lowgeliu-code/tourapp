import React, { useState, useEffect } from 'react';
import { 
  Home, Calendar, CheckSquare, User, MapPin, 
  Bell, ExternalLink, Settings, Edit3, Save,
  Plane, Coffee, Store, Link as LinkIcon, PlusCircle, Trash2
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
  brandName: "FUTUREPNP",
  eventTitle: "Highly-functional\nMaterial Week 2026",
  eventLocation: "幕張メッセ (Makuhari Messe)",
  eventDate: "2026.09.29 — 10.03",
  announcement: "小提醒～9:50記得帶著展覽票在Hall 1 集合哦😊",
  nextTime: "9:45",
  nextLocation: "桃園機場集合",
  nextDetail: "T2華航 團體報到櫃檯",
  itinerary: {
    1: { date: "9/29", weekday: "週二", title: "抵達日本・入住飯店", events: [
      { time: "9:45", endTime: "", icon: "pin", title: "桃園機場集合", subtitle: "T2華航 團體報到櫃檯", note: "請攜帶護照", mapUrl: "https://maps.google.com", attachmentUrl: "" }
    ]},
    2: { date: "9/30", weekday: "週三", title: "PCB / CCL專家", events: [] },
    3: { date: "10/1", weekday: "週四", title: "展覽參訪", events: [] },
    4: { date: "10/2", weekday: "週五", title: "展覽參訪", events: [] },
    5: { date: "10/3", weekday: "週六", title: "賦歸", events: [] }
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
      alert('更新成功！所有客戶的行程與首頁已同步。');
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
      alert("✅ 登入成功！");
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
      updatedEvents.push({ time: "12:00", endTime: "", icon: "pin", title: "新增行程", subtitle: "", note: "", mapUrl: "", attachmentUrl: "" });
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const removeEvent = (day, index) => {
    if(window.confirm('確定要刪除這個行程嗎？')){
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

  // 增加天數
  const addDay = () => {
    setEditData(prev => {
      const daysCount = Object.keys(prev.itinerary).length + 1;
      return {
        ...prev,
        itinerary: {
          ...prev.itinerary,
          [daysCount]: { date: "10/4", weekday: "週日", title: "新的一天行程", events: [] }
        }
      };
    });
  };

  // 刪除天數
  const removeDay = (dayNum) => {
    if (dayNum === 1) {
      alert("第一天不能刪除喔！");
      return;
    }
    if (window.confirm(`確定要刪除 DAY ${dayNum} 及其所有行程嗎？`)) {
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
            <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold italic mb-2 tracking-tight whitespace-pre-line">{appData.eventTitle}</h2>
                <div className="flex items-center text-sm opacity-90 mt-4"><MapPin size={16} className="mr-1 min-w-[16px]" /><span>{appData.eventLocation}</span></div>
                <div className="text-sm opacity-90 mt-1">{appData.eventDate}</div>
              </div>
            </div>
            
            {isAdmin ? (
              <div className="bg-yellow-50 border-2 border-yellow-400 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center text-yellow-700 font-bold mb-4 text-lg">
                  <Edit3 size={20} className="mr-2" /> 首頁管理模式
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-yellow-200 shadow-sm space-y-3">
                    <div className="text-sm font-bold text-yellow-800 border-b border-yellow-100 pb-2 mb-2">📌 大會基本資訊</div>
                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">頂部品牌名稱</label><input className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 font-bold" value={editData.brandName} onChange={(e) => setEditData({...editData, brandName: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">活動大標題</label><textarea className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 font-bold" rows="2" value={editData.eventTitle} onChange={(e) => setEditData({...editData, eventTitle: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">展覽地點</label><input className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50" value={editData.eventLocation} onChange={(e) => setEditData({...editData, eventLocation: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">活動日期</label><input className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50" value={editData.eventDate} onChange={(e) => setEditData({...editData, eventDate: e.target.value})} /></div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-yellow-200 shadow-sm space-y-3">
                    <div className="text-sm font-bold text-yellow-800 border-b border-yellow-100 pb-2 mb-2">🚀 即時動態與行程</div>
                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">重要公告</label><textarea className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50" rows="2" value={editData.announcement} onChange={(e) => setEditData({...editData, announcement: e.target.value})} /></div>
                    <div className="flex gap-2">
                      <div className="w-1/3"><label className="text-xs font-bold text-gray-500 mb-1 block">時間</label><input className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 font-bold" value={editData.nextTime} onChange={(e) => setEditData({...editData, nextTime: e.target.value})} /></div>
                      <div className="w-2/3"><label className="text-xs font-bold text-gray-500 mb-1 block">下一站地點</label><input className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 font-bold" value={editData.nextLocation} onChange={(e) => setEditData({...editData, nextLocation: e.target.value})} /></div>
                    </div>
                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">地點補充說明 (選填)</label><input className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 text-gray-500" value={editData.nextDetail} onChange={(e) => setEditData({...editData, nextDetail: e.target.value})} /></div>
                  </div>
                  <button onClick={handleSaveToCloud} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center hover:bg-blue-700 shadow-md"><Save size={24} className="mr-2" /> 儲存變更</button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center"><div className="bg-orange-200 p-2 rounded-xl mr-4"><Bell size={20} className="text-orange-700" /></div><div><div className="text-xs text-orange-800 font-bold mb-1">重要公告</div><div className="text-sm text-gray-800 font-medium whitespace-pre-line">{appData.announcement}</div></div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-md"><div className="text-xs opacity-80 mb-2">目前行程</div><div className="text-xl font-bold mb-1">出發前預覽</div><div className="text-sm opacity-90">行程尚未開始</div></div>
                  <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm"><div className="text-xs text-gray-500 mb-2">下一個行程</div><div className="text-2xl font-black text-gray-800 mb-1">{appData.nextTime}</div><div className="text-sm font-bold text-gray-600">{appData.nextLocation}</div>
                    {appData.nextDetail && <div className="text-xs text-gray-400 mt-2 flex items-center"><MapPin size={12} className="mr-1 min-w-[12px]" /> {appData.nextDetail}</div>}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'itinerary':
        return (
          <div className="p-4 animate-in fade-in duration-300">
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center shadow-sm mb-6">
              <div className="bg-orange-200 p-2 rounded-xl mr-4 shrink-0"><Bell size={20} className="text-orange-700" /></div>
              <div><div className="text-xs text-orange-800 font-bold mb-1">重要公告</div><div className="text-sm text-gray-800 font-medium whitespace-pre-line">{displayData.announcement}</div><div className="text-[10px] text-gray-400 mt-1">與首頁同步更新</div></div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-[10px] font-bold text-blue-500 tracking-wider mb-1">TRIP SCHEDULE</div>
                <h2 className="text-2xl font-black text-gray-800">每日行程</h2>
              </div>
              {isAdmin && (
                <button onClick={handleSaveToCloud} className="bg-yellow-400 text-yellow-900 font-bold text-xs px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-yellow-500">
                  <Save size={14} className="mr-1" /> 儲存行程
                </button>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mb-4">點選日期查看全天安排、集合地點及地圖。</p>

            {/* 日期選擇列 (含新增/刪除天數) */}
            <div className="bg-gray-100 rounded-2xl p-1 flex items-center mb-6 overflow-x-auto shadow-inner gap-1">
              {Object.keys(displayData.itinerary).map((dayNumStr) => {
                const dayNum = Number(dayNumStr);
                const dayInfo = displayData.itinerary[dayNum];
                return (
                  <div key={dayNum} className="relative group shrink-0">
                    <button onClick={() => setSelectedDay(dayNum)} className={`flex flex-col items-center py-2 px-4 rounded-xl min-w-[70px] transition-all ${selectedDay === dayNum ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                      <span className="text-[10px] font-bold mb-0.5">DAY {dayNum}</span>
                      {isAdmin ? (
                        <div className="space-y-0.5 text-center">
                          <input className="w-12 text-center text-xs font-black bg-gray-50 border rounded text-blue-600" value={dayInfo.date} onChange={(e) => {
                            const newItin = {...editData.itinerary};
                            newItin[dayNum].date = e.target.value;
                            setEditData({...editData, itinerary: newItin});
                          }} />
                          <input className="w-12 text-center text-[9px] bg-gray-50 border rounded text-gray-500" value={dayInfo.weekday} onChange={(e) => {
                            const newItin = {...editData.itinerary};
                            newItin[dayNum].weekday = e.target.value;
                            setEditData({...editData, itinerary: newItin});
                          }} />
                        </div>
                      ) : (
                        <>
                          <span className={`text-sm font-black ${selectedDay === dayNum ? 'text-blue-600' : 'text-gray-600'}`}>{dayInfo.date}</span>
                          <span className="text-[10px]">{dayInfo.weekday}</span>
                        </>
                      )}
                    </button>
                    {isAdmin && dayNum !== 1 && (
                      <button onClick={() => removeDay(dayNum)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                );
              })}

              {isAdmin && (
                <button onClick={addDay} className="flex flex-col items-center justify-center py-4 px-4 rounded-xl min-w-[60px] text-blue-500 bg-white/50 hover:bg-white border border-dashed border-blue-300">
                  <PlusCircle size={20} />
                  <span className="text-[9px] font-bold mt-1">加天數</span>
                </button>
              )}
            </div>

            {/* 每日標題 (置中對齊) */}
            <div className="text-center border-b border-gray-200 pb-4 mb-6">
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full mb-2 inline-block">DAY {selectedDay}</span>
              {isAdmin ? (
                <input className="w-3/4 mx-auto text-center text-xl font-bold text-gray-800 border-b border-dashed border-gray-300 bg-transparent focus:outline-none block" value={currentDay.title} onChange={(e) => {
                  const newItin = {...editData.itinerary};
                  newItin[selectedDay].title = e.target.value;
                  setEditData({...editData, itinerary: newItin});
                }} placeholder="例如：抵達日本" />
              ) : (
                <h3 className="text-xl font-bold text-gray-800">{currentDay.title}</h3>
              )}
            </div>

            {/* 行程列表 */}
            <div className="relative">
              {currentDay.events && currentDay.events.length > 0 ? currentDay.events.map((ev, idx) => (
                <div key={idx} className="flex mb-6 relative group">
                  {idx !== currentDay.events.length - 1 && <div className="absolute left-[70px] top-8 bottom-[-30px] w-[2px] bg-blue-100 z-0"></div>}
                  
                  <div className="w-16 shrink-0 text-right pr-3 pt-4">
                    {isAdmin ? (
                      <div className="space-y-1">
                        <input className="w-full text-right text-sm font-black text-blue-900 border border-gray-200 rounded px-1" value={ev.time} onChange={(e) => handleEventChange(selectedDay, idx, 'time', e.target.value)} placeholder="09:00" />
                        <input className="w-full text-right text-[10px] text-gray-500 border border-gray-200 rounded px-1" value={ev.endTime} onChange={(e) => handleEventChange(selectedDay, idx, 'endTime', e.target.value)} placeholder="結束時間" />
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-black text-blue-900">{ev.time}</div>
                        {ev.endTime && <div className="text-[10px] text-gray-400">— {ev.endTime}</div>}
                      </>
                    )}
                  </div>
                  
                  <div className="w-4 flex justify-center pt-[22px] relative z-10 shrink-0">
                    <div className="w-3 h-3 rounded-full border-[2.5px] border-blue-500 bg-white"></div>
                  </div>
                  
                  <div className={`flex-1 ml-3 bg-white border ${isAdmin ? 'border-yellow-300' : 'border-gray-100'} rounded-2xl p-4 shadow-sm relative`}>
                    {isAdmin && (
                      <button onClick={() => removeEvent(selectedDay, idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1 bg-red-50 rounded-md">
                        <Trash2 size={14} />
                      </button>
                    )}

                    <div className="flex items-start">
                      <div className="bg-blue-50 text-blue-500 p-2.5 rounded-xl mr-3 shrink-0">
                        {isAdmin ? (
                          <select className="bg-transparent text-xs text-blue-600 focus:outline-none" value={ev.icon} onChange={(e) => handleEventChange(selectedDay, idx, 'icon', e.target.value)}>
                            <option value="pin">📍 地標</option><option value="plane">✈️ 飛機</option>
                            <option value="coffee">☕️ 餐飲</option><option value="store">🏢 展館</option>
                          </select>
                        ) : getEventIcon(ev.icon)}
                      </div>
                      
                      <div className="flex-1 w-full mr-4">
                        {isAdmin ? (
                          <div className="space-y-2 w-full">
                            <input className="w-full font-bold text-gray-800 border-b border-gray-200 bg-gray-50 px-1 text-sm" value={ev.title} onChange={(e) => handleEventChange(selectedDay, idx, 'title', e.target.value)} placeholder="行程標題" />
                            <input className="w-full text-xs text-gray-500 border-b border-gray-200 bg-gray-50 px-1" value={ev.subtitle} onChange={(e) => handleEventChange(selectedDay, idx, 'subtitle', e.target.value)} placeholder="副標題/補充說明" />
                            <input className="w-full text-[10px] text-gray-400 border-b border-gray-200 bg-gray-50 px-1" value={ev.note} onChange={(e) => handleEventChange(selectedDay, idx, 'note', e.target.value)} placeholder="小備註" />
                            <div className="pt-2 mt-2 border-t border-dashed border-gray-200 space-y-1">
                              <input className="w-full text-xs border border-gray-300 rounded px-2 py-1" value={ev.mapUrl} onChange={(e) => handleEventChange(selectedDay, idx, 'mapUrl', e.target.value)} placeholder="Google Maps 網址" />
                              <input className="w-full text-xs border border-gray-300 rounded px-2 py-1" value={ev.attachmentUrl} onChange={(e) => handleEventChange(selectedDay, idx, 'attachmentUrl', e.target.value)} placeholder="附件 / 網頁連結" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="font-bold text-gray-800">{ev.title}</div>
                            {ev.subtitle && <div className="text-xs text-gray-500 mt-1">{ev.subtitle}</div>}
                            {ev.note && <div className="text-[10px] text-gray-400 mt-2">{ev.note}</div>}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {!isAdmin && (ev.mapUrl || ev.attachmentUrl) && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-50">
                        {ev.mapUrl && <a href={ev.mapUrl} target="_blank" rel="noreferrer" className="flex items-center text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg"><MapPin size={12} className="mr-1" /> Google Maps</a>}
                        {ev.attachmentUrl && <a href={ev.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg"><LinkIcon size={12} className="mr-1" /> 查看附件</a>}
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-gray-400"><p className="text-sm">尚無行程資料</p></div>
              )}
              
              {isAdmin && (
                <div className="ml-[82px] mt-2">
                  <button onClick={() => addEvent(selectedDay)} className="flex items-center text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 border-dashed">
                    <PlusCircle size={16} className="mr-2" /> 新增行程
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'checklist':
        return (
          <div className="p-4 animate-in fade-in duration-300">
             <h2 className="text-xl font-bold mb-2 text-gray-800">出發前確認</h2>
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
                {[ { id: '1', label: '護照' }, { id: '2', label: '入境申請 Visit Japan Web' }, { id: '3', label: '網路 / 漫遊' }, { id: '4', label: '少量日幣現金' }, { id: '5', label: '信用卡' }, { id: '6', label: '行動電源' } ].map((item) => (
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
              <button onClick={handleAdminLogin} className="text-gray-300 hover:text-gray-500 flex items-center justify-center w-full text-xs font-bold transition-colors">
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
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center p-2 w-16 transition-colors ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`}>
            <tab.icon size={22} className="mb-1" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}