package com.aether.driver.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Laravel dashboard-aligned industrial palette (indigo + slate)
val Primary      = Color(0xFF4F46E5)   // indigo-600
val PrimaryLight = Color(0xFFEEF2FF)   // indigo-50
val PrimaryDark  = Color(0xFF4338CA)   // indigo-700
val PrimaryDeep  = Color(0xFF3632C0)   // brand accent used in web sidebar

val Danger       = Color(0xFFEF4444)   // red-500
val DangerLight  = Color(0xFFFEE2E2)   // red-100

val Warning      = Color(0xFFF59E0B)   // amber-500
val WarningLight = Color(0xFFFEF3C7)   // amber-100

val Secondary    = Color(0xFF10B981)   // emerald-500
val SecondaryLt  = Color(0xFFD1FAE5)   // emerald-100

val Surface      = Color(0xFFF8F9FC)   // web background
val Card         = Color(0xFFFFFFFF)
val Border       = Color(0xFFE2E8F0)   // slate-200
val BorderSoft   = Color(0xFFEDF2F7)   // soft panel border
val TextPrimary  = Color(0xFF1A202C)   // slate-900
val TextSecond   = Color(0xFF64748B)   // slate-500
val TextMuted    = Color(0xFF94A3B8)   // slate-400

private val ColorScheme = lightColorScheme(
    primary            = Primary,
    onPrimary          = Color.White,
    primaryContainer   = PrimaryLight,
    onPrimaryContainer = PrimaryDark,
    secondary          = Secondary,
    onSecondary        = Color.White,
    secondaryContainer = SecondaryLt,
    error              = Danger,
    errorContainer     = DangerLight,
    onError            = Color.White,
    background         = Surface,
    onBackground       = TextPrimary,
    surface            = Card,
    onSurface          = TextPrimary,
    surfaceVariant     = Color(0xFFF4F5F9),
    onSurfaceVariant   = TextSecond,
    outline            = TextMuted,
    outlineVariant     = Border,
)

private val AppShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small      = RoundedCornerShape(10.dp),
    medium     = RoundedCornerShape(14.dp),
    large      = RoundedCornerShape(20.dp),
    extraLarge = RoundedCornerShape(28.dp),
)

private val AppTypography = Typography(
    displayLarge  = TextStyle(fontWeight = FontWeight.Black,  fontSize = 32.sp, letterSpacing = (-0.5).sp),
    displayMedium = TextStyle(fontWeight = FontWeight.Black,  fontSize = 26.sp, letterSpacing = (-0.3).sp),
    displaySmall  = TextStyle(fontWeight = FontWeight.ExtraBold, fontSize = 22.sp),
    headlineLarge = TextStyle(fontWeight = FontWeight.Black,  fontSize = 20.sp),
    headlineMedium= TextStyle(fontWeight = FontWeight.ExtraBold, fontSize = 18.sp),
    titleLarge    = TextStyle(fontWeight = FontWeight.Bold,   fontSize = 16.sp),
    titleMedium   = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 14.sp),
    bodyLarge     = TextStyle(fontWeight = FontWeight.Normal, fontSize = 14.sp),
    bodyMedium    = TextStyle(fontWeight = FontWeight.Normal, fontSize = 13.sp),
    bodySmall     = TextStyle(fontWeight = FontWeight.Normal, fontSize = 12.sp),
    labelLarge    = TextStyle(fontWeight = FontWeight.ExtraBold, fontSize = 11.sp, letterSpacing = 0.8.sp),
    labelMedium   = TextStyle(fontWeight = FontWeight.Bold,   fontSize = 10.sp, letterSpacing = 0.6.sp),
    labelSmall    = TextStyle(fontWeight = FontWeight.Black,  fontSize = 9.sp,  letterSpacing = 0.8.sp),
)

@Composable
fun AetherDriverAppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = ColorScheme,
        shapes      = AppShapes,
        typography  = AppTypography,
        content     = content,
    )
}
