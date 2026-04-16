package com.aether.driver.ui.screens

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin
import com.aether.driver.ui.theme.*

// ─────────────────────────────────────────────────────────────────────────────
//  AetherTextField — custom styled text field dengan leadingIcon support
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun AetherTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    keyboardType: KeyboardType = KeyboardType.Text,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    leadingIcon: (@Composable () -> Unit)? = null,
    trailingIcon: (@Composable () -> Unit)? = null,
    enabled: Boolean = true,
    isError: Boolean = false,
) {
    var isFocused by remember { mutableStateOf(false) }

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text     = label.uppercase(),
            style    = MaterialTheme.typography.labelSmall,
            color    = when {
                isError   -> Danger
                isFocused -> Primary
                else      -> TextMuted
            },
            modifier = Modifier.padding(bottom = 6.dp),
        )
        OutlinedTextField(
            value                = value,
            onValueChange        = onValueChange,
            placeholder          = { Text(placeholder, color = TextMuted) },
            keyboardOptions      = KeyboardOptions(keyboardType = keyboardType),
            visualTransformation = visualTransformation,
            leadingIcon          = leadingIcon,
            trailingIcon         = trailingIcon,
            enabled              = enabled,
            isError              = isError,
            singleLine           = true,
            shape                = RoundedCornerShape(12.dp),
            colors               = OutlinedTextFieldDefaults.colors(
                focusedBorderColor      = Primary,
                unfocusedBorderColor    = Border,
                errorBorderColor        = Danger,
                focusedContainerColor   = Card,
                unfocusedContainerColor = Color(0xFFF4F5F9),
                disabledContainerColor  = Color(0xFFF1F5F9),
                focusedTextColor        = TextPrimary,
                unfocusedTextColor      = TextPrimary,
                cursorColor             = Primary,
            ),
            modifier = Modifier
                .fillMaxWidth()
                .onFocusChanged { isFocused = it.isFocused },
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  AetherStatusBadge — badge warna per tracking_stage
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun AetherStatusBadge(label: String, stage: String) {
    val (bg, fg) = when (stage) {
        "delivered"              -> SecondaryLt to Secondary
        "arrived_at_destination" -> WarningLight to Warning
        "in_transit"             -> PrimaryLight to Primary
        "picked_up"              -> PrimaryLight to Primary
        else                     -> Color(0xFFF1F5F9) to TextSecond
    }
    Surface(color = bg, shape = MaterialTheme.shapes.small) {
        Text(
            text     = label.uppercase(),
            style    = MaterialTheme.typography.labelSmall,
            color    = fg,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  SectionLabel — uppercase muted label
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun SectionLabel(text: String, modifier: Modifier = Modifier) {
    Text(
        text     = text.uppercase(),
        style    = MaterialTheme.typography.labelSmall,
        color    = TextMuted,
        modifier = modifier,
    )
}

// ─────────────────────────────────────────────────────────────────────────────
//  InfoRow — label + value pair
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun InfoRow(label: String, value: String, valueColor: Color = TextPrimary) {
    Column(modifier = Modifier.fillMaxWidth()) {
        SectionLabel(label)
        Spacer(Modifier.height(2.dp))
        Text(text = value, style = MaterialTheme.typography.titleMedium, color = valueColor)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  AlertBanner — error / warning / success / info banner
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun AlertBanner(message: String, type: AlertType = AlertType.Error) {
    val (bg, fg, icon) = when (type) {
        AlertType.Error   -> Triple(DangerLight, Danger, Icons.Rounded.Error)
        AlertType.Warning -> Triple(WarningLight, Warning, Icons.Rounded.Warning)
        AlertType.Success -> Triple(SecondaryLt, Secondary, Icons.Rounded.CheckCircle)
        AlertType.Info    -> Triple(PrimaryLight, Primary, Icons.Rounded.Info)
    }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(bg)
            .padding(12.dp),
        verticalAlignment     = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Icon(icon, contentDescription = null, tint = fg, modifier = Modifier.size(18.dp))
        Text(
            text       = message,
            style      = MaterialTheme.typography.bodySmall,
            color      = fg,
            fontWeight = FontWeight.SemiBold,
            modifier   = Modifier.weight(1f),
        )
    }
}

enum class AlertType { Error, Warning, Success, Info }

@Composable
fun AppInlineLoadingDots(color: Color) {
    val transition = rememberInfiniteTransition(label = "inline-dots")
    val phase by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 900, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "phase",
    )

    Row(horizontalArrangement = Arrangement.spacedBy(5.dp), verticalAlignment = Alignment.CenterVertically) {
        repeat(3) { index ->
            val alpha = when (index) {
                0 -> if (phase < 0.33f) 1f else 0.45f
                1 -> if (phase in 0.33f..0.66f) 1f else 0.45f
                else -> if (phase > 0.66f) 1f else 0.45f
            }
            Box(
                modifier = Modifier
                    .size(7.dp)
                    .clip(RoundedCornerShape(99.dp))
                    .background(color.copy(alpha = alpha))
            )
        }
    }
}

@Composable
fun AppWarehouseLoader(
    label: String,
    modifier: Modifier = Modifier,
) {
    val transition = rememberInfiniteTransition(label = "warehouse-loader")
    val rotateDeg by transition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1800, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "rotate",
    )
    val pulseScale by transition.animateFloat(
        initialValue = 0.78f,
        targetValue = 1.18f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1150, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "pulse",
    )

    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Canvas(modifier = Modifier.size(64.dp)) {
            val center = Offset(size.width / 2f, size.height / 2f)
            val radius = size.minDimension * 0.34f

            drawCircle(
                color = PrimaryLight.copy(alpha = 0.75f),
                radius = radius * pulseScale,
                center = center,
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 4.dp.toPx())
            )

            val angleRad = (rotateDeg * PI / 180f).toFloat()
            val orbit = Offset(
                x = center.x + (radius * cos(angleRad)),
                y = center.y + (radius * sin(angleRad)),
            )

            drawCircle(color = Primary, radius = 8.dp.toPx(), center = orbit)
            drawCircle(color = Secondary, radius = 5.dp.toPx(), center = center)
        }

        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = TextSecond,
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  IconLabelRow — row dengan icon + label (untuk debug card, tips, dll)
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun IconLabelRow(
    icon: ImageVector,
    iconTint: Color = TextMuted,
    content: @Composable RowScope.() -> Unit,
) {
    Row(
        verticalAlignment     = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(18.dp))
        content()
    }
}

@Composable
fun AetherWorkspaceHeader(
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
    onBack: (() -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {},
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            if (onBack != null) {
                IconButton(
                    onClick = onBack,
                    modifier = Modifier.size(36.dp),
                ) {
                    Icon(
                        imageVector = Icons.Rounded.ArrowBack,
                        contentDescription = "Kembali",
                        tint = TextSecond,
                        modifier = Modifier.size(18.dp),
                    )
                }
            }

            Column {
                Text(
                    text = subtitle.uppercase(),
                    style = MaterialTheme.typography.labelMedium,
                    color = PrimaryDark,
                )
                Text(
                    text = title,
                    style = MaterialTheme.typography.headlineLarge,
                    color = TextPrimary,
                )
            }
        }

        Row(
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically,
            content = actions,
        )
    }
}

@Composable
fun AetherPanel(
    modifier: Modifier = Modifier,
    padding: PaddingValues = PaddingValues(20.dp),
    content: @Composable ColumnScope.() -> Unit,
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.extraLarge,
        color = Card,
        shadowElevation = 1.dp,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, BorderSoft, MaterialTheme.shapes.extraLarge)
                .padding(padding),
            content = content,
        )
    }
}

@Composable
fun AetherPrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isLoading: Boolean = false,
    leadingIcon: ImageVector? = null,
    danger: Boolean = false,
) {
    val container = if (danger) Danger else Primary
    Button(
        onClick = onClick,
        modifier = modifier.height(50.dp),
        enabled = enabled && !isLoading,
        shape = MaterialTheme.shapes.large,
        colors = ButtonDefaults.buttonColors(containerColor = container),
    ) {
        if (isLoading) {
            AppInlineLoadingDots(color = Color.White)
        } else {
            if (leadingIcon != null) {
                Icon(leadingIcon, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
            }
            Text(text, style = MaterialTheme.typography.labelLarge, color = Color.White)
        }
    }
}

@Composable
fun AetherSecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    leadingIcon: ImageVector? = null,
    danger: Boolean = false,
) {
    val color = if (danger) Danger else Primary
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.height(48.dp),
        enabled = enabled,
        shape = MaterialTheme.shapes.large,
        border = androidx.compose.foundation.BorderStroke(1.dp, if (danger) DangerLight else Border),
    ) {
        if (leadingIcon != null) {
            Icon(leadingIcon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
        }
        Text(text, style = MaterialTheme.typography.labelLarge, color = color)
    }
}

@Composable
fun AetherFormSectionHeader(
    icon: ImageVector,
    number: String,
    title: String,
    subtitle: String? = null,
) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(PrimaryLight),
            contentAlignment = Alignment.Center,
        ) {
            Icon(icon, contentDescription = null, tint = Primary, modifier = Modifier.size(18.dp))
        }
        Column {
            Text(number, style = MaterialTheme.typography.labelSmall, color = TextMuted)
            Text(title, style = MaterialTheme.typography.titleLarge, color = TextPrimary)
            if (!subtitle.isNullOrBlank()) {
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = TextMuted)
            }
        }
    }
}
