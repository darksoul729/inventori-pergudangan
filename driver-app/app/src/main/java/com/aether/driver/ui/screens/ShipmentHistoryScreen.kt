package com.aether.driver.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowForward
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Inventory2
import androidx.compose.material.icons.rounded.Notes
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.aether.driver.api.RetrofitClient
import com.aether.driver.data.SessionManager
import com.aether.driver.data.model.Shipment
import com.aether.driver.ui.theme.*
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

@Composable
fun ShipmentHistoryScreen(
    sessionManager: SessionManager,
    onBackToActive: () -> Unit,
) {
    var history by remember { mutableStateOf<List<Shipment>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    suspend fun loadHistory() {
        try {
            val api = RetrofitClient.getApiService(sessionManager)
            val resp = api.getShipmentHistory()
            if (resp.isSuccessful) {
                history = resp.body()?.data ?: emptyList()
                errorMessage = null
            } else {
                errorMessage = "Gagal memuat riwayat pengiriman."
            }
        } catch (_: Exception) {
            errorMessage = "Tidak dapat memuat riwayat pengiriman. Periksa koneksi dan URL server."
        } finally {
            isLoading = false
        }
    }

    LaunchedEffect(Unit) { loadHistory() }

    Scaffold(
        topBar = {
            AetherWorkspaceHeader(
                title = "Riwayat Pengiriman",
                subtitle = "Petayu Driver",
                onBack = onBackToActive,
            )
        },
        containerColor = Surface,
    ) { paddingValues ->
        Box(
            modifier = Modifier.fillMaxSize().padding(paddingValues).background(Surface),
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 16.dp, bottom = 32.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                errorMessage?.let { msg ->
                    item { AlertBanner(message = msg, type = AlertType.Error) }
                }

                if (isLoading) {
                    item {
                        Box(Modifier.fillMaxWidth().padding(48.dp), contentAlignment = Alignment.Center) {
                            AppWarehouseLoader(label = "Memuat riwayat pengiriman...", modifier = Modifier.fillMaxWidth())
                        }
                    }
                }

                if (!isLoading && history.isEmpty() && errorMessage == null) {
                    item {
                        Column(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 64.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                        ) {
                            Box(
                                modifier = Modifier.size(80.dp).clip(RoundedCornerShape(24.dp)).background(PrimaryLight),
                                contentAlignment = Alignment.Center,
                            ) {
                                Icon(Icons.Rounded.Inventory2, contentDescription = null, tint = Primary, modifier = Modifier.size(40.dp))
                            }
                            Spacer(Modifier.height(20.dp))
                            Text("Belum Ada Riwayat", style = MaterialTheme.typography.titleLarge, color = TextPrimary, fontWeight = FontWeight.Bold)
                            Spacer(Modifier.height(8.dp))
                            Text("Pengiriman yang selesai akan muncul di sini",
                                style = MaterialTheme.typography.bodyMedium, color = TextMuted, textAlign = TextAlign.Center)
                        }
                    }
                }

                itemsIndexed(history, key = { _, item -> item.id }) { index, shipment ->
                    var visible by remember(shipment.id) { mutableStateOf(false) }
                    LaunchedEffect(shipment.id) {
                        kotlinx.coroutines.delay((index * 40L).coerceAtMost(220L))
                        visible = true
                    }

                    AnimatedVisibility(
                        visible = visible,
                        enter = fadeIn(tween(240)) + slideInVertically(tween(260), initialOffsetY = { it / 6 }),
                    ) {
                        HistoryCard(shipment = shipment)
                    }
                }
            }
        }
    }
}

@Composable
private fun HistoryCard(shipment: Shipment) {
    AetherPanel(modifier = Modifier.fillMaxWidth(), padding = PaddingValues(20.dp)) {
        // Header row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Box(
                    modifier = Modifier.size(40.dp).clip(RoundedCornerShape(10.dp)).background(PrimaryLight),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("#${shipment.shipment_id}", style = MaterialTheme.typography.labelSmall, color = Primary, fontWeight = FontWeight.Bold)
                }
                Column {
                    SectionLabel("ID Pengiriman")
                    Text("#${shipment.shipment_id}", style = MaterialTheme.typography.headlineMedium, color = Primary, fontWeight = FontWeight.Bold)
                }
            }
            AetherStatusBadge(label = shipment.tracking_stage_label ?: "Terkirim", stage = "delivered")
        }

        Spacer(Modifier.height(16.dp))
        Divider(color = Border)
        Spacer(Modifier.height(16.dp))

        // Route
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                SectionLabel("Asal")
                Spacer(Modifier.height(4.dp))
                Text(shipment.origin_name, style = MaterialTheme.typography.titleMedium, color = TextPrimary, fontWeight = FontWeight.SemiBold)
            }
            Box(
                modifier = Modifier.size(32.dp).clip(RoundedCornerShape(8.dp)).background(PrimaryLight),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Rounded.ArrowForward, contentDescription = null, tint = Primary, modifier = Modifier.size(16.dp))
            }
            Column(modifier = Modifier.weight(1f), horizontalAlignment = Alignment.End) {
                SectionLabel("Tujuan")
                Spacer(Modifier.height(4.dp))
                Text(shipment.destination_name, style = MaterialTheme.typography.titleMedium, color = TextPrimary, textAlign = TextAlign.End, fontWeight = FontWeight.SemiBold)
            }
        }

        // Delivery info
        shipment.delivered_at?.let { deliveredAt ->
            Spacer(Modifier.height(12.dp))
            Surface(color = SuccessLight, shape = RoundedCornerShape(10.dp)) {
                Row(modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Rounded.CheckCircle, contentDescription = null, tint = Success, modifier = Modifier.size(16.dp))
                    Text("Terkirim: ${formatApiDate(deliveredAt)}", style = MaterialTheme.typography.bodySmall, color = Success, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        shipment.delivery_recipient_name?.let { recipient ->
            Spacer(Modifier.height(8.dp))
            Surface(color = PrimaryLight.copy(alpha = 0.3f), shape = RoundedCornerShape(10.dp)) {
                Row(modifier = Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Rounded.Person, contentDescription = null, tint = Primary, modifier = Modifier.size(16.dp))
                    Column {
                        SectionLabel("Diterima Oleh")
                        Text(recipient, style = MaterialTheme.typography.bodySmall, color = TextPrimary, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }

        shipment.delivery_note?.let { note ->
            Spacer(Modifier.height(8.dp))
            Surface(color = PrimaryLight.copy(alpha = 0.3f), shape = RoundedCornerShape(10.dp)) {
                Row(modifier = Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(Icons.Rounded.Notes, contentDescription = null, tint = TextSecond, modifier = Modifier.size(16.dp))
                    Column {
                        SectionLabel("Catatan")
                        Text(note, style = MaterialTheme.typography.bodySmall, color = TextSecond)
                    }
                }
            }
        }
    }
}

private fun formatApiDate(dateString: String): String {
    return try {
        val formats = listOf(DateTimeFormatter.ISO_DATE_TIME, DateTimeFormatter.ISO_OFFSET_DATE_TIME, DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        var parsed: LocalDateTime? = null
        for (format in formats) { try { parsed = LocalDateTime.parse(dateString, format); break } catch (_: Exception) { continue } }
        parsed?.format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm", Locale("id", "ID"))) ?: dateString
    } catch (_: Exception) { dateString }
}
