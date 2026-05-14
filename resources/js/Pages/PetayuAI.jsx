import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import PetayuAIModal from '@/Components/PetayuAIModal';
import {
    X, Send, Plus, Trash2, MessageSquare, Sparkles,
    ChevronRight, Loader2, AlertCircle, Bot, User,
    Database, Zap, BarChart3, Info, Mic, MicOff,
    Volume2, VolumeX, Eraser, Play, Phone, PhoneOff, Waves,
    Save, Search, Clock, History, Cpu
} from 'lucide-react';

// ─── Custom External-styled AI SVG Icon ─────────────────────────────────────
const PetayuIcon = ({ className = "w-6 h-6" }) => (
    <img src="/images/logo 1.png" alt="Petayu AI" className={className} />
);

// ─── Markdown renderer (Optimized for Full Page) ──────────────────────────
function MarkdownContent({ content }) {
    const lines = stripStructuredMetadata(content).split('\n');
    return (
        <div className="prose-petayu space-y-4">
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
    return text.replace(/\n*\[\[PETAYU_FORECAST:[\s\S]*?\]\]\s*/g, '').trim();
}

function parseForecastMetadata(content = '') {
    const match = content.match(/\[\[PETAYU_FORECAST:([\s\S]*?)\]\]/);
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

export default function PetayuAI() {
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
            const res = await fetch('/petayu-ai/conversations', { headers: { 'Accept': 'application/json' } });
            if (res.ok) setConversations(await res.json());
        } catch { }
    };

    const loadMessages = async (id) => {
        setIsHistoryLoading(true);
        setActiveId(id);
        setError(null);
        try {
            const res = await fetch(`/petayu-ai/conversations/${id}/messages`, { headers: { 'Accept': 'application/json' } });
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
            const res = await fetch('/petayu-ai/chat', {
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
            await fetch(`/petayu-ai/conversations/${id}`, {
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
            <Head title="PETAYU AI Assistant" />

            <div className="flex h-full min-h-0 w-full box-border bg-[#f8f9fb] overflow-hidden">
                
                {/* Conversation History Sidebar */}
                <div className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} min-h-0 border-r border-[#E5EAF3] bg-white transition-all duration-300 ease-in-out flex flex-col shadow-[2px_0_12px_rgba(0,0,0,0.03)]`}>
                    <div className="p-4 pb-3">
                        <div className="flex items-center gap-3 px-2 py-3 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-[#5B33CC]/10 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-[#5B33CC]" />
                            </div>
                            {!isSidebarCollapsed && <span className="text-[13px] font-black text-[#4722B3] tracking-tight">PETAYU AI</span>}
                        </div>
                        <button 
                            onClick={startNewChat}
                            className={`w-full flex items-center justify-center gap-2 bg-[#5B33CC] hover:bg-[#4722B3] text-white rounded-xl py-3 transition-all font-bold text-[12px] shadow-[0_4px_14px_rgba(89,50,201,0.25)] ${isSidebarCollapsed ? 'px-0' : 'px-4'}`}
                        >
                            <Plus className="w-4 h-4" />
                            {!isSidebarCollapsed && "Percakapan Baru"}
                        </button>
                    </div>

                    {!isSidebarCollapsed && (
                        <div className="px-4 pb-3">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari riwayat..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#f8f9fb] border border-[#E5EAF3] rounded-xl py-2.5 pl-9 pr-4 text-[12px] font-semibold text-gray-600 focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC]/20 transition-all placeholder-gray-400"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex-1 min-h-0 overflow-y-auto px-3 space-y-1">
                        {!isSidebarCollapsed && (
                            <div className="px-2 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <History className="w-3.5 h-3.5" /> Riwayat
                            </div>
                        )}
                        {conversations.filter(c => (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())).map(conv => (
                            <div 
                                key={conv.id}
                                onClick={() => loadMessages(conv.id)}
                                className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${activeId === conv.id ? 'bg-[#5B33CC]/8 border border-[#5B33CC]/20' : 'hover:bg-[#f8f9fb] border border-transparent'}`}
                            >
                                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeId === conv.id ? 'bg-[#5B33CC] text-white' : 'bg-[#f8f9fb] text-gray-400 group-hover:bg-[#5B33CC]/10 group-hover:text-[#5B33CC]'}`}>
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                {!isSidebarCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-[12px] font-bold truncate ${activeId === conv.id ? 'text-[#4722B3]' : 'text-gray-600'}`}>{conv.title}</div>
                                        <div className="text-[10px] font-semibold text-gray-400 mt-0.5">
                                            {conv.updated_at ? new Date(conv.updated_at).toLocaleDateString('id-ID') : '-'}
                                        </div>
                                    </div>
                                )}
                                {!isSidebarCollapsed && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteChat(conv.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-50"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-[#E5EAF3]">
                        <button 
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-[#5B33CC] transition-colors py-2 rounded-xl hover:bg-[#f8f9fb]"
                        >
                            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-180" />}
                            {!isSidebarCollapsed && <span className="text-[11px] font-bold">Tutup</span>}
                        </button>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 min-h-0 min-w-0 flex flex-col bg-white relative">

                    {/* Chat Header */}
                    <div className="h-[64px] border-b border-[#E5EAF3] flex items-center justify-between px-6 shrink-0 bg-white z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-[16px] bg-[#5B33CC]/10 flex items-center justify-center">
                                <PetayuIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-black text-[#4722B3] tracking-tight">PETAYU AI</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Kinetic V1.0 · Aktif</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#f8f9fb] border border-[#E5EAF3] rounded-xl">
                                <Cpu className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-[11px] font-bold text-gray-400">Latensi: </span>
                                <span className="text-[11px] font-black text-[#5B33CC] tabular-nums">
                                    {lastLatencyMs !== null ? `${(lastLatencyMs / 1000).toFixed(2)}s` : '-'}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCallModalOpen(true)}
                                className="flex h-9 items-center gap-2 rounded-xl bg-[#5B33CC] px-4 text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(89,50,201,0.25)] transition-all hover:bg-[#4722B3]"
                                title="Mulai panggilan suara PETAYU AI"
                            >
                                <Phone className="h-3.5 w-3.5" />
                                Panggil AI
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6 z-0 relative">
                        {messages.length === 0 && !isHistoryLoading && (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto">
                                <div className="w-16 h-16 rounded-2xl bg-[#5B33CC]/10 flex items-center justify-center mb-6">
                                    <Sparkles className="w-8 h-8 text-[#5B33CC]" />
                                </div>
                                <h1 className="text-2xl font-black text-[#4722B3] mb-3 tracking-tight">Halo, Saya PETAYU AI.</h1>
                                <p className="text-gray-500 font-semibold leading-relaxed">Asisten pintar pengelolaan gudang secara real-time. Tanyakan apa saja tentang stok, mutasi, atau efisiensi gudang.</p>
                                
                                <div className="grid grid-cols-2 gap-3 mt-8 w-full">
                                    {["Status stok hari ini", "Produk paling laku", "Prediksi stok 7 hari", "Analisis driver sibuk"].map(suggestion => (
                                        <button 
                                            key={suggestion}
                                            onClick={() => setInputText(suggestion)}
                                            className="px-5 py-3.5 rounded-xl bg-white border border-[#E5EAF3] text-[13px] font-bold text-gray-600 hover:border-[#5B33CC] hover:text-[#5B33CC] hover:shadow-md transition-all duration-200"
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
                            <div key={m.id || i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-start gap-3 max-w-[82%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`shrink-0 w-9 h-9 rounded-[14px] flex items-center justify-center ${m.role === 'user' ? 'bg-[#5B33CC]/10 text-[#5B33CC]' : 'bg-[#5B33CC] text-white'}`}>
                                        {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`px-5 py-4 rounded-2xl ${m.role === 'user' ? 'bg-[#5B33CC]/8 border border-[#5B33CC]/15 rounded-tr-md text-[#4722B3]' : 'bg-white border border-[#E5EAF3] rounded-tl-md shadow-sm'}`}>
                                        <div className="mb-1.5 flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${m.role === 'user' ? 'text-[#5B33CC]/60' : 'text-[#5B33CC]'}`}>
                                                {m.role === 'user' ? 'Anda' : 'PETAYU AI'}
                                            </span>
                                            {m.role !== 'user' && (
                                                <div className="px-1.5 py-0.5 rounded bg-emerald-50 text-[9px] font-black text-emerald-600 border border-emerald-100">AI</div>
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
                            <div className="flex justify-start">
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 w-9 h-9 rounded-[14px] bg-[#5B33CC] flex items-center justify-center text-white">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="px-5 py-4 rounded-2xl rounded-tl-md bg-white border border-[#E5EAF3] shadow-sm">
                                        <div className="flex gap-1.5 items-center h-5">
                                            <div className="w-2 h-2 bg-[#5B33CC]/40 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-[#5B33CC]/40 rounded-full animate-bounce delay-75" />
                                            <div className="w-2 h-2 bg-[#5B33CC]/40 rounded-full animate-bounce delay-150" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Area */}
                    <div className="p-4 bg-white z-10 shrink-0 border-t border-[#E5EAF3]">
                        {error && (
                            <div className="mb-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[12px] font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}
                        <div className="relative max-w-4xl mx-auto">
                            <div className="flex items-center gap-3 bg-[#f8f9fb] border border-[#E5EAF3] focus-within:border-[#5B33CC] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(89,50,201,0.08)] rounded-2xl px-5 py-2 transition-all duration-200">
                                <input 
                                    ref={textareaRef}
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Tanyakan analisis gudang ke PETAYU AI..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 font-semibold py-3 text-[14px]"
                                />
                                
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={toggleListening}
                                        className={`p-2 rounded-xl transition-all ${recognitionRef.current ? 'text-rose-600 bg-rose-50' : 'text-gray-400 hover:text-[#5B33CC] hover:bg-[#5B33CC]/10'}`}
                                    >
                                        <Mic className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleSendMessage()}
                                        disabled={isLoading || !inputText.trim()}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${inputText.trim() ? 'bg-[#5B33CC] text-white shadow-[0_4px_12px_rgba(89,50,201,0.3)]' : 'bg-gray-100 text-gray-300'}`}
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <PetayuAIModal
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
