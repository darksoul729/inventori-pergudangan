package com.aether.driver.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Email
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material.icons.rounded.Visibility
import androidx.compose.material.icons.rounded.VisibilityOff
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aether.driver.R
import com.aether.driver.api.RetrofitClient
import com.aether.driver.data.SessionManager
import com.aether.driver.data.model.LoginRequest
import com.aether.driver.ui.theme.*
import kotlinx.coroutines.delay
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

    // Entrance animations
    val logoScale = remember { Animatable(0.5f) }
    val logoAlpha = remember { Animatable(0f) }
    var cardVisible by remember { mutableStateOf(false) }
    var footerVisible by remember { mutableStateOf(false) }

    // Floating glow behind logo
    val infiniteTransition = rememberInfiniteTransition(label = "loginGlow")
    val glowPulse by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(2500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "glowPulse",
    )

    LaunchedEffect(Unit) {
        launch { logoAlpha.animateTo(1f, tween(600, easing = FastOutSlowInEasing)) }
        logoScale.animateTo(1f, tween(800, easing = FastOutSlowInEasing))
        delay(250)
        cardVisible = true
        delay(350)
        footerVisible = true
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9F8FD)),
    ) {
        // ── Decorative circles ────────────────────────────────────────────
        Box(
            modifier = Modifier
                .offset(x = (-60).dp, y = (-80).dp)
                .size(200.dp)
                .alpha(0.4f)
                .clip(CircleShape)
                .background(PrimaryLight),
        )
        Box(
            modifier = Modifier
                .offset(x = 180.dp, y = 350.dp)
                .size(140.dp)
                .alpha(0.3f)
                .clip(CircleShape)
                .background(SecondaryLt),
        )
        Box(
            modifier = Modifier
                .offset(x = (-30).dp, y = 600.dp)
                .size(100.dp)
                .alpha(0.5f)
                .clip(CircleShape)
                .background(PrimaryLight),
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(horizontal = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(Modifier.height(70.dp))

            // ── Logo with glow ────────────────────────────────────────────
            Box(contentAlignment = Alignment.Center) {
                Box(
                    modifier = Modifier
                        .size(130.dp)
                        .scale(glowPulse)
                        .alpha(0.5f)
                        .clip(CircleShape)
                        .background(
                            Brush.radialGradient(
                                colors = listOf(PrimaryLight, Color.Transparent),
                            )
                        ),
                )
                Box(
                    modifier = Modifier
                        .graphicsLayer {
                            this.alpha = logoAlpha.value
                        }
                        .scale(logoScale.value),
                    contentAlignment = Alignment.Center,
                ) {
                    Box(
                        modifier = Modifier
                            .size(108.dp)
                            .clip(CircleShape)
                            .background(PrimaryLight.copy(alpha = 0.4f)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Box(
                            modifier = Modifier
                                .size(90.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                                .border(1.dp, BorderSoft, CircleShape),
                            contentAlignment = Alignment.Center,
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.logo_petayu),
                                contentDescription = "Petayu Logo",
                                modifier = Modifier.size(68.dp),
                                contentScale = ContentScale.Fit,
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(24.dp))

            Text(
                text = "PETAYU DRIVER",
                style = MaterialTheme.typography.displayMedium.copy(
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp,
                ),
                color = PrimaryDark,
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text = "Sistem Logistik & Pengiriman Gudang",
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontWeight = FontWeight.Medium,
                ),
                color = TextSecond,
            )

            Spacer(Modifier.height(36.dp))

            // ── Login card ────────────────────────────────────────────────
            AnimatedVisibility(
                visible = cardVisible,
                enter = fadeIn(tween(400)) + slideInVertically(
                    tween(500, easing = FastOutSlowInEasing),
                    initialOffsetY = { it / 6 },
                ),
            ) {
                AetherPanel(
                    modifier = Modifier.fillMaxWidth(),
                    padding = PaddingValues(24.dp),
                ) {
                        Text(
                            text = "Masuk ke Akun",
                            style = MaterialTheme.typography.headlineMedium,
                            color = TextPrimary,
                        )
                        Text(
                            text = "Gunakan email & password yang terdaftar",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextMuted,
                            modifier = Modifier.padding(top = 2.dp, bottom = 20.dp),
                        )

                        AetherTextField(
                            value = email,
                            onValueChange = { email = it; errorMessage = null },
                            label = "Email",
                            placeholder = "nama@email.com",
                            keyboardType = KeyboardType.Email,
                            leadingIcon = {
                                Icon(Icons.Rounded.Email, contentDescription = null,
                                    tint = if (email.isNotBlank()) Primary else TextMuted,
                                    modifier = Modifier.size(20.dp))
                            },
                        )

                        Spacer(Modifier.height(14.dp))

                        AetherTextField(
                            value = password,
                            onValueChange = { password = it; errorMessage = null },
                            label = "Password",
                            placeholder = "••••••••",
                            keyboardType = KeyboardType.Password,
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
                                                401 -> "Email atau password salah."
                                                403 -> "Akun belum disetujui atau ditangguhkan. Hubungi admin."
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
            }

            Spacer(Modifier.height(20.dp))

            AnimatedVisibility(
                visible = footerVisible,
                enter = fadeIn(tween(300)) + slideInVertically(tween(350), initialOffsetY = { it / 8 }),
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center,
                ) {
                    Text("Belum punya akun? ", style = MaterialTheme.typography.bodySmall, color = TextSecond)
                    TextButton(onClick = onOpenRegister, contentPadding = PaddingValues(0.dp)) {
                        Text("Daftar Driver", style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.ExtraBold, color = Primary)
                    }
                }
            }

            Spacer(Modifier.height(32.dp))
        }
    }
}
