import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { 
  Plus, 
  Home, 
  Compass, 
  Library, 
  History, 
  Search, 
  Paperclip, 
  Sparkles, 
  Image as ImageIcon, 
  SearchIcon, 
  ChevronDown,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';

export default function BeeBotModal({ isOpen, onClose }) {
  const { auth } = usePage().props;
  const [activeTab, setActiveTab] = useState('BeeBot');
  
  if (!isOpen) return null;

  const history = {
    tomorrow: [
      "What's something you've learned...",
      "If you could teleport anywhere...",
      "What's one goal you want to ac..."
    ],
    sevenDaysAgo: [
      "Ask me anything weird or rand...",
      "How are you feeling today, real...",
      "What's one habit you wish you..."
    ]
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden pointer-events-none">
      {/* Backdrop - minimal opacity, subtle blur */}
      <div 
        className="absolute inset-0 bg-black/10 backdrop-blur-[4px] pointer-events-auto transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Container - highly transparent */}
      <div className="relative w-full max-w-[1100px] h-[85vh] bg-white/20 backdrop-blur-[20px] border border-white/30 rounded-[40px] shadow-[0_32px_120px_rgba(0,0,0,0.1)] flex flex-row overflow-hidden pointer-events-auto animate-in zoom-in-95 fade-in duration-300 transform-gpu">
        
        {/* Sidebar - even more transparent */}
        <aside className="w-[280px] border-r border-white/20 flex flex-col bg-white/10">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#585CE5]" fill="currentColor">
                  <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#1D1D1F]">BeeBot</span>
            </div>
            
            <nav className="space-y-1">
              <NavItem icon={<Home className="w-[18px] h-[18px]" />} label="Home" active />
              <NavItem icon={<Compass className="w-[18px] h-[18px]" />} label="Explore" />
              <NavItem icon={<Library className="w-[18px] h-[18px]" />} label="Library" />
              <NavItem icon={<History className="w-[18px] h-[18px]" />} label="History" />
            </nav>

            <div className="mt-10 overflow-y-auto custom-scrollbar flex-1 max-h-[300px]">
              <div className="mb-6">
                <h3 className="px-3 text-[10px] font-bold text-[#86868B] uppercase tracking-[0.15em] mb-3 opacity-60">Tomorrow</h3>
                {history.tomorrow.map((item, i) => (
                  <HistoryItem key={i} text={item} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-auto p-4 border-t border-white/10">
            <div className="flex items-center p-2 rounded-2xl hover:bg-white/20 cursor-pointer transition-all border border-transparent">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-black shadow-lg shadow-indigo-200/50">
                  {auth.user.name.charAt(0)}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="text-[12px] font-black text-[#1D1D1F] truncate leading-tight">{auth.user.name}</div>
                <div className="text-[10px] text-[#86868B] truncate leading-tight uppercase font-black tracking-widest mt-0.5 opacity-60">AI Assistant</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          
          {/* Top Actions */}
          <header className="h-[72px] px-8 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-1 bg-white/20 p-1 rounded-[14px] border border-white/20">
                  <TabItem label="BeeBot" active={activeTab === 'BeeBot'} onClick={() => setActiveTab('BeeBot')} />
               </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-red-500 hover:text-white transition-all text-[#1D1D1F] border border-white/20">
                    <X className="w-4 h-4" />
                </button>
            </div>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center px-10 relative overflow-y-auto custom-scrollbar">
            
            <div className="w-full max-w-2xl flex flex-col items-center text-center py-10">
               
               {/* Model Selector */}
               <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 rounded-2xl border border-white/40 shadow-xl shadow-black/[0.02] cursor-pointer hover:bg-white/60 transition-all">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-[13px] font-black text-[#1D1D1F]">iBeeBot 4o-mini</span>
                      <ChevronDown className="w-4 h-4 text-[#A1A1A6]" />
                  </div>
               </div>

               {/* Orb */}
               <div className="relative mb-8 transform scale-75">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#585CE5] via-[#A855F7] to-[#F472B6] opacity-30 blur-3xl absolute inset-0 -z-10"></div>
                  <div className="w-20 h-20 rounded-full bg-white/20 shadow-2xl flex items-center justify-center relative overflow-hidden backdrop-blur-xl border border-white/60">
                      <div className="w-12 h-12 bg-gradient-to-tr from-[#585CE5] to-[#A855F7] rounded-full blur-[1px] opacity-90"></div>
                  </div>
               </div>

               <div className="mb-10">
                  <h1 className="text-3xl font-black text-[#1D1D1F] tracking-tight mb-2">Good Day, {auth.user.name.split(' ')[0]}</h1>
                  <p className="text-[15px] font-bold text-[#86868B]">How Can I <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Assist You Today?</span></p>
               </div>

               {/* Input Area - Transparent glass */}
               <div className="w-full bg-white/10 backdrop-blur-2xl rounded-[32px] border border-white/20 p-2 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.03)] focus-within:bg-white/20 transition-all duration-500">
                  <div className="p-4">
                      <textarea 
                          className="w-full bg-transparent border-none focus:ring-0 text-[15px] font-bold text-[#1D1D1F] placeholder-[#A1A1A6] resize-none min-h-[80px]"
                          placeholder="Initiate a query or send a command..."
                      ></textarea>
                  </div>
                  
                  <div className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-1.5">
                          <InputActionButton icon={<Paperclip className="w-4 h-4" />} />
                          <InputActionButton icon={<Sparkles className="w-4 h-4" />} label="Reason" />
                          <InputActionButton icon={<ImageIcon className="w-4 h-4" />} label="Image" />
                      </div>
                      
                      <div className="w-10 h-10 rounded-2xl bg-[#585CE5] text-white shadow-lg shadow-indigo-200 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all">
                          <Plus className="w-5 h-5" />
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .animate-in {
            animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

function NavItem({ icon, label, active = false }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
      active ? 'bg-white/40 text-[#1D1D1F] shadow-sm' : 'text-[#86868B] hover:bg-white/20 hover:text-[#1D1D1F]'
    }`}>
      {icon}
      <span className="text-[13px] font-black">{label}</span>
    </div>
  );
}

function HistoryItem({ text }) {
  return (
    <div className="px-3 py-2.5 rounded-xl text-[12px] font-bold text-[#1D1D1F]/70 hover:bg-white/30 hover:text-[#1D1D1F] cursor-pointer transition-all truncate">
      {text}
    </div>
  );
}

function TabItem({ label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 rounded-[10px] text-[11px] font-black uppercase tracking-widest transition-all ${
        active ? 'bg-white shadow-sm text-[#1D1D1F]' : 'text-[#86868B]/60 hover:text-[#1D1D1F]'
      }`}
    >
      {label}
    </button>
  );
}

function InputActionButton({ icon, label }) {
    return (
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 border border-white/20 hover:bg-white/40 transition-all group">
            <span className="text-[#86868B] group-hover:text-indigo-500 transition-colors">{icon}</span>
            {label && <span className="text-[11px] font-black uppercase tracking-widest text-[#1D1D1F]">{label}</span>}
        </button>
    );
}
