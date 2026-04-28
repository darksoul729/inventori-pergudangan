package com.aether.driver.api

import com.aether.driver.BuildConfig
import com.aether.driver.data.SessionManager
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    fun getApiService(sessionManager: SessionManager): ApiService {
        val baseUrl = if (BuildConfig.ENABLE_LOGGING) {
            runBlocking {
                sessionManager.serverUrl.first()?.takeIf { it.isNotBlank() }
            } ?: BuildConfig.DRIVER_API_BASE_URL
        } else {
            // Release build must always point to production endpoint.
            BuildConfig.DRIVER_API_BASE_URL
        }

        val authInterceptor = AuthInterceptor {
            runBlocking { sessionManager.authToken.first() }
        }

        val clientBuilder = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(authInterceptor)

        // Only enable verbose logging in debug builds
        if (BuildConfig.ENABLE_LOGGING) {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }
            clientBuilder.addInterceptor(logging)
        }

        return Retrofit.Builder()
            .baseUrl(baseUrl.ensureTrailingSlash())
            .addConverterFactory(GsonConverterFactory.create())
            .client(clientBuilder.build())
            .build()
            .create(ApiService::class.java)
    }
}

private fun String.ensureTrailingSlash(): String {
    return if (endsWith("/")) this else "$this/"
}
