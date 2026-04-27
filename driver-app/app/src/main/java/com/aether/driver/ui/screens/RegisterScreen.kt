package com.aether.driver.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBackIosNew
import androidx.compose.material.icons.rounded.Badge
import androidx.compose.material.icons.rounded.CreditCard
import androidx.compose.material.icons.rounded.DirectionsCar
import androidx.compose.material.icons.rounded.Email
import androidx.compose.material.icons.rounded.ErrorOutline
import androidx.compose.material.icons.rounded.HourglassTop
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.LockOpen
import androidx.compose.material.icons.rounded.NotificationsActive
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.PersonAdd
import androidx.compose.material.icons.rounded.Phone
import androidx.compose.material.icons.rounded.Send
import androidx.compose.material.icons.rounded.Visibility
import androidx.compose.material.icons.rounded.VisibilityOff
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
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
import com.aether.driver.data.model.RegisterRequest
import com.aether.driver.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun RegisterScreen(sessionManager: SessionManager, onBackToLogin: () -> Unit) {
    var name             by remember { mutableStateOf("") }
    var email            by remember { mutableStateOf("") }
    var phone            by remember { mutableStateOf("") }
    var licenseNumber    by remember { mutableStateOf("") }
    var password         by remember { mutableStateOf("") }
    var confirmPassword  by remember { mutableStateOf("") }
    var passwordVisible  by remember { mutableStateOf(false) }
    var isLoading        by remember { mutableStateOf(false) }
    var message          by remember { mutableStateOf<String?>(null) }
    var isError          by remember { mutableStateOf(false) }
    var registrationDone by remember { mutableStateOf(false) }
    val scope            = rememberCoroutineScope()
    val scrollState      = rememberScrollState()

    var cardVisible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { delay(200); cardVisible = true }

    if (registrationDone) {
        PendingApprovalScreen(onBackToLogin = onBackToLogin)
        return
    }

    Box(modifier = Modifier.fillMaxSize().background(Color(0xFFF9F8FD))) {
        // Decorative circles
        Box(modifier = Modifier.offset(x = (-60).dp, y = (-80).dp).size(200.dp).alpha(0.4f).clip(CircleShape).background(PrimaryLight))
        Box(modifier = Modifier.offset(x = 180.dp, y = 350.dp).size(140.dp).alpha(0.3f).clip(CircleShape).background(SecondaryLt))

        Column(
            modifier = Modifier.fillMaxSize().verticalScroll(scrollState).padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(Modifier.height(48.dp))

            // Back button
            Row(modifier = Modifier.fillMaxWidth()) {
                TextButton(onClick = onBackToLogin, contentPadding = PaddingValues(0.dp)) {
                    Icon(Icons.Rounded.ArrowBackIosNew, contentDescription = "Kembali",
                        tint = PrimaryDark, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Kembali ke Login", style = MaterialTheme.typography.labelLarge, color = PrimaryDark)
                }
            }

            Spacer(Modifier.height(16.dp))

            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Box(
                    modifier = Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(PrimaryLight.copy(alpha = 0.5f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Rounded.PersonAdd, contentDescription = null, tint = Primary, modifier = Modifier.size(26.dp))
                }
                Column {
                    Text("Daftar Driver", style = MaterialTheme.typography.displaySmall, color = PrimaryDark, fontWeight = FontWeight.Bold)
                    Text("Ajukan akun untuk persetujuan admin gudang",
                        style = MaterialTheme.typography.bodySmall, color = TextSecond)
                }
            }

            Spacer(Modifier.height(28.dp))

            AnimatedVisibility(
                visible = cardVisible,
                enter = fadeIn(tween(400)) + slideInVertically(tween(500, easing = androidx.compose.animation.core.FastOutSlowInEasing), initialOffsetY = { it / 6 }),
            ) {
                AetherPanel(modifier = Modifier.fillMaxWidth(), padding = PaddingValues(24.dp)) {
                    // Step 01
                    AetherFormSectionHeader(icon = Icons.Rounded.Person, number = "01", title = "Identitas Diri")
                    Spacer(Modifier.height(16.dp))

                    AetherTextField(value = name, onValueChange = { name = it }, label = "Nama Lengkap",
                        placeholder = "Budi Santoso",
                        leadingIcon = { Icon(Icons.Rounded.Badge, null, tint = TextMuted, modifier = Modifier.size(20.dp)) })
                    Spacer(Modifier.height(14.dp))
                    AetherTextField(value = email, onValueChange = { email = it }, label = "Email",
                        placeholder = "budi@email.com", keyboardType = KeyboardType.Email,
                        leadingIcon = { Icon(Icons.Rounded.Email, null, tint = TextMuted, modifier = Modifier.size(20.dp)) })
                    Spacer(Modifier.height(14.dp))
                    AetherTextField(value = phone, onValueChange = { phone = it },
                        label = "No. HP (Opsional)", placeholder = "08123456789", keyboardType = KeyboardType.Phone,
                        leadingIcon = { Icon(Icons.Rounded.Phone, null, tint = TextMuted, modifier = Modifier.size(20.dp)) })

                    Spacer(Modifier.height(24.dp))
                    Divider(color = Border)
                    Spacer(Modifier.height(20.dp))

                    // Step 02
                    AetherFormSectionHeader(icon = Icons.Rounded.DirectionsCar, number = "02", title = "Data Pengemudi")
                    Spacer(Modifier.height(16.dp))

                    AetherTextField(value = licenseNumber, onValueChange = { licenseNumber = it },
                        label = "Nomor SIM", placeholder = "1234567890", keyboardType = KeyboardType.Number,
                        leadingIcon = { Icon(Icons.Rounded.CreditCard, null, tint = TextMuted, modifier = Modifier.size(20.dp)) })

                    Spacer(Modifier.height(12.dp))
                    Surface(color = PrimaryLight, shape = RoundedCornerShape(10.dp)) {
                        Row(modifier = Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Rounded.Info, null, tint = Primary, modifier = Modifier.size(16.dp))
                            Text("Foto KTP diserahkan langsung ke admin untuk diunggah saat verifikasi.",
                                style = MaterialTheme.typography.bodySmall, color = PrimaryDark)
                        }
                    }

                    Spacer(Modifier.height(24.dp))
                    Divider(color = Border)
                    Spacer(Modifier.height(20.dp))

                    // Step 03
                    AetherFormSectionHeader(icon = Icons.Rounded.Lock, number = "03", title = "Keamanan Akun")
                    Spacer(Modifier.height(16.dp))

                    AetherTextField(
                        value = password, onValueChange = { password = it },
                        label = "Password", placeholder = "Min. 8 karakter",
                        keyboardType = KeyboardType.Password,
                        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        leadingIcon = { Icon(Icons.Rounded.Lock, null, tint = TextMuted, modifier = Modifier.size(20.dp)) },
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(if (passwordVisible) Icons.Rounded.VisibilityOff else Icons.Rounded.Visibility,
                                    null, tint = TextMuted, modifier = Modifier.size(20.dp))
                            }
                        },
                    )
                    Spacer(Modifier.height(14.dp))
                    AetherTextField(
                        value = confirmPassword, onValueChange = { confirmPassword = it },
                        label = "Konfirmasi Password", placeholder = "Ulangi password",
                        keyboardType = KeyboardType.Password,
                        visualTransformation = PasswordVisualTransformation(),
                        isError = confirmPassword.isNotBlank() && confirmPassword != password,
                        leadingIcon = { Icon(Icons.Rounded.LockOpen, null, tint = TextMuted, modifier = Modifier.size(20.dp)) },
                    )
                    if (confirmPassword.isNotBlank() && confirmPassword != password) {
                        Spacer(Modifier.height(6.dp))
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Icon(Icons.Rounded.ErrorOutline, null, tint = Danger, modifier = Modifier.size(14.dp))
                            Text("Password tidak sama", style = MaterialTheme.typography.bodySmall, color = Danger)
                        }
                    }

                    message?.let {
                        Spacer(Modifier.height(16.dp))
                        AlertBanner(message = it, type = if (isError) AlertType.Error else AlertType.Success)
                    }

                    Spacer(Modifier.height(24.dp))

                    AetherPrimaryButton(
                        onClick = {
                            if (password != confirmPassword) { isError = true; message = "Konfirmasi password tidak sama."; return@AetherPrimaryButton }
                            isLoading = true
                            scope.launch {
                                try {
                                    val api = RetrofitClient.getApiService(sessionManager)
                                    val resp = api.register(RegisterRequest(name = name.trim(), email = email.trim(),
                                        password = password, phone = phone.ifBlank { null }, license_number = licenseNumber.trim()))
                                    if (resp.isSuccessful) { registrationDone = true }
                                    else { isError = true; message = "Registrasi gagal. Periksa kembali data Anda." }
                                } catch (_: Exception) { isError = true; message = "Tidak dapat mengirim registrasi. Periksa koneksi dan URL server." }
                                finally { isLoading = false }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !isLoading && name.isNotBlank() && email.isNotBlank() &&
                            licenseNumber.isNotBlank() && password.isNotBlank() && password == confirmPassword,
                        isLoading = isLoading,
                        text = "AJUKAN REGISTRASI",
                        leadingIcon = Icons.Rounded.Send,
                    )
                }
            }

            Spacer(Modifier.height(20.dp))
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
                Text("Sudah punya akun? ", style = MaterialTheme.typography.bodySmall, color = TextSecond)
                TextButton(onClick = onBackToLogin, contentPadding = PaddingValues(0.dp)) {
                    Text("Masuk", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.ExtraBold, color = Primary)
                }
            }
            Spacer(Modifier.height(32.dp))
        }
    }
}

@Composable
fun PendingApprovalScreen(onBackToLogin: () -> Unit) {
    Box(modifier = Modifier.fillMaxSize().background(Color(0xFFF9F8FD)), contentAlignment = Alignment.Center) {
        Column(modifier = Modifier.padding(40.dp), horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)) {

            Box(modifier = Modifier.size(100.dp).clip(RoundedCornerShape(28.dp)).background(PrimaryLight),
                contentAlignment = Alignment.Center) {
                Icon(Icons.Rounded.HourglassTop, contentDescription = null, tint = Primary, modifier = Modifier.size(52.dp))
            }

            Text("Menunggu Verifikasi", style = MaterialTheme.typography.displaySmall,
                color = PrimaryDark, textAlign = TextAlign.Center, fontWeight = FontWeight.Bold)
            Text("Akun Anda telah diajukan. Admin gudang akan meninjau dan menyetujui akses Anda.",
                style = MaterialTheme.typography.bodyMedium, color = TextSecond, textAlign = TextAlign.Center)

            Surface(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp), color = PrimaryLight.copy(alpha = 0.5f)) {
                Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Rounded.NotificationsActive, null, tint = Primary, modifier = Modifier.size(24.dp))
                    Column {
                        Text("Status: MENUNGGU PERSETUJUAN", style = MaterialTheme.typography.labelMedium, color = Primary, fontWeight = FontWeight.Bold)
                        Text("Anda bisa login setelah admin menyetujui akun.",
                            style = MaterialTheme.typography.bodySmall, color = TextSecond)
                    }
                }
            }

            Spacer(Modifier.height(8.dp))
            AetherSecondaryButton(
                text = "Kembali ke Login",
                onClick = onBackToLogin,
                modifier = Modifier.fillMaxWidth(),
                leadingIcon = Icons.Rounded.ArrowBackIosNew,
            )
        }
    }
}
