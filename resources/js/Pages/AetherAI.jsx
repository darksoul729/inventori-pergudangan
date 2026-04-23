import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import AetherAIModal from '@/Components/AetherAIModal';
import {
    X, Send, Plus, Trash2, MessageSquare, Sparkles,
    ChevronRight, Loader2, AlertCircle, Bot, User,
    Database, Zap, BarChart3, Info, Mic, MicOff,
    Volume2, VolumeX, Eraser, Play, Phone, PhoneOff, Waves,
    Save, Search, Clock, History, Cpu
} from 'lucide-react';

// ─── Custom External-styled AI SVG Icon ─────────────────────────────────────
const AetherIcon = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" fill="currentColor" />
        <circle cx="12" cy="12" r="3" fill="white" />
        <path d="M12 5V7M12 17V19M5 12H7M17 12H19M7.05 7.05L8.46 8.46M15.54 15.54L16.95 16.95M7.05 16.95L8.46 15.54M15.54 8.46L16.95 7.05" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

// ─── Markdown renderer (Optimized for Full Page) ──────────────────────────
function MarkdownContent({ content }) {
    const lines = stripStructuredMetadata(content).split('\n');
    return (
        <div className="prose-aether space-y-4">
            {lines.map((line, i) => {
                const cleanLine = line.trim();
                if (cleanLine.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-slate-900 mb-4">{cleanLine.slice(2)}</h1>;
                if (cleanLine.startsWith('## ')) return <h2 key={i} className="text-xl font-black text-slate-800 mb-2 mt-6">{cleanLine.slice(3)}</h2>;
                if (cleanLine.startsWith('### ')) return <h3 key={i} className="text-lg font-black text-slate-700 mb-2 mt-4">{cleanLine.slice(4)}</h3>;
                
                if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
                    return (
                        <div key={i} className="flex gap-4 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all">
                            <span className="mt-2 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                            <span className="text-slate-700 leading-relaxed">{renderInline(cleanLine.slice(2))}</span>
                        </div>
                    );
                }

                if (cleanLine.match(/^\d+\. /)) {
                    const rank = cleanLine.match(/^(\d+)\. /)?.[1];
                    return (
                        <div key={i} className="flex items-center gap-4 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white shadow-lg shadow-indigo-200">{rank}</span>
                            <span className="text-slate-700 leading-relaxed font-semibold">{renderInline(cleanLine.replace(/^\d+\. /, ''))}</span>
                        </div>
                    );
                }

                if (line.startsWith('---')) return <hr key={i} className="border-slate-100 my-6" />;
                if (line === '') return <div key={i} className="h-2" />;
                
                return <p key={i} className="text-slate-600 text-[15px] leading-relaxed mb-2">{renderInline(line)}</p>;
            })}
        </div>
    );
}

function stripStructuredMetadata(text = '') {
    return text.replace(/\n*\[\[AETHER_FORECAST:[\s\S]*?\]\]\s*/g, '').trim();
}

function parseForecastMetadata(content = '') {
    const match = content.match(/\[\[AETHER_FORECAST:([\s\S]*?)\]\]/);
    if (!match) return null;
    try { return JSON.parse(match[1]); } catch { return null; }
}

function renderInline(text) {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-slate-900 font-extrabold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg text-sm font-mono border border-indigo-100">{part.slice(1, -1)}</code>;
        }
        return part;
    });
}

function InsightSummary({ content }) {
    const extract = (label) => {
        const plain = content.replace(/\*\*/g, '');
        const match = plain.match(new RegExp(`${label}:\\s*([^\\n]+)`, 'i'));
        return match?.[1]?.trim() ?? null;
    };

    const metrics = [
        { label: 'Stock Total', value: extract('Total Unit Tersimpan'), icon: <Database /> },
        { label: 'Varian Produk', value: extract('Total Produk Terdaftar'), icon: <BarChart3 /> },
        { label: 'Estimasi Nilai', value: extract('Estimasi Nilai Aset'), icon: <Sparkles /> },
        { label: 'Efisiensi Rak', value: extract('Efisiensi Penyimpanan'), icon: <Zap /> },
    ].filter(m => m.value);

    if (metrics.length < 2) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map(m => (
                <div key={m.label} className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                            {React.cloneElement(m.icon, { className: "w-5 h-5" })}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{m.label}</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">{m.value}</div>
                </div>
            ))}
        </div>
    );
}

function ForecastSummary({ data }) {
    const items = data?.items || [];
    if (!items.length) return null;

    const maxStock = Math.max(...items.map(item => Math.max(item.current_stock || 0, item.predicted_stock || 0)), 1);

    return (
        <div className="mb-8 rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h4 className="flex items-center gap-3 text-lg font-black text-slate-900">
                        <BarChart3 className="w-6 h-6 text-indigo-600" />
                        Analisis Prediksi Stok ({data.days} Hari)
                    </h4>
                    <p className="text-sm font-semibold text-slate-400 mt-1">Estimasi kebutuhan berdasarkan tren mutasi terbaru</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Akurasi Model: </span>
                    <span className="text-xs font-black text-emerald-600 uppercase">Tinggi (89%)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((item, idx) => {
                    const isRisk = item.status !== 'aman';
                    const currentPct = Math.round((item.current_stock / maxStock) * 100);
                    const predPct = Math.round((item.predicted_stock / maxStock) * 100);

                    return (
                        <div key={idx} className="group p-6 rounded-[24px] border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-100 transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.name}</div>
                                    <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{item.unit} · Tren {item.trend}</div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isRisk ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                    {isRisk ? 'Risk' : 'Safe'}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-wide">
                                        <span>Stok Saat Ini</span>
                                        <span>{item.current_stock} {item.unit}</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-400 transition-all duration-1000" style={{ width: `${currentPct}%` }} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-black text-indigo-500 uppercase tracking-wide">
                                        <span>Estimasi {data.days} Hari</span>
                                        <span>{item.predicted_stock} {item.unit}</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-indigo-50 rounded-full overflow-hidden">
                                        <div className={`h-full ${isRisk ? 'bg-rose-500' : 'bg-indigo-600'} transition-all duration-1000 delay-300`} style={{ width: `${predPct}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function AetherAI() {
    const { props } = usePage();
    const [conversations, setConversations] = useState(props.conversations || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [lastLatencyMs, setLastLatencyMs] = useState(null);
    const [lastProviderLatencyMs, setLastProviderLatencyMs] = useState(null);

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const recognitionRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const prompt = params.get('prompt');

        if (prompt) {
            setInputText(prompt);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const toggleListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Browser ini belum mendukung input suara.');
            return;
        }

        if (isLoading) return;

        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        recognition.onstart = () => {
            setError(null);
        };
        recognition.onresult = (event) => {
            const transcript = event.results?.[0]?.[0]?.transcript?.trim();
            if (transcript) {
                setInputText(transcript);
                handleSendMessage(transcript);
            }
        };
        recognition.onerror = () => {
            setError('Gagal mendengarkan suara.');
        };
        recognition.onend = () => {
            recognitionRef.current = null;
        };
        recognitionRef.current = recognition;
        recognition.start();
    };

    const loadConversations = async () => {
        try {
            const res = await fetch('/aether/conversations', { headers: { 'Accept': 'application/json' } });
            if (res.ok) setConversations(await res.json());
        } catch { }
    };

    const loadMessages = async (id) => {
        setIsHistoryLoading(true);
        setActiveId(id);
        setError(null);
        try {
            const res = await fetch(`/aether/conversations/${id}/messages`, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error('Gagal memuat riwayat');
            setMessages(await res.json());
        } catch (e) { setError(e.message); }
        finally { setIsHistoryLoading(false); }
    };

    const handleSendMessage = async (overrideText = null) => {
        const text = (overrideText ?? inputText).trim();
        if (!text || isLoading) return;
        setInputText('');
        setIsLoading(true);
        setError(null);

        const tempId = `temp-${Date.now()}`;
        setMessages(prev => [...prev, { id: tempId, role: 'user', content: text }]);

        try {
            const res = await fetch('/aether/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ message: text, conversation_id: activeId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal mengirim');
            setLastLatencyMs(data.latency_ms ?? null);
            setLastProviderLatencyMs(data.provider_latency_ms ?? null);

            if (data.conversation_id && data.conversation_id !== activeId) {
                setActiveId(data.conversation_id);
                loadConversations();
            }

            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== tempId);
                return [...filtered, { role: 'user', content: text, id: `u-${Date.now()}` }, data.message];
            });
        } catch (e) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        setActiveId(null);
        setMessages([]);
        setInputText('');
    };

    const deleteChat = async (id) => {
        try {
            await fetch(`/aether/conversations/${id}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content }
            });
            if (activeId === id) startNewChat();
            loadConversations();
        } catch { }
    };

    return (
        <DashboardLayout 
            fullPage={true}
            contentClassName="max-w-none w-full h-full"
        >
            <Head title="Aether AI Assistant" />

            <div className="flex h-full min-h-0 w-full box-border bg-white overflow-hidden relative pt-24">
                
                {/* Conversation History Sidebar */}
                <div className={`${isSidebarCollapsed ? 'w-20' : 'w-80'} min-h-0 border-r border-slate-50 bg-[#fcfdfe] transition-all duration-500 ease-in-out flex flex-col`}>
                    <div className="p-6 pb-2">
                        <button 
                            onClick={startNewChat}
                            className={`w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[20px] py-4 shadow-xl shadow-indigo-100 transition-all font-black uppercase tracking-widest text-[11px] ${isSidebarCollapsed ? 'px-0' : 'px-4'}`}
                        >
                            <Plus className="w-5 h-5" />
                            {!isSidebarCollapsed && "Percakapan Baru"}
                        </button>
                    </div>

                    {!isSidebarCollapsed && (
                        <div className="px-6 pb-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari riwayat obrolan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-[12px] font-bold text-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-slate-400 shadow-sm"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-4 space-y-2">
                        {!isSidebarCollapsed && (
                            <div className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <History className="w-4 h-4" /> Riwayat Baru
                            </div>
                        )}
                        {conversations.filter(c => (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())).map(conv => (
                            <div 
                                key={conv.id}
                                onClick={() => loadMessages(conv.id)}
                                className={`group flex items-center gap-4 px-5 py-4 rounded-[22px] cursor-pointer transition-all duration-300 ${activeId === conv.id ? 'bg-white shadow-[0_8px_30px_rgba(79,70,229,0.08)] border border-indigo-50 border-1 scale-[1.02]' : 'hover:bg-white/60 hover:shadow-sm'}`}
                            >
                                <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${activeId === conv.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-400'}`}>
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                {!isSidebarCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-black truncate leading-tight ${activeId === conv.id ? 'text-slate-900' : 'text-slate-500'}`}>{conv.title}</div>
                                        <div className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-wide">
                                            {conv.updated_at ? new Date(conv.updated_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                )}
                                {!isSidebarCollapsed && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteChat(conv.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all bg-white rounded-xl shadow-sm border border-slate-100 scale-90"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-6 border-t border-slate-50">
                        <button 
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="w-full flex items-center justify-center gap-3 text-slate-300 hover:text-indigo-600 transition-colors py-2"
                        >
                            {isSidebarCollapsed ? <ChevronRight /> : <ChevronRight className="rotate-180" />}
                        </button>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 min-h-0 min-w-0 flex flex-col bg-white relative">
                    
                    {/* Floating Glow Orbs */}
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/30 blur-[120px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-50/20 blur-[100px] rounded-full pointer-events-none" />

                    {/* Chat Header */}
                    <div className="h-[72px] border-b border-slate-50 flex items-center justify-between px-8 shrink-0 bg-white/80 backdrop-blur-md z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-lg shadow-indigo-100">
                                <AetherIcon className="text-white w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Aether Knowledge Interface</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Model: Kinetic V1.0-IND-GROQ</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-[18px]">
                                <Cpu className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Latensi: </span>
                                <span className="text-xs font-black text-indigo-600 tabular-nums">
                                    {lastLatencyMs !== null ? `${(lastLatencyMs / 1000).toFixed(2)}s` : '-'}
                                </span>
                                {lastProviderLatencyMs !== null && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                        Groq {(lastProviderLatencyMs / 1000).toFixed(2)}s
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCallModalOpen(true)}
                                className="flex h-11 items-center gap-2 rounded-[18px] bg-indigo-600 px-5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700"
                                title="Mulai panggilan suara Aether"
                            >
                                <Phone className="h-4 w-4" />
                                Call
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar z-0 relative">
                        {messages.length === 0 && !isHistoryLoading && (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                                <div className="w-24 h-24 rounded-[32px] bg-indigo-50 flex items-center justify-center mb-8 rotate-12">
                                    <Sparkles className="w-12 h-12 text-indigo-600" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Halo, Saya Aether.</h1>
                                <p className="text-slate-400 font-semibold leading-relaxed text-lg">Asisten pintar yang siap membantu pengelolaan gudang secara real-time. Tanyakan apa saja tentang stok, mutasi, atau efisiensi gudang hari ini.</p>
                                
                                <div className="grid grid-cols-2 gap-4 mt-12 w-full">
                                    {["Status stok hari ini", "Produk paling laku", "Prediksi stok 7 hari", "Analisis driver sibuk"].map(suggestion => (
                                        <button 
                                            key={suggestion}
                                            onClick={() => setInputText(suggestion)}
                                            className="px-6 py-4 rounded-[24px] bg-white border border-slate-100 text-sm font-black text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 transform hover:-translate-y-1"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isHistoryLoading && (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div key={m.id || i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                <div className={`flex items-start gap-5 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`shrink-0 w-11 h-11 rounded-[18px] flex items-center justify-center shadow-md ${m.role === 'user' ? 'bg-indigo-50 text-indigo-600' : 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white'}`}>
                                        {m.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                                    </div>
                                    <div className={`p-8 rounded-[32px] ${m.role === 'user' ? 'bg-[#f4f7ff] text-slate-800 border border-indigo-100/50 rounded-tr-none' : 'bg-white border border-slate-100 shadow-sm rounded-tl-none'}`}>
                                        <div className="mb-2 flex items-center gap-3">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${m.role === 'user' ? 'text-slate-400' : 'text-indigo-500'}`}>
                                                {m.role === 'user' ? 'Pengguna Operasional' : 'Aether Intelligence'}
                                            </span>
                                            {m.role !== 'user' && (
                                                <div className="px-2 py-0.5 rounded-lg bg-indigo-50 text-[9px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100">Certified</div>
                                            )}
                                        </div>
                                        
                                        {m.role !== 'user' && <InsightSummary content={m.content} />}
                                        {m.role !== 'user' && parseForecastMetadata(m.content) && (
                                            <ForecastSummary data={parseForecastMetadata(m.content)} />
                                        )}

                                        <MarkdownContent content={m.content} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="flex items-start gap-5">
                                    <div className="shrink-0 w-11 h-11 rounded-[18px] bg-indigo-100 flex items-center justify-center text-indigo-300">
                                        <Bot className="w-6 h-6" />
                                    </div>
                                    <div className="p-6 rounded-[32px] rounded-tl-none bg-indigo-50 border border-indigo-100">
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75" />
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Area */}
                    <div className="p-6 bg-white/80 backdrop-blur-sm z-10 shrink-0 border-t border-slate-50">
                        {error && (
                            <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3 animate-in shake duration-500">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}
                        <div className="relative group max-w-6xl mx-auto">
                            <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-focus-within:opacity-20 blur-xl transition-all duration-500" />
                            <div className="relative flex items-center gap-4 bg-white border border-slate-200 group-focus-within:border-indigo-500 group-focus-within:shadow-2xl group-focus-within:shadow-indigo-100 rounded-[30px] p-2 pl-8 transition-all duration-300 shadow-sm">
                                <input 
                                    ref={textareaRef}
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Tanyakan analisis gudang ke Aether..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-300 font-bold py-4 text-base"
                                />
                                
                                <div className="flex items-center gap-2 pr-2">
                                    <button 
                                        onClick={toggleListening}
                                        className={`p-3 rounded-full transition-all ${recognitionRef.current ? 'text-rose-600 bg-rose-50 animate-pulse' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                    >
                                        <Mic className="w-6 h-6" />
                                    </button>
                                    <button 
                                        onClick={() => handleSendMessage()}
                                        disabled={isLoading || !inputText.trim()}
                                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${inputText.trim() ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 rotate-0 scale-100' : 'bg-slate-100 text-slate-300 rotate-[-45deg] scale-90'}`}
                                    >
                                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AetherAIModal
                isOpen={isCallModalOpen}
                onClose={() => setIsCallModalOpen(false)}
                startInCall={true}
            />
        </DashboardLayout>
    );
}

// Add these to app.css for better command center vibe if needed, but using inline for now
const style = `
@keyframes pulse-slow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.1); }
}
`;
