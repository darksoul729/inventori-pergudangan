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
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Error
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import com.aether.driver.ui.theme.*
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

// ── PetayuTextField ──────────────────────────────────────────────────────
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
            fontWeight = FontWeight.SemiBold,
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
            shape                = RoundedCornerShape(14.dp),
            colors               = OutlinedTextFieldDefaults.colors(
                focusedBorderColor      = Primary,
                unfocusedBorderColor    = Border,
                errorBorderColor        = Danger,
                focusedContainerColor   = Color(0xFFFAF8FF),
                unfocusedContainerColor = Color(0xFFFAF8FF),
                disabledContainerColor  = Color(0xFFF5F3FF),
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

// ── PetayuStatusBadge ────────────────────────────────────────────────────
@Composable
fun AetherStatusBadge(label: String, stage: String) {
    val (bg, fg) = when (stage) {
        "delivered"              -> SuccessLight to Success
        "arrived_at_destination" -> WarningLight to Warning
        "in_transit"             -> SecondaryLt to Secondary
        "picked_up"              -> PrimaryLight to Primary
        else                     -> Color(0xFFF1F0FF) to TextSecond
    }
    Surface(color = bg, shape = RoundedCornerShape(8.dp)) {
        Text(
            text     = label.uppercase(),
            style    = MaterialTheme.typography.labelSmall,
            color    = fg,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
        )
    }
}

// ── SectionLabel ─────────────────────────────────────────────────────────
@Composable
fun SectionLabel(text: String, modifier: Modifier = Modifier) {
    Text(
        text     = text.uppercase(),
        style    = MaterialTheme.typography.labelSmall,
        color    = TextMuted,
        fontWeight = FontWeight.SemiBold,
        modifier = modifier,
    )
}

// ── InfoRow ──────────────────────────────────────────────────────────────
@Composable
fun InfoRow(label: String, value: String, valueColor: Color = TextPrimary) {
    Column(modifier = Modifier.fillMaxWidth()) {
        SectionLabel(label)
        Spacer(Modifier.height(2.dp))
        Text(text = value, style = MaterialTheme.typography.titleMedium, color = valueColor, fontWeight = FontWeight.SemiBold)
    }
}

// ── AlertBanner ──────────────────────────────────────────────────────────
@Composable
fun AlertBanner(message: String, type: AlertType = AlertType.Error) {
    val (bg, fg, icon) = when (type) {
        AlertType.Error   -> Triple(DangerLight, Danger, Icons.Rounded.Error)
        AlertType.Warning -> Triple(WarningLight, Warning, Icons.Rounded.Warning)
        AlertType.Success -> Triple(SuccessLight, Success, Icons.Rounded.CheckCircle)
        AlertType.Info    -> Triple(PrimaryLight, Primary, Icons.Rounded.Info)
    }
    Surface(
        color = bg,
        shape = RoundedCornerShape(12.dp),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment     = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
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
}

enum class AlertType { Error, Warning, Success, Info }

// ── Loading dots ─────────────────────────────────────────────────────────
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
                0 -> if (phase < 0.33f) 1f else 0.4f
                1 -> if (phase in 0.33f..0.66f) 1f else 0.4f
                else -> if (phase > 0.66f) 1f else 0.4f
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

// ── Warehouse loader ─────────────────────────────────────────────────────
@Composable
fun AppWarehouseLoader(
    label: String,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.padding(vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        androidx.compose.material3.CircularProgressIndicator(
            color = Primary,
            strokeWidth = 3.dp,
            modifier = Modifier.size(48.dp)
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = TextMuted,
            fontWeight = FontWeight.Medium
        )
    }
}

// ── IconLabelRow ─────────────────────────────────────────────────────────
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

// ── Workspace header ─────────────────────────────────────────────────────
@Composable
fun AetherWorkspaceHeader(
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
    onBack: (() -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {},
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = Color.White,
        shadowElevation = 0.dp,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 16.dp),
        ) {
            if (onBack != null) {
                IconButton(
                    onClick = onBack,
                    modifier = Modifier.size(32.dp),
                ) {
                    Icon(
                        imageVector = Icons.Rounded.ArrowBack,
                        contentDescription = "Kembali",
                        tint = Primary,
                        modifier = Modifier.size(18.dp),
                    )
                }
                Spacer(Modifier.height(4.dp))
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = subtitle.uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = Primary,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        text = title,
                        style = MaterialTheme.typography.headlineLarge,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold,
                    )
                }
                Row(
                    horizontalArrangement = Arrangement.spacedBy(2.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    content = actions,
                )
            }
        }
    }
}

// ── Panel card ───────────────────────────────────────────────────────────
@Composable
fun AetherPanel(
    modifier: Modifier = Modifier,
    padding: PaddingValues = PaddingValues(20.dp),
    content: @Composable ColumnScope.() -> Unit,
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = Color.White,
        shadowElevation = 2.dp,
        tonalElevation = 0.dp,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, BorderSoft, RoundedCornerShape(16.dp))
                .padding(padding),
            content = content,
        )
    }
}

// ── Primary button ───────────────────────────────────────────────────────
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
        shape = RoundedCornerShape(14.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = container,
            disabledContainerColor = container.copy(alpha = 0.5f),
        ),
    ) {
        if (isLoading) {
            AppInlineLoadingDots(color = Color.White)
        } else {
            if (leadingIcon != null) {
                Icon(leadingIcon, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
            }
            Text(text, style = MaterialTheme.typography.labelLarge, color = Color.White, fontWeight = FontWeight.Bold)
        }
    }
}

// ── Secondary button ─────────────────────────────────────────────────────
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
        shape = RoundedCornerShape(14.dp),
        border = androidx.compose.foundation.BorderStroke(1.5.dp, if (danger) Danger.copy(alpha = 0.4f) else Border),
    ) {
        if (leadingIcon != null) {
            Icon(leadingIcon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
        }
        Text(text, style = MaterialTheme.typography.labelLarge, color = color, fontWeight = FontWeight.SemiBold)
    }
}

// ── Form section header ──────────────────────────────────────────────────
@Composable
fun AetherFormSectionHeader(
    icon: ImageVector,
    number: String,
    title: String,
    subtitle: String? = null,
) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(Primary),
            contentAlignment = Alignment.Center,
        ) {
            Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
        }
        Column {
            Text(number, style = MaterialTheme.typography.labelSmall, color = Primary, fontWeight = FontWeight.Bold)
            Text(title, style = MaterialTheme.typography.titleLarge, color = TextPrimary, fontWeight = FontWeight.Bold)
            if (!subtitle.isNullOrBlank()) {
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = TextMuted)
            }
        }
    }
}

// ── Petayu Confirm Dialog ──────────────────────────────────────────────────
@Composable
fun PetayuConfirmDialog(
    title: String,
    message: String,
    confirmText: String = "Lanjutkan",
    cancelText: String = "Batal",
    isDanger: Boolean = false,
    icon: ImageVector = Icons.Rounded.Warning,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
) {
    androidx.compose.material3.AlertDialog(
        onDismissRequest = onDismiss,
        modifier = Modifier.fillMaxWidth(),
        containerColor = Color.White,
        shape = RoundedCornerShape(24.dp),
        title = {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(if (isDanger) DangerLight else PrimaryLight),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = if (isDanger) Danger else Primary,
                        modifier = Modifier.size(32.dp)
                    )
                }
                Spacer(Modifier.height(20.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextPrimary,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    fontWeight = FontWeight.Black
                )
            }
        },
        text = {
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecond,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)
            )
        },
        confirmButton = {
            Column(
                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                AetherPrimaryButton(
                    text = confirmText,
                    onClick = onConfirm,
                    modifier = Modifier.fillMaxWidth(),
                    danger = isDanger,
                )
                AetherSecondaryButton(
                    text = cancelText,
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
        dismissButton = {}
    )
}
