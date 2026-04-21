import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import {
    X, Send, Plus, Trash2, MessageSquare, Sparkles,
    ChevronRight, Loader2, AlertCircle, Bot, User,
    Database, Zap, BarChart3, Info, Mic, MicOff,
    Volume2, VolumeX, Eraser, Play, Phone, PhoneOff, Waves,
    Save, Clock
} from 'lucide-react';

// ─── Custom External-styled AI SVG Icon ─────────────────────────────────────
const AetherIcon = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" fill="white" fillOpacity="0.9" />
        <circle cx="12" cy="12" r="3" fill="white" />
        <path d="M12 5V7M12 17V19M5 12H7M17 12H19M7.05 7.05L8.46 8.46M15.54 15.54L16.95 16.95M7.05 16.95L8.46 15.54M15.54 8.46L16.95 7.05" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

// ─── Markdown renderer (Light Theme Optimized) ──────────────────────────────
function MarkdownContent({ content }) {
    const lines = stripStructuredMetadata(content).split('\n');
    return (
        <div className="prose-aether space-y-2">
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

function stripStructuredMetadata(text = '') {
    return text.replace(/\n*\[\[AETHER_FORECAST:[\s\S]*?\]\]\s*/g, '').trim();
}

function parseForecastMetadata(content = '') {
    const match = content.match(/\[\[AETHER_FORECAST:([\s\S]*?)\]\]/);
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
const Typewriter = ({ text, speed = 10, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[index]);
                setIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else if (onComplete) { onComplete(); }
    }, [index, text, speed, onComplete]);
    return <span>{displayedText}</span>;
};



function extractMetric(content, label) {
    const plain = content.replace(/\*\*/g, '');
    const match = plain.match(new RegExp(`${label}:\\s*([^\\n]+)`, 'i'));
    return match?.[1]?.trim() ?? null;
}

function InsightSummary({ content }) {
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
                        {item.icon}
                        {item.label}
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
        { label: 'Mic', value: debug.mic },
        { label: 'Chat', value: debug.chat },
        { label: 'TTS', value: debug.tts },
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
                {latencyMs !== null && (
                    <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2">
                        <Clock className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-wide text-indigo-700">
                            Total {(latencyMs / 1000).toFixed(2)}s
                        </span>
                    </div>
                )}
                {providerLatencyMs !== null && (
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-500">
                        Groq {(providerLatencyMs / 1000).toFixed(2)}s
                    </div>
                )}
            </div>
            {debug.error && (
                <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold leading-relaxed text-amber-700">
                    {debug.error}
                </div>
            )}
        </div>
    );
}

function renderInline(text) {
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

const QUICK_SUGGESTIONS = [
    { icon: <BarChart3 className="w-3.5 h-3.5" />, text: 'Ringkasan stok hari ini' },
    { icon: <Database className="w-3.5 h-3.5" />, text: 'Produk dengan stok rendah' },
    { icon: <Zap className="w-3.5 h-3.5" />, text: 'Prediksi stok 3 hari' },
    { icon: <Sparkles className="w-3.5 h-3.5" />, text: 'Analisis efisiensi gudang' },
];

const VOICE_SILENCE_GRACE_MS = 3400;
const VOICE_MAX_RECORDING_MS = 6000;

export default function AetherAIModal({ isOpen, onClose, startInCall = false }) {
    const { props } = usePage();
    const auth = props?.auth || {};
    const [conversations, setConversations] = useState([]);
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
    const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
    const [isStableVoiceActive, setIsStableVoiceActive] = useState(false);
    const [stableStatus, setStableStatus] = useState('Siap membantu via suara');
    const [liveUserText, setLiveUserText] = useState('');
    const [liveAiText, setLiveAiText] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [stableVolumeLevel, setStableVolumeLevel] = useState(0);
    const [isStableMuted, setIsStableMuted] = useState(false);
    const [lastLatencyMs, setLastLatencyMs] = useState(null);
    const [lastProviderLatencyMs, setLastProviderLatencyMs] = useState(null);
    const [voiceRecordCycle, setVoiceRecordCycle] = useState(0);
    const [voiceDebug, setVoiceDebug] = useState({
        mic: 'idle',
        chat: 'idle',
        tts: 'idle',
        error: null,
    });

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const recognitionRef = useRef(null);
    const audioRef = useRef(null);
    const browserSpeechRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const liveStreamRef = useRef(null);
    const liveAudioContextRef = useRef(null);
    const liveAnalyserRef = useRef(null);
    const liveUserTextRef = useRef('');
    const liveAiTextRef = useRef('');
    const voiceAbortControllerRef = useRef(null);
    const voiceChatAbortControllerRef = useRef(null);
    const liveSubmitInFlightRef = useRef(false);
    const liveLastSubmitRef = useRef({ text: '', at: 0 });
    const pendingVoiceTranscriptRef = useRef('');
    const finalVoiceTranscriptRef = useRef('');
    const mediaRecorderRef = useRef(null);
    const voiceAudioChunksRef = useRef([]);
    const voiceTurnFinalizingRef = useRef(false);
    const voiceSilenceIntervalRef = useRef(null);
    const voiceSoundStartedRef = useRef(false);
    const voiceLastSoundAtRef = useRef(0);
    const finalizeVoiceTurnRef = useRef(null);
    const autoStartedCallRef = useRef(false);
    const skipNextTranscriptionRef = useRef(false);
    const voiceRecordTimeoutRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    useEffect(() => { liveUserTextRef.current = liveUserText; }, [liveUserText]);
    useEffect(() => { liveAiTextRef.current = liveAiText; }, [liveAiText]);

    const playAudioData = useCallback((audioData, signal) => new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new DOMException('Canceled', 'AbortError'));
            return;
        }

        const audio = new Audio(audioData);
        audioRef.current = audio;
        const cleanup = () => signal?.removeEventListener('abort', abort);
        const abort = () => {
            audio.pause();
            audio.currentTime = 0;
            cleanup();
            reject(new DOMException('Canceled', 'AbortError'));
        };
        signal?.addEventListener('abort', abort, { once: true });

        audio.onplaying = () => {
            setVoiceDebug(prev => ({ ...prev, tts: 'playing', error: null }));
            setIsPreparingSpeech(false);
            setIsSpeaking(true);
        };
        audio.onended = () => {
            setVoiceDebug(prev => ({ ...prev, tts: 'done' }));
            cleanup();
            setIsSpeaking(false);
            resolve();
        };
        audio.onerror = () => {
            setVoiceDebug(prev => ({ ...prev, tts: 'error', error: 'Audio TTS lokal gagal diputar.' }));
            cleanup();
            setIsSpeaking(false);
            reject(new Error('Audio TTS lokal gagal diputar.'));
        };

        audio.play().catch(reject);
    }), []);

    const speakWithBrowserTts = useCallback((text, signal) => new Promise((resolve, reject) => {
        if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
            reject(new Error('Browser TTS tidak tersedia.'));
            return;
        }
        if (signal?.aborted) {
            reject(new DOMException('Canceled', 'AbortError'));
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices?.() || [];
        const indonesianVoice = voices.find(voice => voice.lang?.toLowerCase().startsWith('id'))
            || voices.find(voice => voice.lang?.toLowerCase().includes('id'));

        if (indonesianVoice) utterance.voice = indonesianVoice;
        utterance.lang = indonesianVoice?.lang || 'id-ID';
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;
        browserSpeechRef.current = utterance;

        const cleanup = () => signal?.removeEventListener('abort', abort);
        const abort = () => {
            window.speechSynthesis.cancel();
            cleanup();
            reject(new DOMException('Canceled', 'AbortError'));
        };
        signal?.addEventListener('abort', abort, { once: true });

        utterance.onstart = () => {
            setVoiceDebug(prev => ({ ...prev, tts: 'browser', error: null }));
            setIsPreparingSpeech(false);
            setIsSpeaking(true);
            setStableStatus('Aether sedang berbicara...');
        };
        utterance.onend = () => {
            setVoiceDebug(prev => ({ ...prev, tts: 'done' }));
            cleanup();
            setIsSpeaking(false);
            browserSpeechRef.current = null;
            resolve();
        };
        utterance.onerror = () => {
            setVoiceDebug(prev => ({ ...prev, tts: 'error', error: 'Browser TTS gagal memutar suara.' }));
            cleanup();
            setIsSpeaking(false);
            browserSpeechRef.current = null;
            reject(new Error('Browser TTS gagal memutar suara.'));
        };

        window.speechSynthesis.speak(utterance);
    }), []);

    const speakWithLocalTts = useCallback(async (text, signal) => {
        const chunks = splitSpeechText(text);
        if (chunks.length === 0) return;

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        setIsPreparingSpeech(true);
        setVoiceDebug(prev => ({ ...prev, tts: 'local', error: null }));

        for (const chunk of chunks) {
            if (signal?.aborted) throw new DOMException('Canceled', 'AbortError');

            const res = await fetch('/aether/local-tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ text: chunk }),
                signal,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.audio) {
                setVoiceDebug(prev => ({ ...prev, tts: 'fallback', error: data.error || 'TTS lokal tidak tersedia.' }));
                throw new Error(data.error || 'TTS lokal tidak tersedia.');
            }

            await playAudioData(data.audio, signal);
            await new Promise(resolve => window.setTimeout(resolve, 80));
        }

        setIsPreparingSpeech(false);
        setIsSpeaking(false);
        setVoiceDebug(prev => ({ ...prev, tts: 'done' }));
    }, [playAudioData]);

    const stopSpeaking = useCallback(() => {
        voiceAbortControllerRef.current?.abort();
        voiceAbortControllerRef.current = null;
        audioRef.current?.pause();
        audioRef.current = null;
        window.speechSynthesis?.cancel?.();
        browserSpeechRef.current = null;
        setIsPreparingSpeech(false);
        setIsSpeaking(false);
        setVoiceDebug(prev => ({ ...prev, tts: prev.tts === 'idle' ? 'idle' : 'stopped' }));
    }, []);

    const stopStableCall = useCallback(() => {
        voiceChatAbortControllerRef.current?.abort();
        voiceChatAbortControllerRef.current = null;
        liveSubmitInFlightRef.current = false;
        voiceTurnFinalizingRef.current = false;
        setIsStableVoiceActive(false);
        setIsLiveCallOpen(false);
        setIsListening(false);
        setIsSpeaking(false);
        setIsThinking(false);
        setStableStatus('Panggilan Berakhir');
        setStableVolumeLevel(0);
        setVoiceDebug({ mic: 'stopped', chat: 'idle', tts: 'stopped', error: null });

        stopSpeaking();
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try { mediaRecorderRef.current.stop(); } catch (e) { }
        }
        mediaRecorderRef.current = null;
        voiceAudioChunksRef.current = [];
        voiceSoundStartedRef.current = false;
        voiceLastSoundAtRef.current = 0;
        skipNextTranscriptionRef.current = false;
        if (voiceSilenceIntervalRef.current) {
            clearInterval(voiceSilenceIntervalRef.current);
            voiceSilenceIntervalRef.current = null;
        }
        if (voiceRecordTimeoutRef.current) {
            clearTimeout(voiceRecordTimeoutRef.current);
            voiceRecordTimeoutRef.current = null;
        }
        if (liveAudioContextRef.current) {
            liveAudioContextRef.current.close().catch(() => { });
            liveAudioContextRef.current = null;
        }
        if (liveStreamRef.current) {
            liveStreamRef.current.getTracks().forEach(track => track.stop());
            liveStreamRef.current = null;
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    }, [stopSpeaking]);

    const cancelVoiceTurn = useCallback(() => {
        voiceChatAbortControllerRef.current?.abort();
        voiceChatAbortControllerRef.current = null;
        liveSubmitInFlightRef.current = false;
        voiceTurnFinalizingRef.current = false;

        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try { mediaRecorderRef.current.stop(); } catch (e) { }
        }
        mediaRecorderRef.current = null;
        voiceAudioChunksRef.current = [];
        voiceSoundStartedRef.current = false;
        voiceLastSoundAtRef.current = 0;
        skipNextTranscriptionRef.current = false;
        if (voiceSilenceIntervalRef.current) {
            clearInterval(voiceSilenceIntervalRef.current);
            voiceSilenceIntervalRef.current = null;
        }
        if (voiceRecordTimeoutRef.current) {
            clearTimeout(voiceRecordTimeoutRef.current);
            voiceRecordTimeoutRef.current = null;
        }

        stopSpeaking();
        setIsThinking(false);
        setIsPreparingSpeech(false);
        setLiveAiText('');
        setStableStatus('Dibatalkan. Silakan bicara lagi.');
        setVoiceDebug(prev => ({ ...prev, chat: 'canceled', tts: 'stopped', error: null }));
    }, [stopSpeaking]);

    const toggleStableMute = useCallback(() => {
        setIsStableMuted(prev => {
            const next = !prev;
            if (next && recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
                setIsListening(false);
                setStableStatus('Mikrofon dimatikan');
                setVoiceDebug(prev => ({ ...prev, mic: 'muted' }));
            } else if (!next && isStableVoiceActive) {
                setStableStatus('Sedang mendengarkan...');
                setVoiceDebug(prev => ({ ...prev, mic: 'listening' }));
            }
            return next;
        });
    }, [isStableVoiceActive]);

    const startMicVisualizer = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setVoiceDebug(prev => ({ ...prev, mic: 'ready', error: null }));
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            liveStreamRef.current = stream;
            liveAudioContextRef.current = audioContext;
            liveAnalyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
                if (!liveAnalyserRef.current) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
                const avg = sum / bufferLength;
                if (avg > 2) {
                    voiceSoundStartedRef.current = true;
                    voiceLastSoundAtRef.current = Date.now();
                }
                setStableVolumeLevel(Math.min(1, avg / 128));
                requestAnimationFrame(updateVolume);
            };
            updateVolume();
            return stream;
        } catch (e) {
            console.error('Visualizer failed', e);
            setVoiceDebug(prev => ({ ...prev, mic: 'permission', error: 'Izin mikrofon belum diberikan.' }));
            return null;
        }
    }, []);



    useEffect(() => () => {
        audioRef.current?.pause();
        recognitionRef.current?.stop?.();
        stopStableCall();
    }, [stopStableCall]);

    const speakText = useCallback(async (text) => {
        const cleanText = stripMarkdown(text);
        if (!cleanText) return;

        stopSpeaking();
        setError(null);

        try {
            setIsPreparingSpeech(true);
            setVoiceDebug(prev => ({ ...prev, tts: 'preparing', error: null }));
            voiceAbortControllerRef.current?.abort();
            const controller = new AbortController();
            voiceAbortControllerRef.current = controller;
            try {
                await speakWithLocalTts(cleanText, controller.signal);
            } catch (localError) {
                if (localError.name === 'AbortError') throw localError;
                setStableStatus('Sistem suara utama sibuk, memakai suara browser...');
                setVoiceDebug(prev => ({ ...prev, tts: 'fallback', error: localError.message }));
                await speakWithBrowserTts(cleanText, controller.signal);
            }
        } catch (e) {
            if (e.name === 'AbortError') return;
            setIsPreparingSpeech(false);
            setIsSpeaking(false);
            setVoiceDebug(prev => ({ ...prev, tts: 'error', error: e.message || 'Gagal memutar suara AI.' }));
            setError(e.message || 'Gagal memutar suara AI.');
        } finally {
            voiceAbortControllerRef.current = null;
        }
    }, [speakWithBrowserTts, speakWithLocalTts, stopSpeaking]);

    const loadConversations = useCallback(async () => {
        try {
            const res = await fetch('/aether/conversations', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) return;
            const data = await res.json();
            setConversations(data);
        } catch { }
    }, []);


    const loadMessages = useCallback(async (conversationId) => {
        setIsFetchingHistory(true);
        setError(null);
        try {
            const res = await fetch(`/aether/conversations/${conversationId}/messages`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Gagal memuat riwayat');
            }
            const data = await res.json();
            setMessages(data);
        } catch (e) {
            console.error('Aether: Error loading messages', e);
            setError(e.message);
        } finally {
            setIsFetchingHistory(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadConversations();
            setMessages([]);
            setActiveConversationId(null);
            setInputText('');
            setError(null);
        }
    }, [isOpen, loadConversations]);

    const selectConversation = (id) => {
        setActiveConversationId(id);
        loadMessages(id);
    };

    const startNewConversation = () => {
        setActiveConversationId(null);
        setMessages([]);
        setError(null);
    };

    const deleteConversation = async (e, id) => {
        e.stopPropagation();
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        try {
            await fetch(`/aether/conversations/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (activeConversationId === id) {
                setActiveConversationId(null);
                setMessages([]);
            }
            loadConversations();
        } catch { }
    };

    const cleanNewConversations = async () => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        try {
            const res = await fetch('/aether/conversations-empty', {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Gagal membersihkan percakapan');
            if (activeConversationId) {
                const activeWasRemoved = conversations.some(conv => conv.id === activeConversationId && conv.title === 'Percakapan Baru');
                if (activeWasRemoved && messages.length <= 1) {
                    setActiveConversationId(null);
                    setMessages([]);
                }
            }
            await loadConversations();
        } catch (e) {
            setError(e.message || 'Gagal membersihkan percakapan.');
        }
    };

    const sendMessage = async (overrideText = null) => {
        const text = (overrideText ?? inputText).trim();
        if (!text || isLoading) return;

        setInputText('');
        setError(null);
        setIsLoading(true);

        const tempUserMsg = { id: `temp-${Date.now()}`, role: 'user', content: text, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, tempUserMsg]);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

        try {
            const res = await fetch('/aether/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    message: text,
                    conversation_id: activeConversationId,
                }),
            });

            const data = await res.json();

            // Always update conversation ID if returned (to avoid duplicate 'Percakapan Baru')
            if (data.conversation_id) setActiveConversationId(data.conversation_id);

            if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
            setLastLatencyMs(data.latency_ms ?? null);
            setLastProviderLatencyMs(data.provider_latency_ms ?? null);

            setMessages(prev => {
                const withoutTemp = prev.filter(m => m.id !== tempUserMsg.id);
                return [...withoutTemp, { ...tempUserMsg, id: `user-${Date.now()}` }, { ...data.message, animate: true }];
            });

            if (voiceEnabled && data.message?.content) {
                speakText(data.message.content);
            }

            await loadConversations();
        } catch (err) {
            setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
            setError(err.message || 'Gagal mengirim pesan.');
            // Re-load list if we might have created a new conversation before failing
            loadConversations();
        } finally {
            setIsLoading(false);
        }
    };

    const toggleListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Browser ini belum mendukung input suara. Coba gunakan Chrome atau Edge.');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => {
            setError(null);
            setVoiceEnabled(true);
            setIsListening(true);
        };
        recognition.onresult = (event) => {
            const transcript = event.results?.[0]?.[0]?.transcript?.trim();
            if (transcript) {
                setInputText(transcript);
                sendMessage(transcript);
            }
        };
        recognition.onerror = () => {
            setError('Input suara gagal. Pastikan izin mikrofon sudah diberikan.');
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
    };

    const handleStableVoiceSubmit = async (text) => {
        const cleanText = text.trim();
        if (!cleanText) return;
        pendingVoiceTranscriptRef.current = '';
        finalVoiceTranscriptRef.current = '';

        const now = Date.now();
        if (
            liveSubmitInFlightRef.current ||
            (liveLastSubmitRef.current.text === cleanText && now - liveLastSubmitRef.current.at < 5000)
        ) {
            return;
        }

        liveSubmitInFlightRef.current = true;
        liveLastSubmitRef.current = { text: cleanText, at: now };
        voiceChatAbortControllerRef.current?.abort();
        const chatController = new AbortController();
        voiceChatAbortControllerRef.current = chatController;

        setIsThinking(true);
        setStableStatus("Aether sedang berpikir...");
        setVoiceDebug(prev => ({ ...prev, chat: 'sending', tts: 'idle', error: null }));
        setLiveUserText(cleanText);
        setLiveAiText("");

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        try {
            const res = await fetch("/aether/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({
                    message: cleanText,
                    conversation_id: activeConversationId,
                    is_voice_call: true,
                }),
                signal: chatController.signal,
            });
            const data = await res.json();
            if (data.conversation_id) setActiveConversationId(data.conversation_id);
            if (!res.ok) throw new Error(data.error || "Gagal menghubungi AI.");
            setLastLatencyMs(data.latency_ms ?? null);
            setLastProviderLatencyMs(data.provider_latency_ms ?? null);
            setVoiceDebug(prev => ({ ...prev, chat: 'done', error: null }));

            const aiResponse = data.message.content;
            setLiveAiText(aiResponse);

            setMessages(prev => [...prev.filter(m => !m.id?.toString().startsWith("temp")), { role: "user", content: cleanText }, data.message]);
            setStableStatus("Menyiapkan suara...");
            setVoiceDebug(prev => ({ ...prev, tts: 'preparing' }));

            setIsThinking(false);
            setIsPreparingSpeech(true);
            await speakText(aiResponse);

            await loadConversations();
        } catch (e) {
            if (e.name === 'AbortError') {
                setStableStatus("Dibatalkan. Silakan bicara lagi.");
                setVoiceDebug(prev => ({ ...prev, chat: 'canceled', error: null }));
                return;
            }
            setError(e.message);
            setStableStatus("Terjadi kesalahan. Coba lagi.");
            setVoiceDebug(prev => ({ ...prev, chat: 'error', error: e.message }));
        } finally {
            if (voiceChatAbortControllerRef.current === chatController) {
                voiceChatAbortControllerRef.current = null;
            }
            liveSubmitInFlightRef.current = false;
            setIsThinking(false);
        }
    };

    const transcribeFallbackAudio = useCallback(async (blob) => {
        if (!blob || blob.size < 1200 || liveSubmitInFlightRef.current) {
            return;
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        const form = new FormData();
        form.append('audio', blob, 'aether-call.webm');

        setStableStatus('Mentranskripsi suara...');
        setVoiceDebug(prev => ({ ...prev, mic: 'transcribing', error: null }));

        try {
            const res = await fetch('/aether/transcribe', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: form,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Transkripsi suara gagal.');

            const text = (data.text || '').trim();
            if (!text) {
                setStableStatus('Suara belum terbaca jelas. Silakan ulangi.');
                setVoiceDebug(prev => ({ ...prev, mic: 'empty', error: 'Transkripsi kosong.' }));
                return;
            }

            setLiveUserText(text);
            setVoiceDebug(prev => ({ ...prev, mic: 'transcribed', error: null }));
            handleStableVoiceSubmit(text);
        } catch (e) {
            setStableStatus('Transkripsi gagal. Coba ulangi.');
            setVoiceDebug(prev => ({ ...prev, mic: 'transcribe_error', error: e.message || 'Transkripsi suara gagal.' }));
        } finally {
            window.setTimeout(() => setVoiceRecordCycle(cycle => cycle + 1), 500);
        }
    }, [handleStableVoiceSubmit]);

    const startAudioFallbackRecorder = useCallback((stream) => {
        if (!stream || !window.MediaRecorder || isStableMuted || isThinking || isSpeaking || isPreparingSpeech) {
            return;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            return;
        }

        const mimeType = MediaRecorder.isTypeSupported?.('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : (MediaRecorder.isTypeSupported?.('audio/webm') ? 'audio/webm' : '');

        try {
            const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            voiceAudioChunksRef.current = [];
            voiceSoundStartedRef.current = false;
            voiceLastSoundAtRef.current = 0;

            recorder.ondataavailable = (event) => {
                if (event.data?.size > 0) {
                    voiceAudioChunksRef.current.push(event.data);
                }
            };

            recorder.onstart = () => {
                setVoiceDebug(prev => ({
                    ...prev,
                    mic: prev.mic === 'listening' || prev.mic === 'ready' ? 'listening+rec' : 'recording',
                    error: null,
                }));
            };

            recorder.onstop = () => {
                if (voiceRecordTimeoutRef.current) {
                    clearTimeout(voiceRecordTimeoutRef.current);
                    voiceRecordTimeoutRef.current = null;
                }
                const chunks = voiceAudioChunksRef.current;
                const shouldSkip = skipNextTranscriptionRef.current;
                skipNextTranscriptionRef.current = false;
                voiceAudioChunksRef.current = [];
                voiceSoundStartedRef.current = false;
                voiceLastSoundAtRef.current = 0;

                if (shouldSkip || chunks.length === 0) {
                    return;
                }

                const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
                transcribeFallbackAudio(blob);
            };

            recorder.start(250);
            voiceRecordTimeoutRef.current = window.setTimeout(() => {
                if (
                    recorder.state === 'recording' &&
                    !liveSubmitInFlightRef.current &&
                    !isThinking &&
                    !isSpeaking &&
                    !isPreparingSpeech
                ) {
                    setVoiceDebug(prev => ({ ...prev, mic: 'auto-transcribe', error: null }));
                    try { recorder.stop(); } catch (e) { }
                }
            }, VOICE_MAX_RECORDING_MS);

            if (voiceSilenceIntervalRef.current) {
                clearInterval(voiceSilenceIntervalRef.current);
            }
            voiceSilenceIntervalRef.current = setInterval(() => {
                if (
                    recorder.state === 'recording' &&
                    voiceSoundStartedRef.current &&
                    Date.now() - voiceLastSoundAtRef.current > VOICE_SILENCE_GRACE_MS &&
                    !liveSubmitInFlightRef.current &&
                    !isThinking &&
                    !isSpeaking &&
                    !isPreparingSpeech
                ) {
                    try { recorder.stop(); } catch (e) { }
                }
            }, 300);
        } catch (e) {
            setVoiceDebug(prev => ({ ...prev, mic: 'recorder_error', error: e.message || 'Perekam suara tidak bisa dimulai.' }));
        }
    }, [isStableMuted, isThinking, isSpeaking, isPreparingSpeech, transcribeFallbackAudio]);

    const forceTranscribeCurrentRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            setVoiceDebug(prev => ({ ...prev, mic: 'manual-transcribe', error: null }));
            try { mediaRecorderRef.current.stop(); } catch (e) { }
            return;
        }

        if (liveStreamRef.current) {
            setVoiceDebug(prev => ({ ...prev, mic: 'recording', error: null }));
            startAudioFallbackRecorder(liveStreamRef.current);
        }
    }, [startAudioFallbackRecorder]);

    const finalizeVoiceTurn = useCallback((fallbackText = '') => {
        if (voiceTurnFinalizingRef.current || liveSubmitInFlightRef.current) return;
        voiceTurnFinalizingRef.current = true;

        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) { }
        }

        const chosenText = (fallbackText || finalVoiceTranscriptRef.current || pendingVoiceTranscriptRef.current).trim();

        voiceTurnFinalizingRef.current = false;
        if (chosenText.length > 1) {
            skipNextTranscriptionRef.current = true;
            voiceAudioChunksRef.current = [];
            voiceSoundStartedRef.current = false;
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                try { mediaRecorderRef.current.stop(); } catch (e) { }
            }
            handleStableVoiceSubmit(chosenText);
        } else {
            setStableStatus('Suara belum terbaca jelas. Silakan ulangi.');
        }
    }, [handleStableVoiceSubmit]);

    useEffect(() => {
        finalizeVoiceTurnRef.current = finalizeVoiceTurn;
    }, [finalizeVoiceTurn]);

    const restartStableListening = useCallback((forceStart = false) => {
        if (!forceStart) {
            if (!isStableVoiceActive || isStableMuted || isSpeaking || isPreparingSpeech || isThinking || isListening) return;
        }
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                setVoiceDebug(prev => ({ ...prev, mic: 'unsupported', error: 'Browser belum mendukung SpeechRecognition.' }));
                setStableStatus('Browser belum mendukung input suara.');
                return;
            }
            const recognition = new SpeechRecognition();
            recognition.lang = "id-ID";
            recognition.interimResults = true;
            recognition.continuous = true;
            recognition.onstart = () => {
                setIsListening(true);
                setStableStatus("Sedang mendengarkan...");
                setVoiceDebug(prev => ({ ...prev, mic: 'listening', error: null }));
            };
            recognition.onresult = (event) => {
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                setVoiceDebug(prev => ({ ...prev, mic: 'transcript', error: null }));

                let finalTranscript = '';
                let interimTranscript = '';
                const startIndex = typeof event.resultIndex === 'number' ? event.resultIndex : 0;
                for (let i = startIndex; i < event.results.length; i++) {
                    const piece = event.results[i]?.[0]?.transcript || '';
                    if (event.results[i].isFinal) {
                        finalTranscript += piece;
                    } else {
                        interimTranscript += piece;
                    }
                }

                const stableFinalText = finalTranscript.replace(/\s+/g, ' ').trim();
                if (stableFinalText) {
                    finalVoiceTranscriptRef.current = `${finalVoiceTranscriptRef.current} ${stableFinalText}`.replace(/\s+/g, ' ').trim();
                }
                const previewText = `${finalVoiceTranscriptRef.current} ${interimTranscript}`.replace(/\s+/g, ' ').trim();
                pendingVoiceTranscriptRef.current = previewText;
                setLiveUserText(previewText);

                const scheduleSubmit = () => {
                    const stableText = (finalVoiceTranscriptRef.current || pendingVoiceTranscriptRef.current).trim();
                    if (stableText.length > 1) {
                        finalizeVoiceTurn(stableText);
                    }
                };

                if (event.results[event.results.length - 1].isFinal) {
                    silenceTimerRef.current = setTimeout(scheduleSubmit, VOICE_SILENCE_GRACE_MS);
                    return;
                }

                silenceTimerRef.current = setTimeout(scheduleSubmit, VOICE_SILENCE_GRACE_MS);
            };
            recognition.onspeechend = () => {
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                    const stableText = (finalVoiceTranscriptRef.current || pendingVoiceTranscriptRef.current).trim();
                    if (stableText.length > 1) {
                        finalizeVoiceTurn(stableText);
                    }
                }, VOICE_SILENCE_GRACE_MS);
            };
            recognition.onsoundend = () => {
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                    const stableText = (finalVoiceTranscriptRef.current || pendingVoiceTranscriptRef.current).trim();
                    if (stableText.length > 1) {
                        finalizeVoiceTurn(stableText);
                    }
                }, VOICE_SILENCE_GRACE_MS);
            };
            recognition.onend = () => {
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current);
                    silenceTimerRef.current = null;
                }
                setIsListening(false);
                setVoiceDebug(prev => ({ ...prev, mic: prev.mic === 'muted' ? 'muted' : 'idle' }));
                const stableText = (finalVoiceTranscriptRef.current || pendingVoiceTranscriptRef.current).trim();
                if (
                    stableText.length > 1 &&
                    !liveSubmitInFlightRef.current &&
                    !isStableMuted &&
                    !isThinking &&
                    !isSpeaking
                ) {
                    window.setTimeout(() => {
                        if (!liveSubmitInFlightRef.current) finalizeVoiceTurn(stableText);
                    }, 900);
                }
            };
            recognition.onerror = (e) => {
                if (e.error !== "no-speech") console.error("Speech recognition error", e);
                setIsListening(false);
                setVoiceDebug(prev => ({ ...prev, mic: e.error || 'error', error: e.error === 'no-speech' ? null : `Mic error: ${e.error}` }));
            };
            recognitionRef.current = recognition;
            recognition.start();
        } catch (e) {
            console.error("GAGAL MEMULAI SPEECH RECOGNITION:", e);
            setIsListening(false);
            setVoiceDebug(prev => ({ ...prev, mic: 'error', error: e.message || 'Gagal memulai mikrofon.' }));
        }
    }, [isStableVoiceActive, isStableMuted, isSpeaking, isPreparingSpeech, isThinking, isListening, activeConversationId, finalizeVoiceTurn]);

    const startStableVoiceCall = () => {
        stopSpeaking();
        setError(null);
        setLiveUserText('');
        setLiveAiText('');
        pendingVoiceTranscriptRef.current = '';
        finalVoiceTranscriptRef.current = '';
        voiceTurnFinalizingRef.current = false;
        voiceAudioChunksRef.current = [];
        setIsStableMuted(false);
        setIsLiveCallOpen(true);
        setIsStableVoiceActive(true);
        setVoiceDebug({ mic: 'starting', chat: 'idle', tts: 'idle', error: null });

        // Langsung nyalakan pendengaran suara bawaan browser (Sinkron, tidak butuh await)
        // Ini menghindari hilangnya proxy 'user activation click context' pada ponsel/Tablet.
        restartStableListening(true);

        // Biarkan visualizer berjalan di latar belakang tanpa ngeblokir jalannya telepon
        startMicVisualizer().then(stream => {
            if (!stream) {
                setStableStatus('Izin mikrofon diperlukan.');
                return;
            }
            startAudioFallbackRecorder(stream);
        });
    };

    useEffect(() => {
        if (!isOpen) {
            autoStartedCallRef.current = false;
            return;
        }

        if (startInCall && !autoStartedCallRef.current && !isStableVoiceActive) {
            autoStartedCallRef.current = true;
            startStableVoiceCall();
        }
    }, [isOpen, startInCall, isStableVoiceActive]);

    // Auto-restart recognition when safe (not speaking/thinking/already listening)
    useEffect(() => {
        let timeout;
        if (isStableVoiceActive && !isSpeaking && !isPreparingSpeech && !isListening && !isThinking) {
            // Small delay to ensure browser speech engine is fully cleared
            timeout = setTimeout(restartStableListening, 300);
        }
        return () => clearTimeout(timeout);
    }, [isStableVoiceActive, isSpeaking, isPreparingSpeech, isListening, isThinking, restartStableListening]);

    useEffect(() => {
        if (
            isStableVoiceActive &&
            !isStableMuted &&
            !isThinking &&
            !isSpeaking &&
            !isPreparingSpeech &&
            liveStreamRef.current
        ) {
            startAudioFallbackRecorder(liveStreamRef.current);
        }
    }, [isStableVoiceActive, isStableMuted, isThinking, isSpeaking, isPreparingSpeech, voiceRecordCycle, startAudioFallbackRecorder]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const toggleVoice = () => {
        const next = !voiceEnabled;
        setVoiceEnabled(next);

        if (!next) {
            stopSpeaking();
            return;
        }

        const latestAiMessage = [...messages].reverse().find(message => message.role === 'model');
        if (latestAiMessage?.content) {
            speakText(latestAiMessage.content);
        }
    };

    if (!isOpen) return null;

    const firstName = auth.user.name.split(' ')[0];
    const hasMessages = messages.length > 0;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 pointer-events-none">
            <div className="absolute inset-0 bg-slate-200/40 backdrop-blur-md pointer-events-auto" onClick={onClose} />

            <div className="relative w-full max-w-[1140px] h-[88vh] flex overflow-hidden rounded-[32px] pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white"
                style={{ background: '#f8fafc' }}>

                {/* ═══ SIDEBAR (Light Theme) ══════════════════════════════════════════ */}
                <aside className={`${showSidebar && !isLiveCallOpen ? 'w-[280px]' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0 border-r border-slate-200 flex flex-col`}
                    style={{ background: '#ffffff' }}>

                    <div className="p-5 flex-1 overflow-hidden flex flex-col">
                        <div className="flex items-center gap-3 mb-8 px-1">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                                <AetherIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-slate-900 font-black text-base leading-none">Aether</p>
                                <p className="text-indigo-500 text-[10px] font-bold tracking-widest uppercase mt-0.5">Intelligence</p>
                            </div>
                        </div>

                        <button onClick={startNewConversation}
                            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all mb-6 border border-slate-100 hover:border-indigo-100 shadow-sm">
                            <Plus className="w-4 h-4" />
                            Chat Baru
                        </button>

                        <div className="flex items-center justify-between px-1 mb-3">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sesi Obrolan</div>
                            <button
                                type="button"
                                onClick={cleanNewConversations}
                                className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                aria-label="Bersihkan percakapan baru"
                                title="Bersihkan percakapan baru"
                            >
                                <Eraser className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar-light pr-1">
                            {conversations.length === 0 ? (
                                <p className="text-slate-300 text-xs px-2 py-4 text-center italic">Kosong</p>
                            ) : (
                                conversations.map(conv => (
                                    <div key={conv.id} onClick={() => selectConversation(conv.id)}
                                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeConversationId === conv.id
                                                ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                            }`}>
                                        <MessageSquare className={`w-4 h-4 shrink-0 ${activeConversationId === conv.id ? 'text-indigo-500' : 'opacity-40'}`} />
                                        <span className="text-xs flex-1 truncate">{conv.title}</span>
                                        <button onClick={(e) => deleteConversation(e, conv.id)}
                                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-5 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-black border border-slate-200">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-slate-800 text-xs font-black truncate">{auth.user.name}</p>
                                <p className="text-slate-400 text-[10px] font-bold">Manager</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ═══ MAIN CONTENT (Light Theme) ═════════════════════════════════════ */}
                <div className="flex-1 flex flex-col min-w-0 relative">
                    <header className="h-16 px-6 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white/50 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setShowSidebar(!showSidebar)}
                                disabled={isLiveCallOpen}
                                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all border border-transparent">
                                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showSidebar ? 'rotate-180' : ''}`} />
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-900 font-black text-sm tracking-tight">{isLiveCallOpen ? 'Aether Call' : 'AI Lab'}</span>
                                <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${isLiveCallOpen ? 'bg-indigo-50 border-indigo-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isLiveCallOpen ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${isLiveCallOpen ? 'text-indigo-700' : 'text-emerald-700'}`}>
                                        {isLiveCallOpen ? 'Voice Active' : 'Online'}
                                    </span>
                                </div>
                                {lastLatencyMs !== null && (
                                    <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1">
                                        <Clock className="h-3 w-3 text-slate-400" />
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                            {(lastLatencyMs / 1000).toFixed(2)}s
                                        </span>
                                        {lastProviderLatencyMs !== null && (
                                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                                                Groq {(lastProviderLatencyMs / 1000).toFixed(2)}s
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Only show Suara & Bicara buttons when NOT in call mode */}
                            {!isStableVoiceActive && (
                                <button
                                    type="button"
                                    onClick={toggleVoice}
                                    className={`h-9 px-3 flex items-center gap-2 rounded-2xl transition-all text-[11px] font-black uppercase tracking-wide ${voiceEnabled ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    title={voiceEnabled ? 'Matikan suara' : 'Nyalakan suara'}
                                >
                                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                    <span className="hidden sm:inline">Suara</span>
                                </button>
                            )}

                            {/* Call Button — always visible */}
                            <button
                                type="button"
                                onClick={isStableVoiceActive ? stopStableCall : startStableVoiceCall}
                                className={`h-9 px-4 flex items-center gap-2 rounded-2xl transition-all text-[11px] font-black uppercase tracking-wide ${isStableVoiceActive
                                        ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                title={isStableVoiceActive ? 'Akhiri panggilan' : 'Mulai panggilan suara'}
                            >
                                {isStableVoiceActive ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                                <span className="hidden sm:inline">{isStableVoiceActive ? 'Tutup' : 'Call'}</span>
                            </button>

                            <button onClick={onClose}
                                className="w-9 h-9 flex items-center justify-center rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                                aria-label="Tutup AI Lab">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </header>


                    <div className={`flex-1 custom-scrollbar-light ${isLiveCallOpen ? 'overflow-hidden bg-white' : 'overflow-y-auto px-6 py-6 bg-[#f8fafc]/50'}`}>
                        {/* ═══ FULL VOICE CALL SCREEN ═══════════════════════════════════════ */}
                        {isLiveCallOpen && (
                            <div className="h-full min-h-[520px] flex flex-col bg-white">
                                <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
                                    <div className="mb-8 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                                        <span className={`h-2.5 w-2.5 rounded-full ${isSpeaking || isPreparingSpeech ? 'bg-indigo-500 animate-pulse' :
                                                isThinking ? 'bg-amber-500 animate-pulse' :
                                                    isListening ? 'bg-emerald-500 animate-pulse' :
                                                        isStableMuted ? 'bg-red-500' :
                                                            'bg-slate-300'
                                            }`} />
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">{stableStatus}</span>
                                    </div>

                                    <div className="relative h-48 w-48 sm:h-56 sm:w-56">
                                        <div
                                            className={`absolute inset-0 rounded-full transition-all duration-300 ${isSpeaking || isPreparingSpeech ? 'bg-indigo-200 blur-3xl opacity-80 scale-110' :
                                                    isListening ? 'bg-emerald-200 blur-3xl opacity-80' :
                                                        isThinking ? 'bg-amber-100 blur-3xl opacity-80' :
                                                            'bg-slate-200 blur-3xl opacity-60'
                                            }`}
                                            style={{ transform: `scale(${1 + stableVolumeLevel * 0.18})` }}
                                        />
                                        <div
                                            className={`absolute inset-3 rounded-full border transition-all duration-300 ${isListening ? 'border-emerald-200' : isSpeaking || isPreparingSpeech ? 'border-indigo-200' : 'border-slate-200'}`}
                                            style={{ transform: `scale(${1 + stableVolumeLevel * 0.1})` }}
                                        />
                                        <div
                                            className={`absolute inset-7 rounded-full border transition-all duration-300 ${isListening ? 'border-emerald-300/80' : isSpeaking || isPreparingSpeech ? 'border-indigo-300/80' : 'border-slate-300/70'}`}
                                            style={{ transform: `scale(${1 + stableVolumeLevel * 0.16})` }}
                                        />
                                        <div className="absolute inset-10 rounded-full bg-gradient-to-br from-white via-cyan-100 to-indigo-500 shadow-[0_36px_80px_rgba(79,70,229,0.24)] border border-white" />
                                        <div className="absolute inset-x-16 top-14 h-14 rounded-full bg-white/70 blur-lg" />
                                        <div className="absolute bottom-12 left-1/2 h-16 w-28 -translate-x-1/2 rounded-full bg-indigo-700/20 blur-xl" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="flex h-24 w-28 items-center justify-center gap-1.5">
                                                {[0.35, 0.58, 0.82, 1, 0.72, 0.48, 0.3].map((base, index) => (
                                                    <span
                                                        key={index}
                                                        className={`w-1.5 rounded-full transition-all duration-150 ${isSpeaking || isPreparingSpeech ? 'bg-white/95' : isListening ? 'bg-emerald-50' : 'bg-white/80'}`}
                                                        style={{
                                                            height: `${22 + (base + stableVolumeLevel) * 32}px`,
                                                            opacity: isThinking ? 0.55 : 0.95,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 text-3xl font-black tracking-tight text-slate-950">Aether</div>
                                    <div className="mt-2 min-h-[24px] text-sm font-bold text-slate-500">
                                        {isPreparingSpeech ? 'Menyiapkan suara Piper...' :
                                            isThinking ? 'Memahami ucapan anda...' :
                                                isSpeaking ? 'Aether sedang berbicara' :
                                                    isListening ? 'Mendengarkan anda...' :
                                                        isStableMuted ? 'Mikrofon dimatikan' :
                                                            'Panggilan suara aktif'}
                                    </div>

                                    {(isPreparingSpeech || isThinking) && (
                                        <div className="mt-5 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                                            <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:120ms]" />
                                            <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:240ms]" />
                                        </div>
                                    )}

                                    {liveUserText && (
                                        <div className="mt-8 w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ucapan terakhir</div>
                                            <div className="mt-1 line-clamp-2 text-sm font-semibold leading-relaxed text-slate-700">{liveUserText}</div>
                                        </div>
                                    )}

                                    <VoiceDebugPanel
                                        debug={voiceDebug}
                                        latencyMs={lastLatencyMs}
                                        providerLatencyMs={lastProviderLatencyMs}
                                    />
                                </div>

                                <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-5">
                                    <div className="mx-auto flex max-w-xl items-center justify-center gap-3">
                                        {(isThinking || isPreparingSpeech || isSpeaking) && (
                                            <button
                                                type="button"
                                                onClick={cancelVoiceTurn}
                                                className="h-12 px-5 rounded-2xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all text-[11px] font-black uppercase tracking-wide"
                                            >
                                                Batalkan
                                            </button>
                                        )}
                                        {!isThinking && !isPreparingSpeech && !isSpeaking && (
                                            <button
                                                type="button"
                                                onClick={forceTranscribeCurrentRecording}
                                                className="h-12 px-5 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all text-[11px] font-black uppercase tracking-wide"
                                            >
                                                Kirim Suara
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={toggleStableMute}
                                            className={`h-14 w-14 flex items-center justify-center rounded-full transition-all ${isStableMuted
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200'
                                                }`}
                                            title={isStableMuted ? 'Nyalakan mic' : 'Matikan mic'}
                                            aria-label={isStableMuted ? 'Nyalakan mikrofon' : 'Matikan mikrofon'}
                                        >
                                            {isStableMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={stopStableCall}
                                            className="h-14 w-14 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                                            title="Akhiri panggilan"
                                            aria-label="Akhiri panggilan"
                                        >
                                            <PhoneOff className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isLiveCallOpen && isFetchingHistory && (
                            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-300">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                <span className="text-xs font-bold uppercase tracking-widest">Sinkronisasi Data...</span>
                            </div>
                        )}

                        {!isLiveCallOpen && !hasMessages && !isFetchingHistory && (
                            <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 rounded-full bg-indigo-100 opacity-50 blur-3xl absolute inset-0 -z-10" />
                                    <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center relative shadow-2xl shadow-indigo-200 rotate-3">
                                        <AetherIcon className="w-10 h-10" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-xl border border-slate-50">
                                        <Sparkles className="w-5 h-5 text-indigo-500" />
                                    </div>
                                </div>

                                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                                    Halo, {firstName}! ✦
                                </h2>
                                <p className="text-slate-500 text-sm mb-12 max-w-sm font-medium leading-relaxed">
                                    Saya asisten kecerdasan buatan gudang anda. <br />
                                    Mari analisis data operasional secara instan.
                                </p>

                                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                                    {QUICK_SUGGESTIONS.map((s, i) => (
                                        <button key={i} onClick={() => sendMessage(s.text)}
                                            className="flex items-center gap-3 px-4 py-4 rounded-2xl text-left text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all group border border-slate-200/60 bg-white/50">
                                            <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                                                <span className="text-slate-400 group-hover:text-indigo-500">{s.icon}</span>
                                            </div>
                                            {s.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isLiveCallOpen && !isFetchingHistory && messages.map((msg, i) => (
                            <MessageBubble key={msg.id ?? i} message={msg} user={auth.user} onSpeak={speakText} />
                        ))}

                        {!isLiveCallOpen && isLoading && (
                            <div className="flex gap-4 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                                    <AetherIcon className="w-6 h-6" />
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

                    {!isLiveCallOpen && (
                    <div className="px-6 pb-6 pt-3 bg-white/85 backdrop-blur-md">
                        <div
                            className="relative rounded-[28px] border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)] transition-all focus-within:border-indigo-200 focus-within:shadow-[0_18px_55px_rgba(99,102,241,0.16)]"
                        >
                            <textarea
                                ref={textareaRef}
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                placeholder="Ketik perintah atau tanyakan data gudang..."
                                rows={1}
                                className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-[14px] font-semibold resize-none py-4 pl-5 pr-28 border-0 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
                                style={{ minHeight: '58px', maxHeight: '160px', boxShadow: 'none' }}
                                onInput={e => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                                }}
                            />
                            <button
                                type="button"
                                onClick={toggleListening}
                                disabled={isLoading}
                                className={`absolute right-14 bottom-2.5 w-9 h-9 rounded-2xl flex items-center justify-center transition-all disabled:opacity-30 ${isListening ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'bg-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                                    }`}
                                aria-label={isListening ? 'Berhenti mendengarkan' : 'Mulai input suara'}
                                title={isListening ? 'Berhenti mendengarkan' : 'Mulai input suara'}
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => sendMessage()}
                                disabled={!inputText.trim() || isLoading}
                                className="absolute right-2.5 bottom-2.5 w-9 h-9 rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 shadow-lg"
                                style={{
                                    background: inputText.trim() && !isLoading ? '#6366f1' : '#cbd5e1',
                                    boxShadow: inputText.trim() && !isLoading ? '0 8px 20px rgba(99,102,241,0.3)' : 'none',
                                }}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <div className={`w-1.5 h-1.5 rounded-full ${isPreparingSpeech ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                {isPreparingSpeech
                                    ? 'Menyiapkan suara...'
                                    : 'Didukung Groq AI · Piper TTS offline'}
                            </p>
                        </div>
                    </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-light::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar-light::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-light::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
                .custom-scrollbar-light::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                .prose-aether strong { color: #1e293b; font-weight: 800; }
            `}} />
        </div>
    );
}

// ─── Message Bubble Component (Moved Outside to Prevent Re-creation) ───────
function MessageBubble({ message, user, onSpeak }) {
    const isUser = message?.role === 'user';
    const [typedContent, setTypedContent] = useState(message?.animate ? '' : message?.content);
    const forecastData = !isUser
        ? (message?.type === 'stock_forecast' ? message?.data : parseForecastMetadata(typedContent || ''))
        : null;

    useEffect(() => {
        if (!message?.animate || isUser) {
            setTypedContent(message?.content || '');
            return;
        }

        let index = 0;
        setTypedContent('');
        const interval = window.setInterval(() => {
            const content = message?.content || '';
            index += Math.max(1, Math.ceil(content.length / 180));
            setTypedContent(content.slice(0, index));
            if (index >= content.length) {
                window.clearInterval(interval);
            }
        }, 18);

        return () => window.clearInterval(interval);
    }, [message?.content, message?.animate, isUser]);

    return (
        <div className={`flex gap-4 mb-8 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-sm font-black shadow-md ${isUser ? 'bg-white text-slate-700 border border-slate-200' : 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-100'
                }`}>
                {isUser ? (user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />) : <AetherIcon className="w-6 h-6" />}
            </div>
            <div className={`max-w-[85%] px-6 py-4 rounded-3xl shadow-sm ${isUser ? 'rounded-tr-lg bg-indigo-600 text-white font-bold' : 'rounded-tl-lg bg-white border border-slate-100 text-slate-800'
                }`}>
                {!isUser && (
                    <div className="flex justify-end mb-2">
                        <button
                            type="button"
                            onClick={() => onSpeak(message?.content)}
                            className="h-8 px-2.5 flex items-center gap-1.5 justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-[11px] font-black"
                        >
                            <Volume2 className="w-3.5 h-3.5" />
                            Dengarkan
                        </button>
                    </div>
                )}
                {isUser ? (
                    <div className="whitespace-pre-wrap text-sm font-bold leading-relaxed text-white">
                        {typedContent}
                    </div>
                ) : (
                    <div className="prose-aether">
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
                    {(() => {
                        try {
                            const date = message?.timestamp ? new Date(message.timestamp) : new Date();
                            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } catch (e) {
                            return 'Baru saja';
                        }
                    })()}
                </div>
            </div>
        </div>
    );
}
