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

// Petayu Driver brand palette — aligned with logo colors
val Primary      = Color(0xFF5932C9)   // brand purple — tombol utama, sidebar aktif, icon, link
val PrimaryLight = Color(0xFFF0EBFF)   // light purple tint
val PrimaryDark  = Color(0xFF28106F)   // deep purple — header, teks penting, gradient
val PrimaryDeep  = Color(0xFF28106F)   // same as PrimaryDark for gradient headers

val Secondary    = Color(0xFF72CBEA)   // sky blue — aksen, grafik, badge, hover, status info
val SecondaryLt  = Color(0xFFDCF4FC)   // light sky tint

val Danger       = Color(0xFFEF4444)   // red-500
val DangerLight  = Color(0xFFFEE2E2)   // red-100

val Warning      = Color(0xFFF59E0B)   // amber-500
val WarningLight = Color(0xFFFEF3C7)   // amber-100

val Success      = Color(0xFF10B981)   // emerald-500
val SuccessLight = Color(0xFFD1FAE5)   // emerald-100

val Surface      = Color(0xFFFFFFFF)   // pure white background
val Card         = Color(0xFFFFFFFF)
val Border       = Color(0xFFE5E0F0)   // muted purple-grey border
val BorderSoft   = Color(0xFFF0EBFA)   // soft panel border
val TextPrimary  = Color(0xFF1A1035)   // deep dark text
val TextSecond   = Color(0xFF6B5F8A)   // muted purple-grey
val TextMuted    = Color(0xFF9B8FC0)   // light muted purple

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
    surfaceVariant     = Color(0xFFF4F0FF),
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
