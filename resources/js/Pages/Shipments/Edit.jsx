import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ChevronLeft, Crosshair, MapPinned, Save, Search } from 'lucide-react';

const LOCATION_INPUT_MODES = [
    { id: 'city', label: 'Cari Kota', icon: Search },
    { id: 'map', label: 'Pin Map', icon: MapPinned },
    { id: 'manual', label: 'Manual', icon: Crosshair },
];

const pickerIcon = new L.DivIcon({
    className: 'shipment-location-picker',
    html: `
        <div style="width:18px;height:18px;border-radius:999px;background:#4f46e5;border:3px solid #ffffff;box-shadow:0 6px 18px rgba(79,70,229,.35);"></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

const cityCoords = {
    JAKARTA: { lat: -6.2088, lng: 106.8456, code: 'JKT', label: 'Jakarta' },
    SURABAYA: { lat: -7.2575, lng: 112.7521, code: 'SUB', label: 'Surabaya' },
    MEDAN: { lat: 3.5952, lng: 98.6722, code: 'KNO', label: 'Medan' },
    BANDUNG: { lat: -6.9175, lng: 107.6191, code: 'BDO', label: 'Bandung' },
    MAKASSAR: { lat: -5.1476, lng: 119.4327, code: 'UPG', label: 'Makassar' },
    SEMARANG: { lat: -6.9667, lng: 110.4167, code: 'SRG', label: 'Semarang' },
    PALEMBANG: { lat: -2.9761, lng: 104.7754, code: 'PLM', label: 'Palembang' },
    DENPASAR: { lat: -8.6705, lng: 115.2126, code: 'DPS', label: 'Denpasar' },
    BALI: { lat: -8.4095, lng: 115.1889, code: 'DPS', label: 'Bali' },
    SINGAPORE: { lat: 1.3521, lng: 103.8198, code: 'SIN', label: 'Singapore' },
    DUBAI: { lat: 25.2048, lng: 55.2708, code: 'DXB', label: 'Dubai, UAE' },
    TOKYO: { lat: 35.6762, lng: 139.6503, code: 'NRT', label: 'Tokyo, JP' },
    SYDNEY: { lat: -33.8688, lng: 151.2093, code: 'SYD', label: 'Sydney, AUS' },
    LONDON: { lat: 51.5072, lng: -0.1276, code: 'LHR', label: 'London, UK' },
    PARIS: { lat: 48.8566, lng: 2.3522, code: 'CDG', label: 'Paris, FRA' },
    'LOS ANGELES': { lat: 34.0522, lng: -118.2437, code: 'LAX', label: 'Los Angeles, USA' },
    'NEW YORK': { lat: 40.7128, lng: -74.006, code: 'JFK', label: 'New York, USA' },
    HAMBURG: { lat: 53.5511, lng: 9.9937, code: 'HAM', label: 'Hamburg, GER' },
    SHANGHAI: { lat: 31.2304, lng: 121.4737, code: 'PVG', label: 'Shanghai, CN' },
};

const cityOptions = Object.entries(cityCoords).map(([key, city]) => ({ key, ...city }));

function LocationMapEvents({ position, onPick }) {
    const map = useMapEvents({
        click(event) {
            onPick(event.latlng);
        },
    });

    useEffect(() => {
        if (position?.lat && position?.lng) {
            map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 7), {
                animate: true,
                duration: 0.5,
            });
        }
    }, [map, position]);

    return position?.lat && position?.lng ? (
        <Marker position={[position.lat, position.lng]} icon={pickerIcon} />
    ) : null;
}

function CoordinateMapPicker({ value, onPick }) {
    const center = value?.lat && value?.lng ? [value.lat, value.lng] : [-2.5489, 118.0149];

    return (
        <div className="overflow-hidden rounded-[24px] border border-gray-200">
            <MapContainer center={center} zoom={value?.lat && value?.lng ? 8 : 5} style={{ height: '280px', width: '100%' }} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                <LocationMapEvents position={value} onPick={onPick} />
            </MapContainer>
            <div className="flex items-center justify-between gap-4 bg-slate-50 px-4 py-3 text-[12px] font-semibold text-slate-500">
                <span>Klik pada map untuk menentukan titik lokasi.</span>
                <span className="text-indigo-600">
                    {value?.lat && value?.lng ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : 'Belum ada titik'}
                </span>
            </div>
        </div>
    );
}

export default function EditShipment({ shipment, drivers = [] }) {
    const [originMode, setOriginMode] = useState('city');
    const [destinationMode, setDestinationMode] = useState('city');
    const [originSearch, setOriginSearch] = useState('');
    const [destinationSearch, setDestinationSearch] = useState('');

    const { data, setData, put, processing, errors } = useForm({
        origin: shipment.origin || '',
        origin_name: shipment.origin_name || '',
        destination: shipment.destination || '',
        destination_name: shipment.destination_name || '',
        status: shipment.status || 'in-transit',
        estimated_arrival: shipment.estimated_arrival ? new Date(shipment.estimated_arrival).toISOString().slice(0, 16) : '',
        load_type: shipment.load_type || 'ground',
        driver_id: shipment.driver_id || '',
        origin_lat: shipment.origin_lat || '',
        origin_lng: shipment.origin_lng || '',
        dest_lat: shipment.dest_lat || '',
        dest_lng: shipment.dest_lng || '',
    });

    const applyLocationSelection = (type, location) => {
        if (type === 'origin') {
            setData((prev) => ({
                ...prev,
                origin: location.code ?? prev.origin,
                origin_name: location.label ?? prev.origin_name,
                origin_lat: location.lat,
                origin_lng: location.lng,
            }));
            return;
        }

        setData((prev) => ({
            ...prev,
            destination: location.code ?? prev.destination,
            destination_name: location.label ?? prev.destination_name,
            dest_lat: location.lat,
            dest_lng: location.lng,
        }));
    };

    const handleMapLocationPick = (type, latlng) => {
        const roundedLat = Number(latlng.lat.toFixed(6));
        const roundedLng = Number(latlng.lng.toFixed(6));
        const nearbyCity = cityOptions.find((city) => Math.abs(city.lat - roundedLat) < 0.8 && Math.abs(city.lng - roundedLng) < 0.8);

        applyLocationSelection(type, {
            code: nearbyCity?.code ?? (type === 'origin' ? data.origin || 'PIN' : data.destination || 'PIN'),
            label: nearbyCity?.label ?? `Pinned ${roundedLat}, ${roundedLng}`,
            lat: roundedLat,
            lng: roundedLng,
        });
    };

    const getFilteredCities = (query) => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return cityOptions.slice(0, 8);

        return cityOptions.filter((city) =>
            city.label.toLowerCase().includes(normalized) ||
            city.code.toLowerCase().includes(normalized) ||
            city.key.toLowerCase().includes(normalized)
        ).slice(0, 8);
    };

    const renderLocationSection = ({
        type,
        title,
        tone,
        mode,
        setMode,
        search,
        setSearch,
        codeValue,
        nameValue,
        latValue,
        lngValue,
    }) => {
        const filteredCities = getFilteredCities(search);
        const isOrigin = type === 'origin';
        const position = latValue && lngValue ? { lat: Number(latValue), lng: Number(lngValue) } : null;

        return (
            <div className={`rounded-[28px] border p-6 space-y-5 ${tone}`}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">{title}</div>
                        <p className="mt-1 text-[13px] font-semibold text-slate-500">Cari kota cepat, klik peta, atau isi koordinat manual.</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-indigo-600 border border-indigo-100">
                        {latValue && lngValue ? 'Koordinat siap' : 'Belum dipilih'}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {LOCATION_INPUT_MODES.map((item) => {
                        const Icon = item.icon;
                        const active = mode === item.id;

                        return (
                            <button
                                key={`${type}-${item.id}`}
                                type="button"
                                onClick={() => setMode(item.id)}
                                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-[12px] font-black transition-all ${
                                    active
                                        ? 'border-indigo-200 bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                        : 'border-gray-200 bg-white text-slate-500 hover:border-indigo-100 hover:text-indigo-600'
                                }`}
                            >
                                <Icon className="h-4 w-4" strokeWidth={2.1} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Kode lokasi"
                        className="px-4 py-3 border border-gray-200 rounded-2xl text-[12px] font-bold"
                        value={codeValue}
                        onChange={(e) => setData(isOrigin ? 'origin' : 'destination', e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Nama kota / gudang / alamat"
                        className="px-4 py-3 border border-gray-200 rounded-2xl text-[12px] font-bold"
                        value={nameValue}
                        onChange={(e) => setData(isOrigin ? 'origin_name' : 'destination_name', e.target.value)}
                        required
                    />
                </div>

                {mode === 'city' && (
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2.1} />
                            <input
                                type="text"
                                placeholder="Cari kota, kode bandara, atau hub"
                                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-[13px] font-semibold text-slate-700"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredCities.map((city) => (
                                <button
                                    key={`${type}-${city.key}`}
                                    type="button"
                                    onClick={() => applyLocationSelection(type, city)}
                                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition-all hover:border-indigo-100 hover:bg-indigo-50/50"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-[13px] font-black text-slate-800">{city.label}</div>
                                            <div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{city.code}</div>
                                        </div>
                                        <div className="text-right text-[11px] font-semibold text-slate-400">
                                            <div>Lat {city.lat}</div>
                                            <div>Lng {city.lng}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {mode === 'map' && (
                    <CoordinateMapPicker value={position} onPick={(latlng) => handleMapLocationPick(type, latlng)} />
                )}

                {mode === 'manual' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="number"
                            step="any"
                            placeholder="Latitude / Lat"
                            className="px-4 py-3 border border-gray-200 rounded-2xl text-[12px] font-bold"
                            value={latValue}
                            onChange={(e) => setData(isOrigin ? 'origin_lat' : 'dest_lat', e.target.value)}
                        />
                        <input
                            type="number"
                            step="any"
                            placeholder="Longitude / Lng"
                            className="px-4 py-3 border border-gray-200 rounded-2xl text-[12px] font-bold"
                            value={lngValue}
                            onChange={(e) => setData(isOrigin ? 'origin_lng' : 'dest_lng', e.target.value)}
                        />
                    </div>
                )}

                <div className="rounded-2xl bg-white/80 border border-white px-4 py-3 text-[12px] leading-6 text-slate-500">
                    <span className="font-black text-slate-700">Lat</span> menunjukkan posisi utara atau selatan.
                    <span className="mx-1 font-black text-slate-700">Lng</span> menunjukkan posisi timur atau barat.
                    Contoh Jakarta: <span className="font-black text-indigo-600">Lat -6.2088</span>,
                    <span className="ml-1 font-black text-indigo-600">Lng 106.8456</span>.
                </div>
            </div>
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('shipments.update', shipment.shipment_id));
    };

    return (
        <DashboardLayout contentClassName="w-full max-w-[1600px] mx-auto">
            <Head title="Edit Pengiriman" />

            <div className="space-y-8 p-6 md:p-8">
                <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                        <Link
                            href={route('shipments.index')}
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
                        </Link>
                        <div>
                            <h1 className="text-[28px] font-black tracking-tight text-slate-900">Edit Pengiriman #{shipment.shipment_id}</h1>
                            <p className="mt-1 text-[14px] font-semibold text-slate-500">
                                Ubah data pengiriman sesuai kebutuhan.
                            </p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-[12px] font-semibold text-indigo-700">
                        ID Pengiriman tidak dapat diubah setelah dibuat.
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-6">
                        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                            <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">ID Pengiriman (Tidak Dapat Diubah)</label>
                            <input
                                type="text"
                                className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 text-[14px] font-bold text-slate-600 cursor-not-allowed"
                                value={shipment.shipment_id}
                                disabled
                            />
                        </div>

                        {renderLocationSection({
                            type: 'origin',
                            title: 'Data Asal (Origin)',
                            tone: 'bg-indigo-50/40 border-indigo-100/70',
                            mode: originMode,
                            setMode: setOriginMode,
                            search: originSearch,
                            setSearch: setOriginSearch,
                            codeValue: data.origin,
                            nameValue: data.origin_name,
                            latValue: data.origin_lat,
                            lngValue: data.origin_lng,
                        })}

                        {renderLocationSection({
                            type: 'destination',
                            title: 'Data Tujuan (Destination)',
                            tone: 'bg-fuchsia-50/35 border-fuchsia-100/70',
                            mode: destinationMode,
                            setMode: setDestinationMode,
                            search: destinationSearch,
                            setSearch: setDestinationSearch,
                            codeValue: data.destination,
                            nameValue: data.destination_name,
                            latValue: data.dest_lat,
                            lngValue: data.dest_lng,
                        })}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Detail Pengiriman</div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Estimasi Tiba</label>
                                    <input type="datetime-local" className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-[13px] font-bold" value={data.estimated_arrival} onChange={(e) => setData('estimated_arrival', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</label>
                                    <select className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-[13px] font-bold" value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                        <option value="in-transit">Dalam Perjalanan</option>
                                        <option value="on-time">Tepat Waktu</option>
                                        <option value="delayed">Terlambat</option>
                                        <option value="delivered">Sampai Tujuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Jenis Kargo</label>
                                    <select className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-[13px] font-bold" value={data.load_type} onChange={(e) => setData('load_type', e.target.value)}>
                                        <option value="ground">Darat</option>
                                        <option value="sea">Laut</option>
                                        <option value="air">Udara</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tugaskan Driver</label>
                                    <select className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-[13px] font-bold" value={data.driver_id} onChange={(e) => setData('driver_id', e.target.value)}>
                                        <option value="">Pilih Driver (Opsional)</option>
                                        {drivers.map((driver) => {
                                            // Driver is busy if is_busy is true AND they are NOT the currently assigned driver for this shipment
                                            const isCurrentlyAssigned = driver.id === shipment.driver_id;
                                            const showAsBusy = driver.is_busy && !isCurrentlyAssigned;

                                            return (
                                                <option
                                                    key={driver.id}
                                                    value={driver.id}
                                                    disabled={showAsBusy}
                                                >
                                                    {driver.name} {showAsBusy ? '(SIBUK)' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {errors.driver_id && <div className="mt-2 text-[11px] font-bold text-red-500">{errors.driver_id}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Ringkasan Lokasi</div>
                            <div className="space-y-4 text-[13px] font-semibold text-slate-600">
                                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">Asal</div>
                                    <div className="mt-1 font-black text-slate-900">{data.origin_name || 'Belum dipilih'}</div>
                                    <div className="mt-1 text-slate-500">{data.origin_lat && data.origin_lng ? `${data.origin_lat}, ${data.origin_lng}` : 'Koordinat belum ada'}</div>
                                </div>
                                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-500">Tujuan</div>
                                    <div className="mt-1 font-black text-slate-900">{data.destination_name || 'Belum dipilih'}</div>
                                    <div className="mt-1 text-slate-500">{data.dest_lat && data.dest_lng ? `${data.dest_lat}, ${data.dest_lng}` : 'Koordinat belum ada'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link href={route('shipments.index')} className="flex-1 rounded-2xl border border-slate-200 px-6 py-4 text-center text-[14px] font-black text-slate-500 transition hover:bg-white">
                                Batal
                            </Link>
                            <button type="submit" disabled={processing} className="flex-[1.4] rounded-2xl bg-indigo-600 px-6 py-4 text-[14px] font-black uppercase text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50">
                                <span className="inline-flex items-center gap-2">
                                    <Save className="h-4 w-4" strokeWidth={2.2} />
                                    Simpan Perubahan
                                </span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
