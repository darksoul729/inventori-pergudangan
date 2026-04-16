package com.aether.driver.api

import com.aether.driver.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @POST("api/driver/register")
    suspend fun register(@Body request: RegisterRequest): Response<StatusResponse>

    @POST("api/driver/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @GET("api/driver/profile")
    suspend fun getProfile(): Response<DriverProfileResponse>

    @GET("api/driver/shipments")
    suspend fun getAssignedShipments(): Response<ShipmentListResponse>

    @GET("api/driver/shipments/history")
    suspend fun getShipmentHistory(): Response<ShipmentListResponse>

    @POST("api/driver/shipments/claim")
    suspend fun claimShipment(@Body body: Map<String, String>): Response<StatusResponse>

    @PUT("api/driver/shipments/{id}/status")
    suspend fun updateShipmentStatus(
        @Path("id") id: Int,
        @Body status: Map<String, String>
    ): Response<StatusResponse>

    @POST("api/driver/location")
    suspend fun updateLocation(@Body location: LocationData): Response<StatusResponse>
}
