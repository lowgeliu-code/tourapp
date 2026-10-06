import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, doc, getDoc, setDoc, onSnapshot, 
  collection, addDoc, updateDoc, deleteDoc 
} from 'firebase/firestore';
import { 
  Home, Calendar, Map, CheckSquare, User, 
  Bell, MapPin, ChevronRight, ChevronDown, 
  Settings, Check, Plane, ExternalLink, Plus, Edit2, Save, X
} from 'lucide-react';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-trade-show-app';

// Mock Data for Initial Setup (if Firebase is empty)
const defaultChecklist = [
  { id: 'c1', label: '護照' },
  { id: 'c2', label: '入境申請 Visit Japan Web' },
  { id: 'c3', label: '網路 / 漫遊' },
  { id: 'c4', label: '少量日幣現金' },
  { id: 'c5', label: '信用卡' },
  { id: 'c6', label: '行動電源' },
  { id: 'c7', label: '名片' },
  { id: 'c8', label: '展覽入場 QR Code' },
  { id: 'c9', label: '個人藥品' },
];

const defaultContacts = [
  { id: '1', role: '第一聯絡人', name: 'Mike Chiang', line: '開啟 LINE 聯絡', wechat: 'mike_chiang_0907', primary: true },
  { id: '2', role: '第二聯絡人', name: 'Rita Shih', email: 'rita.shih@futurepnp.com', lineId: 'futurepnp_rita', wechat: 'shih_lia', primary: false }
];

export default function TradeShowApp() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  // Data States
  const [announcement, setAnnouncement] = useState('小提醒～9:50記得帶著展覽票在Hall 2集合喔！');
  const [itinerary, setItinerary] = useState([]);
  const [booths, setBooths] = useState([]);
  const [checklistState, setChecklistState] = useState({});
  const [userNotes, setUserNotes] = useState({});

  // UI States
  const [editingAnnouncement, setEditingAnnouncement] = useState(false);
  const [tempAnnouncement, setTempAnnouncement] = useState('');
  const [selectedDay, setSelectedDay] = useState('9/29');
  const [boothFilter, setBoothFilter] = useState({ date: '9/30', period: '上午' });
  const [expandedBooth, setExpandedBooth] = useState(null);
  
  // Form States for Admin
  const [showAddItinerary, setShowAddItinerary] = useState(false);
  const [newItinerary, setNewItinerary] = useState({ day: '9/29', time: '10:00', title: '', desc: '', location: '' });
  const [showAddBooth, setShowAddBooth] = useState(false);
  const [newBooth, setNewBooth] = useState({ date: '9/30', period: '上午', name: '', boothNo: '', hall: '' });

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen to Public Data (Announcement)
    const unsubAnnounce = onSnapshot(
      doc(db, 'artifacts', appId, 'public', 'data', 'config', 'announcement'),
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().text) {
          setAnnouncement(docSnap.data().text);
        }
      },
      (error) => console.error("Error fetching announcement:", error)
    );

    // Listen to Public Data (Itinerary)
    const unsubItinerary = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'itinerary'),
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
        // Sort by time roughly
        items.sort((a, b) => a.time.localeCompare(b.time));
        setItinerary(items.length > 0 ? items : getDefaultItinerary());
      },
      (error) => console.error("Error fetching itinerary:", error)
    );

    // Listen to Public Data (Booths)
    const unsubBooths = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'booths'),
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
        setBooths(items.length > 0 ? items : getDefaultBooths());
      },
      (error) => console.error("Error fetching booths:", error)
    );

    // Listen to Private User Data (Checklist)
    const unsubChecklist = onSnapshot(
      doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'checklist'),
      (docSnap) => {
        if (docSnap.exists()) {
          setChecklistState(docSnap.data().state || {});
        }
      },
      (error) => console.error("Error fetching checklist:", error)
    );

    // Listen to Private User Data (Notes)
    const unsubNotes = onSnapshot(
      collection(db, 'artifacts', appId, 'users', user.uid, 'notes'),
      (snapshot) => {
        const notesObj = {};
        snapshot.forEach((doc) => {
          notesObj[doc.id] = doc.data().text;
        });
        setUserNotes(notesObj);
      },
      (error) => console.error("Error fetching notes:", error)
    );

    return () => {
      unsubAnnounce();
      unsubItinerary();
      unsubBooths();
      unsubChecklist();
      unsubNotes();
    };
  }, [user]);

  const saveAnnouncement = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'announcement'), {
        text: tempAnnouncement
      });
      setEditingAnnouncement(false);
    } catch (e) {
      console.error("Error saving announcement", e);
    }
  };

  const addItineraryItem = async () => {
    if (!user || !newItinerary.title) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'itinerary'), newItinerary);
      setShowAddItinerary(false);
      setNewItinerary({ day: selectedDay, time: '10:00', title: '', desc: '', location: '' });
    } catch (e) {
      console.error("Error adding itinerary", e);
    }
  };

  const addBoothItem = async () => {
    if (!user || !newBooth.name) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'booths'), newBooth);
      setShowAddBooth(false);
      setNewBooth({ date: boothFilter.date, period: boothFilter.period, name: '', boothNo: '', hall: '' });
    } catch (e) {
      console.error("Error adding booth", e);
    }
  };

  const toggleChecklist = async (id) => {
    if (!user) return;
    const newState = { ...checklistState, [id]: !checklistState[id] };
    setChecklistState(newState); // Optimistic UI update
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'checklist'), {
        state: newState
      }, { merge: true });
    } catch (e) {
      console.error("Error saving checklist", e);
    }
  };

  const saveNote = async (boothId, text) => {
    if (!user) return;
    // Optimistic update
    setUserNotes(prev => ({ ...prev, [boothId]: text }));
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'notes', boothId), {
        text: text,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error saving note", e);
    }
  };

  const getDefaultItinerary = () => [
    { id: 'i1', day: '9/29', time: '9:45', title: '桃園機場集合', desc: 'T2華航 團體報到櫃檯\n請攜帶護照', location: 'Google Maps' },
    { id: 'i2', day: '9/29', time: '12:15', title: 'CI104 台北 → 成田', desc: 'TPE → NRT\n抵達後搭乘中巴前往飯店', location: '' },
  ];

  const getDefaultBooths = () => [
    { id: 'b1', date: '9/30', period: '上午', name: '太陽誘電化學科技', boothNo: '11-48', hall: 'Hall 2 · Highly-functional Material Expo' },
    { id: 'b2', date: '9/30', period: '上午', name: 'Resonac', boothNo: '18-9', hall: 'Hall 3 · Material Expo' }
  ];

  const renderHome = () => (
    <div className="pb-24 animate-in fade-in duration-300">
      {/* Header/Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-slate-800 text-white p-6 pt-12 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
           <Map size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-xs backdrop-blur-sm">
             <Plane size={14} /> <span>2026 幕張材料展參訪指南</span>
          </div>
          <h1 className="text-3xl font-bold italic tracking-wide mb-2 leading-tight">Highly-functional<br/>Material Week 2026</h1>
          <p className="flex items-center text-sm text-blue-100 mt-4"><MapPin size={16} className="mr-1"/> 幕張メッセ (Makuhari Messe)</p>
          <p className="text-sm text-blue-100 mt-1">2026.09.29 — 10.03</p>
        </div>
      </div>

      <div className="px-4 -mt-8 relative z-20 space-y-4">
        {/* Announcement Card */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 shadow-sm relative">
          <div className="flex items-start">
            <div className="bg-yellow-100 p-2 rounded-full mr-3 text-yellow-600">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold text-yellow-800 mb-1">重要公告</h3>
              {editingAnnouncement && isAdmin ? (
                <div className="flex items-center mt-2">
                  <textarea 
                    className="w-full text-sm p-2 border rounded-md"
                    value={tempAnnouncement}
                    onChange={(e) => setTempAnnouncement(e.target.value)}
                  />
                  <button onClick={saveAnnouncement} className="ml-2 p-2 bg-blue-600 text-white rounded-full"><Check size={16}/></button>
                </div>
              ) : (
                <p className="text-sm text-gray-800 font-medium">{announcement}</p>
              )}
            </div>
            {isAdmin && !editingAnnouncement && (
              <button onClick={() => { setTempAnnouncement(announcement); setEditingAnnouncement(true); }} className="text-gray-400 hover:text-gray-600">
                <Edit2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Current / Next Schedule */}
        <div className="flex space-x-3">
          <div className="flex-1 bg-blue-600 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between h-36">
            <span className="text-xs text-blue-200 font-medium">目前行程</span>
            <div>
              <h2 className="text-xl font-bold">出發前預覽</h2>
              <p className="text-sm text-blue-100 mt-1">行程尚未開始</p>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-36">
            <span className="text-xs text-gray-400 font-medium">下一個行程</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">9:45</h2>
              <p className="text-sm font-bold text-gray-800 mt-1 leading-tight">桃園機場集合</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center"><MapPin size={10} className="mr-1"/> T2華航 團體櫃檯</p>
            </div>
          </div>
        </div>

        {/* Meeting Point */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
           <div className="p-4 flex items-center border-b border-gray-50">
             <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600">
               <MapPin size={20} />
             </div>
             <div>
               <p className="text-[10px] font-bold text-blue-600 tracking-wider">MEETING POINT</p>
               <h3 className="font-bold text-gray-800">集合位置</h3>
             </div>
           </div>
           <div className="h-40 bg-gray-200 w-full flex items-center justify-center text-gray-400">
              [ Map / Location Image Placeholder ]
           </div>
        </div>
      </div>
    </div>
  );

  const renderItinerary = () => {
    const days = [
      { id: '9/29', label: 'DAY 1', date: '9/29', dayOfWeek: '週二' },
      { id: '9/30', label: 'DAY 2', date: '9/30', dayOfWeek: '週三' },
      { id: '10/1', label: 'DAY 3', date: '10/1', dayOfWeek: '週四' },
      { id: '10/2', label: 'DAY 4', date: '10/2', dayOfWeek: '週五' },
      { id: '10/3', label: 'DAY 5', date: '10/3', dayOfWeek: '週六' },
    ];

    const currentDayItems = itinerary.filter(i => i.day === selectedDay);

    return (
      <div className="bg-gray-50 min-h-screen pb-24 pt-4 animate-in fade-in duration-300">
        <div className="px-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-1">導覽行程</h2>
          <p className="text-xs text-gray-500 mb-4">點選日期查看全天安排、集合地點及地圖。</p>
          
          {/* Day Selector */}
          <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
            {days.map(d => (
              <button 
                key={d.id}
                onClick={() => setSelectedDay(d.id)}
                className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-2xl border transition-all ${
                  selectedDay === d.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-transparent text-gray-400'
                }`}
              >
                <span className={`text-[10px] font-bold ${selectedDay === d.id ? 'text-blue-500' : ''}`}>{d.label}</span>
                <span className={`text-lg font-bold my-1 ${selectedDay === d.id ? 'text-blue-700' : 'text-gray-700'}`}>{d.date}</span>
                <span className={`text-[10px] ${selectedDay === d.id ? 'text-blue-600' : ''}`}>{d.dayOfWeek}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="px-4 mt-6">
          <div className="flex items-center mb-6">
             <span className="bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-md mr-2">{days.find(d=>d.id===selectedDay)?.label}</span>
             <h3 className="text-lg font-bold text-gray-800 flex-1">當日行程</h3>
             <span className="text-sm text-gray-500">{selectedDay}</span>
          </div>

          <div className="relative pl-4 space-y-6">
            {/* Vertical Line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-px bg-blue-100 z-0"></div>

            {currentDayItems.map((item, idx) => (
              <div key={item.id || idx} className="relative z-10 flex">
                <div className="w-16 pt-3 pr-2 text-right">
                   <div className="text-sm font-bold text-blue-900">{item.time}</div>
                </div>
                {/* Timeline Dot */}
                <div className="flex flex-col items-center pt-3.5 mr-3">
                   <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white z-10"></div>
                </div>
                {/* Card */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <h4 className="text-base font-bold text-gray-800">{item.title}</h4>
                  {item.desc && (
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-line leading-relaxed">{item.desc}</p>
                  )}
                  {item.location && (
                    <button className="mt-3 flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                       <MapPin size={12} className="mr-1"/> {item.location}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {currentDayItems.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">此日尚無行程安排</div>
            )}
          </div>

          {/* Admin Add Button */}
          {isAdmin && (
            <div className="mt-8 pt-4 border-t border-gray-200">
               <button 
                  onClick={() => setShowAddItinerary(!showAddItinerary)}
                  className="w-full flex items-center justify-center py-3 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm"
               >
                 <Plus size={16} className="mr-1"/> 新增行程 (管理員)
               </button>
               
               {showAddItinerary && (
                 <div className="mt-4 bg-white p-4 rounded-xl border shadow-sm space-y-3">
                    <div className="flex space-x-2">
                      <input type="text" placeholder="時間 (例: 09:00)" value={newItinerary.time} onChange={e=>setNewItinerary({...newItinerary, time: e.target.value})} className="w-1/3 border p-2 rounded text-sm"/>
                      <input type="text" placeholder="標題" value={newItinerary.title} onChange={e=>setNewItinerary({...newItinerary, title: e.target.value})} className="flex-1 border p-2 rounded text-sm"/>
                    </div>
                    <textarea placeholder="說明" value={newItinerary.desc} onChange={e=>setNewItinerary({...newItinerary, desc: e.target.value})} className="w-full border p-2 rounded text-sm h-20"/>
                    <button onClick={addItineraryItem} className="w-full bg-blue-600 text-white py-2 rounded font-medium">儲存</button>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBooths = () => {
    const dates = ['9/30', '10/1', '10/2'];
    const periods = ['上午', '下午'];
    
    const filteredBooths = booths.filter(b => b.date === boothFilter.date && b.period === boothFilter.period);

    return (
      <div className="bg-gray-50 min-h-screen pb-24 pt-4 animate-in fade-in duration-300">
        <div className="px-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">攤位導覽</h2>
          <p className="text-xs text-gray-500 mb-4">依日期與時段查看廠商；點開卡片後可閱讀重點並寫下私人筆記。</p>
          
          {/* Filters */}
          <div className="flex space-x-2">
            {dates.map(d => (
              <div key={d} className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="text-center py-2 border-b border-gray-50 font-bold text-blue-900 text-lg">{d}</div>
                <div className="flex flex-col">
                  {periods.map(p => {
                     const isSelected = boothFilter.date === d && boothFilter.period === p;
                     return (
                      <button 
                        key={p}
                        onClick={() => setBoothFilter({date: d, period: p})}
                        className={`py-2 text-sm font-medium transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                     )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 space-y-3">
          <div className="flex items-center mb-2">
             <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Day {dates.indexOf(boothFilter.date) + 2} · {boothFilter.period}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">帶看展</h3>

          {filteredBooths.map(booth => (
            <div key={booth.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
              <button 
                onClick={() => setExpandedBooth(expandedBooth === booth.id ? null : booth.id)}
                className="w-full text-left p-4 flex items-center justify-between"
              >
                 <div>
                    <h4 className="text-base font-bold text-gray-800">{booth.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">Booth No. | {booth.boothNo}</p>
                    <p className="text-xs text-blue-500 mt-0.5">{booth.hall}</p>
                 </div>
                 <ChevronDown size={20} className={`text-gray-400 transition-transform ${expandedBooth === booth.id ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Expandable Notes Area (Client feature) */}
              {expandedBooth === booth.id && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-50 bg-gray-50/50">
                   <p className="text-xs font-bold text-gray-500 mb-2 flex items-center">
                     <Edit2 size={12} className="mr-1"/> 私人筆記 (自動儲存)
                   </p>
                   <textarea 
                     className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none bg-white min-h-[100px]"
                     placeholder="在這裡記下您想提問的問題或筆記..."
                     value={userNotes[booth.id] || ''}
                     onChange={(e) => saveNote(booth.id, e.target.value)}
                   />
                </div>
              )}
            </div>
          ))}

          {filteredBooths.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100 border-dashed">此時段尚無攤位安排</div>
          )}

           {/* Admin Add Booth */}
           {isAdmin && (
            <div className="mt-8 pt-4">
               <button 
                  onClick={() => setShowAddBooth(!showAddBooth)}
                  className="w-full flex items-center justify-center py-3 bg-blue-50 text-blue-600 rounded-xl font-medium text-sm"
               >
                 <Plus size={16} className="mr-1"/> 新增攤位 (管理員)
               </button>
               
               {showAddBooth && (
                 <div className="mt-4 bg-white p-4 rounded-xl border shadow-sm space-y-3">
                    <input type="text" placeholder="廠商名稱" value={newBooth.name} onChange={e=>setNewBooth({...newBooth, name: e.target.value})} className="w-full border p-2 rounded text-sm"/>
                    <div className="flex space-x-2">
                      <input type="text" placeholder="攤位號 (例: 11-48)" value={newBooth.boothNo} onChange={e=>setNewBooth({...newBooth, boothNo: e.target.value})} className="w-1/2 border p-2 rounded text-sm"/>
                      <input type="text" placeholder="展館" value={newBooth.hall} onChange={e=>setNewBooth({...newBooth, hall: e.target.value})} className="w-1/2 border p-2 rounded text-sm"/>
                    </div>
                    <button onClick={addBoothItem} className="w-full bg-blue-600 text-white py-2 rounded font-medium">儲存攤位</button>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderChecklist = () => (
    <div className="bg-gray-50 min-h-screen pb-24 pt-4 animate-in fade-in duration-300">
       <div className="px-4 mb-4">
          <p className="text-sm text-gray-500">勾選狀態只會保存在你的手機。</p>
       </div>
       
       <div className="px-4">
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
           <div className="p-4 border-b border-gray-50 bg-blue-50/30 flex items-center">
             <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
                <Check size={12} strokeWidth={3} />
             </div>
             <span className="font-bold text-blue-900">出發前確認</span>
           </div>
           
           <div className="divide-y divide-gray-50">
             {defaultChecklist.map(item => {
               const isChecked = checklistState[item.id] || false;
               return (
                 <label key={item.id} className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                   <div className={`w-6 h-6 rounded-md border-2 mr-4 flex items-center justify-center transition-colors ${isChecked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                      {isChecked && <Check size={16} className="text-white" />}
                   </div>
                   <span className={`text-base transition-all ${isChecked ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                     {item.label}
                   </span>
                 </label>
               )
             })}
           </div>
         </div>
       </div>
    </div>
  );

  const renderContacts = () => (
    <div className="bg-gray-50 min-h-screen pb-24 pt-4 animate-in fade-in duration-300">
       <div className="px-4 space-y-4">
         
         {defaultContacts.map(contact => (
           <div key={contact.id} className={`${contact.primary ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-100 text-gray-800 shadow-sm'} rounded-2xl p-5 relative overflow-hidden`}>
              
              {contact.primary && (
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <User size={100} />
                </div>
              )}

              <div className="flex items-center mb-6 relative z-10">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${contact.primary ? 'bg-white text-blue-600' : 'bg-blue-50 text-blue-600'}`}>
                    <User size={24} />
                 </div>
                 <div>
                    <p className={`text-xs ${contact.primary ? 'text-blue-200' : 'text-gray-500'}`}>{contact.role}</p>
                    <h2 className="text-xl font-bold">{contact.name}</h2>
                 </div>
              </div>

              <div className="space-y-3 relative z-10">
                {contact.email && (
                  <div className={`p-3 rounded-xl ${contact.primary ? 'bg-blue-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${contact.primary ? 'text-blue-300' : 'text-gray-500'}`}>Email</p>
                    <p className="font-medium text-sm">{contact.email}</p>
                  </div>
                )}
                {contact.line && (
                  <button className={`w-full text-left p-3 rounded-xl flex items-center justify-between ${contact.primary ? 'bg-blue-500 hover:bg-blue-400' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                    <div>
                      <p className={`text-[10px] uppercase tracking-wider mb-1 ${contact.primary ? 'text-blue-200' : 'text-gray-500'}`}>LINE</p>
                      <p className="font-medium text-sm">{contact.line}</p>
                    </div>
                    <ExternalLink size={16} className={contact.primary ? 'text-white' : 'text-gray-400'} />
                  </button>
                )}
                 {contact.lineId && (
                  <div className={`p-3 rounded-xl ${contact.primary ? 'bg-blue-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${contact.primary ? 'text-blue-300' : 'text-gray-500'}`}>Line ID</p>
                    <p className="font-medium text-sm">{contact.lineId}</p>
                  </div>
                )}
                {contact.wechat && (
                  <div className={`p-3 rounded-xl ${contact.primary ? 'bg-blue-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${contact.primary ? 'text-blue-300' : 'text-gray-500'}`}>WeChat ID</p>
                    <p className="font-medium text-sm">{contact.wechat}</p>
                  </div>
                )}
              </div>
           </div>
         ))}
         
       </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-x-hidden font-sans">
      
      {/* Top Bar (App Header) */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-amber-400 flex items-center justify-center rounded-lg shadow-sm">
             <div className="w-3 h-3 bg-white rotate-45"></div>
           </div>
           <span className="font-bold text-gray-800 tracking-tight text-lg">FUTURE<span className="text-blue-600">PNP</span></span>
        </div>
        
        {/* Admin Toggle */}
        <button 
          onClick={() => setIsAdmin(!isAdmin)}
          className={`flex items-center px-2 py-1 rounded-full text-[10px] font-bold border transition-colors ${isAdmin ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
        >
          <Settings size={12} className="mr-1" />
          {isAdmin ? 'ADMIN MODE ON' : 'CLIENT MODE'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'itinerary' && renderItinerary()}
        {activeTab === 'booths' && renderBooths()}
        {activeTab === 'checklist' && renderChecklist()}
        {activeTab === 'contacts' && renderContacts()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-md mx-auto flex justify-between items-end px-2 py-2">
          {[
            { id: 'home', icon: Home, label: '首頁' },
            { id: 'itinerary', icon: Calendar, label: '行程' },
            { id: 'booths', icon: Map, label: '攤位導覽' },
            { id: 'checklist', icon: CheckSquare, label: '行前準備' },
            { id: 'contacts', icon: User, label: '聯絡資訊' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 transition-all ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className={`relative flex items-center justify-center w-12 h-8 rounded-full mb-1 transition-all ${isActive ? 'bg-blue-100/50' : 'bg-transparent'}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      
    </div>
  );
}