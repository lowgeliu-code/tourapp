import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckSquare, User, MapPin, 
  Bell, ExternalLink, Settings, Edit3, Save,
  Plane, Coffee, Store, Hotel, CalendarDays, Link as LinkIcon, PlusCircle, Trash2, Shield, TrendingUp, Star, ArrowUp, ArrowDown
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
  activeEvent: null,
  itinerary: {
    1: { date: "9/29", weekday: "週二", title: "抵達日本・入住飯店", events: [
      { time: "9:45", endTime: "", icon: "pin", title: "桃園機場集合", subtitle: "T2華航 團體報到櫃檯", note: "請攜帶護照", mapUrl: "https://maps.google.com", attachments: [{ name: "展覽手冊", url: "" }] }
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

  const handleAttachmentChange = (day, eventIndex, attIndex, field, value) => {
    setEditData(prev => {
      const updatedEvents = [...prev.itinerary[day].events];
      const currentEv = updatedEvents[eventIndex] || {};
      const atts = [...(currentEv.attachments || [{ name: "", url: "" }])];
      atts[attIndex] = { ...atts[attIndex], [field]: value };
      updatedEvents[eventIndex] = { ...currentEv, attachments: atts };
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const addAttachment = (day, eventIndex) => {
    setEditData(prev => {
      const updatedEvents = [...prev.itinerary[day].events];
      const currentEv = updatedEvents[eventIndex] || {};
      const atts = [...(currentEv.attachments || [{ name: "", url: "" }])];
      atts.push({ name: "", url: "" });
      updatedEvents[eventIndex] = { ...currentEv, attachments: atts };
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const removeAttachment = (day, eventIndex, attIndex) => {
    setEditData(prev => {
      const updatedEvents = [...prev.itinerary[day].events];
      const currentEv = updatedEvents[eventIndex] || {};
      const atts = [...(currentEv.attachments || [{ name: "", url: "" }])];
      atts.splice(attIndex, 1);
      updatedEvents[eventIndex] = { ...currentEv, attachments: atts.length > 0 ? atts : [{ name: "", url: "" }] };
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const addEvent = (day) => {
    setEditData(prev => {
      const updatedEvents = [...prev.itinerary[day].events];
      updatedEvents.push({ time: "12:00", endTime: "", icon: "pin", title: "新增活動項目", subtitle: "", note: "", mapUrl: "", attachments: [{ name: "", url: "" }] });
      return {
        ...prev,
        itinerary: { ...prev.itinerary, [day]: { ...prev.itinerary[day], events: updatedEvents } }
      };
    });
  };

  const removeEvent = (day, index) => {
    if(window.confirm('確定要移除此項活動？')){
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

  const moveEvent = (day, index, direction) => {
    setEditData(prev => {
      const updatedEvents = [...prev.itinerary[day].events];
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
    if (window.confirm(`確定要刪除 DAY ${dayNum} 及其所有活動？`)) {
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
      case 'plane': return <Plane size={16} />;
      case 'coffee': return <Coffee size={16} />;
      case 'store': return <Store size={16} />;
      case 'hotel': return <Hotel size={16} />;
      case 'activity': return <CalendarDays size={16} />;
      default: return <MapPin size={16} />;
    }
  };

  const displayData = isAdmin ? editData : appData;
  const currentDay = displayData.itinerary[selectedDay] || displayData.itinerary[1];

  const renderContent = () => {
    switch (activeTab) {
      case 'itinerary':
        return (
          <div className="p-4 animate-in fade-in duration-300 pb-20">
            {isAdmin && (
              <div className="bg-[#F8FAFC] border-2 border-[#2563EB] p-4 rounded mb-6 shadow-sm space-y-3 font-mono">
                <div className="text-xs font-bold text-[#1E293B] border-b border-gray-200 pb-2 flex items-center">
                  <Edit3 size={16} className="mr-1.5 text-[#2563EB]" /> 🔧 管理員：展會基本資訊設定
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-0.5">品牌名稱</label>
                    <input className="w-full text-xs border rounded p-1 bg-white font-bold" value={editData.brandName} onChange={(e) => setEditData({...editData, brandName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-0.5">展會日期</label>
                    <input className="w-full text-xs border rounded p-1 bg-white" value={editData.eventDate} onChange={(e) => setEditData({...editData, eventDate: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-0.5">活動大標題</label>
                  <input className="w-full text-xs border rounded p-1 bg-white font-bold" value={editData.eventTitle} onChange={(e) => setEditData({...editData, eventTitle: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-0.5">展覽地點</label>
                  <input className="w-full text-xs border rounded p-1 bg-white" value={editData.eventLocation} onChange={(e) => setEditData({...editData, eventLocation: e.target.value})} />
                </div>
              </div>
            )}

            <div className="bg-[#1A2332] text-[#E2E8F0] p-5 rounded shadow-md border-l-4 border-[#3B82F6] mb-6 relative overflow-hidden font-mono">
              <div className="relative z-10">
                <div className="text-[10px] tracking-widest text-[#60A5FA] mb-1">EQUITY RESEARCH // 2026</div>
                <h2 className="text-xl font-black tracking-tight">{displayData.eventTitle}</h2>
                <div className="flex items-center text-xs opacity-80 mt-3">
                  <MapPin size={13} className="mr-1 text-[#60A5FA] shrink-0" />
                  <span>{displayData.eventLocation}</span>
                </div>
                <div className="text-xs opacity-70 mt-0.5">{displayData.eventDate}</div>
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

            {/* 凍結式日期切換列：設定高層級 z-50 與完全不透明的實心背景，確保行程捲上來時會被遮擋在下方 */}
            <div className="sticky top-14 z-50 bg-[#F8FAFC] border-2 border-[#CBD5E1] rounded-lg p-1.5 flex items-center mb-4 shadow-xl gap-1">
              {Object.keys(displayData.itinerary).map((dayNumStr) => {
                const dayNum = Number(dayNumStr);
                const dayInfo = displayData.itinerary[dayNum];
                return (
                  <div key={dayNum} className="relative group shrink-0">
                    <button onClick={() => setSelectedDay(dayNum)} className={`flex flex-col items-center py-1 px-2.5 rounded transition-all font-mono focus:outline-none focus:ring-0 ${selectedDay === dayNum ? 'bg-[#1E293B] text-white shadow' : 'text-[#475569] hover:text-[#0F172A] bg-white border border-gray-200'}`}>
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
                          <span className="text-[11px] font-black">{dayInfo.date}</span>
                          <span className="text-[8px] opacity-70">{dayInfo.weekday}</span>
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
                return (
                  <div key={idx} className="flex mb-5 relative group font-mono">
                    {/* 將時間軸線條的 z-index 設低 (z-0)，確保絕對不會蓋過日期列 */}
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
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-[#2563EB] bg-white"></div>
                    </div>
                    
                    <div className={`flex-1 ml-2.5 bg-white border ${isAdmin ? 'border-[#2563EB]' : 'border-[#CBD5E1]'} rounded p-3.5 shadow-sm relative`}>
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <div className="flex bg-gray-100 rounded border border-gray-300 overflow-hidden">
                            <button onClick={() => moveEvent(selectedDay, idx, 'up')} disabled={idx === 0} title="往上移" className="p-1 hover:bg-gray-200 text-gray-700 disabled:opacity-30 border-r border-gray-300">
                              <ArrowUp size={13} />
                            </button>
                            <button onClick={() => moveEvent(selectedDay, idx, 'down')} disabled={idx === currentDay.events.length - 1} title="往下移" className="p-1 hover:bg-gray-200 text-gray-700 disabled:opacity-30">
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
                            <select className="bg-transparent text-xs text-[#1E293B] focus:outline-none font-mono" value={ev.icon} onChange={(e) => handleEventChange(selectedDay, idx, 'icon', e.target.value)}>
                              <option value="pin">📍 地標</option>
                              <option value="plane">✈️ 班機</option>
                              <option value="coffee">☕ 餐飲</option>
                              <option value="store">🏢 展館</option>
                              <option value="hotel">🏨 飯店</option>
                              <option value="activity">📅 活動</option>
                            </select>
                          ) : getEventIcon(ev.icon)}
                        </div>
                        
                        <div className="flex-1 w-full mr-3">
                          {isAdmin ? (
                            <div className="space-y-1.5 w-full pt-8">
                              <input className="w-full font-bold text-[#0F172A] border-b border-gray-200 bg-[#F8FAFC] px-1 text-xs" value={ev.title} onChange={(e) => handleEventChange(selectedDay, idx, 'title', e.target.value)} placeholder="主標題" />
                              <input className="w-full text-[11px] text-gray-600 border-b border-gray-200 bg-[#F8FAFC] px-1" value={ev.subtitle} onChange={(e) => handleEventChange(selectedDay, idx, 'subtitle', e.target.value)} placeholder="副標題" />
                              <input className="w-full text-[10px] text-gray-500 border-b border-gray-200 bg-[#F8FAFC] px-1" value={ev.note} onChange={(e) => handleEventChange(selectedDay, idx, 'note', e.target.value)} placeholder="備註" />
                              
                              <div className="pt-1.5 mt-1.5 border-t border-dashed border-gray-200 space-y-1.5">
                                <input className="w-full text-[10px] border border-gray-300 rounded px-1.5 py-0.5 bg-white" value={ev.mapUrl || ""} onChange={(e) => handleEventChange(selectedDay, idx, 'mapUrl', e.target.value)} placeholder="Google Maps 連結" />
                                
                                <div className="space-y-1 pt-1">
                                  <div className="text-[10px] font-bold text-[#2563EB]">附件列表：</div>
                                  {(ev.attachments || [{ name: "", url: "" }]).map((att, attIdx) => (
                                    <div key={attIdx} className="flex items-center gap-1">
                                      <input 
                                        className="w-1/3 text-[10px] border border-gray-300 rounded px-1.5 py-0.5 bg-white font-bold" 
                                        value={att.name || ""} 
                                        onChange={(e) => handleAttachmentChange(selectedDay, idx, attIdx, 'name', e.target.value)} 
                                        placeholder="預覽名稱 (如手冊)" 
                                      />
                                      <input 
                                        className="flex-1 text-[10px] border border-gray-300 rounded px-1.5 py-0.5 bg-white" 
                                        value={att.url || ""} 
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
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="font-bold text-[#0F172A] text-xs">{ev.title}</div>
                              {ev.subtitle && <div className="text-[11px] text-gray-600 mt-0.5">{ev.subtitle}</div>}
                              {ev.note && <div className="text-[10px] text-[#2563EB] mt-1 font-sans">{ev.note}</div>}
                            </>
                          )}
                        </div>
                      </div>
                      
                      {!isAdmin && (ev.mapUrl || (ev.attachments && ev.attachments.some(a => a.url))) && (
                        <div className="flex flex-wrap gap-2 mt-2.5 pt-2.5 border-t border-[#F1F5F9] font-sans">
                          {ev.mapUrl && <a href={ev.mapUrl} target="_blank" rel="noreferrer" className="flex items-center text-[10px] font-bold text-[#1E293B] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-2.5 py-1 rounded transition-colors"><MapPin size={11} className="mr-1 text-[#2563EB]" /> Google Maps</a>}
                          {ev.attachments && ev.attachments.map((att, i) => att.url ? (
                            <a key={i} href={att.url} target="_blank" rel="noreferrer" className="flex items-center text-[10px] font-bold text-[#1E293B] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-2.5 py-1 rounded transition-colors">
                              <LinkIcon size={11} className="mr-1 text-[#2563EB]" /> {att.name || `附件 ${i + 1}`}
                            </a>
                          ) : null)}
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
                {displayData.checklist.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center gap-2">
                    <input className="flex-1 text-xs border border-gray-300 rounded p-1.5 bg-white" value={item.label} onChange={(e) => handleChecklistChange(idx, e.target.value)} />
                    <button onClick={() => removeChecklistItem(idx)} className="text-red-600 p-1 bg-red-50 rounded hover:bg-red-100"><Trash2 size={14} /></button>
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
          <div className="p-4 space-y-4 animate-in fade-in duration-300 flex flex-col h-[75vh] font-mono pb-20">
            <div className="flex justify-between items-center mb-1">
              <div>
                <div className="text-[10px] text-[#2563EB] font-bold tracking-widest mb-1">COMMUNICATION</div>
                <h2 className="text-xl font-black text-[#0F172A]">通訊與聯絡窗口</h2>
              </div>
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
                  <label className="text-[10px] text-blue-600 block mb-2">自訂通訊欄位</label>
                  <div className="space-y-2">
                    {(editData.contact.fields || []).map((field, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input className="w-1/3 border rounded p-1 bg-white text-[11px] font-bold text-gray-700" value={field.label} onChange={(e) => handleContactFieldChange(idx, 'label', e.target.value)} placeholder="欄位名" />
                        <input className="flex-1 border rounded p-1 bg-white text-[11px]" value={field.value} onChange={(e) => handleContactFieldChange(idx, 'value', e.target.value)} placeholder="內容" />
                        <button onClick={() => removeContactField(idx)} className="text-red-600 p-1 bg-red-50 rounded hover:bg-red-100"><Trash2 size={14} /></button>
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
    <div className="max-w-md mx-auto bg-[#F8FAFC] min-h-screen pb-28 font-sans shadow-2xl relative border-x border-[#CBD5E1]">
      <div className="bg-white text-center py-3.5 border-b border-[#CBD5E1] shadow-sm sticky top-0 z-20 flex justify-center items-center px-4">
        <div className="text-[#0F172A] font-black text-xs md:text-sm tracking-widest font-mono flex items-center">
          <TrendingUp size={16} className="mr-1.5 text-[#2563EB]" /> {appData.brandName}
        </div>
        {isAdmin && <span className="absolute right-4 text-[9px] bg-[#2563EB] text-white px-2 py-0.5 rounded font-mono font-bold tracking-widest">ADMIN</span>}
      </div>
      
      {renderContent()}

      {isAdmin && (
        <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-30 pointer-events-none animate-in fade-in duration-200">
          <button 
            onClick={handleSaveToCloud}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 px-4 rounded-xl shadow-xl flex items-center justify-center font-mono text-sm pointer-events-auto border-2 border-white/20 active:scale-95 transition-all"
          >
            <Save size={18} className="mr-2" /> 💾 儲存所有變更並同步至雲端
          </button>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#CBD5E1] flex justify-around p-1.5 pb-7 max-w-md mx-auto z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        {[
          { id: 'itinerary', icon: Calendar, label: '行程' },
          { id: 'checklist', icon: CheckSquare, label: '裝備' },
          { id: 'contact', icon: User, label: '通訊' }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center p-1.5 w-20 transition-colors font-mono ${activeTab === tab.id ? 'text-[#2563EB]' : 'text-gray-400 hover:text-gray-600'}`}>
            <tab.icon size={20} className="mb-0.5" />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}