<?php

namespace App\Http\Controllers;

use App\Models\AetherConversation;
use App\Models\AetherMessage;
use App\Models\Product;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Client\ConnectionException;
use Symfony\Component\Process\Process;
use Inertia\Inertia;


class AetherAIController extends Controller
{
    public function index()
    {
        return Inertia::render('AetherAI', [
            'conversations' => AetherConversation::where('user_id', Auth::id())
                ->orderByDesc('updated_at')
                ->limit(50)
                ->get(['id', 'title', 'updated_at']),
        ]);
    }

    // ─── API Config ─────────────────────────────────────────────────────────────
    private const MAX_HISTORY = 20;
    private const INTENT_CASUAL_GREETING = 'casual_greeting';
    private const INTENT_INVENTORY_SUMMARY = 'inventory_summary';
    private const INTENT_LOW_STOCK_PRODUCTS = 'low_stock_products';
    private const INTENT_TOP_OUTBOUND_PRODUCTS = 'top_outbound_products';
    private const INTENT_STOCK_FORECAST = 'stock_forecast';
    private const INTENT_PRODUCT_LOOKUP = 'product_lookup';

    // ─── List Conversations ─────────────────────────────────────────────────────
    public function conversations()
    {
        $conversations = AetherConversation::where('user_id', Auth::id())
            ->orderByDesc('updated_at')
            ->limit(30)
            ->get(['id', 'title', 'created_at', 'updated_at']);

        return response()->json($conversations);
    }

    // ─── Get Messages for a Conversation ────────────────────────────────────────
    public function messages($id)
    {
        try {
            $conversation = AetherConversation::findOrFail($id);

            Log::info('Aether: Fetching messages', [
                'conversation_id' => $conversation->id,
                'user_id' => Auth::id(),
                'owner_id' => $conversation->user_id
            ]);

            Gate::authorize('view', $conversation);

            $messages = $conversation->messages()
                ->orderBy('created_at')
                ->get()
                ->map(fn ($message) => $this->formatMessagePayload($message));

            return response()->json($messages);
        } catch (\Exception $e) {
            Log::error('Aether: Failed to load messages', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Gagal memuat riwayat: ' . $e->getMessage()], 403);
        }
    }

    // ─── Create New Conversation ─────────────────────────────────────────────────
    public function newConversation()
    {
        $conversation = AetherConversation::create([
            'user_id' => Auth::id(),
            'title'   => 'Percakapan Baru',
        ]);

        return response()->json($conversation);
    }

    // ─── Delete Conversation ─────────────────────────────────────────────────────
    public function deleteConversation($id)
    {
        $conversation = AetherConversation::findOrFail($id);
        Gate::authorize('delete', $conversation);
        $conversation->delete();

        return response()->json(['ok' => true]);
    }

    // ─── Delete Untitled/Failed New Conversations ───────────────────────────────
    public function deleteUntitledConversations()
    {
        $conversations = AetherConversation::where('user_id', Auth::id())
            ->where('title', 'Percakapan Baru')
            ->withCount('messages')
            ->get();

        $deleted = 0;
        foreach ($conversations as $conversation) {
            if ($conversation->messages_count <= 1) {
                $conversation->delete();
                $deleted++;
            }
        }

        return response()->json([
            'ok' => true,
            'deleted' => $deleted,
        ]);
    }

    // ─── Save voice call transcript into chat history ───────────────────────────
    public function saveLiveTranscript(Request $request)
    {
        $request->validate([
            'user_text' => 'nullable|string|max:8000',
            'ai_text' => 'nullable|string|max:12000',
        ]);

        $userText = trim((string) $request->input('user_text', ''));
        $aiText = trim((string) $request->input('ai_text', ''));

        if ($userText === '' && $aiText === '') {
            return response()->json(['ok' => true, 'saved' => false]);
        }

        $conversation = AetherConversation::create([
            'user_id' => Auth::id(),
            'title' => 'Panggilan Live ' . now()->format('d/m H:i'),
        ]);

        if ($userText !== '') {
            AetherMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'user',
                'content' => $userText,
            ]);
        }

        if ($aiText !== '') {
            AetherMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'model',
                'content' => $aiText,
            ]);
        }

        return response()->json([
            'ok' => true,
            'saved' => true,
            'conversation_id' => $conversation->id,
            'conversation_title' => $conversation->title,
        ]);
    }

    // ─── Premium Edge TTS for ultra-realistic female voice ─────────────────────────────────────
    public function localTextToSpeech(Request $request)
    {
        $request->validate([
            'text' => 'required|string|max:1200',
        ]);

        $text = mb_strimwidth(strip_tags($request->text), 0, 1000, '');
        $tmpAudio = tempnam(storage_path('app/public'), 'aether-piper-') . '.wav';

        try {
            $piper = '/home/panzek/.local/bin/piper';
            if (!is_file($piper)) {
                $piper = 'piper'; 
            }

            // Using the local indonesian piper model
            $modelPath = storage_path('app/models/id_ID-news_tts-medium.onnx');
            
            $process = new Process([
                $piper,
                '-m', $modelPath,
                '-s', '0', 
                '-f', $tmpAudio,
            ]);
            $process->setTimeout(60);
            $process->setInput($text);
            $process->run();

            if (!$process->isSuccessful() || !is_file($tmpAudio) || filesize($tmpAudio) === 0) {
                Log::error('Piper TTS failed', [
                    'exit_code' => $process->getExitCode(),
                    'error' => $process->getErrorOutput(),
                ]);

                return response()->json(['error' => 'Gagal menggunakan Piper TTS.'], 500);
            }

            return response()->json([
                'audio' => 'data:audio/wav;base64,' . base64_encode(file_get_contents($tmpAudio)),
                'engine' => 'piper',
            ]);
        } catch (\Exception $e) {
            Log::error('TTS Exception', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal memproses Piper.'], 500);
        } finally {
            if (is_file($tmpAudio)) @unlink($tmpAudio);
            $baseTmp = str_replace('.wav', '', $tmpAudio);
            if (is_file($baseTmp)) @unlink($baseTmp);
        }
    }

    // ─── Groq Whisper STT for voice call transcription ─────────────────────────
    public function transcribeAudio(Request $request)
    {
        $request->validate([
            'audio' => 'required|file|max:20480',
        ]);

        $apiKey = config('services.groq.key');
        if (!$apiKey) {
            return response()->json(['error' => 'GROQ_API_KEY belum dikonfigurasi di .env'], 500);
        }

        $audio = $request->file('audio');
        $filename = $audio->getClientOriginalName() ?: 'aether-voice.webm';

        try {
            $response = Http::withToken($apiKey)
                ->timeout(45)
                ->attach('file', file_get_contents($audio->getRealPath()), $filename)
                ->post(config('services.groq.transcription_url'), [
                    'model' => config('services.groq.transcription_model', 'whisper-large-v3-turbo'),
                    'language' => 'id',
                    'temperature' => 0,
                    'response_format' => 'json',
                ]);

            if (!$response->successful()) {
                Log::error('Groq transcription failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json([
                    'error' => $response->json('error.message') ?: 'Transkripsi suara gagal.',
                ], $response->status());
            }

            $text = trim((string) $response->json('text', ''));
            if ($text === '') {
                return response()->json(['error' => 'Tidak ada suara yang berhasil ditranskripsi.'], 422);
            }

            return response()->json(['text' => $text]);
        } catch (\Throwable $e) {
            Log::error('Groq transcription exception', [
                'message' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Gagal memproses transkripsi suara.'], 500);
        }
    }

    // ─── Send Message → Groq → Save → Return ───────────────────────────────────
    public function chat(Request $request)
    {
        $request->validate([
            'message'         => 'required|string|max:4000',
            'conversation_id' => 'nullable|integer|exists:aether_conversations,id',
        ]);

        $requestStartedAt = microtime(true);
        $user = Auth::user();

        // ── Resolve or create conversation ──────────────────────────────────────
        $createdConversation = false;
        if ($request->conversation_id) {
            $conversation = AetherConversation::where('id', $request->conversation_id)
                ->where('user_id', $user->id)
                ->firstOrFail();
        } else {
            $conversation = AetherConversation::create([
                'user_id' => $user->id,
                'title'   => 'Percakapan Baru',
            ]);
            $createdConversation = true;
        }

        // ── Save user message ────────────────────────────────────────────────────
        $userMessage = AetherMessage::create([
            'conversation_id' => $conversation->id,
            'role'            => 'user',
            'content'         => $request->message,
        ]);

        // ── Build history ────────────────────────────────────────────────────────
        $history = $conversation->messages()
            ->orderByDesc('created_at')
            ->limit(self::MAX_HISTORY)
            ->get()
            ->reverse()
            ->values();

        $localIntent = $this->resolveLocalIntent($request->message);
        if ($localIntent) {
            $aiText = $this->handleLocalIntent($localIntent, $request->message, $user);
            $latencyMs = $this->elapsedMs($requestStartedAt);

            Log::info('Aether chat handled locally', [
                'conversation_id' => $conversation->id,
                'user_id' => $user->id,
                'intent' => $localIntent,
                'latency_ms' => $latencyMs,
            ]);

            return $this->saveAssistantReply(
                $conversation,
                $history,
                $request->message,
                $aiText,
                'local',
                $localIntent,
                $latencyMs
            );
        }

        // ── Build system prompt ──────────────────────────────────────────────────
        $systemPrompt = $this->buildSystemPrompt($user);
        
        $isVoiceCall = $request->boolean('is_voice_call');
        if ($isVoiceCall) {
            $systemPrompt .= "\n\n[PENTING]: INI ADALAH PERCAKAPAN SUARA TELEPON! ANDA WAJIB MERESPON DENGAN SANGAT-SANGAT SINGKAT! MAKSIMAL HANYA 1 ATAU 2 KALIMAT PENDEK SAJA BAGAIMANAPUN SITUASINYA. JANGAN GUNAKAN DAFTAR, TEKS PANJANG, ATAU BENTUK APAPUN KECUALI KALIMAT LISAN PENDEK YANG BISA LANGSUNG DIUCAPKAN VIA TELEPON.";
        }

        // ── Groq is the only configured AI provider ─────────────────────────────
        $groqKey = config('services.groq.key');
        if (empty($groqKey)) {
            if ($createdConversation) $conversation->delete();
            else $userMessage->delete();

            return response()->json(['error' => 'GROQ_API_KEY belum dikonfigurasi di .env'], 500);
        }

        try {
            $groqStartedAt = microtime(true);
            $aiText = $this->callGroqApi($groqKey, $systemPrompt, $history, $isVoiceCall);
            $groqLatencyMs = $this->elapsedMs($groqStartedAt);
        } catch (ConnectionException $e) {
            if ($createdConversation) $conversation->delete();
            else $userMessage->delete();

            $latencyMs = $this->elapsedMs($requestStartedAt);
            Log::warning('Aether Groq connection timeout/failure', [
                'conversation_id' => $conversation->id,
                'user_id' => $user->id,
                'latency_ms' => $latencyMs,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Koneksi ke Groq timeout atau gagal. Coba ulangi sebentar lagi.',
                'latency_ms' => $latencyMs,
            ], 504);
        } catch (\Exception $e) {
            if ($createdConversation) $conversation->delete();
            else $userMessage->delete();

            $latencyMs = $this->elapsedMs($requestStartedAt);
            Log::error('Aether Groq request failed', [
                'conversation_id' => $conversation->id,
                'user_id' => $user->id,
                'latency_ms' => $latencyMs,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => $e->getMessage(),
                'latency_ms' => $latencyMs,
            ], 502);
        }

        $latencyMs = $this->elapsedMs($requestStartedAt);
        Log::info('Aether chat completed via Groq', [
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'model' => config('services.groq.model', 'llama-3.3-70b-versatile'),
            'is_voice_call' => $isVoiceCall,
            'groq_latency_ms' => $groqLatencyMs,
            'total_latency_ms' => $latencyMs,
        ]);

        return $this->saveAssistantReply(
            $conversation,
            $history,
            $request->message,
            $aiText,
            'groq',
            null,
            $latencyMs,
            $groqLatencyMs
        );
    }

    // ─── Call Groq API (OpenAI-compatible) ──────────────────────────────────────
    private function callGroqApi(string $apiKey, string $systemPrompt, $history, bool $isVoiceCall = false): string
    {
        $groqModel = config('services.groq.model', 'llama-3.3-70b-versatile');
        $groqUrl   = config('services.groq.url', 'https://api.groq.com/openai/v1/chat/completions');

        // Build messages in OpenAI format
        $messages = [['role' => 'system', 'content' => $systemPrompt]];
        foreach ($history as $msg) {
            // Groq uses 'assistant' not 'model'
            $messages[] = [
                'role'    => $msg->role === 'model' ? 'assistant' : 'user',
                'content' => $msg->content,
            ];
        }

        $timeout = (int) config('services.groq.timeout', 25);
        $connectTimeout = (int) config('services.groq.connect_timeout', 8);
        $maxTokens = $isVoiceCall
            ? (int) config('services.groq.voice_max_tokens', 180)
            : (int) config('services.groq.max_tokens', 2048);

        $response = Http::connectTimeout($connectTimeout)
            ->timeout($timeout)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ])
            ->post($groqUrl, [
                'model'       => $groqModel,
                'messages'    => $messages,
                'temperature' => $isVoiceCall ? 0.45 : 0.7,
                'max_tokens'  => $maxTokens,
                'top_p'       => 0.95,
            ]);

        if (!$response->successful()) {
            $err = $response->json('error.message') ?: 'Groq API error: ' . $response->status();
            Log::error('Groq API error', [
                'status'  => $response->status(),
                'error'   => $err,
                'model'   => $groqModel,
                'timeout' => $timeout,
                'connect_timeout' => $connectTimeout,
                'max_tokens' => $maxTokens,
                'is_voice_call' => $isVoiceCall,
            ]);
            throw new \RuntimeException($err);
        }

        $text = $response->json('choices.0.message.content');
        if (!$text) {
            throw new \RuntimeException('Groq returned empty response.');
        }

        // Clean out <think>...</think> blocks from DeepSeek/Qwen style reasoning models
        // using the 's' modifier for multiline match and '$' to catch unclosed blocks
        $text = preg_replace('/<think>.*?(<\/think>|$)/s', '', $text);
        
        return trim($text);
    }

    private function elapsedMs(float $startedAt): int
    {
        return (int) round((microtime(true) - $startedAt) * 1000);
    }

    private function resolveLocalIntent(string $message): ?string
    {
        if ($this->isTopOutboundProductsRequest($message)) {
            return self::INTENT_TOP_OUTBOUND_PRODUCTS;
        }

        if ($this->isLowStockProductsRequest($message)) {
            return self::INTENT_LOW_STOCK_PRODUCTS;
        }

        if ($this->isStockForecastRequest($message)) {
            return self::INTENT_STOCK_FORECAST;
        }

        if ($this->isInventorySummaryRequest($message)) {
            return self::INTENT_INVENTORY_SUMMARY;
        }

        if ($this->isProductLookupRequest($message)) {
            return self::INTENT_PRODUCT_LOOKUP;
        }

        if ($this->isCasualGreeting($message)) {
            return self::INTENT_CASUAL_GREETING;
        }

        return null;
    }

    private function handleLocalIntent(string $intent, string $message, $user): array
    {
        return match ($intent) {
            self::INTENT_TOP_OUTBOUND_PRODUCTS => $this->topOutboundProductsReply(),
            self::INTENT_LOW_STOCK_PRODUCTS => $this->lowStockProductsReply(),
            self::INTENT_STOCK_FORECAST => $this->stockForecastReply($message),
            self::INTENT_INVENTORY_SUMMARY => $this->inventorySummaryReply(),
            self::INTENT_PRODUCT_LOOKUP => $this->productLookupReply($message)
                ?? $this->localReply(
                    self::INTENT_PRODUCT_LOOKUP,
                    'Saya belum menemukan produk yang cocok. Coba pakai nama produk atau SKU yang lebih persis.',
                    ['items' => []]
                ),
            self::INTENT_CASUAL_GREETING => $this->casualGreetingReply($user),
            default => throw new \RuntimeException("Intent lokal tidak dikenal: {$intent}"),
        };
    }

    private function localReply(string $type, string $text, array $data = []): array
    {
        return [
            'type' => $type,
            'text' => $text,
            'data' => $data,
        ];
    }

    private function saveAssistantReply($conversation, $history, string $userMessage, string|array $reply, string $provider, ?string $intent = null, ?int $latencyMs = null, ?int $providerLatencyMs = null)
    {
        $aiText = is_array($reply) ? (string) ($reply['text'] ?? '') : $reply;
        $type = is_array($reply) ? ($reply['type'] ?? $intent) : null;
        $data = is_array($reply) ? ($reply['data'] ?? []) : [];

        $messagePayload = [
            'conversation_id' => $conversation->id,
            'role'            => 'model',
            'content'         => $aiText,
        ];

        if ($type && Schema::hasColumn('aether_messages', 'metadata')) {
            $messagePayload['metadata'] = [
                'type' => $type,
                'data' => $data,
                'intent' => $intent,
                'provider' => $provider,
            ];
        }

        $aiMessage = AetherMessage::create($messagePayload);

        if ($conversation->title === 'Percakapan Baru' && $history->count() <= 2) {
            $conversation->update(['title' => mb_strimwidth($userMessage, 0, 50, '...')]);
        }
        $conversation->touch();

        $payload = [
            'conversation_id'    => $conversation->id,
            'conversation_title' => $conversation->title,
            'provider'           => $provider,
            'latency_ms'         => $latencyMs,
            'provider_latency_ms' => $providerLatencyMs,
            'message'            => [
                'id'         => $aiMessage->id,
                'role'       => 'model',
                'content'    => $aiText,
                'created_at' => $aiMessage->created_at,
            ],
        ];

        if ($intent) {
            $payload['intent'] = $intent;
        }
        if ($type) {
            $payload['type'] = $type;
            $payload['message']['type'] = $type;
            $payload['message']['data'] = $data;
        }

        return response()->json($payload);
    }

    private function formatMessagePayload(AetherMessage $message): array
    {
        $metadata = $message->metadata ?? [];
        $payload = [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'role' => $message->role,
            'content' => $message->content,
            'created_at' => $message->created_at,
            'updated_at' => $message->updated_at,
        ];

        if (!empty($metadata['type'])) {
            $payload['type'] = $metadata['type'];
            $payload['data'] = $metadata['data'] ?? [];
            $payload['intent'] = $metadata['intent'] ?? $metadata['type'];
            $payload['provider'] = $metadata['provider'] ?? 'local';
        }

        return $payload;
    }

    private function isCasualGreeting(string $message): bool
    {
        $normalized = mb_strtolower(trim($message));
        $normalized = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', $normalized);
        $normalized = preg_replace('/\s+/u', ' ', $normalized);

        if (!$normalized) {
            return false;
        }

        $blockedIntentWords = [
            'stok', 'stock', 'produk', 'barang', 'rak', 'gudang', 'laporan',
            'ringkasan', 'summary', 'analisis', 'status', 'pengiriman',
            'driver', 'supplier', 'nilai', 'aset', 'berapa', 'mana',
            'kenapa', 'mengapa', 'bagaimana', 'tolong', 'buat', 'cari',
        ];

        foreach ($blockedIntentWords as $word) {
            if (preg_match('/\b' . preg_quote($word, '/') . '\b/u', $normalized)) {
                return false;
            }
        }

        $words = explode(' ', $normalized);
        $startsWithGreeting = (bool) preg_match(
            '/^(halo+|hallo+|hello+|hai+|hi+|hei+|hey+|pagi|siang|sore|malam|test|tes|selamat\s+(pagi|siang|sore|malam))\b/u',
            $normalized
        );

        return $startsWithGreeting && count($words) <= 4;
    }

    private function casualGreetingReply($user): array
    {
        $name = trim((string) ($user->name ?? ''));
        $firstName = $name !== '' ? preg_split('/\s+/', $name)[0] : 'di sana';

        return $this->localReply(self::INTENT_CASUAL_GREETING, "Halo {$firstName}, ada yang bisa saya bantu?");
    }

    private function isInventorySummaryRequest(string $message): bool
    {
        $normalized = mb_strtolower(trim($message));
        $normalized = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', $normalized);
        $normalized = preg_replace('/\s+/u', ' ', $normalized);

        $asksSummary = preg_match('/\b(ringkasan|summary|overview|rekap|total)\b/u', $normalized);
        $asksInventory = preg_match('/\b(stok|stock|inventaris|gudang|produk|barang)\b/u', $normalized);

        return (bool) ($asksSummary && $asksInventory);
    }

    private function inventorySummaryReply(): array
    {
        $totalStock = RackStock::sum('quantity');
        $totalProducts = Product::where('is_active', true)->count();
        $totalValue = (float) DB::table('rack_stocks')
            ->join('products', 'rack_stocks.product_id', '=', 'products.id')
            ->where('products.is_active', true)
            ->sum(DB::raw('rack_stocks.quantity * products.purchase_price'));
        $totalCapacity = Rack::sum('capacity');
        $efficiency = $totalCapacity > 0 ? round(($totalStock / $totalCapacity) * 100, 1) : 0;

        $text = implode("\n\n", [
            'Ringkasan stok hari ini:',
            "- **Total Unit Tersimpan**: " . number_format($totalStock, 0, ',', '.') . ' unit',
            "- **Total Produk Terdaftar**: " . number_format($totalProducts, 0, ',', '.') . ' jenis',
            "- **Estimasi Nilai Aset**: Rp " . number_format($totalValue, 0, ',', '.'),
            "- **Efisiensi Penyimpanan**: {$efficiency}% dari kapasitas total " . number_format($totalCapacity, 0, ',', '.') . ' unit',
        ]);

        return $this->localReply(self::INTENT_INVENTORY_SUMMARY, $text, [
            'total_stock' => (int) $totalStock,
            'total_products' => (int) $totalProducts,
            'total_value' => $totalValue,
            'total_capacity' => (int) $totalCapacity,
            'efficiency' => $efficiency,
        ]);
    }

    private function isLowStockProductsRequest(string $message): bool
    {
        $normalized = mb_strtolower(trim($message));
        $normalized = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', $normalized);
        $normalized = preg_replace('/\s+/u', ' ', $normalized);

        $asksStock = preg_match('/\b(stok|stock|produk|barang|inventaris)\b/u', $normalized);
        $asksLow = preg_match('/\b(rendah|menipis|minimum|minim|habis|restock|reorder|low)\b/u', $normalized);

        return (bool) ($asksStock && $asksLow);
    }

    private function lowStockProductsReply(): array
    {
        $products = Product::with('unit')
            ->withSum('rackStocks as current_stock', 'quantity')
            ->where('is_active', true)
            ->get()
            ->filter(fn ($product) => (int) ($product->current_stock ?? 0) <= (int) ($product->minimum_stock ?? 0))
            ->sortBy(fn ($product) => (int) ($product->current_stock ?? 0) - (int) ($product->minimum_stock ?? 0))
            ->take(8)
            ->values();

        if ($products->isEmpty()) {
            return $this->localReply(
                self::INTENT_LOW_STOCK_PRODUCTS,
                'Tidak ada produk yang berada di bawah atau sama dengan batas stok minimum saat ini.',
                ['items' => []]
            );
        }

        $lines = ['Produk dengan stok rendah saat ini:'];
        foreach ($products as $index => $product) {
            $unit = $product->unit->name ?? 'unit';
            $currentStock = (int) ($product->current_stock ?? 0);
            $minimumStock = (int) ($product->minimum_stock ?? 0);
            $shortage = max(0, $minimumStock - $currentStock);

            $lines[] = sprintf(
                "%d. **%s** (SKU: %s): stok %s %s, minimum %s %s, kekurangan %s %s.",
                $index + 1,
                $product->name,
                $product->sku,
                number_format($currentStock, 0, ',', '.'),
                $unit,
                number_format($minimumStock, 0, ',', '.'),
                $unit,
                number_format($shortage, 0, ',', '.'),
                $unit
            );
        }

        return $this->localReply(self::INTENT_LOW_STOCK_PRODUCTS, implode("\n\n", $lines), [
            'items' => $products->map(fn ($product) => [
                'name' => $product->name,
                'sku' => $product->sku,
                'unit' => $product->unit->name ?? 'unit',
                'current_stock' => (int) ($product->current_stock ?? 0),
                'minimum_stock' => (int) ($product->minimum_stock ?? 0),
                'shortage' => max(0, (int) ($product->minimum_stock ?? 0) - (int) ($product->current_stock ?? 0)),
            ])->values(),
        ]);
    }

    private function isTopOutboundProductsRequest(string $message): bool
    {
        $normalized = mb_strtolower(trim($message));
        $normalized = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', $normalized);
        $normalized = preg_replace('/\s+/u', ' ', $normalized);

        $asksOutbound = preg_match('/\b(keluar|outbound|terjual|dipakai|digunakan)\b/u', $normalized);
        $asksRanking = preg_match('/\b(paling|terbanyak|tertinggi|banyak|top|ranking|rank)\b/u', $normalized);
        $asksProduct = preg_match('/\b(produk|barang|item|sku|apa)\b/u', $normalized);

        return (bool) ($asksOutbound && $asksRanking && $asksProduct);
    }

    private function topOutboundProductsReply(): array
    {
        $historyDays = 30;
        $since = now()->subDays($historyDays)->startOfDay();

        $outboundStats = StockMovement::query()
            ->select('product_id')
            ->selectRaw('SUM(quantity) as total_out')
            ->selectRaw('COUNT(*) as movement_count')
            ->whereIn('movement_type', ['out', 'outbound'])
            ->where('movement_date', '>=', $since)
            ->groupBy('product_id')
            ->orderByDesc('total_out')
            ->limit(6)
            ->get();

        if ($outboundStats->isEmpty()) {
            return $this->localReply(
                self::INTENT_TOP_OUTBOUND_PRODUCTS,
                "Belum ada catatan barang keluar dalam {$historyDays} hari terakhir.",
                ['history_days' => $historyDays, 'items' => []]
            );
        }

        $products = Product::with(['unit'])
            ->withSum('rackStocks as current_stock', 'quantity')
            ->whereIn('id', $outboundStats->pluck('product_id'))
            ->get()
            ->keyBy('id');

        $lines = [
            "Produk yang paling banyak keluar dalam {$historyDays} hari terakhir:",
        ];

        foreach ($outboundStats as $index => $stat) {
            $product = $products->get($stat->product_id);
            if (!$product) {
                continue;
            }

            $unit = $product->unit->name ?? 'unit';
            $currentStock = (int) ($product->current_stock ?? 0);
            $dailyAverage = ((int) $stat->total_out) / $historyDays;

            $lines[] = sprintf(
                "%d. **%s** (SKU: %s): keluar %s %s, rata-rata %.1f %s/hari, stok sekarang %s %s.",
                $index + 1,
                $product->name,
                $product->sku,
                number_format((int) $stat->total_out, 0, ',', '.'),
                $unit,
                $dailyAverage,
                $unit,
                number_format($currentStock, 0, ',', '.'),
                $unit
            );
        }

        $exampleSku = $products->first()?->sku ?? 'SKU-PRODUK';
        $lines[] = "Kalau mau lanjut, ketik misalnya `prediksi stok {$exampleSku} 7 hari` untuk proyeksi produk tertentu.";

        return $this->localReply(self::INTENT_TOP_OUTBOUND_PRODUCTS, implode("\n\n", $lines), [
            'history_days' => $historyDays,
            'items' => $outboundStats->map(function ($stat) use ($products, $historyDays) {
                $product = $products->get($stat->product_id);
                if (!$product) {
                    return null;
                }

                return [
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'unit' => $product->unit->name ?? 'unit',
                    'total_out' => (int) $stat->total_out,
                    'daily_average' => round(((int) $stat->total_out) / $historyDays, 2),
                    'current_stock' => (int) ($product->current_stock ?? 0),
                ];
            })->filter()->values(),
        ]);
    }

    private function productLookupReply(string $message): ?array
    {
        $searchTerm = $this->forecastProductSearchTerm($message);
        if (!$searchTerm || str_word_count($searchTerm) > 5) {
            return null;
        }

        $products = Product::with(['unit'])
            ->withSum('rackStocks as current_stock', 'quantity')
            ->where('is_active', true)
            ->get()
            ->filter(fn ($product) => $this->productMatchesForecastSearch($product, $searchTerm))
            ->take(5)
            ->values();

        if ($products->isEmpty()) {
            return null;
        }

        if ($products->count() > 1) {
            $lines = ["Saya menemukan beberapa produk yang cocok dengan **{$searchTerm}**:"];
            foreach ($products as $index => $product) {
                $unit = $product->unit->name ?? 'unit';
                $lines[] = sprintf(
                    "%d. **%s** (SKU: %s): stok sekarang %s %s.",
                    $index + 1,
                    $product->name,
                    $product->sku,
                    number_format((int) ($product->current_stock ?? 0), 0, ',', '.'),
                    $unit
                );
            }
            $lines[] = "Ketik SKU yang lebih spesifik kalau mau saya buatkan prediksi stoknya.";

            return $this->localReply(self::INTENT_PRODUCT_LOOKUP, implode("\n\n", $lines), [
                'query' => $searchTerm,
                'items' => $products->map(fn ($product) => [
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'unit' => $product->unit->name ?? 'unit',
                    'current_stock' => (int) ($product->current_stock ?? 0),
                ])->values(),
            ]);
        }

        $product = $products->first();
        $unit = $product->unit->name ?? 'unit';
        $currentStock = (int) ($product->current_stock ?? 0);

        $text = sprintf(
            "**%s** (SKU: %s) saat ini punya stok **%s %s**. Kalau mau prediksi, ketik `prediksi stok %s 7 hari`.",
            $product->name,
            $product->sku,
            number_format($currentStock, 0, ',', '.'),
            $unit,
            $product->sku
        );

        return $this->localReply(self::INTENT_PRODUCT_LOOKUP, $text, [
            'query' => $searchTerm,
            'items' => [[
                'name' => $product->name,
                'sku' => $product->sku,
                'unit' => $unit,
                'current_stock' => $currentStock,
            ]],
        ]);
    }

    private function isProductLookupRequest(string $message): bool
    {
        $searchTerm = $this->forecastProductSearchTerm($message);
        if (!$searchTerm || str_word_count($searchTerm) > 5) {
            return false;
        }

        return Product::query()
            ->where('is_active', true)
            ->get(['name', 'sku', 'barcode'])
            ->contains(fn ($product) => $this->productMatchesForecastSearch($product, $searchTerm));
    }

    private function isStockForecastRequest(string $message): bool
    {
        $normalized = mb_strtolower(trim($message));
        $normalized = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', $normalized);
        $normalized = preg_replace('/\s+/u', ' ', $normalized);

        $hasForecastWord = preg_match('/\b(prediksi|predeiksi|forecast|perkiraan|proyeksi)\b/u', $normalized);
        $hasStockWord = preg_match('/\b(stok|stock|inventaris|barang|produk)\b/u', $normalized);
        $mentionsDays = preg_match('/\b\d+\s*hari\b/u', $normalized) || str_contains($normalized, 'kedepan') || str_contains($normalized, 'ke depan');

        return (bool) ($hasForecastWord && ($hasStockWord || $mentionsDays));
    }

    private function forecastDaysFromMessage(string $message): int
    {
        if (preg_match('/(\d+)\s*hari/iu', $message, $matches)) {
            return max(1, min(30, (int) $matches[1]));
        }

        return 3;
    }

    private function forecastProductSearchTerm(string $message): ?string
    {
        $normalized = mb_strtolower(trim($message));
        $normalized = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', $normalized);
        $normalized = preg_replace('/\b\d+\s*hari\b/iu', ' ', $normalized);
        $normalized = preg_replace(
            '/\b(prediksi|predeiksi|forecast|perkiraan|proyeksi|stok|stock|inventaris|barang|produk|untuk|itu|yang|ke|depan|kedepan|hari|besok|lusa|dong|aja|tolong)\b/iu',
            ' ',
            $normalized
        );
        $normalized = preg_replace('/\b\d+\b/u', ' ', $normalized);
        $normalized = preg_replace('/\s+/u', ' ', $normalized);
        $normalized = trim($normalized);

        return mb_strlen($normalized) >= 2 ? $normalized : null;
    }

    private function productMatchesForecastSearch($product, string $searchTerm): bool
    {
        $haystack = mb_strtolower(trim(implode(' ', array_filter([
            $product->name,
            $product->sku,
            $product->barcode,
        ]))));
        $haystack = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', $haystack);
        $haystack = preg_replace('/\s+/u', ' ', $haystack);

        if (str_contains($haystack, $searchTerm)) {
            return true;
        }

        $tokens = array_values(array_filter(explode(' ', $searchTerm), fn ($token) => mb_strlen($token) >= 2));
        if (empty($tokens)) {
            return false;
        }

        foreach ($tokens as $token) {
            if (!str_contains($haystack, $token)) {
                return false;
            }
        }

        return true;
    }

    private function stockForecastReply(string $message): array
    {
        $forecastDays = $this->forecastDaysFromMessage($message);
        $productSearchTerm = $this->forecastProductSearchTerm($message);
        $historyDays = 30;
        $recentDays = 7;
        $since = now()->subDays($historyDays)->startOfDay();
        $recentSince = now()->subDays($recentDays)->startOfDay();

        $movementStats = StockMovement::query()
            ->select('product_id')
            ->selectRaw("SUM(CASE WHEN movement_type IN ('in', 'restock') THEN quantity ELSE 0 END) as inbound_qty")
            ->selectRaw("SUM(CASE WHEN movement_type IN ('out', 'outbound') THEN quantity ELSE 0 END) as outbound_qty")
            ->selectRaw("SUM(CASE WHEN movement_date >= ? AND movement_type IN ('in', 'restock') THEN quantity ELSE 0 END) as recent_inbound_qty", [$recentSince])
            ->selectRaw("SUM(CASE WHEN movement_date >= ? AND movement_type IN ('out', 'outbound') THEN quantity ELSE 0 END) as recent_outbound_qty", [$recentSince])
            ->where('movement_date', '>=', $since)
            ->groupBy('product_id')
            ->get()
            ->keyBy('product_id');

        $productQuery = Product::with('unit')
            ->withSum('rackStocks as current_stock', 'quantity')
            ->where('is_active', true);

        $sourceProducts = $productQuery->get();

        if ($productSearchTerm) {
            $sourceProducts = $sourceProducts
                ->filter(fn ($product) => $this->productMatchesForecastSearch($product, $productSearchTerm))
                ->values();

            if ($sourceProducts->isEmpty()) {
                return $this->localReply(
                    self::INTENT_STOCK_FORECAST,
                    "Saya belum menemukan produk yang cocok dengan **{$productSearchTerm}**. Coba pakai nama produk atau SKU yang lebih persis, misalnya `prediksi stok AX900 7 hari`.",
                    ['query' => $productSearchTerm, 'items' => []]
                );
            }
        }

        $products = $sourceProducts
            ->map(function ($product) use ($movementStats, $historyDays, $forecastDays) {
                $stats = $movementStats->get($product->id);
                $currentStock = (int) ($product->current_stock ?? 0);
                $inbound = (int) ($stats->inbound_qty ?? 0);
                $outbound = (int) ($stats->outbound_qty ?? 0);
                $recentInbound = (int) ($stats->recent_inbound_qty ?? 0);
                $recentOutbound = (int) ($stats->recent_outbound_qty ?? 0);
                $longDailyNet = ($inbound - $outbound) / $historyDays;
                $recentDailyNet = ($recentInbound - $recentOutbound) / 7;
                $dailyNet = $stats ? (($recentDailyNet * 0.6) + ($longDailyNet * 0.4)) : 0;
                $dailyOut = $outbound / $historyDays;
                $predictedStock = max(0, (int) round($currentStock + ($dailyNet * $forecastDays)));
                $minimumStock = (int) ($product->minimum_stock ?? 0);
                $riskScore = 0;

                if ($predictedStock <= $minimumStock) {
                    $riskScore += 1000;
                }
                if ($predictedStock < $currentStock) {
                    $riskScore += ($currentStock - $predictedStock);
                }

                return [
                    'name' => $product->name,
                    'unit' => $product->unit->name ?? 'unit',
                    'current_stock' => $currentStock,
                    'minimum_stock' => $minimumStock,
                    'inbound' => $inbound,
                    'outbound' => $outbound,
                    'daily_out' => $dailyOut,
                    'daily_net' => $dailyNet,
                    'recent_daily_net' => $recentDailyNet,
                    'predicted_stock' => $predictedStock,
                    'risk_score' => $riskScore,
                ];
            })
            ->sortByDesc('risk_score')
            ->take(6)
            ->values();

        if ($products->isEmpty()) {
            return $this->localReply(
                self::INTENT_STOCK_FORECAST,
                'Belum ada produk aktif untuk dibuat prediksi stok.',
                ['items' => []]
            );
        }

        $hasMovements = $movementStats->isNotEmpty();
        $scopeText = $productSearchTerm ? "untuk produk **{$productSearchTerm}**" : 'untuk produk prioritas';
        $lines = [
            "Prediksi stok {$forecastDays} hari ke depan {$scopeText}, berdasarkan pola mutasi {$historyDays} hari terakhir dengan bobot lebih besar pada tren {$recentDays} hari terbaru:",
        ];

        if (!$hasMovements) {
            $lines[] = "Catatan: belum ada histori mutasi dalam {$historyDays} hari terakhir, jadi prediksi masih sama dengan stok saat ini.";
        }

        foreach ($products as $index => $item) {
            $trend = $item['daily_net'] > 0.05
                ? 'naik'
                : ($item['daily_net'] < -0.05 ? 'turun' : 'stabil');
            $status = $item['predicted_stock'] <= $item['minimum_stock']
                ? 'perlu dipantau/restock'
                : 'aman';

            $lines[] = sprintf(
                "%d. **%s**: sekarang %s %s, prediksi %s %s, tren %s, rata-rata keluar %.1f %s/hari, status %s.",
                $index + 1,
                $item['name'],
                number_format($item['current_stock'], 0, ',', '.'),
                $item['unit'],
                number_format($item['predicted_stock'], 0, ',', '.'),
                $item['unit'],
                $trend,
                $item['daily_out'],
                $item['unit'],
                $status
            );
        }

        $lines[] = "Ini proyeksi sederhana dari histori mutasi, bukan demand forecast musiman. Untuk prediksi lebih akurat, perlu histori penjualan/keluar barang yang lebih panjang.";
        $forecastData = [
            'days' => $forecastDays,
            'history_days' => $historyDays,
            'recent_days' => $recentDays,
            'scope' => $productSearchTerm ? 'product' : 'priority',
            'query' => $productSearchTerm,
            'generated_at' => now()->toIso8601String(),
            'items' => $products->map(fn ($item) => [
                'name' => $item['name'],
                'unit' => $item['unit'],
                'current_stock' => $item['current_stock'],
                'predicted_stock' => $item['predicted_stock'],
                'minimum_stock' => $item['minimum_stock'],
                'daily_out' => round($item['daily_out'], 2),
                'daily_net' => round($item['daily_net'], 2),
                'trend' => $item['daily_net'] > 0.05 ? 'naik' : ($item['daily_net'] < -0.05 ? 'turun' : 'stabil'),
                'status' => $item['predicted_stock'] <= $item['minimum_stock'] ? 'perlu dipantau/restock' : 'aman',
            ])->values(),
        ];

        return $this->localReply(self::INTENT_STOCK_FORECAST, implode("\n\n", $lines), $forecastData);
    }

    private function buildSystemPrompt($user): string
    {
        // ── Inventory snapshot ──────────────────────────────────────────────────
        $totalStock    = RackStock::sum('quantity');
        $totalProducts = Product::count();
        $totalValue    = (float) DB::table('rack_stocks')
            ->join('products', 'rack_stocks.product_id', '=', 'products.id')
            ->sum(DB::raw('rack_stocks.quantity * products.purchase_price'));

        $totalCapacity = Rack::sum('capacity');
        $efficiency    = $totalCapacity > 0 ? round(($totalStock / $totalCapacity) * 100, 1) : 0;

        // ── Product listing (top 20 by qty) ──────────────────────────────────────
        $products = Product::with(['category', 'unit'])
            ->withSum('rackStocks as total_qty', 'quantity')
            ->orderByDesc('total_qty')
            ->limit(20)
            ->get()
            ->map(fn ($p) => sprintf(
                '  - %s (SKU: %s) | Kategori: %s | Stok: %s %s | Harga Beli: Rp %s',
                $p->name,
                $p->sku,
                $p->category->name ?? 'N/A',
                number_format($p->total_qty ?? 0),
                $p->unit->name ?? 'pcs',
                number_format($p->purchase_price ?? 0, 0, ',', '.')
            ))
            ->implode("\n");

        // ── Rack utilization ─────────────────────────────────────────────────────
        $racks = Rack::with('zone')
            ->withSum('rackStocks as total_qty', 'quantity')
            ->limit(15)
            ->get()
            ->map(fn ($r) => sprintf(
                '  - Rak %s (Zona: %s) | Terisi: %s / %s | %.1f%%',
                $r->code,
                $r->zone->name ?? '-',
                number_format($r->total_qty ?? 0),
                number_format($r->capacity),
                $r->capacity > 0 ? (($r->total_qty ?? 0) / $r->capacity) * 100 : 0
            ))
            ->implode("\n");

        // ── Shipments ────────────────────────────────────────────────────────────
        $shipStats = DB::table('shipments')
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'in-transit' THEN 1 ELSE 0 END) as transit,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                SUM(CASE WHEN status = 'delayed' THEN 1 ELSE 0 END) as delayed_count,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
            ")
            ->first();

        // ── Recent movements ─────────────────────────────────────────────────────
        $recentMoves = StockMovement::with('product')
            ->orderByDesc('movement_date')
            ->limit(5)
            ->get()
            ->map(fn ($m) => sprintf(
                '  - [%s] %s: %s unit %s',
                $m->movement_date ? $m->movement_date->format('d/m/Y') : '-',
                strtoupper(($m->movement_type ?? 'N/A') === 'in' ? 'MASUK' : 'KELUAR'),
                number_format($m->quantity ?? 0),
                $m->product->name ?? '-'
            ))
            ->implode("\n");

        // ── Drivers ─────────────────────────────────────────────────────────────
        $drivers = DB::table('users')
            ->join('roles', 'users.role_id', '=', 'roles.id')
            ->where('roles.name', 'driver')
            ->selectRaw("COUNT(*) as total, SUM(CASE WHEN users.status = 'available' THEN 1 ELSE 0 END) as available, SUM(CASE WHEN users.status = 'busy' THEN 1 ELSE 0 END) as busy")
            ->first();

        $now   = now()->locale('id')->isoFormat('dddd, D MMMM YYYY [pukul] HH:mm [WIB]');
        $role  = ucfirst($user->role ?? 'staff');

        return <<<PROMPT
 Kamu adalah **Aether**, asisten AI cerdas milik sistem manajemen gudang **PT. Aether Inventori Pergudangan**.
 Kamu menggunakan Groq AI dan memiliki akses real-time ke seluruh data operasional gudang.
 
 ## Identitas & Kepribadian
 - Nama: **Aether**
 - Gaya Bicara: **Hangat, ramah, dan sangat percakapan (seperti asisten manusia yang lincah)**. Hindari gaya bicara robotik atau kaku.
 - Nada: Energetik, membantu, dan bersahabat. Gunakan kalimat pembuka dan penutup yang alami.
 - Kemampuan: Menganalisis data gudang, memberikan rekomendasi, menjawab pertanyaan operasional dengan cerdas.
 
 ## Pengguna Saat Ini
 - Nama: {$user->name}
 - Role: {$role}
 - Waktu Sekarang: {$now}
 
 ## Data Gudang Real-Time (diperbarui setiap permintaan)
 
 ### 📦 Ringkasan Inventaris
 - Total Unit Tersimpan: **{$totalStock} unit**
 - Total Produk Terdaftar: **{$totalProducts} jenis**
 - Estimasi Nilai Aset: **Rp {$totalValue}**
 - Efisiensi Penyimpanan: **{$efficiency}%** dari kapasitas total {$totalCapacity} unit
 
 ### 🏭 20 Produk Teratas (berdasarkan stok)
 {$products}
 
 ### 🗄️ Utilisasi Rak (15 rak)
 {$racks}
 
 ### 🚛 Status Pengiriman
 - Total Pengiriman: {$shipStats->total}
 - Sedang Transit: {$shipStats->transit}
 - Terkirim: {$shipStats->delivered}
 - Tertunda/Delayed: {$shipStats->delayed_count}
 - Menunggu: {$shipStats->pending}
 
 ### 👨‍✈️ Armada Driver
 - Total Driver: {$drivers->total}
 - Tersedia: {$drivers->available}
 - Sedang Bertugas: {$drivers->busy}
 
 ### 📋 5 Pergerakan Barang Terbaru
 {$recentMoves}
 
 ## Instruksi Khusus (PENTING)
 1. Jawab sesuai konteks pertanyaan terakhir. Jika pengguna hanya menyapa atau basa-basi, jawab singkat dan natural; jangan langsung mengulang ringkasan gudang.
 2. Jangan membuka setiap balasan dengan sapaan yang sama. Hindari mengulang kalimat, data, atau rekomendasi yang baru saja kamu sampaikan di percakapan ini.
 3. Jika pengguna meminta data operasional, gunakan data aktual di atas dan berikan angka yang relevan.
 4. Jika ada data yang mengkhawatirkan (stok rendah atau rak penuh), sebutkan hanya ketika relevan dengan pertanyaan.
 5. Ringkas, percakapan, dan dinamis. Format markdown boleh dipakai untuk daftar/data, tapi jangan berlebihan.
 6. BATASAN KONTEKS (SANGAT PENTING): Kamu HANYA boleh menjawab pertanyaan yang berkaitan dengan operasional gudang, inventaris, logistik, stok, driver, pengiriman, dan manajemen WMS (Warehouse Management System). 
 7. Jika pengguna menanyakan hal di luar urusan gudang (seperti membuat kode program, pertanyaan umum, matematika murni, sains, atau tips gaya hidup yang tidak relevan dengan gudang), kamu WAJIB menjawab bahwa kamu tidak bisa menjawab pertanyaan tersebut karena fokus utama kamu hanya pada manajemen sistem gudang PT. Aether. 
 
 Ingat, kamu adalah asisten spesialis gudang yang handal bagi {$user->name}, bukan asisten umum!
PROMPT;
    }

}
