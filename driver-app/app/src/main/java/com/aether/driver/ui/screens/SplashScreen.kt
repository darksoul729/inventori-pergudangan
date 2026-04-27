package com.aether.driver.ui.screens

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aether.driver.R
import androidx.compose.foundation.border
import com.aether.driver.ui.theme.BorderSoft
import com.aether.driver.ui.theme.PrimaryLight
import com.aether.driver.ui.theme.SecondaryLt
import com.aether.driver.ui.theme.TextMuted
import com.aether.driver.ui.theme.TextSecond
import com.aether.driver.ui.theme.PrimaryDark
import com.aether.driver.ui.theme.Primary
import com.aether.driver.ui.theme.Secondary
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.sin

@Composable
private fun FloatingParticle(
    delayMs: Int,
    startX: Float,
    startY: Float,
    size: Float,
    color: Color,
) {
    val infiniteTransition = rememberInfiniteTransition(label = "particle$delayMs")
    val floatY by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 4000 + delayMs, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "floatY",
    )
    val floatX by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 3000 + delayMs, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "floatX",
    )
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.1f,
        targetValue = 0.45f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2000 + delayMs, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "pulseAlpha",
    )

    Box(
        modifier = Modifier
            .offset(
                x = (startX + sin(floatX * 3.14f) * 20f).dp,
                y = (startY + floatY * 30f - 15f).dp,
            )
            .size(size.dp)
            .alpha(pulseAlpha)
            .clip(CircleShape)
            .background(color),
    )
}

@Composable
private fun LoadingBar(progress: Float, alpha: Float) {
    Column(
        modifier = Modifier
            .fillMaxWidth(0.55f)
            .graphicsLayer { this.alpha = alpha },
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp)
                .clip(RoundedCornerShape(2.dp))
                .background(BorderSoft),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(fraction = progress.coerceIn(0f, 1f))
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(
                        Brush.horizontalGradient(
                            colors = listOf(Primary, Secondary, Primary),
                        ),
                    ),
            )
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text = when {
                progress < 0.3f -> "Menghubungkan..."
                progress < 0.7f -> "Menyiapkan..."
                else -> "Hampir selesai..."
            },
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.Medium,
                letterSpacing = 0.5.sp,
            ),
            color = TextMuted,
        )
    }
}

@Composable
fun PetayuSplashScreen(
    onSplashFinished: () -> Unit,
) {
    val logoScale = remember { Animatable(0.3f) }
    val logoAlpha = remember { Animatable(0f) }
    val logoRotation = remember { Animatable(-15f) }
    val textAlpha = remember { Animatable(0f) }
    val textSlideY = remember { Animatable(30f) }
    val subtitleAlpha = remember { Animatable(0f) }
    val barAlpha = remember { Animatable(0f) }
    val loadingProgress = remember { Animatable(0f) }

    val infiniteTransition = rememberInfiniteTransition(label = "glow")
    val glowScale by infiniteTransition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "glowScale",
    )
    val glowAlpha by infiniteTransition.animateFloat(
        initialValue = 0.1f,
        targetValue = 0.22f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "glowAlpha",
    )

    LaunchedEffect(Unit) {
        launch { logoAlpha.animateTo(1f, tween(500, easing = FastOutSlowInEasing)) }
        launch { logoRotation.animateTo(0f, tween(700, easing = FastOutSlowInEasing)) }
        logoScale.animateTo(1f, tween(800, easing = FastOutSlowInEasing))

        delay(100)
        launch { barAlpha.animateTo(1f, tween(300)) }
        launch { loadingProgress.animateTo(1f, tween(2200, easing = LinearEasing)) }

        delay(300)
        launch { textSlideY.animateTo(0f, tween(500, easing = FastOutSlowInEasing)) }
        launch { textAlpha.animateTo(1f, tween(500, easing = FastOutSlowInEasing)) }

        delay(400)
        subtitleAlpha.animateTo(1f, tween(400, easing = FastOutSlowInEasing))

        delay(1800)
        onSplashFinished()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White),
    ) {
        FloatingParticle(delayMs = 800, startX = -80f, startY = -120f, size = 16f, color = PrimaryLight.copy(alpha = 0.5f))
        FloatingParticle(delayMs = 1200, startX = 60f, startY = -80f, size = 12f, color = SecondaryLt.copy(alpha = 0.6f))
        FloatingParticle(delayMs = 600, startX = 100f, startY = -160f, size = 18f, color = PrimaryLight.copy(alpha = 0.4f))
        FloatingParticle(delayMs = 1500, startX = -120f, startY = 40f, size = 14f, color = SecondaryLt.copy(alpha = 0.5f))
        FloatingParticle(delayMs = 900, startX = 40f, startY = 100f, size = 10f, color = PrimaryLight.copy(alpha = 0.6f))
        FloatingParticle(delayMs = 1100, startX = -50f, startY = 160f, size = 16f, color = SecondaryLt.copy(alpha = 0.5f))
        FloatingParticle(delayMs = 700, startX = 130f, startY = 60f, size = 12f, color = PrimaryLight.copy(alpha = 0.4f))
        FloatingParticle(delayMs = 1400, startX = -100f, startY = -40f, size = 14f, color = SecondaryLt.copy(alpha = 0.6f))

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 80.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            // Glow behind logo
            Box(
                modifier = Modifier
                    .size(160.dp)
                    .scale(glowScale)
                    .alpha(glowAlpha)
                    .clip(CircleShape)
                    .background(
                        Brush.radialGradient(
                            colors = listOf(PrimaryLight, Color.Transparent),
                        )
                    ),
            )

            // Logo with rotation + scale + alpha (offset up to overlap glow)
            Box(
                modifier = Modifier
                    .offset(y = (-160).dp)
                    .graphicsLayer {
                        this.alpha = logoAlpha.value
                        this.rotationZ = logoRotation.value
                    }
                    .scale(logoScale.value),
                contentAlignment = Alignment.Center,
            ) {
                Box(
                    modifier = Modifier
                        .size(116.dp)
                        .clip(CircleShape)
                        .background(PrimaryLight.copy(alpha = 0.4f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Box(
                        modifier = Modifier
                            .size(96.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                            .border(1.dp, BorderSoft, CircleShape),
                        contentAlignment = Alignment.Center,
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.logo_petayu),
                            contentDescription = "Petayu Logo",
                            modifier = Modifier.size(72.dp),
                            contentScale = ContentScale.Fit,
                        )
                    }
                }
            }

            Spacer(Modifier.height(20.dp))

            Text(
                text = "PETAYU DRIVER",
                style = MaterialTheme.typography.displayMedium.copy(
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp,
                ),
                color = PrimaryDark,
                modifier = Modifier
                    .graphicsLayer {
                        this.alpha = textAlpha.value
                        this.translationY = textSlideY.value
                    },
            )

            Spacer(Modifier.height(6.dp))

            Text(
                text = "Sistem Logistik & Pengiriman Gudang",
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontWeight = FontWeight.Medium,
                ),
                color = TextSecond,
                modifier = Modifier.graphicsLayer { this.alpha = subtitleAlpha.value },
            )
        }

        // Loading bar at bottom
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 60.dp),
            contentAlignment = Alignment.BottomCenter,
        ) {
            LoadingBar(progress = loadingProgress.value, alpha = barAlpha.value)
        }
    }
}
