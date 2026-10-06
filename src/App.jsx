import React, { useState, useEffect } from 'react';
import { Home, Calendar, Map, CheckSquare, User, MapPin, ChevronRight, Bell, ExternalLink, Settings, Edit3, Save } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

// 1. 您的 Firebase 金鑰 (已帶入)
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

// 預設資料 (當雲端沒有資料時的備用方案)
const defaultData = {
  brandName: "FUTUREPNP",
  eventTitle: "Highly-functional\nMaterial Week 2026",
  eventLocation: "幕張メッセ (Makuhari Messe)",
  eventDate: "2026.09.29 — 10.03",
  announcement: "小提醒～9:50記得帶著展覽票在Hall 2集合喔！",
  nextTime: "9:45",
  nextLocation: "桃園機場集合",
  nextDetail: "T2華航 團體報到櫃檯"
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [appData, setAppData] = useState(defaultData);
  const [editData, setEditData] = useState(defaultData);

  // 即時監聽雲端資料庫
  useEffect(() => {
    const docRef = doc(db, 'tourConfig', 'mainContent');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        // 合併新舊資料，確保擴充的新欄位不會消失
        const serverData = docSnap.data();
        setAppData({ ...defaultData, ...serverData });
        setEditData({ ...defaultData, ...serverData }); 
      } else {
        setDoc(docRef, defaultData);
      }
    });
    return () => unsubscribe();
  }, []);

  // 行前準備的個人紀錄
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

  // 儲存編輯內容
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

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-4 space-y-4 animate-in fade-in duration-300">
            {/* 頂部橫幅 (動態帶入 appData 資料) */}
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
              /* --- 管理員編輯介面 --- */
              <div className="bg-yellow-50 border-2 border-yellow-400 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center text-yellow-700 font-bold mb-4 text-lg">
                  <Edit3 size={20} className="mr-2" />
                  管理員編輯模式
                </div>
                
                <div className="space-y-4">
                  {/* 新增：大會資訊設定區塊 */}
                  <div className="bg-white p-4 rounded-xl border border-yellow-200 shadow-sm space-y-3">
                    <div className="text-sm font-bold text-yellow-800 border-b border-yellow-100 pb-2 mb-2">📌 大會基本資訊</div>
                    
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">頂部品牌名稱</label>
                      <input 
                        className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 font-bold" 
                        value={editData.brandName}
                        onChange={(e) => setEditData({...editData, brandName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">活動大標題 (可換行)</label>
                      <textarea 
                        className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 font-bold" 
                        rows="2"
                        value={editData.eventTitle}
                        onChange={(e) => setEditData({...editData, eventTitle: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">展覽地點</label>
                      <input 
                        className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50" 
                        value={editData.eventLocation}
                        onChange={(e) => setEditData({...editData, eventLocation: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">活動日期</label>
                      <input 
                        className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50" 
                        value={editData.eventDate}
                        onChange={(e) => setEditData({...editData, eventDate: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* 原本的：行程與公告設定區塊 */}
                  <div className="bg-white p-4 rounded-xl border border-yellow-200 shadow-sm space-y-3">
                    <div className="text-sm font-bold text-yellow-800 border-b border-yellow-100 pb-2 mb-2">🚀 即時動態與行程</div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">重要公告</label>
                      <textarea 
                        className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50" 
                        rows="2"
                        value={editData.announcement}
                        onChange={(e) => setEditData({...editData, announcement: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-1/3">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">時間</label>
                        <input 
                          className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 font-bold" 
                          value={editData.nextTime}
                          onChange={(e) => setEditData({...editData, nextTime: e.target.value})}
                        />
                      </div>
                      <div className="w-2/3">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">下一站地點</label>
                        <input 
                          className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 font-bold" 
                          value={editData.nextLocation}
                          onChange={(e) => setEditData({...editData, nextLocation: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">地點補充說明 (選填)</label>
                      <input 
                        className="w-full p-2 border border-yellow-300 rounded-lg text-sm bg-gray-50 text-gray-500" 
                        value={editData.nextDetail}
                        onChange={(e) => setEditData({...editData, nextDetail: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleSaveToCloud}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all text-lg shadow-md"
                  >
                    <Save size={24} className="mr-2" />
                    發佈並同步給所有客戶
                  </button>
                </div>
              </div>
            ) : (
              /* --- 一般客戶觀看介面 --- */
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
      case 'checklist':
        return (
          <div className="p-4 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold mb-2 text-gray-800 flex items-center">出發前確認</h2>
            <p className="text-xs text-gray-500 mb-4">勾選狀態只會保存在你的手機。</p>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {[
                { id: '1', label: '護照' },
                { id: '2', label: '入境申請 Visit Japan Web' },
                { id: '3', label: '網路 / 漫遊' },
                { id: '4', label: '少量日幣現金' },
                { id: '5', label: '信用卡' },
                { id: '6', label: '行動電源' },
                { id: '7', label: '名片' },
                { id: '8', label: '展覽入場 QR Code' },
                { id: '9', label: '個人藥品' }
              ].map((item) => (
                <div key={item.id} onClick={() => toggleCheck(item.id)} className="flex items-center p-4 border-b border-gray-50 last:border-b-0 cursor-pointer active:bg-gray-50">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${checklist[item.id] ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
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
                <div className="bg-white text-blue-600 rounded-full p-3 mr-4">
                  <User size={24} />
                </div>
                <div>
                  <div className="text-xs opacity-80 mb-1">第一聯絡人</div>
                  <div className="text-xl font-bold">Mike Chiang</div>
                </div>
              </div>
              <div className="p-5 space-y-4 bg-blue-700/30">
                <div>
                  <div className="text-xs opacity-70 mb-1">LINE</div>
                  <div className="font-bold flex items-center justify-between">
                    <span>開啟 LINE 聯絡</span>
                    <ExternalLink size={16} />
                  </div>
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">WECHAT ID</div>
                  <div className="font-bold">mike_chiang_0907</div>
                </div>
              </div>
            </div>

            {/* 隱藏的主辦方管理入口 */}
            <div className="mt-auto pt-10 pb-4 text-center">
              <button 
                onClick={handleAdminLogin}
                className="text-gray-300 hover:text-gray-500 flex items-center justify-center w-full text-xs font-bold transition-colors"
              >
                <Settings size={14} className="mr-1" />
                {isAdmin ? '登出管理模式' : '主辦方登入'}
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-10 text-center text-gray-400 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold mb-2">建置中...</h2>
            <p className="text-sm">這個分頁的內容即將完成！</p>
          </div>
        );
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
          { id: 'booths', icon: Map, label: '攤位導覽' },
          { id: 'checklist', icon: CheckSquare, label: '行前準備' },
          { id: 'contact', icon: User, label: '聯絡資訊' }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
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