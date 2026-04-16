package com.aether.driver.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.aether.driver.BuildConfig
import com.aether.driver.data.SessionManager
import com.aether.driver.ui.theme.*
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

@Composable
fun ServerSettingsScreen(sessionManager: SessionManager, onBack: () -> Unit) {
    val scope       = rememberCoroutineScope()
    var serverUrl   by remember { mutableStateOf("") }
    var isSaved     by remember { mutableStateOf(false) }
    val scrollState = rememberScrollState()

    LaunchedEffect(Unit) {
        serverUrl = sessionManager.serverUrl.first() ?: ""
    }

    Scaffold(
        topBar = {
            Surface(
                color = Card,
                shadowElevation = 1.dp,
            ) {
                AetherWorkspaceHeader(
                    title = "Konfigurasi Server",
                    subtitle = "Aether Driver",
                    onBack = onBack,
                )
            }
        },
        containerColor = Surface,
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Surface,
                            PrimaryLight.copy(alpha = 0.3f),
                            Surface,
                        )
                    )
                ),
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(scrollState)
                    .padding(horizontal = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Spacer(Modifier.height(20.dp))

                AetherPanel(
                    modifier = Modifier.fillMaxWidth(),
                    padding = PaddingValues(28.dp),
                ) {

                    Text(
                        text  = "Base URL Server",
                        style = MaterialTheme.typography.headlineMedium,
                        color = TextPrimary,
                    )
                    Text(
                        text  = "Kosongkan untuk menggunakan URL default dari build config.",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextMuted,
                        modifier = Modifier.padding(top = 4.dp, bottom = 20.dp),
                    )

                    AetherTextField(
                        value         = serverUrl,
                        onValueChange = { serverUrl = it; isSaved = false },
                        label         = "URL Server",
                        placeholder   = "http://192.168.1.10:8000/",
                        keyboardType  = KeyboardType.Uri,
                        leadingIcon   = { Icon(Icons.Rounded.Link, contentDescription = null, tint = TextMuted, modifier = Modifier.size(20.dp)) }
                    )

                    Spacer(Modifier.height(10.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment     = Alignment.CenterVertically,
                    ) {
                        Icon(Icons.Rounded.CloudQueue, contentDescription = null, tint = TextMuted, modifier = Modifier.size(18.dp))
                        Column {
                            Text(
                                text  = "Default dari BuildConfig:",
                                style = MaterialTheme.typography.labelSmall,
                                color = TextMuted,
                            )
                            Text(
                                text  = BuildConfig.DRIVER_API_BASE_URL,
                                style = MaterialTheme.typography.bodySmall,
                                color = TextSecond,
                                fontWeight = FontWeight.SemiBold,
                            )
                        }
                    }

                    Spacer(Modifier.height(24.dp))

                    AetherPrimaryButton(
                        text = if (isSaved) "Tersimpan" else "Simpan URL",
                        onClick = {
                            scope.launch {
                                sessionManager.saveServerUrl(serverUrl.trim())
                                isSaved = true
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        leadingIcon = if (isSaved) Icons.Rounded.Check else Icons.Rounded.Save,
                    )

                    if (serverUrl.isNotBlank()) {
                        Spacer(Modifier.height(12.dp))
                        AetherSecondaryButton(
                            text = "Hapus & Reset ke Default",
                            onClick  = {
                                serverUrl = ""
                                scope.launch {
                                    sessionManager.saveServerUrl("")
                                    isSaved = true
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            leadingIcon = Icons.Rounded.DeleteOutline,
                            danger = true,
                        )
                    }
                }

                Spacer(Modifier.height(24.dp))

                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape    = MaterialTheme.shapes.extraLarge,
                    color    = PrimaryLight,
                ) {
                    Column(
                        modifier            = Modifier.padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment     = Alignment.CenterVertically,
                        ) {
                            Icon(Icons.Rounded.Lightbulb, contentDescription = null, tint = Primary, modifier = Modifier.size(18.dp))
                            Text(
                                text  = "Panduan Koneksi",
                                style = MaterialTheme.typography.titleMedium,
                                color = Primary,
                            )
                        }
                        TipRow(tip = "Pastikan HP dan laptop/server terhubung ke WiFi yang sama.")
                        TipRow(tip = "Cari IP laptop: jalankan 'ipconfig' (Windows) atau 'ip a' (Linux).")
                        TipRow(tip = "Format URL: http://192.168.x.x:8000/ (sertakan trailing slash).")
                        TipRow(tip = "Pastikan server Laravel sudah berjalan: 'php artisan serve --host=0.0.0.0'.")
                    }
                }

                Spacer(Modifier.height(32.dp))
            }
        }
    }
}

@Composable
private fun TipRow(tip: String) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment     = Alignment.Top,
    ) {
        Icon(Icons.Rounded.Circle, contentDescription = null, tint = Primary, modifier = Modifier.size(6.dp).padding(top = 6.dp))
        Text(
            text  = tip,
            style = MaterialTheme.typography.bodySmall,
            color = PrimaryDark,
        )
    }
}
