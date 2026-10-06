import React, { useState, useEffect } from 'react';
import { Home, Calendar, Map, CheckSquare, User, MapPin, ChevronRight, Bell, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  
  // 關鍵修改：使用手機本地記憶體儲存勾選狀態，不需要雲端資料庫！
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

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-4 space-y-4 animate-in fade-in duration-300">
            {/* 頂部橫幅 */}
            <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold italic mb-2 tracking-tight">Highly-functional<br/>Material Week 2026</h2>
                <div className="flex items-center text-sm opacity-90 mt-4">
                  <MapPin size={16} className="mr-1" />
                  <span>幕張メッセ (Makuhari Messe)</span>
                </div>
                <div className="text-sm opacity-90 mt-1">2026.09.29 — 10.03</div>
              </div>
            </div>
            
            {/* 公告區 */}
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center">
                <div className="bg-orange-200 p-2 rounded-xl mr-4">
                  <Bell size={20} className="text-orange-700" />
                </div>
                <div>
                  <div className="text-xs text-orange-800 font-bold mb-1">重要公告</div>
                  <div className="text-sm text-gray-800 font-medium">小提醒～9:50記得帶著展覽票在Hall...</div>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </div>

            {/* 行程預覽區 */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-md">
                 <div className="text-xs opacity-80 mb-2">目前行程</div>
                 <div className="text-xl font-bold mb-1">出發前預覽</div>
                 <div className="text-sm opacity-90">行程尚未開始</div>
               </div>
               <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                 <div className="text-xs text-gray-500 mb-2">下一個行程</div>
                 <div className="text-2xl font-black text-gray-800 mb-1">9:45</div>
                 <div className="text-sm font-bold text-gray-600">桃園機場集合</div>
                 <div className="text-xs text-gray-400 mt-2 flex items-center">
                    <MapPin size={12} className="mr-1" /> T2華航 團體報到櫃檯
                 </div>
               </div>
            </div>
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
                <div key={item.id} onClick={() => toggleCheck(item.id)} className="flex items-center p-4 border-b border-gray-50 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors">
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
          <div className="p-4 space-y-4 animate-in fade-in duration-300">
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
        <div className="text-blue-700 font-black text-xl tracking-tight">FUTUREPNP</div>
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