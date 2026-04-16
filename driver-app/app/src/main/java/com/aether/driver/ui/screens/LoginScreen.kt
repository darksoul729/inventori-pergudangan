package com.aether.driver.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.DirectionsCar
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.Email
import androidx.compose.material.icons.rounded.Visibility
import androidx.compose.material.icons.rounded.VisibilityOff
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.aether.driver.api.RetrofitClient
import com.aether.driver.data.SessionManager
import com.aether.driver.data.model.LoginRequest
import com.aether.driver.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    sessionManager: SessionManager,
    onLoginSuccess: () -> Unit,
    onOpenRegister: () -> Unit,
    onOpenServerSettings: () -> Unit,
) {
    var email           by remember { mutableStateOf("") }
    var password        by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var isLoading       by remember { mutableStateOf(false) }
    var errorMessage    by remember { mutableStateOf<String?>(null) }
    val scope           = rememberCoroutineScope()
    val scrollState     = rememberScrollState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Surface)
    ) {
        // ── Gradient header ───────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(280.dp)
                .background(Brush.verticalGradient(listOf(PrimaryDeep, Primary, Surface)))
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(Modifier.height(72.dp))

            // ── App icon ──────────────────────────────────────────────────
            Box(
                modifier = Modifier
                    .size(76.dp)
                    .clip(RoundedCornerShape(22.dp))
                    .background(Color.White)
                    .border(2.dp, Border, RoundedCornerShape(22.dp)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Rounded.DirectionsCar,
                    contentDescription = "App Icon",
                    tint     = Primary,
                    modifier = Modifier.size(40.dp),
                )
            }

            Spacer(Modifier.height(20.dp))

            Text(
                text      = "AETHER DRIVER",
                style     = MaterialTheme.typography.displayMedium,
                color     = Color.White,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text      = "Sistem logistik & pengiriman gudang",
                style     = MaterialTheme.typography.bodyMedium,
                color     = Color.White.copy(alpha = 0.75f),
                textAlign = TextAlign.Center,
            )

            Spacer(Modifier.height(40.dp))

            // ── Login card ────────────────────────────────────────────────
            AetherPanel(
                modifier = Modifier.fillMaxWidth(),
                padding = PaddingValues(28.dp),
            ) {
                    Text(
                        text  = "Masuk ke Akun",
                        style = MaterialTheme.typography.headlineMedium,
                        color = TextPrimary,
                    )
                    Text(
                        text     = "Gunakan email & password yang terdaftar",
                        style    = MaterialTheme.typography.bodySmall,
                        color    = TextMuted,
                        modifier = Modifier.padding(top = 2.dp, bottom = 24.dp),
                    )

                    // Email
                    AetherTextField(
                        value         = email,
                        onValueChange = { email = it; errorMessage = null },
                        label         = "Email",
                        placeholder   = "nama@email.com",
                        keyboardType  = KeyboardType.Email,
                        leadingIcon   = {
                            Icon(Icons.Rounded.Email, contentDescription = null,
                                tint = if (email.isNotBlank()) Primary else TextMuted,
                                modifier = Modifier.size(20.dp))
                        },
                    )

                    Spacer(Modifier.height(14.dp))

                    // Password
                    AetherTextField(
                        value                = password,
                        onValueChange        = { password = it; errorMessage = null },
                        label                = "Password",
                        placeholder          = "••••••••",
                        keyboardType         = KeyboardType.Password,
                        visualTransformation = if (passwordVisible) VisualTransformation.None
                                               else PasswordVisualTransformation(),
                        leadingIcon = {
                            Icon(Icons.Rounded.Lock, contentDescription = null,
                                tint = if (password.isNotBlank()) Primary else TextMuted,
                                modifier = Modifier.size(20.dp))
                        },
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    imageVector = if (passwordVisible) Icons.Rounded.VisibilityOff
                                                  else Icons.Rounded.Visibility,
                                    contentDescription = if (passwordVisible) "Sembunyikan" else "Tampilkan",
                                    tint = TextMuted,
                                    modifier = Modifier.size(20.dp),
                                )
                            }
                        },
                    )

                    // Error
                    errorMessage?.let {
                        Spacer(Modifier.height(12.dp))
                        AlertBanner(message = it, type = AlertType.Error)
                    }

                    Spacer(Modifier.height(24.dp))

                    AetherPrimaryButton(
                        text = "MASUK",
                        onClick = {
                            isLoading = true
                            scope.launch {
                                try {
                                    val api = RetrofitClient.getApiService(sessionManager)
                                    val response = api.login(LoginRequest(email.trim(), password))
                                    if (response.isSuccessful) {
                                        response.body()?.let { body ->
                                            sessionManager.saveToken(body.token)
                                            sessionManager.saveDriverProfile(
                                                name = body.user.name,
                                                email = body.user.email,
                                                licenseNumber = body.driver.license_number,
                                                status = body.driver.status,
                                            )
                                            onLoginSuccess()
                                        } ?: run { errorMessage = "Token tidak ditemukan." }
                                    } else {
                                        errorMessage = when (response.code()) {
                                            401  -> "Email atau password salah."
                                            403  -> "Akun belum disetujui atau ditangguhkan. Hubungi admin."
                                            else -> "Login gagal (${response.code()}). Coba lagi."
                                        }
                                    }
                                } catch (_: Exception) {
                                    errorMessage = "Tidak dapat terhubung ke server. Periksa URL di Pengaturan."
                                } finally {
                                    isLoading = false
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = email.isNotBlank() && password.isNotBlank(),
                        isLoading = isLoading,
                    )

                    Spacer(Modifier.height(10.dp))

                    AetherSecondaryButton(
                        text = "Atur Server/IP Dulu",
                        onClick = onOpenServerSettings,
                        modifier = Modifier.fillMaxWidth(),
                        leadingIcon = Icons.Rounded.Settings,
                    )
            }

            Spacer(Modifier.height(20.dp))

            // ── Register link ─────────────────────────────────────────────
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
                Text("Belum punya akun? ", style = MaterialTheme.typography.bodySmall, color = TextSecond)
                TextButton(onClick = onOpenRegister, contentPadding = PaddingValues(0.dp)) {
                    Text("Daftar Driver", style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.ExtraBold, color = Primary)
                }
            }

            Spacer(Modifier.height(32.dp))
        }
    }
}
