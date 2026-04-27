package com.aether.driver.ui.screens

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Circle
import androidx.compose.material.icons.rounded.CloudQueue
import androidx.compose.material.icons.rounded.DeleteOutline
import androidx.compose.material.icons.rounded.Link
import androidx.compose.material.icons.rounded.Lightbulb
import androidx.compose.material.icons.rounded.Save
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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
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

    LaunchedEffect(Unit) { serverUrl = sessionManager.serverUrl.first() ?: "" }

    Scaffold(
        topBar = {
            AetherWorkspaceHeader(
                title = "Konfigurasi Server",
                subtitle = "Petayu Driver",
                onBack = onBack,
            )
        },
        containerColor = Surface,
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize().padding(paddingValues).background(Surface)) {
            Column(
                modifier = Modifier.fillMaxSize().verticalScroll(scrollState).padding(horizontal = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Spacer(Modifier.height(20.dp))

                AetherPanel(modifier = Modifier.fillMaxWidth(), padding = PaddingValues(24.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Box(
                            modifier = Modifier.size(40.dp).clip(RoundedCornerShape(10.dp)).background(PrimaryLight),
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(Icons.Rounded.Link, contentDescription = null, tint = Primary, modifier = Modifier.size(20.dp))
                        }
                        Column {
                            Text("Base URL Server", style = MaterialTheme.typography.headlineMedium, color = TextPrimary, fontWeight = FontWeight.Bold)
                            Text("Kosongkan untuk menggunakan URL default dari build config.",
                                style = MaterialTheme.typography.bodySmall, color = TextMuted)
                        }
                    }

                    Spacer(Modifier.height(20.dp))

                    AetherTextField(
                        value = serverUrl,
                        onValueChange = { serverUrl = it; isSaved = false },
                        label = "URL Server",
                        placeholder = "http://192.168.1.10:8000/",
                        keyboardType = KeyboardType.Uri,
                        leadingIcon = { Icon(Icons.Rounded.Link, contentDescription = null, tint = TextMuted, modifier = Modifier.size(20.dp)) }
                    )

                    Spacer(Modifier.height(10.dp))
                    Surface(color = PrimaryLight.copy(alpha = 0.3f), shape = RoundedCornerShape(10.dp)) {
                        Row(modifier = Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Rounded.CloudQueue, contentDescription = null, tint = Primary, modifier = Modifier.size(18.dp))
                            Column {
                                Text("Default dari BuildConfig:", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                                Text(BuildConfig.DRIVER_API_BASE_URL, style = MaterialTheme.typography.bodySmall, color = TextSecond, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }

                    Spacer(Modifier.height(24.dp))

                    AetherPrimaryButton(
                        text = if (isSaved) "Tersimpan" else "Simpan URL",
                        onClick = { scope.launch { sessionManager.saveServerUrl(serverUrl.trim()); isSaved = true } },
                        modifier = Modifier.fillMaxWidth(),
                        leadingIcon = if (isSaved) Icons.Rounded.Check else Icons.Rounded.Save,
                    )

                    if (serverUrl.isNotBlank()) {
                        Spacer(Modifier.height(12.dp))
                        AetherSecondaryButton(
                            text = "Hapus & Reset ke Default",
                            onClick = { serverUrl = ""; scope.launch { sessionManager.saveServerUrl(""); isSaved = true } },
                            modifier = Modifier.fillMaxWidth(),
                            leadingIcon = Icons.Rounded.DeleteOutline,
                            danger = true,
                        )
                    }
                }

                Spacer(Modifier.height(24.dp))

                // Tips section
                AetherPanel(modifier = Modifier.fillMaxWidth(), padding = PaddingValues(20.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(
                            modifier = Modifier.size(32.dp).clip(RoundedCornerShape(8.dp)).background(SecondaryLt),
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(Icons.Rounded.Lightbulb, contentDescription = null, tint = Secondary, modifier = Modifier.size(16.dp))
                        }
                        Text("Panduan Koneksi", style = MaterialTheme.typography.titleMedium, color = Primary, fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.height(14.dp))
                    TipRow(tip = "Pastikan HP dan laptop/server terhubung ke WiFi yang sama.")
                    TipRow(tip = "Cari IP laptop: jalankan 'ipconfig' (Windows) atau 'ip a' (Linux).")
                    TipRow(tip = "Format URL: http://192.168.x.x:8000/ (sertakan trailing slash).")
                    TipRow(tip = "Pastikan server Laravel sudah berjalan: 'php artisan serve --host=0.0.0.0'.")
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
        verticalAlignment = Alignment.Top,
        modifier = Modifier.padding(bottom = 6.dp),
    ) {
        Icon(Icons.Rounded.Circle, contentDescription = null, tint = Primary, modifier = Modifier.size(6.dp).padding(top = 6.dp))
        Text(tip, style = MaterialTheme.typography.bodySmall, color = TextSecond)
    }
}
