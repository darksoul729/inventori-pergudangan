package com.aether.driver

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.ActivityCompat
import com.aether.driver.data.SessionManager
import com.aether.driver.ui.screens.LoginScreen
import com.aether.driver.ui.screens.RegisterScreen
import com.aether.driver.ui.screens.ServerSettingsScreen
import com.aether.driver.ui.screens.ShipmentListScreen
import com.aether.driver.ui.screens.ShipmentHistoryScreen
import com.aether.driver.ui.theme.AetherDriverAppTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val sessionManager = SessionManager(applicationContext)

        // Request initial permissions
        val permissions = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            permissions.add(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        ActivityCompat.requestPermissions(this, permissions.toTypedArray(), 0)

        setContent {
            AetherDriverAppTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val token = sessionManager.authToken.collectAsState(initial = null).value
                    AppNavigation(sessionManager, startDestination = if (token == null) "login" else "shipments")
                }
            }
        }
    }
}

@Composable
fun AppNavigation(sessionManager: SessionManager, startDestination: String) {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = startDestination) {
        composable("login") {
            LoginScreen(
                sessionManager = sessionManager,
                onLoginSuccess = {
                    navController.navigate("shipments") {
                        popUpTo("login") { inclusive = true }
                    }
                },
                onOpenRegister = {
                    navController.navigate("register")
                },
                onOpenServerSettings = {
                    navController.navigate("settings")
                }
            )
        }
        composable("register") {
            RegisterScreen(sessionManager) {
                navController.popBackStack()
            }
        }
        composable("settings") {
            ServerSettingsScreen(sessionManager) {
                navController.popBackStack()
            }
        }
        composable("shipments") {
            ShipmentListScreen(
                sessionManager = sessionManager,
                onLogout = {
                    navController.navigate("login") {
                        popUpTo("shipments") { inclusive = true }
                    }
                },
                onOpenSettings = {
                    navController.navigate("settings")
                },
                onOpenHistory = {
                    navController.navigate("history")
                }
            )
        }
        composable("history") {
            ShipmentHistoryScreen(
                sessionManager = sessionManager,
                onBackToActive = {
                    navController.popBackStack()
                }
            )
        }
    }
}
