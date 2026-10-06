import React, { useState, useEffect } from 'react';
import {
Home, Calendar, Map, CheckSquare, User, MapPin,
Bell, ExternalLink, Settings, Edit3, Save,
Plane, Coffee, Store, Link as LinkIcon, PlusCircle, Trash2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

// 1. 您的 Firebase 金鑰
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

// 預設資料
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
{ time: "9:45", endTime: "", icon: "pin", title: "桃園機場集合", subtitle: "T2華航 團體報到櫃檯", note: "請攜帶護照", mapUrl: "", attachmentUrl: "" },
{ time: "12:15", endTime: "16:35", icon: "plane", title: "CI104 台北 → 成田", subtitle: "TPE → NRT", note: "抵達後搭乘中巴前往飯店", mapUrl: "", attachmentUrl: "" }
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
alert("✅ 登入成功！您現在可以編輯「首頁」與「行程」了。");
} else if (pwd !== null) {
alert("❌ 密碼錯誤");
}
};

// --- 行程與天數編輯功能 ---
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

const handleDayInfoChange = (day, field, value) => {
setEditData(prev => ({
...prev,
itinerary: {
...prev.itinerary,
[day]: { ...prev.itinerary[day], [field]: value }
}
}));
};

const addDay = () => {
setEditData(prev => {
const currentDays = Object.keys(prev.itinerary).length;
const nextDay = currentDays + 1;
return {
...prev,
itinerary: {
...prev.itinerary,
[nextDay]: { date: "新日期", weekday: "星期", title: "新增天數", events: [] }
}
};
});
};

const removeDay = (dayNum) => {
if(window.confirm(確定要刪除 DAY ${dayNum} 及其所有行程嗎？)){
setEditData(prev => {
const newItin = {};
let counter = 1;
Object.keys(prev.itinerary).sort((a,b)=>Number(a)-Number(b)).forEach(k => {
if (Number(k) !== dayNum) {
newItin[counter] = prev.itinerary[k];
counter++;
}
});
return { ...prev, itinerary: newItin };
});
if (selectedDay === dayNum) setSelectedDay(1);
}
};

const getEventIcon = (type) => {
switch(type) {
case 'plane': return ;
case 'coffee': return ;
case 'store': return ;
default: return ;
}
};

const renderContent = () => {
switch (activeTab) {
case 'home':
return (



{appData.eventTitle}
{appData.eventLocation}
{appData.eventDate}



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
    const displayData = isAdmin ? editData : appData;
    const currentDay = displayData.itinerary[selectedDay] || { date: "", weekday: "", title: "", events: [] };
    const daysKeys = Object.keys(displayData.itinerary).sort((a,b)=>Number(a)-Number(b));

    return (
      <div className="p-4 animate-in fade-in duration-300">
        {/* 頂部同步公告 */}
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
            <button onClick={handleSaveToCloud} className="bg-yellow-400 text-yellow-900 font-bold text-xs px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-yellow-500 active:scale-95 transition-all">
              <Save size={14} className="mr-1" /> 儲存行程
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mb-4 text-center">點選日期查看全天安排、集合地點及地圖。</p>

        {/* 日期選擇器 */}
        <div className="bg-gray-100 rounded-2xl p-1 flex items-center mb-6 overflow-x-auto shadow-inner gap-1">
          {daysKeys.map((k) => {
            const dayNum = Number(k);
            return (
              <button key={dayNum} onClick={() => setSelectedDay(dayNum)} className={`flex flex-col items-center py-2 px-4 rounded-xl min-w-[64px] transition-all shrink-0 ${selectedDay === dayNum ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                <span className="text-[10px] font-bold mb-0.5">DAY {dayNum}</span>
                <span className={`text-sm font-black ${selectedDay === dayNum ? 'text-blue-600' : 'text-gray-600'}`}>{displayData.itinerary[dayNum].date}</span>
                <span className="text-[10px]">{displayData.itinerary[dayNum].weekday}</span>
              </button>
            );
          })}
          {/* 新增天數按鈕 */}
          {isAdmin && (
            <button onClick={addDay} className="flex flex-col items-center justify-center py-2 px-4 rounded-xl min-w-[64px] h-[68px] text-blue-400 hover:bg-blue-50 border border-dashed border-blue-200 shrink-0 transition-colors">
              <PlusCircle size={20} />
            </button>
          )}
        </div>

        {/* 置中的每日標題與日期編輯 */}
        <div className="flex flex-col items-center border-b border-gray-200 pb-5 mb-6 relative">
          {isAdmin && daysKeys.length > 1 && (
            <button onClick={() => removeDay(selectedDay)} className="absolute right-0 top-0 text-red-400 hover:text-red-600 p-1.5 bg-red-50 rounded-md transition-colors" title="刪除此天">
              <Trash2 size={16} />
            </button>
          )}
          
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full mb-3 inline-block tracking-wider">
            DAY {selectedDay}
          </span>
          
          {isAdmin ? (
            <div className="w-full flex flex-col items-center gap-3">
              <input 
                className="w-full text-center text-xl font-bold text-gray-800 border-b border-dashed border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 pb-1" 
                value={currentDay.title} 
                onChange={(e) => handleDayInfoChange(selectedDay, 'title', e.target.value)} 
                placeholder="輸入標題 (例如：抵達日本)" 
              />
              <div className="flex gap-2 justify-center">
                <input 
                  className="text-center text-sm font-bold text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5 w-24 bg-white" 
                  value={currentDay.date} 
                  onChange={(e) => handleDayInfoChange(selectedDay, 'date', e.target.value)} 
                  placeholder="9/29" 
                />
                <input 
                  className="text-center text-sm font-bold text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5 w-20 bg-white" 
                  value={currentDay.weekday} 
                  onChange={(e) => handleDayInfoChange(selectedDay, 'weekday', e.target.value)} 
                  placeholder="週二" 
                />
              </div>
            </div>
          ) : (
            <h3 className="text-2xl font-black text-gray-800 text-center tracking-tight">{currentDay.title}</h3>
          )}
        </div>

        {/* 行程列表與編輯區 */}
        <div className="relative">
          {currentDay.events.map((ev, idx) => (
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
                        <input className="w-full text-[10px] text-gray-400 border-b border-gray-200 bg-gray-50 px-1" value={ev.note} onChange={(e) => handleEventChange(selectedDay, idx, 'note', e.target.value)} placeholder="小備註 (如：記得帶護照)" />
                        
                        <div className="pt-2 mt-2 border-t border-dashed border-gray-200">
                          <div className="text-[10px] font-bold text-blue-600 mb-1 flex items-center"><MapPin size={10} className="mr-1"/> 連結設定 (有填才會顯示按鈕)</div>
                          <input className="w-full text-xs border border-gray-300 rounded px-2 py-1 mb-1" value={ev.mapUrl} onChange={(e) => handleEventChange(selectedDay, idx, 'mapUrl', e.target.value)} placeholder="Google Maps 網址 (https://...)" />
                          <input className="w-full text-xs border border-gray-300 rounded px-2 py-1" value={ev.attachmentUrl} onChange={(e) => handleEventChange(selectedDay, idx, 'attachmentUrl', e.target.value)} placeholder="附件 / 網頁連結 (https://...)" />
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
                    {ev.mapUrl && (
                      <a href={ev.mapUrl} target="_blank" rel="noreferrer" className="flex items-center text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                        <MapPin size={12} className="mr-1" /> Google Maps
                      </a>
                    )}
                    {ev.attachmentUrl && (
                      <a href={ev.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                        <LinkIcon size={12} className="mr-1" /> 查看附件/網頁
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isAdmin && (
            <div className="ml-[82px] mt-2">
              <button onClick={() => addEvent(selectedDay)} className="flex items-center text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200 border-dashed">
                <PlusCircle size={16} className="mr-2" /> 新增一個行程
              </button>
            </div>
          )}

          {!isAdmin && currentDay.events.length === 0 && (
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


{appData.brandName}
{isAdmin && 編輯模式}


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