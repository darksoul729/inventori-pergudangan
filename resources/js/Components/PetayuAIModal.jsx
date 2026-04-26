import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import {
    X, Send, Plus, MessageSquare, Sparkles,
    ChevronRight, Loader2, AlertCircle, Bot, User,
    Database, Zap, BarChart3, Mic,
    Volume2, VolumeX, Eraser, Phone, PhoneOff,
    Clock, Search
} from 'lucide-react';

// ─── AI SVG Icon ─────────────────────────────────────────────────────────────
const PetayuIcon = ({ className = 'w-6 h-6', style }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" fill="white" fillOpacity="0.9" />
        <circle cx="12" cy="12" r="3" fill="white" />
        <path d="M12 5V7M12 17V19M5 12H7M17 12H19M7.05 7.05L8.46 8.46M15.54 15.54L16.95 16.95M7.05 16.95L8.46 15.54M15.54 8.46L16.95 7.05"
            stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function stripStructuredMetadata(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/\n*\[\[PETAYU_FORECAST:[\s\S]*?\]\]\s*/g, '').trim();
}

function parseForecastMetadata(content) {
    if (typeof content !== 'string') return null;
    const match = content.match(/\[\[PETAYU_FORECAST:([\s\S]*?)\]\]/);
    if (!match) return null;
    try {
        const data = JSON.parse(match[1]);
        if (!Array.isArray(data.items) || data.items.length === 0) return null;
        return data;
    } catch {
        return null;
    }
}

function stripMarkdown(text) {
    if (typeof text !== 'string') return '';
    return stripStructuredMetadata(text)
        .replace(/[#*_`>-]/g, ' ')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
}

function splitSpeechText(text) {
    const clean = stripMarkdown(text);
    if (!clean) return [];
    const sentences = clean.match(/[^.!?。！？]+[.!?。！？]*/g) || [clean];
    const chunks = [];
    let current = '';
    sentences.forEach(sentence => {
        const next = `${current} ${sentence}`.trim();
        if (next.length > 180 && current) {
            chunks.push(current);
            current = sentence.trim();
        } else {
            current = next;
        }
    });
    if (current) chunks.push(current);
    return chunks;
}

function renderInline(text) {
    if (typeof text !== 'string') return text;
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-slate-900 font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
        }
        return part;
    });
}

function extractMetric(content, label) {
    if (typeof content !== 'string') return null;
    const plain = content.replace(/\*\*/g, '');
    const match = plain.match(new RegExp(`${label}:\\s*([^\\n]+)`, 'i'));
    return match?.[1]?.trim() ?? null;
}

// ─── Sub-Components ───────────────────────────────────────────────────────────
function MarkdownContent({ content }) {
    if (typeof content !== 'string') return null;
    const lines = stripStructuredMetadata(content).split('\n');
    return (
        <div className="prose-petayu space-y-2">
            {lines.map((line, i) => {
                const cleanLine = line.trim();
                if (cleanLine.startsWith('# ')) return <h1 key={i} className="text-lg font-black text-slate-950 mb-2">{cleanLine.slice(2)}</h1>;
                if (cleanLine.startsWith('## ')) return <h2 key={i} className="text-base font-black text-slate-900 mb-1 mt-3">{cleanLine.slice(3)}</h2>;
                if (cleanLine.startsWith('### ')) return <h3 key={i} className="text-sm font-black text-slate-800 mb-1 mt-2">{cleanLine.slice(4)}</h3>;
                if (/^[A-Za-zÀ-ÿ0-9\s/&-]{4,48}:$/.test(cleanLine)) {
                    return <h3 key={i} className="text-[12px] font-black text-slate-900 uppercase tracking-[0.12em] mt-4 mb-2">{cleanLine.replace(':', '')}</h3>;
                }
                if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
                    return (
                        <div key={i} className="flex gap-3 rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm text-slate-700">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                            <span className="leading-relaxed">{renderInline(cleanLine.slice(2))}</span>
                        </div>
                    );
                }
                if (cleanLine.match(/^\d+\. /)) {
                    const rank = cleanLine.match(/^(\d+)\. /)?.[1];
                    return (
                        <div key={i} className="flex items-center gap-3 rounded-2xl bg-white border border-slate-100 px-3 py-2 shadow-sm">
                            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50 text-[11px] font-black text-indigo-600">{rank}</span>
                            <span className="text-sm text-slate-700 leading-relaxed">{renderInline(cleanLine.replace(/^\d+\. /, ''))}</span>
                        </div>
                    );
                }
                if (line.startsWith('---')) return <hr key={i} className="border-slate-100 my-2" />;
                if (line === '') return <div key={i} className="h-1" />;
                return <p key={i} className="text-slate-600 text-sm leading-relaxed">{renderInline(line)}</p>;
            })}
        </div>
    );
}

function InsightSummary({ content }) {
    if (typeof content !== 'string') return null;
    const metrics = [
        { label: 'Unit tersimpan', value: extractMetric(content, 'Total Unit Tersimpan'), icon: <Database className="w-4 h-4" />, tone: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
        { label: 'Produk', value: extractMetric(content, 'Total Produk Terdaftar'), icon: <BarChart3 className="w-4 h-4" />, tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        { label: 'Nilai aset', value: extractMetric(content, 'Estimasi Nilai Aset(?: Inventaris)?'), icon: <Sparkles className="w-4 h-4" />, tone: 'bg-amber-50 text-amber-700 border-amber-100' },
        { label: 'Efisiensi', value: extractMetric(content, 'Efisiensi Penyimpanan'), icon: <Zap className="w-4 h-4" />, tone: 'bg-sky-50 text-sky-700 border-sky-100' },
    ].filter(item => item.value);
    if (metrics.length < 2) return null;
    return (
        <div className="grid grid-cols-2 gap-2 mb-4">
            {metrics.map(item => (
                <div key={item.label} className={`rounded-2xl border px-3 py-3 ${item.tone}`}>
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide opacity-80">
                        {item.icon}{item.label}
                    </div>
                    <div className="mt-1 text-[15px] font-black leading-tight text-slate-900">{item.value}</div>
                </div>
            ))}
        </div>
    );
}

function ForecastSummary({ data }) {
    const items = data?.items || [];
    if (!items.length) return null;
    const maxStock = Math.max(...items.map(item => Math.max(item.current_stock || 0, item.predicted_stock || 0)), 1);
    const riskyCount = items.filter(item => item.status !== 'aman').length;
    return (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                        <BarChart3 className="h-4 w-4 text-indigo-600" />
                        Forecast {data.days} hari
                    </div>
                    <div className="mt-1 text-[12px] font-bold text-slate-500">
                        Bobot tren {data.recent_days} hari terbaru dari histori {data.history_days} hari
                    </div>
                </div>
                <div className={`rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wide ${riskyCount > 0 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {riskyCount > 0 ? `${riskyCount} perlu pantau` : 'Semua aman'}
                </div>
            </div>
            <div className="mt-4 space-y-3">
                {items.map((item, index) => {
                    const currentWidth = Math.max(6, Math.round(((item.current_stock || 0) / maxStock) * 100));
                    const predictedWidth = Math.max(6, Math.round(((item.predicted_stock || 0) / maxStock) * 100));
                    const isRisk = item.status !== 'aman';
                    const trendLabel = item.trend === 'naik' ? 'Naik' : item.trend === 'turun' ? 'Turun' : 'Stabil';
                    return (
                        <div key={`${item.name}-${index}`} className="rounded-2xl border border-white bg-white px-3 py-3 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="truncate text-[13px] font-black text-slate-900">{item.name}</div>
                                    <div className="mt-0.5 text-[11px] font-bold text-slate-400">
                                        Keluar {item.daily_out} {item.unit}/hari · Tren {trendLabel}
                                    </div>
                                </div>
                                <div className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-black uppercase ${isRisk ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                    {isRisk ? 'Pantau' : 'Aman'}
                                </div>
                            </div>
                            <div className="mt-3 space-y-2">
                                <div className="grid grid-cols-[56px_1fr_72px] items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Kini</span>
                                    <div className="h-2 rounded-full bg-slate-100">
                                        <div className="h-2 rounded-full bg-slate-400" style={{ width: `${currentWidth}%` }} />
                                    </div>
                                    <span className="text-right text-[11px] font-black tabular-nums text-slate-600">{item.current_stock} {item.unit}</span>
                                </div>
                                <div className="grid grid-cols-[56px_1fr_72px] items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-indigo-500">Pred</span>
                                    <div className="h-2 rounded-full bg-indigo-50">
                                        <div className={`h-2 rounded-full ${isRisk ? 'bg-amber-500' : 'bg-indigo-600'}`} style={{ width: `${predictedWidth}%` }} />
                                    </div>
                                    <span className="text-right text-[11px] font-black tabular-nums text-slate-900">{item.predicted_stock} {item.unit}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function VoiceDebugPanel({ debug, latencyMs, providerLatencyMs }) {
    const items = [
        { label: 'Mic', value: debug?.mic || 'idle' },
        { label: 'Chat', value: debug?.chat || 'idle' },
        { label: 'TTS', value: debug?.tts || 'idle' },
    ];
    return (
        <div className="mt-6 w-full max-w-xl rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-left shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
                {items.map(item => (
                    <div key={item.label} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                        <span className="text-[10px] font-black uppercase tracking-wide text-slate-700">{item.value}</span>
                    </div>
                ))}
                {latencyMs != null && (
                    <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2">
                        <Clock className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-wide text-indigo-700">Total {(latencyMs / 1000).toFixed(2)}s</span>
                    </div>
                )}
                {providerLatencyMs != null && (
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-500">
                        Groq {(providerLatencyMs / 1000).toFixed(2)}s
                    </div>
                )}
            </div>
            {debug?.error && (
                <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold leading-relaxed text-amber-700">{debug.error}</div>
            )}
        </div>
    );
}

const QUICK_SUGGESTIONS = [
    { icon: <BarChart3 className="w-3.5 h-3.5" />, text: 'Ringkasan stok hari ini' },
    { icon: <Database className="w-3.5 h-3.5" />, text: 'Produk dengan stok rendah' },
    { icon: <Zap className="w-3.5 h-3.5" />, text: 'Prediksi stok 3 hari' },
    { icon: <Sparkles className="w-3.5 h-3.5" />, text: 'Analisis efisiensi gudang' },
];

// ─── MessageBubble ─────────────────────────────────────────────────────────────
function MessageBubble({ message, user, onSpeak }) {
    const safeMessage = message || {};
    const isUser = safeMessage.role === 'user';
    const rawContent = typeof safeMessage.content === 'string' ? safeMessage.content : '';

    const [typedContent, setTypedContent] = useState(safeMessage.animate ? '' : rawContent);

    const forecastData = !isUser
        ? (safeMessage.type === 'stock_forecast' ? safeMessage.data : parseForecastMetadata(typedContent))
        : null;

    useEffect(() => {
        if (!safeMessage.animate || isUser) {
            setTypedContent(rawContent);
            return;
        }
        let index = 0;
        setTypedContent('');
        const interval = setInterval(() => {
            index += Math.max(1, Math.ceil(rawContent.length / 180));
            setTypedContent(rawContent.slice(0, index));
            if (index >= rawContent.length) clearInterval(interval);
        }, 18);
        return () => clearInterval(interval);
    }, [rawContent, safeMessage.animate, isUser]);

    const timeLabel = (() => {
        try {
            const d = safeMessage.timestamp ? new Date(safeMessage.timestamp) : new Date();
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return 'Baru saja'; }
    })();

    return (
        <div className={`flex gap-4 mb-8 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-sm font-black shadow-md ${isUser ? 'bg-white text-slate-700 border border-slate-200' : 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-100'}`}>
                {isUser
                    ? (user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />)
                    : <PetayuIcon className="w-6 h-6" />
                }
            </div>
            <div className={`max-w-[85%] px-6 py-4 rounded-3xl shadow-sm ${isUser ? 'rounded-tr-lg bg-indigo-600 text-white font-bold' : 'rounded-tl-lg bg-white border border-slate-100 text-slate-800'}`}>
                {!isUser && (
                    <div className="flex justify-end mb-2">
                        <button
                            type="button"
                            onClick={() => onSpeak && onSpeak(safeMessage.content)}
                            className="h-8 px-2.5 flex items-center gap-1.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-[11px] font-black"
                        >
                            <Volume2 className="w-3.5 h-3.5" />
                            Dengarkan
                        </button>
                    </div>
                )}
                {isUser ? (
                    <div className="whitespace-pre-wrap text-sm font-bold leading-relaxed text-white">{typedContent}</div>
                ) : (
                    <div className="prose-petayu">
                        {typedContent && (
                            <>
                                {typedContent.includes('Total Unit Tersimpan') && <InsightSummary content={typedContent} />}
                                {forecastData && <ForecastSummary data={forecastData} />}
                                <MarkdownContent content={typedContent} />
                            </>
                        )}
                    </div>
                )}
                <div className={`mt-2 text-[10px] font-black uppercase tracking-widest ${isUser ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {timeLabel}
                </div>
            </div>
        </div>
    );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function PetayuAIModal({ isOpen, onClose, startInCall = false }) {
    // ── Safe page props ──
    let auth = {};
    try {
        const { props } = usePage();
        auth = props?.auth || {};
    } catch (e) {
        // usePage may throw outside Inertia context; gracefully fall back
    }

    // ── State ──
    const [conversations, setConversations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);
    const [error, setError] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPreparingSpeech, setIsPreparingSpeech] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
    const [stableStatus, setStableStatus] = useState('Siap membantu via suara');
    const [stableVolumeLevel, setStableVolumeLevel] = useState(0);
    const [voiceDebug, setVoiceDebug] = useState({ mic: 'idle', chat: 'idle', tts: 'idle', error: null });
    const [lastLatencyMs, setLastLatencyMs] = useState(null);
    const [lastProviderLatencyMs, setLastProviderLatencyMs] = useState(null);
    const [isPptHolding, setIsPptHolding] = useState(false);
    const [liveUserText, setLiveUserText] = useState('');

    // ── Refs ──
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const audioRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const voiceAudioChunksRef = useRef([]);
    const voiceAbortControllerRef = useRef(null);
    const liveStreamRef = useRef(null);
    const browserSpeechRef = useRef(null);
    const liveSubmitInFlightRef = useRef(false);
    const handleStableVoiceSubmitRef = useRef(null);

    // ── Scroll ──
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen, messages, scrollToBottom]);

    // ── TTS helpers ──
    const stopSpeaking = useCallback(() => {
        voiceAbortControllerRef.current?.abort();
        voiceAbortControllerRef.current = null;
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        window.speechSynthesis?.cancel?.();
        browserSpeechRef.current = null;
        setIsPreparingSpeech(false);
        setIsSpeaking(false);
    }, []);

    const speakWithBrowserTts = useCallback((text, signal) => new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(new DOMException('Canceled', 'AbortError'));
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 1.05;
        browserSpeechRef.current = utterance;
        const abort = () => { window.speechSynthesis.cancel(); signal?.removeEventListener('abort', abort); resolve(); };
        signal?.addEventListener('abort', abort, { once: true });
        utterance.onstart = () => { setIsPreparingSpeech(false); setIsSpeaking(true); };
        utterance.onend = () => { signal?.removeEventListener('abort', abort); setIsSpeaking(false); resolve(); };
        utterance.onerror = () => { signal?.removeEventListener('abort', abort); setIsSpeaking(false); reject(new Error('Browser TTS error')); };
        window.speechSynthesis.speak(utterance);
    }), []);

    const playAudioData = useCallback((audioData, signal) => new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(new DOMException('Canceled', 'AbortError'));
        const audio = new Audio(`data:audio/wav;base64,${audioData}`);
        audioRef.current = audio;
        const abort = () => { audio.pause(); audio.currentTime = 0; resolve(); };
        signal?.addEventListener('abort', abort, { once: true });
        audio.onended = () => { signal?.removeEventListener('abort', abort); audioRef.current = null; resolve(); };
        audio.onerror = () => { signal?.removeEventListener('abort', abort); audioRef.current = null; reject(new Error('Audio playback failed')); };
        audio.play().catch(reject);
    }), []);

    const speakWithLocalTts = useCallback(async (text, signal) => {
        try {
            const chunks = splitSpeechText(text);
            if (!chunks.length) return;
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            setIsPreparingSpeech(true);
            for (const chunk of chunks) {
                if (signal?.aborted) throw new DOMException('Canceled', 'AbortError');
                const res = await fetch('/petayu-ai/local-tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                    body: JSON.stringify({ text: chunk }),
                    signal,
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.audio) throw new Error(data.error || 'TTS lokal tidak tersedia.');
                await playAudioData(data.audio, signal);
                await new Promise(r => setTimeout(r, 80));
            }
        } finally {
            setIsPreparingSpeech(false);
            setIsSpeaking(false);
        }
    }, [playAudioData]);

    const speakText = useCallback(async (text) => {
        if (!text || typeof text !== 'string') return;
        stopSpeaking();
        const controller = new AbortController();
        voiceAbortControllerRef.current = controller;
        const cleanText = stripMarkdown(text);
        if (!cleanText) return;
        try {
            setIsPreparingSpeech(true);
            try {
                await speakWithLocalTts(cleanText, controller.signal);
            } catch (err) {
                if (err.name !== 'AbortError') await speakWithBrowserTts(cleanText, controller.signal);
            }
        } catch (e) {
            if (e.name !== 'AbortError') console.error('Speech error:', e);
        } finally {
            voiceAbortControllerRef.current = null;
            setIsPreparingSpeech(false);
        }
    }, [stopSpeaking, speakWithLocalTts, speakWithBrowserTts]);

    // ── Conversation loading ──
    const loadConversations = useCallback(async () => {
        setIsFetchingHistory(true);
        try {
            const res = await fetch('/petayu-ai/conversations');
            const data = await res.json();
            setConversations(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Error loading conversations:', e);
        } finally {
            setIsFetchingHistory(false);
        }
    }, []);

    const loadMessages = useCallback(async (conversationId) => {
        setIsFetchingHistory(true);
        try {
            const res = await fetch(`/petayu-ai/conversations/${conversationId}/messages`);
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
            setActiveConversationId(conversationId);
            scrollToBottom();
        } catch (e) {
            console.error('Error loading messages:', e);
        } finally {
            setIsFetchingHistory(false);
        }
    }, [scrollToBottom]);

    useEffect(() => {
        if (isOpen) {
            loadConversations();
            setMessages([]);
            setActiveConversationId(null);
            setInputText('');
            setError(null);
        }
    }, [isOpen, loadConversations]);

    // ── sendMessage ──
    const sendMessage = useCallback(async (textOverride = null) => {
        const text = textOverride || inputText;
        if (!text?.trim() || isLoading) return;
        const userMsg = { id: Date.now(), role: 'user', content: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);
        setError(null);
        scrollToBottom();
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            const res = await fetch('/petayu-ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ message: text, conversation_id: activeConversationId }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            if (data.conversation_id && !activeConversationId) {
                setActiveConversationId(data.conversation_id);
                loadConversations();
            }
            const aiMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: data.message?.content || '',
                type: data.message?.type,
                data: data.message?.data,
                animate: true,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMsg]);
            scrollToBottom();
            if (voiceEnabled && aiMsg.content) speakText(aiMsg.content);
        } catch (e) {
            setError(e.message || 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, isLoading, activeConversationId, voiceEnabled, loadConversations, scrollToBottom, speakText]);

    // ── Voice: handleStableVoiceSubmit (defined BEFORE startPpt to avoid stale closure) ──
    const handleStableVoiceSubmit = useCallback(async (text) => {
        if (!text || liveSubmitInFlightRef.current) return;
        liveSubmitInFlightRef.current = true;
        setIsThinking(true);
        setStableStatus('Sedang berpikir...');
        setVoiceDebug(d => ({ ...d, chat: 'sending' }));
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            const res = await fetch('/petayu-ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ message: text, conversation_id: activeConversationId }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            const aiMsg = { id: Date.now(), role: 'assistant', content: data.message?.content || '', type: data.message?.type, data: data.message?.data, timestamp: new Date() };
            setMessages(prev => [...prev, { id: Date.now() - 1, role: 'user', content: text, timestamp: new Date() }, aiMsg]);
            scrollToBottom();
            setIsThinking(false);
            if (aiMsg.content) await speakText(aiMsg.content);
            setStableStatus('Siap membantu via suara');
        } catch (e) {
            console.error('Voice chat error:', e);
            setStableStatus('Terjadi kesalahan.');
            setIsThinking(false);
        } finally {
            liveSubmitInFlightRef.current = false;
        }
    }, [activeConversationId, scrollToBottom, speakText]);

    // Keep ref always pointing to latest handleStableVoiceSubmit
    useEffect(() => {
        handleStableVoiceSubmitRef.current = handleStableVoiceSubmit;
    }, [handleStableVoiceSubmit]);

    // ── Voice PTT (allows interrupting AI speech) ──
    const startPpt = useCallback(async () => {
        if (isThinking || isPreparingSpeech) return;
        // If AI is speaking, interrupt it first
        if (isSpeaking) stopSpeaking();
        setIsPptHolding(true);
        setLiveUserText('');
        setIsListening(true);
        setStableStatus('Mendengarkan...');
        setVoiceDebug(d => ({ ...d, mic: 'recording' }));
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            liveStreamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            voiceAudioChunksRef.current = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) voiceAudioChunksRef.current.push(e.data); };
            recorder.onstop = async () => {
                const blob = new Blob(voiceAudioChunksRef.current, { type: 'audio/webm' });
                if (blob.size < 1000) {
                    setStableStatus('Rekaman terlalu pendek, coba lagi.');
                    return;
                }
                setStableStatus('Mengirim ke server...');
                const fd = new FormData();
                fd.append('audio', blob, 'voice.webm');
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
                try {
                    const res = await fetch('/petayu-ai/transcribe', {
                        method: 'POST',
                        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                        body: fd,
                    });
                    const data = await res.json();
                    if (data.text) {
                        setLiveUserText(data.text);
                        // Use ref to call latest version (avoids stale closure)
                        handleStableVoiceSubmitRef.current?.(data.text);
                    } else if (data.error) {
                        setStableStatus(`Gagal: ${data.error}`);
                        setVoiceDebug(d => ({ ...d, mic: 'error', error: data.error }));
                    }
                } catch (e) {
                    console.error('Transcription error:', e);
                    setStableStatus('Gagal transkripsi suara.');
                    setVoiceDebug(d => ({ ...d, mic: 'error', error: e.message }));
                }
            };
            recorder.start();
        } catch (e) {
            console.error('Mic error:', e);
            setStableStatus('Izin mikrofon diperlukan.');
            setVoiceDebug(d => ({ ...d, mic: 'error', error: e.message }));
            setIsPptHolding(false);
            setIsListening(false);
        }
    }, [isSpeaking, isThinking, isPreparingSpeech, stopSpeaking]);

    const stopPpt = useCallback(() => {
        setIsPptHolding(false);
        setIsListening(false);
        setVoiceDebug(d => ({ ...d, mic: 'processing' }));
        setStableStatus('Memproses suara...');
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (liveStreamRef.current) {
            liveStreamRef.current.getTracks().forEach(t => t.stop());
            liveStreamRef.current = null;
        }
    }, []);

    // handleStableVoiceSubmit is now defined above startPpt (see line ~553)

    const stopStableCall = useCallback(() => {
        stopSpeaking();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try { mediaRecorderRef.current.stop(); } catch (_) {}
        }
        if (liveStreamRef.current) {
            liveStreamRef.current.getTracks().forEach(t => t.stop());
            liveStreamRef.current = null;
        }
        mediaRecorderRef.current = null;
        voiceAudioChunksRef.current = [];
        liveSubmitInFlightRef.current = false;
        setIsPptHolding(false);
        setIsListening(false);
        setIsSpeaking(false);
        setIsThinking(false);
        setIsPreparingSpeech(false);
        setIsLiveCallOpen(false);
        setStableStatus('Panggilan Berakhir');
        setStableVolumeLevel(0);
        setVoiceDebug({ mic: 'stopped', chat: 'idle', tts: 'stopped', error: null });
    }, [stopSpeaking]);

    const startStableVoiceCall = useCallback(() => {
        stopSpeaking();
        setIsLiveCallOpen(true);
        setIsListening(false);
        setLiveUserText('');
        setStableStatus('Siap membantu');
        setVoiceDebug({ mic: 'active', chat: 'idle', tts: 'idle', error: null });
    }, [stopSpeaking]);

    // ── Guard ──
    if (!isOpen) return null;

    const firstName = auth.user?.name ? auth.user.name.split(' ')[0] : 'User';
    const hasMessages = messages.length > 0;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 pointer-events-none">
            <div className="absolute inset-0 bg-slate-200/40 backdrop-blur-md pointer-events-auto" onClick={onClose} />
            <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-[40px] shadow-[0_32px_120px_rgba(15,23,42,0.18)] flex overflow-hidden pointer-events-auto border border-white">

                {/* ── Sidebar ── */}
                {showSidebar && (
                    <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 tracking-tight">PETAYU AI</h2>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Intelligence</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setMessages([]); setActiveConversationId(null); }}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-500/5 transition-all font-bold text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Percakapan Baru
                            </button>
                            <div className="mt-4 relative">
                                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari riwayat obrolan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-[12px] font-bold text-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-slate-400 shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 space-y-2">
                            <div className="px-4 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Riwayat Terakhir</div>
                            {isFetchingHistory && !conversations.length ? (
                                <div className="px-4 py-8 text-center text-slate-300">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Memuat...</span>
                                </div>
                            ) : conversations.filter(c => (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())).map(conv => (
                                <button key={conv.id} onClick={() => loadMessages(conv.id)}
                                    className={`w-full group flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition-all ${activeConversationId === conv.id ? 'bg-white shadow-xl shadow-indigo-500/5 text-indigo-600' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}>
                                    <div className={`p-2 rounded-xl transition-colors ${activeConversationId === conv.id ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-100 text-slate-400 group-hover:bg-white'}`}>
                                        <MessageSquare className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold truncate pr-2">{conv.title || 'Percakapan AI'}</div>
                                        <div className="text-[9px] font-black uppercase opacity-40 mt-0.5">{new Date(conv.updated_at).toLocaleDateString()}</div>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            ))}
                        </div>
                        <div className="p-5 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-black border border-slate-200">
                                    {auth.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-800 text-xs font-black truncate">{auth.user?.name || 'User'}</p>
                                    <p className="text-slate-400 text-[10px] font-bold">Pengguna Sistem</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Main Panel ── */}
                <div className="flex-1 flex flex-col relative bg-white">

                    {/* Header */}
                    <div className="h-20 px-8 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setShowSidebar(!showSidebar)} className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors">
                                <Bot className="w-5 h-5" />
                            </button>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 leading-none">
                                    {isLiveCallOpen ? 'Panggilan PETAYU AI' : 'PETAYU AI'}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistem Aktif</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isLiveCallOpen && (
                                <button onClick={startStableVoiceCall} className="h-10 px-4 flex items-center gap-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all font-black text-xs">
                                    <Phone className="w-4 h-4" />
                                    Mode Suara
                                </button>
                            )}
                            <button onClick={() => { setVoiceEnabled(v => !v); if (voiceEnabled) stopSpeaking(); }}
                                className={`p-2.5 rounded-xl transition-all ${voiceEnabled ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-400'}`}>
                                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                            </button>
                            <button onClick={() => { if (window.confirm('Hapus seluruh percakapan ini?')) { setMessages([]); setActiveConversationId(null); loadConversations(); } }}
                                className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                                <Eraser className="w-5 h-5" />
                            </button>
                            <div className="w-[1px] h-6 bg-slate-100 mx-2" />
                            <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-8 relative">

                        {/* Live Call Overlay */}
                        {isLiveCallOpen && (
                            <div className="absolute inset-0 bg-white z-20 flex flex-col">
                                <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                                    <div className="relative mb-12">
                                        <div className={`absolute inset-[-40px] rounded-full bg-indigo-100/50 blur-3xl transition-all duration-700 ${isSpeaking || isListening ? 'opacity-100 scale-125' : 'opacity-0 scale-75'}`} />
                                        <div
                                            onClick={() => { if (isSpeaking || isPreparingSpeech) stopSpeaking(); }}
                                            className={`relative w-44 h-44 rounded-full flex items-center justify-center transition-all duration-500 ${isSpeaking || isPreparingSpeech ? 'cursor-pointer hover:scale-105' : ''} ${isListening ? 'bg-emerald-50 scale-110' : isSpeaking ? 'bg-indigo-50 scale-110' : 'bg-white border-2 border-slate-100'}`}
                                            title={isSpeaking ? 'Klik untuk memotong jawaban' : ''}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="flex h-24 w-28 items-center justify-center gap-1.5">
                                                    {[0.35, 0.58, 0.82, 1, 0.72, 0.48, 0.3].map((base, i) => (
                                                        <span key={i} className={`w-1.5 rounded-full transition-all duration-150 ${isSpeaking ? 'bg-indigo-400' : isListening ? 'bg-emerald-400' : 'bg-slate-300'}`}
                                                            style={{ height: `${22 + base * 28}px` }} />
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Interrupt hint overlay */}
                                            {(isSpeaking || isPreparingSpeech) && (
                                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 hover:bg-black/10 transition-all">
                                                    <VolumeX className="w-8 h-8 text-white/0 hover:text-white/80 transition-all" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-3xl font-black tracking-tight text-slate-950">PETAYU AI</div>
                                    <div className="mt-2 text-sm font-bold text-slate-500">
                                        {isPreparingSpeech ? 'Menyiapkan suara...' : isThinking ? 'Memahami ucapan anda...' : isSpeaking ? 'Sedang berbicara — ketuk untuk potong' : isListening ? 'Mendengarkan...' : 'Panggilan suara aktif'}
                                    </div>
                                    {liveUserText && (
                                        <div className="mt-8 w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ucapan terakhir</div>
                                            <div className="mt-1 line-clamp-2 text-sm font-semibold text-slate-700">{liveUserText}</div>
                                        </div>
                                    )}
                                    <VoiceDebugPanel debug={voiceDebug} latencyMs={lastLatencyMs} providerLatencyMs={lastProviderLatencyMs} />
                                </div>
                                <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-8">
                                    <div className="mx-auto flex max-w-xl flex-col items-center gap-8">
                                        {/* Interrupt button — visible when AI is speaking */}
                                        {(isSpeaking || isPreparingSpeech) && (
                                            <button
                                                type="button"
                                                onClick={stopSpeaking}
                                                className="w-full max-w-xs h-14 flex items-center justify-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all shadow-lg shadow-amber-100/50 animate-in fade-in duration-300"
                                            >
                                                <VolumeX className="w-5 h-5" />
                                                <span className="text-xs font-black uppercase tracking-widest">Potong Jawaban</span>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onMouseDown={startPpt}
                                            onMouseUp={stopPpt}
                                            onMouseLeave={() => isPptHolding && stopPpt()}
                                            onTouchStart={e => { e.preventDefault(); startPpt(); }}
                                            onTouchEnd={e => { e.preventDefault(); stopPpt(); }}
                                            disabled={isThinking}
                                            className={`h-28 w-28 flex flex-col items-center justify-center rounded-full transition-all duration-300 shadow-2xl select-none ${isPptHolding ? 'bg-indigo-600 text-white scale-110' : isSpeaking ? 'bg-amber-50 text-amber-600 border-2 border-amber-200 hover:bg-amber-100' : isThinking ? 'bg-slate-100 text-slate-300' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            {isSpeaking ? (
                                                <>
                                                    <Mic className="w-9 h-9" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest mt-1 text-amber-500">INTERRUPT</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Mic className={`w-9 h-9 ${isPptHolding ? 'animate-bounce' : ''}`} />
                                                    <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isPptHolding ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                        {isPptHolding ? 'RELEASE' : 'HOLD'}
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                            {isSpeaking ? 'Tahan mic untuk potong & bicara' : isPptHolding ? 'Lepas untuk kirim pesan' : 'Tahan tombol untuk bicara'}
                                        </p>
                                        <button type="button" onClick={stopStableCall}
                                            className="h-12 w-12 flex items-center justify-center rounded-2xl bg-red-100 text-red-600 hover:bg-red-200 transition-all">
                                            <PhoneOff className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fetching spinner */}
                        {!isLiveCallOpen && isFetchingHistory && (
                            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-300">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                <span className="text-xs font-bold uppercase tracking-widest">Sinkronisasi Data...</span>
                            </div>
                        )}

                        {/* Welcome screen */}
                        {!isLiveCallOpen && !hasMessages && !isFetchingHistory && (
                            <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                <div className="relative mb-8">
                                    <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-indigo-200 rotate-3">
                                        <PetayuIcon className="w-10 h-10" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-xl border border-slate-50">
                                        <Sparkles className="w-5 h-5 text-indigo-500" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Halo, {firstName}! ✦</h2>
                                <p className="text-slate-500 text-sm mb-12 max-w-sm font-medium leading-relaxed">
                                    Saya asisten kecerdasan buatan gudang Anda.<br />Mari analisis data operasional secara instan.
                                </p>
                                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                                    {QUICK_SUGGESTIONS.map((s, i) => (
                                        <button key={i} onClick={() => sendMessage(s.text)}
                                            className="flex items-center gap-3 px-4 py-4 rounded-2xl text-left text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all border border-slate-200/60 bg-white/50">
                                            <span className="text-slate-400">{s.icon}</span>
                                            {s.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        {!isLiveCallOpen && !isFetchingHistory && messages.map((msg, i) => (
                            <MessageBubble key={msg.id ?? i} message={msg} user={auth.user} onSpeak={speakText} />
                        ))}

                        {/* Loading bubble */}
                        {!isLiveCallOpen && isLoading && (
                            <div className="flex gap-4 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                                    <PetayuIcon className="w-6 h-6" />
                                </div>
                                <div className="px-5 py-4 rounded-3xl rounded-tl-lg flex items-center gap-1.5 bg-white border border-slate-100 shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl text-red-600 text-sm mb-6 bg-red-50 border border-red-100">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="font-bold">{error}</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    {!isLiveCallOpen && (
                        <div className="px-6 pb-6 pt-3 bg-white/85 backdrop-blur-md">
                            <div className="relative rounded-[28px] border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)] transition-all focus-within:border-indigo-200 focus-within:shadow-[0_18px_55px_rgba(89,50,201,0.16)]">
                                <textarea
                                    ref={textareaRef}
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                    disabled={isLoading}
                                    placeholder="Ketik perintah atau tanyakan data gudang..."
                                    rows={1}
                                    className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-[14px] font-semibold resize-none py-4 pl-5 pr-28 border-0 outline-none ring-0 focus:outline-none focus:ring-0"
                                    style={{ minHeight: '58px', maxHeight: '160px', boxShadow: 'none' }}
                                    onInput={e => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => sendMessage()}
                                    disabled={!inputText.trim() || isLoading}
                                    className="absolute right-2.5 bottom-2.5 w-9 h-9 rounded-2xl flex items-center justify-center transition-all disabled:opacity-40"
                                    style={{
                                        background: inputText.trim() && !isLoading ? '#5932C9' : '#cbd5e1',
                                        boxShadow: inputText.trim() && !isLoading ? '0 8px 20px rgba(89,50,201,0.3)' : 'none',
                                    }}
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white" />}
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <div className={`w-1.5 h-1.5 rounded-full ${isPreparingSpeech ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                    {isPreparingSpeech ? 'Menyiapkan suara...' : 'Didukung Groq AI · Piper TTS offline'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
