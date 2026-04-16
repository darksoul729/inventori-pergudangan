package com.aether.driver.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "driver_prefs")

class SessionManager(private val context: Context) {
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("auth_token")
        private val SERVER_URL_KEY = stringPreferencesKey("server_url")
        private val DRIVER_NAME_KEY = stringPreferencesKey("driver_name")
        private val DRIVER_EMAIL_KEY = stringPreferencesKey("driver_email")
        private val DRIVER_LICENSE_KEY = stringPreferencesKey("driver_license")
        private val DRIVER_STATUS_KEY = stringPreferencesKey("driver_status")
        private val LAST_LOCATION_SENT_AT_KEY = stringPreferencesKey("last_location_sent_at")
        private val LAST_LOCATION_PAYLOAD_KEY = stringPreferencesKey("last_location_payload")
        private val LAST_LOCATION_ERROR_KEY = stringPreferencesKey("last_location_error")
    }

    val authToken: Flow<String?> = context.dataStore.data.map { it[TOKEN_KEY] }
    val serverUrl: Flow<String?> = context.dataStore.data.map { it[SERVER_URL_KEY] }
    val driverName: Flow<String?> = context.dataStore.data.map { it[DRIVER_NAME_KEY] }
    val driverEmail: Flow<String?> = context.dataStore.data.map { it[DRIVER_EMAIL_KEY] }
    val driverLicenseNumber: Flow<String?> = context.dataStore.data.map { it[DRIVER_LICENSE_KEY] }
    val driverStatus: Flow<String?> = context.dataStore.data.map { it[DRIVER_STATUS_KEY] }
    val lastLocationSentAt: Flow<String?> = context.dataStore.data.map { it[LAST_LOCATION_SENT_AT_KEY] }
    val lastLocationPayload: Flow<String?> = context.dataStore.data.map { it[LAST_LOCATION_PAYLOAD_KEY] }
    val lastLocationError: Flow<String?> = context.dataStore.data.map { it[LAST_LOCATION_ERROR_KEY] }

    suspend fun saveToken(token: String) {
        context.dataStore.edit { it[TOKEN_KEY] = token }
    }

    suspend fun saveServerUrl(url: String) {
        context.dataStore.edit { it[SERVER_URL_KEY] = url }
    }

    suspend fun saveDriverProfile(
        name: String,
        email: String,
        licenseNumber: String?,
        status: String?,
    ) {
        context.dataStore.edit {
            it[DRIVER_NAME_KEY] = name
            it[DRIVER_EMAIL_KEY] = email
            if (licenseNumber.isNullOrBlank()) {
                it.remove(DRIVER_LICENSE_KEY)
            } else {
                it[DRIVER_LICENSE_KEY] = licenseNumber
            }
            if (status.isNullOrBlank()) {
                it.remove(DRIVER_STATUS_KEY)
            } else {
                it[DRIVER_STATUS_KEY] = status
            }
        }
    }

    suspend fun saveLocationDebug(sentAt: String, payload: String) {
        context.dataStore.edit {
            it[LAST_LOCATION_SENT_AT_KEY] = sentAt
            it[LAST_LOCATION_PAYLOAD_KEY] = payload
            it.remove(LAST_LOCATION_ERROR_KEY)
        }
    }

    suspend fun saveLocationError(message: String) {
        context.dataStore.edit { it[LAST_LOCATION_ERROR_KEY] = message }
    }

    suspend fun clearToken() {
        context.dataStore.edit {
            it.remove(TOKEN_KEY)
            it.remove(DRIVER_NAME_KEY)
            it.remove(DRIVER_EMAIL_KEY)
            it.remove(DRIVER_LICENSE_KEY)
            it.remove(DRIVER_STATUS_KEY)
        }
    }
}
