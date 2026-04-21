package com.aether.driver.ui.screens

import android.Manifest
import android.os.Build
import android.content.ActivityNotFoundException
import android.content.ContentResolver
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import coil.compose.SubcomposeAsyncImage
import coil.request.ImageRequest
import com.aether.driver.api.RetrofitClient
import com.aether.driver.data.SessionManager
import com.aether.driver.data.model.Shipment
import com.aether.driver.data.model.StatusResponse
import com.aether.driver.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import com.aether.driver.service.LocationService
import org.json.JSONObject
import retrofit2.Response
import java.io.ByteArrayOutputStream
import kotlin.math.max
import kotlin.math.roundToInt

@Composable
fun ShipmentListScreen(
    sessionManager: SessionManager,
    onLogout: () -> Unit,
    onOpenSettings: () -> Unit,
    onOpenHistory: () -> Unit,
) {
    val context              = LocalContext.current
    val scope                = rememberCoroutineScope()

    var shipments            by remember { mutableStateOf<List<Shipment>>(emptyList()) }
    var isLoading            by remember { mutableStateOf(true) }
    var errorMessage         by remember { mutableStateOf<String?>(null) }
    var successMessage       by remember { mutableStateOf<String?>(null) }
    var isAdvancing          by remember { mutableStateOf(false) }
    var proofShipment        by remember { mutableStateOf<Shipment?>(null) }
    var isSubmittingProof    by remember { mutableStateOf(false) }
    var showLogoutDialog     by remember { mutableStateOf(false) }
    var showProfileDialog    by remember { mutableStateOf(false) }
    var claimCode            by remember { mutableStateOf("") }
    var isClaiming           by remember { mutableStateOf(false) }
    var selectedShipment     by remember { mutableStateOf<Shipment?>(null) }

    // --- Helper Functions (Local to Composable) ---
    suspend fun loadShipments() {
        try {
            val api = RetrofitClient.getApiService(sessionManager)
            val resp = api.getAssignedShipments()
            if (resp.isSuccessful) {
                shipments    = resp.body()?.data ?: emptyList()
                errorMessage = null
            } else {
                errorMessage = "Gagal memuat pengiriman."
            }
        } catch (_: Exception) {
            errorMessage = "Tidak dapat memuat daftar pengiriman. Periksa koneksi dan URL server."
        } finally {
            isLoading = false
        }
    }

    suspend fun syncDriverProfile() {
        try {
            val api = RetrofitClient.getApiService(sessionManager)
            val resp = api.getProfile()
            if (resp.isSuccessful) {
                resp.body()?.let { profile ->
                    sessionManager.saveDriverProfile(
                        name = profile.user.name,
                        email = profile.user.email,
                        licenseNumber = profile.driver?.license_number,
                        status = profile.driver?.status,
                    )
                }
            }
        } catch (_: Exception) {
            // Keep using cached profile data when network fails.
        }
    }

    suspend fun advanceStage(shipment: Shipment, nextStage: String, note: String? = null, transactionCode: String? = null) {
        isAdvancing = true
        errorMessage = null
        successMessage = null
        try {
            val api = RetrofitClient.getApiService(sessionManager)
            val body = buildMap<String, String> {
                put("tracking_stage", nextStage)
                if (!note.isNullOrBlank()) put("note", note)
                if (!transactionCode.isNullOrBlank()) put("transaction_code", transactionCode)
            }
            val resp: Response<StatusResponse> = api.updateShipmentStatus(shipment.id, body)
            if (resp.isSuccessful) {
                successMessage = "Status diperbarui: ${trackingStageLabel(nextStage)}"
                loadShipments()
            } else {
                errorMessage = extractApiError(resp, "Gagal memperbarui status.")
            }
        } catch (_: Exception) {
            errorMessage = "Tidak dapat memperbarui status pengiriman. Periksa koneksi dan URL server."
        } finally {
            isAdvancing = false
        }
    }

    suspend fun submitProof(
        shipment: Shipment,
        recipientName: String,
        note: String,
        photoBase64: String?,
    ) {
        isSubmittingProof = true
        try {
            val api = RetrofitClient.getApiService(sessionManager)
            val body = buildMap<String, String> {
                put("tracking_stage", "delivered")
                put("delivery_recipient_name", recipientName)
                if (note.isNotBlank()) put("delivery_note", note)
                if (photoBase64 != null) put("delivery_photo_base64", photoBase64)
            }
            val resp: Response<StatusResponse> = api.updateShipmentStatus(shipment.id, body)
            if (resp.isSuccessful) {
                proofShipment  = null
                successMessage = "POD terkirim. Menunggu verifikasi admin."
                loadShipments()
            } else {
                errorMessage = extractApiError(resp, "Gagal menyimpan bukti pengiriman.")
            }
        } catch (_: Exception) {
            errorMessage = "Tidak dapat mengirim bukti pengiriman. Periksa koneksi dan URL server."
        } finally {
            isSubmittingProof = false
        }
    }

    suspend fun claimShipmentByCode() {
        val code = claimCode.trim().uppercase()
        if (code.isBlank()) {
            errorMessage = "Masukkan kode pengiriman terlebih dahulu."
            return
        }

        isClaiming = true
        errorMessage = null
        successMessage = null
        try {
            val api = RetrofitClient.getApiService(sessionManager)
            val resp = api.claimShipment(mapOf("shipment_id" to code))
            if (resp.isSuccessful) {
                claimCode = ""
                successMessage = resp.body()?.message ?: "Shipment berhasil diklaim."
                loadShipments()
            } else {
                errorMessage = "Gagal klaim: ${extractApiError(resp, "Kode salah atau expired")}"
            }
        } catch (_: Exception) {
            errorMessage = "Gagal menghubungi server."
        } finally {
            isClaiming = false
        }
    }

    LaunchedEffect(Unit) {
        syncDriverProfile()
        loadShipments()
        while (true) {
            delay(20_000)
            loadShipments()
        }
    }

    selectedShipment?.let { shipment ->
        ShipmentDetailPage(
            shipment = shipment,
            onBack = { selectedShipment = null },
        )
        return
    }

    // No verification dialog needed

    // Location permission
    var locationGranted by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        )
    }
    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) {
        locationGranted = it
    }

    // --- Automated Location Service Lifecycle ---
    LaunchedEffect(shipments.size, locationGranted) {
        if (shipments.isNotEmpty() && locationGranted) {
            val intent = Intent(context, LocationService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        } else {
            context.stopService(Intent(context, LocationService::class.java))
        }
    }

    // Debug GPS state
    val driverName     by sessionManager.driverName.collectAsState(initial = null)
    val driverEmail    by sessionManager.driverEmail.collectAsState(initial = null)
    val driverLicense  by sessionManager.driverLicenseNumber.collectAsState(initial = null)
    val driverStatus   by sessionManager.driverStatus.collectAsState(initial = null)
    val lastGpsSentAt  by sessionManager.lastLocationSentAt.collectAsState(initial = null)
    val lastGpsPayload by sessionManager.lastLocationPayload.collectAsState(initial = null)
    val lastGpsError   by sessionManager.lastLocationError.collectAsState(initial = null)

    Scaffold(
        topBar = {
            Surface(
                color = Card,
                shadowElevation = 1.dp,
            ) {
                AetherWorkspaceHeader(
                    title = "Pengiriman Saya",
                    subtitle = "Aether Driver",
                    actions = {
                        IconButton(onClick = { showProfileDialog = true }, modifier = Modifier.size(36.dp)) {
                            Icon(Icons.Rounded.AccountCircle, contentDescription = "Profil", tint = TextSecond, modifier = Modifier.size(19.dp))
                        }
                        IconButton(onClick = onOpenHistory, modifier = Modifier.size(36.dp)) {
                            Icon(Icons.Rounded.History, contentDescription = "Riwayat", tint = TextSecond, modifier = Modifier.size(18.dp))
                        }
                        IconButton(onClick = onOpenSettings, modifier = Modifier.size(36.dp)) {
                            Icon(Icons.Rounded.Settings, contentDescription = "Pengaturan", tint = TextSecond, modifier = Modifier.size(18.dp))
                        }
                        IconButton(onClick = { showLogoutDialog = true }, modifier = Modifier.size(36.dp)) {
                            Icon(Icons.Rounded.Logout, contentDescription = "Keluar", tint = TextSecond, modifier = Modifier.size(18.dp))
                        }
                    },
                )
            }
        },
        containerColor = Surface,
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Surface,
                            PrimaryLight.copy(alpha = 0.35f),
                            Surface,
                        )
                    )
                ),
        ) {
            LazyColumn(
                modifier             = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding       = PaddingValues(start = 20.dp, end = 20.dp, top = 16.dp, bottom = 32.dp),
                verticalArrangement  = Arrangement.spacedBy(12.dp),
            ) {
                if (!locationGranted) {
                    item {
                        AlertBanner(
                            message = "Izin lokasi belum diberikan. Tracking GPS tidak aktif.",
                            type    = AlertType.Warning,
                        )
                        Spacer(Modifier.height(4.dp))
                        AetherSecondaryButton(
                            text = "Berikan Izin Lokasi",
                            onClick = { permissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION) },
                            modifier = Modifier.fillMaxWidth(),
                            leadingIcon = Icons.Rounded.LocationSearching,
                        )
                    }
                }

                successMessage?.let { msg ->
                    item {
                        AlertBanner(message = msg, type = AlertType.Success)
                        LaunchedEffect(msg) { delay(3000); successMessage = null }
                    }
                }
                errorMessage?.let { msg ->
                    item { AlertBanner(message = msg, type = AlertType.Error) }
                }

                if (shipments.isEmpty()) {
                    item {
                        ClaimShipmentCard(
                            claimCode = claimCode,
                            onClaimCodeChange = { claimCode = it },
                            onClaimClick = { scope.launch { claimShipmentByCode() } },
                            isClaiming = isClaiming,
                        )
                    }
                } else {
                    item {
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            color = Primary.copy(alpha = 0.05f),
                            shape = RoundedCornerShape(16.dp),
                            border = BorderStroke(1.dp, Primary.copy(alpha = 0.1f))
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .background(Primary.copy(alpha = 0.1f), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        Icons.Rounded.Info,
                                        contentDescription = null,
                                        tint = Primary,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                                Spacer(Modifier.width(16.dp))
                                Column {
                                    Text(
                                        "Pengiriman Aktif",
                                        style = MaterialTheme.typography.titleSmall,
                                        color = TextPrimary
                                    )
                                    Text(
                                        "Selesaikan pengiriman saat ini untuk mengambil yang baru.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = TextMuted
                                    )
                                }
                            }
                        }
                    }
                }

                if (isLoading) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 44.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            AppWarehouseLoader(
                                label = "Sinkronisasi pengiriman...",
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }

                if (!isLoading && shipments.isEmpty() && errorMessage == null) {
                    item {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 52.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(86.dp)
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(Color.White)
                                    .border(1.dp, Border, RoundedCornerShape(20.dp)),
                                contentAlignment = Alignment.Center,
                            ) {
                                Icon(
                                    Icons.Rounded.LocalShipping,
                                    contentDescription = null,
                                    tint = Primary,
                                    modifier = Modifier.size(38.dp),
                                )
                            }
                            Spacer(Modifier.height(18.dp))
                            Text(
                                text = "Belum Ada Pengiriman Aktif",
                                style = MaterialTheme.typography.titleLarge,
                                color = TextPrimary,
                            )
                            Spacer(Modifier.height(8.dp))
                            Text(
                                text = "Klaim kode pengiriman dari panel di atas.\nShipment aktif akan tampil otomatis di sini.",
                                style = MaterialTheme.typography.bodySmall,
                                color = TextMuted,
                                textAlign = TextAlign.Center,
                            )
                        }
                    }
                }

                itemsIndexed(shipments, key = { _, item -> item.id }) { index, shipment ->
                    var visible by remember(shipment.id) { mutableStateOf(false) }
                    LaunchedEffect(shipment.id) {
                        delay((index * 45L).coerceAtMost(240L))
                        visible = true
                    }

                    AnimatedVisibility(
                        visible = visible,
                        enter = fadeIn(animationSpec = tween(durationMillis = 260)) +
                            slideInVertically(
                                animationSpec = tween(durationMillis = 280),
                                initialOffsetY = { it / 5 },
                            ),
                    ) {
                        ShipmentCard(
                            shipment    = shipment,
                            isAdvancing = isAdvancing,
                            onAdvanceStage = { nextStage ->
                                if (nextStage == "delivered") {
                                    proofShipment = shipment
                                } else {
                                    scope.launch { advanceStage(shipment, nextStage) }
                                }
                            },
                            onOpenDetail = { selectedShipment = shipment },
                            onResubmitProof = { proofShipment = shipment },
                        )
                    }
                }

                if (shipments.isNotEmpty()) {
                    item {
                        Spacer(Modifier.height(8.dp))
                        DebugGpsCard(
                            locationGranted  = locationGranted,
                            lastSentAt       = lastGpsSentAt,
                            lastPayload      = lastGpsPayload,
                            lastError        = lastGpsError,
                        )
                    }
                }
            }
        }
    }

    proofShipment?.let { shipment ->
        ProofOfDeliveryDialog(
            shipment         = shipment,
            isSubmitting     = isSubmittingProof,
            onSubmit         = { name, note, photo ->
                scope.launch { submitProof(shipment, name, note, photo) }
            },
            onDismiss        = { proofShipment = null },
            contentResolver  = context.contentResolver,
        )
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            modifier = dialogEntranceModifier(),
            title            = { Text("Keluar dari Akun", style = MaterialTheme.typography.headlineMedium) },
            text             = { Text("Anda akan keluar dan perlu login kembali.", style = MaterialTheme.typography.bodyMedium, color = TextSecond) },
            confirmButton    = {
                AetherPrimaryButton(
                    text = "Keluar",
                    onClick = {
                        showLogoutDialog = false
                        scope.launch {
                            sessionManager.clearToken()
                            onLogout()
                        }
                    },
                    danger = true,
                )
            },
            dismissButton    = {
                AetherSecondaryButton(
                    text = "Batal",
                    onClick = { showLogoutDialog = false },
                )
            },
            shape            = MaterialTheme.shapes.extraLarge,
        )
    }

    if (showProfileDialog) {
        ProfileDialog(
            name = driverName,
            email = driverEmail,
            licenseNumber = driverLicense,
            status = driverStatus,
            onDismiss = { showProfileDialog = false },
        )
    }
}

@Composable
fun ShipmentCard(
    shipment: Shipment,
    isAdvancing: Boolean,
    onAdvanceStage: (String) -> Unit,
    onOpenDetail: () -> Unit,
    onResubmitProof: () -> Unit,
) {
    val stage     = currentTrackingStage(shipment)
    val nextStage = nextTrackingStage(stage)
    val isDone    = stage == "delivered"
    val verificationStatus = shipment.pod_verification_status ?: if (isDone) "pending" else null
    val isVerified = verificationStatus == "approved"

    AetherPanel(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onOpenDetail() },
        padding = PaddingValues(18.dp),
    ) {

            Row(
                modifier              = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment     = Alignment.CenterVertically,
            ) {
                Column {
                    SectionLabel("ID Pengiriman")
                    Text(
                        text  = "#${shipment.shipment_id}",
                        style = MaterialTheme.typography.headlineMedium,
                        color = Primary,
                    )
                }
                AetherStatusBadge(
                    label = shipment.tracking_stage_label ?: trackingStageLabel(stage),
                    stage = stage,
                )
            }

            Spacer(Modifier.height(16.dp))
            Divider(color = Border)
            Spacer(Modifier.height(16.dp))

            Row(
                modifier      = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    SectionLabel("Asal")
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text  = shipment.origin_name,
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary,
                    )
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Rounded.ArrowForward, contentDescription = null, tint = TextMuted, modifier = Modifier.size(18.dp))
                }
                Column(modifier = Modifier.weight(1f), horizontalAlignment = Alignment.End) {
                    SectionLabel("Tujuan")
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text      = shipment.destination_name,
                        style     = MaterialTheme.typography.titleMedium,
                        color     = TextPrimary,
                        textAlign = TextAlign.End,
                    )
                }
            }

            shipment.estimated_arrival?.let { eta ->
                Spacer(Modifier.height(12.dp))
                Row(
                    modifier              = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(PrimaryLight)
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment     = Alignment.CenterVertically,
                ) {
                    Icon(Icons.Rounded.Schedule, contentDescription = null, tint = Primary, modifier = Modifier.size(16.dp))
                    Text(
                        text  = "ETA: ${formatApiDate(eta)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = Primary,
                        fontWeight = FontWeight.SemiBold,
                    )
                }
            }

            Spacer(Modifier.height(16.dp))
            TrackingStepper(currentStage = stage)

            shipment.last_tracking_note?.let { note ->
                Spacer(Modifier.height(12.dp))
                Row(
                    modifier  = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Icon(Icons.Rounded.Notes, contentDescription = null, tint = TextSecond, modifier = Modifier.size(16.dp))
                    Text(
                        text  = note,
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecond,
                    )
                }
            }

            if (nextStage != null && !isDone) {
                Spacer(Modifier.height(16.dp))
                AetherPrimaryButton(
                    text = nextStageActionLabel(nextStage),
                    onClick = { onAdvanceStage(nextStage) },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isAdvancing,
                    isLoading = isAdvancing,
                    leadingIcon = if (nextStage == "delivered") Icons.Rounded.TaskAlt else Icons.Rounded.SyncAlt,
                )
            }

            if (isDone) {
                Spacer(Modifier.height(12.dp))
                if (isVerified) {
                    Row(
                        modifier              = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(SecondaryLt)
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment     = Alignment.CenterVertically,
                    ) {
                        Icon(Icons.Rounded.CheckCircle, contentDescription = null, tint = Secondary, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text       = "Selesai diverifikasi admin",
                            style      = MaterialTheme.typography.bodySmall,
                            color      = Secondary,
                            fontWeight = FontWeight.ExtraBold,
                        )
                    }
                } else {
                    val waitingText = when (verificationStatus) {
                        "rejected" -> "Bukti ditolak admin. Kirim ulang POD."
                        else -> "Menunggu verifikasi admin."
                    }
                    Row(
                        modifier              = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(WarningLight)
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment     = Alignment.CenterVertically,
                    ) {
                        Icon(Icons.Rounded.Schedule, contentDescription = null, tint = Warning, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text       = waitingText,
                            style      = MaterialTheme.typography.bodySmall,
                            color      = Warning,
                            fontWeight = FontWeight.ExtraBold,
                        )
                    }

                    if (verificationStatus == "rejected") {
                        Spacer(Modifier.height(12.dp))
                        AetherSecondaryButton(
                            text = "Kirim Ulang Bukti",
                            onClick = onResubmitProof,
                            modifier = Modifier.fillMaxWidth(),
                            leadingIcon = Icons.Rounded.Refresh,
                        )
                    }
                }
            }
    }
}

private val STAGES = listOf(
    "ready_for_pickup"      to "Siap Diambil",
    "picked_up"             to "Diambil",
    "in_transit"            to "Perjalanan",
    "arrived_at_destination" to "Sampai",
    "delivered"             to "Terkirim",
)

@Composable
private fun ClaimShipmentCard(
    claimCode: String,
    onClaimCodeChange: (String) -> Unit,
    onClaimClick: () -> Unit,
    isClaiming: Boolean,
) {
    AetherPanel(
        modifier = Modifier.fillMaxWidth(),
        padding = PaddingValues(16.dp),
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(30.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(PrimaryLight),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Rounded.LocalShipping, contentDescription = null, tint = Primary, modifier = Modifier.size(16.dp))
                }
                Column {
                    Text("Tambah Pengiriman via Kode", style = MaterialTheme.typography.titleLarge, color = TextPrimary)
                    Text("Input kode shipment resmi dari admin.", style = MaterialTheme.typography.bodySmall, color = TextMuted)
                }
            }
            AetherTextField(
                value = claimCode,
                onValueChange = onClaimCodeChange,
                label = "Kode Pengiriman",
                placeholder = "Contoh: SHP-0001",
                leadingIcon = { Icon(Icons.Rounded.ConfirmationNumber, contentDescription = null, tint = TextMuted, modifier = Modifier.size(20.dp)) },
            )
            AetherPrimaryButton(
                text = "Klaim Shipment",
                onClick = onClaimClick,
                modifier = Modifier.fillMaxWidth(),
                enabled = !isClaiming,
                isLoading = isClaiming,
                leadingIcon = Icons.Rounded.Add,
            )
            Text(
                text = "Sistem membatasi 1 shipment aktif sampai POD diverifikasi admin.",
                style = MaterialTheme.typography.bodySmall,
                color = TextMuted,
            )
        }
    }
}

@Composable
private fun TrackingStepper(currentStage: String) {
    val currentIdx = STAGES.indexOfFirst { it.first == currentStage }.coerceAtLeast(0)

    Row(
        modifier              = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment     = Alignment.Top,
    ) {
        STAGES.forEachIndexed { idx, (_, label) ->
            val isDone   = idx < currentIdx
            val isCurrent = idx == currentIdx
            val color    = when {
                isDone    -> Secondary
                isCurrent -> Primary
                else      -> Border
            }

            Column(
                modifier            = Modifier.weight(1f),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Box(
                    modifier         = Modifier
                        .size(22.dp)
                        .clip(CircleShape)
                        .background(color),
                    contentAlignment = Alignment.Center,
                ) {
                    if (isDone) {
                        Icon(Icons.Rounded.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                    } else if (isCurrent) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                        )
                    }
                }
                Spacer(Modifier.height(4.dp))
                Text(
                    text      = label,
                    style     = MaterialTheme.typography.labelSmall.copy(fontSize = 8.sp),
                    color     = if (isCurrent || isDone) color else TextMuted,
                    textAlign = TextAlign.Center,
                    maxLines  = 2,
                )
            }

            if (idx < STAGES.lastIndex) {
                Box(
                    modifier = Modifier
                        .weight(0.5f)
                        .height(2.dp)
                        .padding(top = 10.dp)
                        .background(if (idx < currentIdx) Secondary else Border)
                )
            }
        }
    }
}

@Composable
private fun ProofOfDeliveryDialog(
    shipment: Shipment,
    isSubmitting: Boolean,
    onSubmit: (String, String, String?) -> Unit,
    onDismiss: () -> Unit,
    contentResolver: ContentResolver,
) {
    var recipientName by remember { mutableStateOf("") }
    var note          by remember { mutableStateOf("") }
    var photoUri      by remember { mutableStateOf<Uri?>(null) }
    val photoLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        photoUri = uri
    }

    AlertDialog(
        onDismissRequest = { if (!isSubmitting) onDismiss() },
        modifier = dialogEntranceModifier(),
        shape            = MaterialTheme.shapes.extraLarge,
        title = {
            Column {
                Text("Bukti Pengiriman (POD)", style = MaterialTheme.typography.headlineMedium)
                Text(
                    text  = "#${shipment.shipment_id} → ${shipment.destination_name}",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextMuted,
                )
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                AetherTextField(
                    value         = recipientName,
                    onValueChange = { recipientName = it },
                    label         = "Nama Penerima",
                    placeholder   = "Nama orang yang menerima barang",
                    leadingIcon   = { Icon(Icons.Rounded.Person, contentDescription = null, tint = TextMuted, modifier = Modifier.size(20.dp)) }
                )
                AetherTextField(
                    value         = note,
                    onValueChange = { note = it },
                    label         = "Catatan Pengiriman (Opsional)",
                    placeholder   = "Contoh: Diterima di pintu depan",
                    leadingIcon   = { Icon(Icons.Rounded.EditNote, contentDescription = null, tint = TextMuted, modifier = Modifier.size(20.dp)) }
                )
                OutlinedButton(
                    onClick  = { photoLauncher.launch("image/*") },
                    modifier = Modifier.fillMaxWidth(),
                    shape    = MaterialTheme.shapes.medium,
                ) {
                    Icon(
                        imageVector = if (photoUri != null) Icons.Rounded.AddAPhoto else Icons.Rounded.PhotoCamera,
                        contentDescription = null,
                        tint = if (photoUri != null) Secondary else Primary,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text  = if (photoUri != null) "Foto Terpilih" else "Pilih Foto Bukti",
                        style = MaterialTheme.typography.labelMedium,
                        color = if (photoUri != null) Secondary else Primary,
                    )
                }
            }
        },
        confirmButton = {
            AetherPrimaryButton(
                text = "Simpan & Selesaikan",
                onClick = {
                    val base64 = photoUri?.let { contentResolver.readImageAsBase64(it) }
                    onSubmit(recipientName.trim(), note.trim(), base64)
                },
                enabled = recipientName.isNotBlank() && !isSubmitting,
                isLoading = isSubmitting,
                leadingIcon = Icons.Rounded.TaskAlt,
            )
        },
        dismissButton = {
            TextButton(onClick = { if (!isSubmitting) onDismiss() }) {
                Text("Batal", color = TextSecond, style = MaterialTheme.typography.labelLarge)
            }
        }
    )
}

// VerificationCodeDialog removed
2
@Composable
private fun ShipmentDetailPage(
    shipment: Shipment,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    val stage = currentTrackingStage(shipment)
    val hasDestination = shipment.dest_lat != null && shipment.dest_lng != null
    val hasOrigin = shipment.origin_lat != null && shipment.origin_lng != null
    val routeDistanceKm = if (hasOrigin && hasDestination) {
        haversineKm(
            shipment.origin_lat!!,
            shipment.origin_lng!!,
            shipment.dest_lat!!,
            shipment.dest_lng!!,
        )
    } else null
    val canUseDrivingRoute = routeDistanceKm != null && routeDistanceKm <= 1200.0

    Scaffold(
        topBar = {
            Surface(color = Card, shadowElevation = 1.dp) {
                AetherWorkspaceHeader(
                    title = "Detail Pengiriman",
                    subtitle = "Aether Driver",
                    onBack = onBack,
                )
            }
        },
        containerColor = Surface,
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Surface, PrimaryLight.copy(alpha = 0.3f), Surface)
                    )
                )
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            AnimatedVisibility(visible = true, enter = fadeIn(tween(260)) + slideInVertically(tween(300), initialOffsetY = { it / 8 })) {
                AetherPanel(
                    modifier = Modifier.fillMaxWidth(),
                    padding = PaddingValues(18.dp),
                ) {
                    Text("#${shipment.shipment_id}", style = MaterialTheme.typography.headlineMedium, color = Primary)
                    Spacer(Modifier.height(12.dp))

                    DetailInfoCard("Asal", shipment.origin_name)
                    DetailInfoCard("Tujuan", shipment.destination_name)
                    DetailInfoCard("Tahap", shipment.tracking_stage_label ?: trackingStageLabel(stage))
                    DetailInfoCard("ETA", shipment.estimated_arrival?.let { formatApiDate(it) } ?: "-")
                    DetailInfoCard("Status POD", podVerificationLabel(shipment.pod_verification_status))
                    if (!shipment.pod_verification_note.isNullOrBlank()) {
                        DetailInfoCard("Catatan Verifikasi", shipment.pod_verification_note)
                    }

                    Spacer(Modifier.height(8.dp))
                    SectionLabel("Timeline")
                    TimelineRow("Diklaim", shipment.claimed_at)
                    TimelineRow("Diambil", shipment.picked_up_at)
                    TimelineRow("Perjalanan", shipment.in_transit_at)
                    TimelineRow("Sampai", shipment.arrived_at_destination_at)
                    TimelineRow("Terkirim", shipment.delivered_at)
                }
            }

            if (hasDestination) {
                AnimatedVisibility(visible = true, enter = fadeIn(tween(300)) + slideInVertically(tween(340), initialOffsetY = { it / 10 })) {
                    AetherPanel(
                        modifier = Modifier.fillMaxWidth(),
                        padding = PaddingValues(14.dp),
                    ) {
                        Text("Peta Rute", style = MaterialTheme.typography.titleLarge, color = TextPrimary)
                        Spacer(Modifier.height(10.dp))

                        RouteMapPreview(
                            originLat = shipment.origin_lat,
                            originLng = shipment.origin_lng,
                            destLat = shipment.dest_lat,
                            destLng = shipment.dest_lng,
                        )

                        Spacer(Modifier.height(10.dp))
                        RouteReviewPanel(
                            originName = shipment.origin_name,
                            destinationName = shipment.destination_name,
                            originLat = shipment.origin_lat,
                            originLng = shipment.origin_lng,
                            destLat = shipment.dest_lat,
                            destLng = shipment.dest_lng,
                        )

                        Spacer(Modifier.height(12.dp))
                        AetherPrimaryButton(
                            text = if (canUseDrivingRoute) "Buka Rute di Google Maps" else "Buka Lokasi Tujuan di Google Maps",
                            onClick = {
                                val uri = if (canUseDrivingRoute) {
                                    buildString {
                                        append("https://www.google.com/maps/dir/?api=1")
                                        if (hasOrigin) {
                                            append("&origin=${shipment.origin_lat},${shipment.origin_lng}")
                                        }
                                        append("&destination=${shipment.dest_lat},${shipment.dest_lng}")
                                        append("&travelmode=driving")
                                        append("&dir_action=navigate")
                                    }
                                } else {
                                    buildString {
                                        append("https://www.google.com/maps/search/?api=1")
                                        append("&query=${shipment.dest_lat},${shipment.dest_lng}")
                                    }
                                }
                                try {
                                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(uri)))
                                } catch (_: ActivityNotFoundException) {
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            leadingIcon = Icons.Rounded.Map,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun RouteMapPreview(
    originLat: Double?,
    originLng: Double?,
    destLat: Double?,
    destLng: Double?,
) {
    if (destLat == null || destLng == null) return

    val context = LocalContext.current
    val hasOrigin = originLat != null && originLng != null
    val centerLat = if (hasOrigin) (originLat!! + destLat) / 2.0 else destLat
    val centerLng = if (hasOrigin) (originLng!! + destLng) / 2.0 else destLng
    val distanceKm = if (hasOrigin) haversineKm(originLat!!, originLng!!, destLat, destLng) else 8.0
    val zoom = when {
        distanceKm > 4000 -> 2
        distanceKm > 1800 -> 3
        distanceKm > 800 -> 4
        distanceKm > 300 -> 5
        distanceKm > 120 -> 6
        distanceKm > 50 -> 7
        distanceKm > 20 -> 8
        else -> 10
    }
    val markers = buildString {
        if (hasOrigin) append("&markers=$originLat,$originLng,lightblue1")
        append("&markers=$destLat,$destLng,red")
    }
    val primaryStaticMapUrl =
        "https://staticmap.openstreetmap.de/staticmap.php?center=$centerLat,$centerLng&zoom=$zoom&size=900x520$markers"
    val secondaryStaticMapUrl = if (hasOrigin) {
        "https://static-maps.yandex.ru/1.x/?lang=en_US&ll=$centerLng,$centerLat&z=$zoom&l=map&size=650,380&pt=$originLng,$originLat,pm2blm~$destLng,$destLat,pm2rdm"
    } else {
        "https://static-maps.yandex.ru/1.x/?lang=en_US&ll=$centerLng,$centerLat&z=$zoom&l=map&size=650,380&pt=$destLng,$destLat,pm2rdm"
    }

    var staticMapUrl by remember(primaryStaticMapUrl) { mutableStateOf(primaryStaticMapUrl) }
    var triedSecondaryProvider by remember(primaryStaticMapUrl) { mutableStateOf(false) }
    var hardMapFailed by remember(primaryStaticMapUrl) { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(230.dp)
            .clip(RoundedCornerShape(16.dp))
            .border(1.dp, BorderSoft, RoundedCornerShape(16.dp))
    ) {
        SubcomposeAsyncImage(
            model = ImageRequest.Builder(context)
                .data(staticMapUrl)
                .crossfade(true)
                .build(),
            contentDescription = "Preview peta rute",
            modifier = Modifier.fillMaxSize(),
            onSuccess = {
                hardMapFailed = false
            },
            onError = {
                if (!triedSecondaryProvider) {
                    triedSecondaryProvider = true
                    staticMapUrl = secondaryStaticMapUrl
                } else {
                    hardMapFailed = true
                }
            },
            loading = {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Surface.copy(alpha = 0.88f)),
                    contentAlignment = Alignment.Center,
                ) {
                    AppWarehouseLoader(
                        label = "Memuat peta rute...",
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            },
            error = {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Surface)
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Text("Preview peta tidak tersedia", style = MaterialTheme.typography.titleMedium, color = TextPrimary)
                    RouteSketchMap(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(120.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(PrimaryLight),
                    )
                    Text("Tujuan: $destLat, $destLng", style = MaterialTheme.typography.bodySmall, color = TextSecond)
                    if (originLat != null && originLng != null) {
                        Text("Asal: $originLat, $originLng", style = MaterialTheme.typography.bodySmall, color = TextSecond)
                    }
                    Text(
                        "Gunakan tombol di bawah untuk buka Google Maps.",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextMuted,
                    )
                }
            },
        )

        if (hasOrigin) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val start = geoToCanvasPoint(
                    lat = originLat!!,
                    lon = originLng!!,
                    centerLat = centerLat,
                    centerLng = centerLng,
                    zoom = zoom,
                    width = size.width,
                    height = size.height,
                )
                val end = geoToCanvasPoint(
                    lat = destLat,
                    lon = destLng,
                    centerLat = centerLat,
                    centerLng = centerLng,
                    zoom = zoom,
                    width = size.width,
                    height = size.height,
                )

                drawLine(
                    color = Primary.copy(alpha = 0.75f),
                    start = start,
                    end = end,
                    strokeWidth = 6f,
                    cap = StrokeCap.Round,
                )
                drawCircle(color = Secondary, center = start, radius = 10f)
                drawCircle(color = Danger, center = end, radius = 10f)
                drawCircle(color = Color.White, center = start, radius = 4f)
                drawCircle(color = Color.White, center = end, radius = 4f)
            }
        }

        if (hardMapFailed) {
            Text(
                text = "Provider peta sedang dibatasi jaringan, gunakan tombol Google Maps.",
                style = MaterialTheme.typography.labelSmall,
                color = TextMuted,
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(8.dp),
            )
        }
    }
}

@Composable
private fun RouteSketchMap(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val start = androidx.compose.ui.geometry.Offset(size.width * 0.22f, size.height * 0.72f)
        val end = androidx.compose.ui.geometry.Offset(size.width * 0.78f, size.height * 0.28f)

        drawLine(
            color = Primary.copy(alpha = 0.9f),
            start = start,
            end = end,
            strokeWidth = 8f,
            cap = StrokeCap.Round,
        )

        drawCircle(color = Secondary, radius = 14f, center = start)
        drawCircle(color = Danger, radius = 14f, center = end)
        drawCircle(color = Color.White, radius = 6f, center = start)
        drawCircle(color = Color.White, radius = 6f, center = end)
    }
}

@Composable
private fun RouteReviewPanel(
    originName: String,
    destinationName: String,
    originLat: Double?,
    originLng: Double?,
    destLat: Double?,
    destLng: Double?,
) {
    val clipboard = LocalClipboardManager.current
    val distanceKm = if (originLat != null && originLng != null && destLat != null && destLng != null) {
        haversineKm(originLat, originLng, destLat, destLng)
    } else null
    val drivingHours = distanceKm?.div(50.0)
    val airHours = distanceKm?.div(750.0)
    val seaHours = distanceKm?.div(35.0)
    val routeClass = when {
        distanceKm == null -> "-"
        distanceKm < 75 -> "Lokal"
        distanceKm < 1200 -> "Antar Kota"
        else -> "Internasional"
    }
    val routeClassColor = when (routeClass) {
        "Lokal" -> Secondary
        "Antar Kota" -> Warning
        "Internasional" -> Primary
        else -> TextMuted
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("Data Rute (Review)", style = MaterialTheme.typography.titleSmall, color = TextPrimary)
            Surface(
                shape = RoundedCornerShape(999.dp),
                color = routeClassColor.copy(alpha = 0.14f),
            ) {
                Text(
                    routeClass.uppercase(),
                    style = MaterialTheme.typography.labelSmall,
                    color = routeClassColor,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                )
            }
        }
        DetailInfoCard("Asal", originName)
        DetailInfoCopyCard(
            label = "Koordinat Asal",
            value = formatCoordinatePair(originLat, originLng),
            onCopy = {
                val coord = formatCoordinatePair(originLat, originLng)
                if (coord != "-") clipboard.setText(AnnotatedString(coord))
            }
        )
        DetailInfoCard("Tujuan", destinationName)
        DetailInfoCopyCard(
            label = "Koordinat Tujuan",
            value = formatCoordinatePair(destLat, destLng),
            onCopy = {
                val coord = formatCoordinatePair(destLat, destLng)
                if (coord != "-") clipboard.setText(AnnotatedString(coord))
            }
        )
        DetailInfoCard("Jarak Estimasi", distanceKm?.let { "${"%.1f".format(it)} km (garis lurus)" } ?: "-")
        DetailInfoCard("Estimasi Waktu Darat", drivingHours?.let { formatDurationEstimate(it) } ?: "-")
        DetailInfoCard("Estimasi Waktu Udara", airHours?.let { formatDurationEstimate(it) } ?: "-")
        DetailInfoCard("Estimasi Waktu Laut", seaHours?.let { formatDurationEstimate(it) } ?: "-")
        Text(
            "Estimasi waktu di atas berbasis rata-rata kecepatan (bukan waktu real-time GPS).",
            style = MaterialTheme.typography.bodySmall,
            color = TextMuted,
        )
    }
}

@Composable
private fun DetailInfoCard(label: String, value: String) {
    Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
        Text(label.uppercase(), style = MaterialTheme.typography.labelSmall, color = TextMuted)
        Text(value, style = MaterialTheme.typography.bodyMedium, color = TextPrimary, textAlign = TextAlign.End)
            }
}

@Composable
private fun DetailInfoCopyCard(
    label: String,
    value: String,
    onCopy: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(horizontal = 12.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Text(label.uppercase(), style = MaterialTheme.typography.labelSmall, color = TextMuted)
            Text(value, style = MaterialTheme.typography.bodyMedium, color = TextPrimary)
        }
        TextButton(onClick = onCopy, enabled = value != "-") {
            Text("COPY", style = MaterialTheme.typography.labelSmall, color = Primary)
        }
    }
}

private fun haversineKm(
    lat1: Double,
    lon1: Double,
    lat2: Double,
    lon2: Double,
): Double {
    val earthRadiusKm = 6371.0
    val dLat = Math.toRadians(lat2 - lat1)
    val dLon = Math.toRadians(lon2 - lon1)
    val a = kotlin.math.sin(dLat / 2) * kotlin.math.sin(dLat / 2) +
        kotlin.math.cos(Math.toRadians(lat1)) * kotlin.math.cos(Math.toRadians(lat2)) *
        kotlin.math.sin(dLon / 2) * kotlin.math.sin(dLon / 2)
    val c = 2 * kotlin.math.atan2(kotlin.math.sqrt(a), kotlin.math.sqrt(1 - a))
    return earthRadiusKm * c
}

private fun formatCoordinatePair(lat: Double?, lon: Double?): String {
    if (lat == null || lon == null) return "-"
    return String.format("%.6f, %.6f", lat, lon)
}

private fun geoToCanvasPoint(
    lat: Double,
    lon: Double,
    centerLat: Double,
    centerLng: Double,
    zoom: Int,
    width: Float,
    height: Float,
): androidx.compose.ui.geometry.Offset {
    val scale = 256.0 * (1 shl zoom)
    val centerX = ((centerLng + 180.0) / 360.0) * scale
    val latRadCenter = Math.toRadians(centerLat)
    val centerY = (1.0 - kotlin.math.ln(kotlin.math.tan(latRadCenter) + 1 / kotlin.math.cos(latRadCenter)) / Math.PI) / 2.0 * scale

    val x = ((lon + 180.0) / 360.0) * scale
    val latRad = Math.toRadians(lat)
    val y = (1.0 - kotlin.math.ln(kotlin.math.tan(latRad) + 1 / kotlin.math.cos(latRad)) / Math.PI) / 2.0 * scale

    val px = (width / 2.0 + (x - centerX)).toFloat()
    val py = (height / 2.0 + (y - centerY)).toFloat()
    return androidx.compose.ui.geometry.Offset(px, py)
}

private fun formatDurationEstimate(hours: Double): String {
    if (hours < 1.0) {
        val minutes = (hours * 60).toInt().coerceAtLeast(1)
        return "$minutes menit"
    }
    val totalMinutes = (hours * 60).toInt()
    val day = totalMinutes / (24 * 60)
    val remAfterDay = totalMinutes % (24 * 60)
    val h = remAfterDay / 60
    val m = remAfterDay % 60

    return buildString {
        if (day > 0) append("${day} hari ")
        if (h > 0) append("${h} jam ")
        if (m > 0) append("${m} menit")
    }.trim()
}

@Composable
private fun ProfileDialog(
    name: String?,
    email: String?,
    licenseNumber: String?,
    status: String?,
    onDismiss: () -> Unit,
) {
    val statusLabel = when (status?.lowercase()) {
        "active" -> "Aktif"
        "approved" -> "Disetujui"
        "pending" -> "Menunggu Persetujuan"
        "pending_approval" -> "Menunggu Persetujuan"
        "rejected" -> "Ditolak"
        "suspended" -> "Ditangguhkan"
        "inactive" -> "Tidak Aktif"
        else -> "Belum tersedia"
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        modifier = dialogEntranceModifier(),
        shape = MaterialTheme.shapes.extraLarge,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Icon(Icons.Rounded.Badge, contentDescription = null, tint = Primary, modifier = Modifier.size(20.dp))
                Text("Profil Driver", style = MaterialTheme.typography.headlineMedium)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                ProfileInfoItem("Nama", name ?: "-")
                ProfileInfoItem("Email", email ?: "-")
                ProfileInfoItem("No. SIM", licenseNumber ?: "-")
                ProfileInfoItem("Status", statusLabel)
            }
        },
        confirmButton = {
            AetherSecondaryButton(
                text = "Tutup",
                onClick = onDismiss,
            )
        },
    )
}

@Composable
private fun ProfileInfoItem(
    label: String,
    value: String,
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surfaceVariant,
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(3.dp),
        ) {
            Text(
                text = label.uppercase(),
                style = MaterialTheme.typography.labelMedium,
                color = TextMuted,
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium,
                color = TextPrimary,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}

@Composable
private fun dialogEntranceModifier(): Modifier {
    var animateIn by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { animateIn = true }

    val scale by animateFloatAsState(
        targetValue = if (animateIn) 1f else 0.92f,
        animationSpec = tween(durationMillis = 240, easing = FastOutSlowInEasing),
        label = "dialogScale",
    )
    val alpha by animateFloatAsState(
        targetValue = if (animateIn) 1f else 0f,
        animationSpec = tween(durationMillis = 220),
        label = "dialogAlpha",
    )

    return Modifier.graphicsLayer {
        this.alpha = alpha
        scaleX = scale
        scaleY = scale
    }
}

@Composable
private fun TimelineRow(label: String, value: String?) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, style = MaterialTheme.typography.bodySmall, color = TextMuted)
        Text(value?.let { formatApiDate(it) } ?: "-", style = MaterialTheme.typography.bodySmall, color = TextPrimary)
    }
}

@Composable
private fun DebugGpsCard(
    locationGranted: Boolean,
    lastSentAt: String?,
    lastPayload: String?,
    lastError: String?,
) {
    AetherPanel(
        modifier = Modifier.fillMaxWidth(),
        padding = PaddingValues(16.dp),
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Rounded.SettingsInputAntenna, contentDescription = null, tint = Primary, modifier = Modifier.size(20.dp))
                Text("Debug Tracking GPS", style = MaterialTheme.typography.titleLarge, color = TextPrimary)
            }
            DebugRow("Izin Lokasi", if (locationGranted) "Diberikan" else "Belum diizinkan")
            DebugRow("GPS Terkirim Terakhir", lastSentAt ?: "Belum pernah")
            DebugRow("Payload Terakhir", lastPayload ?: "-")
            if (!lastError.isNullOrBlank()) {
                Spacer(Modifier.height(2.dp))
                AlertBanner(message = "Error: $lastError", type = AlertType.Error)
            }
        }
    }
}

@Composable
private fun DebugRow(label: String, value: String) {
    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(label.uppercase(), style = MaterialTheme.typography.labelSmall, color = TextMuted)
        Text(value, style = MaterialTheme.typography.bodySmall, color = TextPrimary)
    }
}

@Composable
private fun EmptyState() {
    // Deprecated: replaced with inline empty state
}

private fun currentTrackingStage(shipment: Shipment): String =
    shipment.tracking_stage ?: when (shipment.status) {
        "delivered"  -> "delivered"
        "in-transit" -> "in_transit"
        else         -> "ready_for_pickup"
    }

private fun nextTrackingStage(stage: String): String? = when (stage) {
    "ready_for_pickup"       -> "picked_up"
    "picked_up"              -> "in_transit"
    "in_transit"             -> "arrived_at_destination"
    "arrived_at_destination" -> "delivered"
    else                     -> null
}

private fun nextStageActionLabel(stage: String): String = when (stage) {
    "delivered"              -> "Tandai Terkirim"
    else                     -> "Update Status"
}

private fun trackingStageLabel(stage: String): String = when (stage) {
    "ready_for_pickup"       -> "Siap Diambil"
    "picked_up"              -> "Sudah Diambil"
    "in_transit"             -> "Dalam Perjalanan"
    "arrived_at_destination" -> "Sampai Gudang Tujuan"
    "delivered"              -> "Terkirim"
    else                     -> stage
}

private fun podVerificationLabel(status: String?): String = when (status) {
    "approved" -> "Disetujui Admin"
    "rejected" -> "Ditolak Admin"
    "pending" -> "Menunggu Verifikasi Admin"
    else -> "-"
}

private fun formatApiDate(value: String): String =
    value.replace("T", " ").replace("Z", "").take(16)

private fun extractApiError(response: Response<*> , fallback: String): String {
    val body = response.errorBody()?.string()?.takeIf { it.isNotBlank() } ?: return fallback

    return runCatching {
        val json = JSONObject(body)
        when {
            json.has("message") -> json.getString("message")
            json.has("errors") -> {
                val errors = json.getJSONObject("errors")
                val firstKey = errors.keys().asSequence().firstOrNull()
                firstKey?.let { key ->
                    errors.getJSONArray(key).optString(0).takeIf { it.isNotBlank() }
                } ?: fallback
            }
            else -> fallback
        }
    }.getOrDefault(fallback)
}

private fun ContentResolver.readImageAsBase64(uri: Uri): String? {
    openInputStream(uri)?.use { input ->
        val originalBitmap = BitmapFactory.decodeStream(input) ?: return null
        val maxDimension = max(originalBitmap.width, originalBitmap.height)
        val bitmap = if (maxDimension > 1600) {
            val scale = 1600f / maxDimension.toFloat()
            Bitmap.createScaledBitmap(
                originalBitmap,
                (originalBitmap.width * scale).roundToInt().coerceAtLeast(1),
                (originalBitmap.height * scale).roundToInt().coerceAtLeast(1),
                true
            )
        } else {
            originalBitmap
        }
        val out    = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 60, out)
        return "data:image/jpeg;base64,${Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)}"
    }
    return null
}
