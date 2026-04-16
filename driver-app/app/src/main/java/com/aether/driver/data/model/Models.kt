package com.aether.driver.data.model

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val phone: String?,
    val license_number: String
)

data class LoginResponse(
    val token: String,
    val user: User,
    val driver: Driver
)

data class DriverProfileResponse(
    val user: User,
    val driver: Driver?
)

data class User(
    val id: Int,
    val name: String,
    val email: String
)

data class Driver(
    val id: Int,
    val license_number: String,
    val status: String
)

data class Shipment(
    val id: Int,
    val shipment_id: String,
    val origin: String? = null,
    val origin_name: String,
    val origin_lat: Double? = null,
    val origin_lng: Double? = null,
    val destination: String? = null,
    val destination_name: String,
    val dest_lat: Double? = null,
    val dest_lng: Double? = null,
    val status: String,
    val estimated_arrival: String?,
    val tracking_stage: String? = null,
    val tracking_stage_label: String? = null,
    val last_tracking_note: String? = null,
    val claimed_at: String? = null,
    val picked_up_at: String? = null,
    val in_transit_at: String? = null,
    val arrived_at_destination_at: String? = null,
    val delivered_at: String? = null,
    val delivery_recipient_name: String? = null,
    val delivery_note: String? = null,
    val delivery_photo_url: String? = null,
    val pod_verification_status: String? = null,
    val pod_verification_note: String? = null,
    val pod_verified_at: String? = null,
)

data class ShipmentListResponse(
    val message: String? = null,
    val data: List<Shipment> = emptyList(),
)

data class LocationData(
    val latitude: Double,
    val longitude: Double,
    val is_mock: Boolean = false
)

data class StatusResponse(
    val message: String,
    val shipment: Shipment? = null
)
