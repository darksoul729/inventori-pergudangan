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

const TRACKING_STAGE_OPTIONS = [
    { value: 'ready_for_pickup', label: 'Siap Diambil' },
    { value: 'picked_up', label: 'Sudah Diambil' },
    { value: 'in_transit', label: 'Dalam Perjalanan' },
    { value: 'arrived_at_destination', label: 'Sampai Gudang Tujuan' },
];

const pickerIcon = new L.DivIcon({
    className: 'shipment-location-picker',
    html: `
        <div style="width:18px;height:18px;border-radius:999px;background:#5932C9;border:3px solid #ffffff;box-shadow:0 6px 18px rgba(89,50,201,.35);"></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

// Gudang utama - Samarinda, Kalimantan Timur
const WAREHOUSE_ORIGIN = {
    code: 'SMD',
    label: 'Gudang Samarinda, Kaltim',
    lat: -0.4948,
    lng: 117.1436,
    name: 'Gudang Utama Samarinda',
};

const cityCoords = {
    SAMARINDA: { lat: -0.4948, lng: 117.1436, code: 'SMD', label: 'Samarinda, Kaltim' },
    BALIKPAPAN: { lat: -1.2654, lng: 116.8312, code: 'BPN', label: 'Balikpapan, Kaltim' },
    BONTANG: { lat: 0.1333, lng: 117.4833, code: 'BXT', label: 'Bontang, Kaltim' },
    TENGGARONG: { lat: -0.4167, lng: 116.9833, code: 'TGR', label: 'Tenggarong, Kaltim' },
    SANGATTA: { lat: 0.5167, lng: 117.5500, code: 'SGQ', label: 'Sangatta, Kaltim' },
    TARAKAN: { lat: 3.3000, lng: 117.5833, code: 'TRK', label: 'Tarakan, Kaltara' },
    BANJARMASIN: { lat: -3.4434, lng: 114.8361, code: 'BJM', label: 'Banjarmasin, Kalsel' },
    PALANGKARAYA: { lat: -2.2083, lng: 113.9167, code: 'PKY', label: 'Palangkaraya, Kalteng' },
    PONTIANAK: { lat: -0.0226, lng: 109.3444, code: 'PNK', label: 'Pontianak, Kalbar' },
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
    const center = value?.lat && value?.lng ? [value.lat, value.lng] : [-0.4948, 117.1436];

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

export default function EditShipment({ shipment, drivers = [], products = [] }) {
    const [originMode, setOriginMode] = useState('city');
    const [destinationMode, setDestinationMode] = useState('city');
    const [originSearch, setOriginSearch] = useState('');
    const [destinationSearch, setDestinationSearch] = useState('');

    const { data, setData, put, processing, errors } = useForm({
        origin: WAREHOUSE_ORIGIN.code,
        origin_name: WAREHOUSE_ORIGIN.label,
        destination: shipment.destination || '',
        destination_name: shipment.destination_name || '',
        tracking_stage: shipment.tracking_stage || 'ready_for_pickup',
        estimated_arrival: shipment.estimated_arrival ? new Date(shipment.estimated_arrival).toISOString().slice(0, 16) : '',
        load_type: shipment.load_type || 'ground',
        driver_id: shipment.driver_id || '',
        origin_lat: WAREHOUSE_ORIGIN.lat,
        origin_lng: WAREHOUSE_ORIGIN.lng,
        dest_lat: shipment.dest_lat || '',
        dest_lng: shipment.dest_lng || '',
        items: (shipment.items || []).map(i => ({
            product_id: i.product_id || '',
            product_name: i.product_name || '',
            sku: i.sku || '',
            quantity: i.quantity || 1,
            unit: i.unit || 'pcs',
            weight_kg: i.weight_kg || '',
            notes: i.notes || '',
        })),
    });

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', product_name: '', sku: '', quantity: 1, unit: 'pcs', weight_kg: '', notes: '' }]);
    };

    const removeItem = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const updated = [...data.items];
        updated[index][field] = value;
        if (field === 'product_id' && value) {
            const product = products.find(p => p.id == value);
            if (product) {
                updated[index].product_name = product.name;
                updated[index].sku = product.sku;
                updated[index].unit = product.unit;
            }
        }
        setData('items', updated);
    };

    const applyLocationSelection = (type, location) => {
        if (type === 'origin') {
            // Origin locked to warehouse - ignore changes
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
        if (type === 'origin') return; // Origin locked

        const roundedLat = Number(latlng.lat.toFixed(6));
        const roundedLng = Number(latlng.lng.toFixed(6));
        const nearbyCity = cityOptions.find((city) => Math.abs(city.lat - roundedLat) < 0.8 && Math.abs(city.lng - roundedLng) < 0.8);

        applyLocationSelection(type, {
            code: nearbyCity?.code ?? (data.destination || 'PIN'),
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
                    Contoh Samarinda: <span className="font-black text-indigo-600">Lat -0.4948</span>,
                    <span className="ml-1 font-black text-indigo-600">Lng 117.1436</span>.
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

                        {/* Origin locked to warehouse */}
                        <div className="rounded-[28px] border bg-indigo-50/40 border-indigo-100/70 p-6 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Asal (Origin) — Gudang Utama</div>
                                    <p className="mt-1 text-[13px] font-semibold text-slate-500">Pengiriman selalu berasal dari gudang utama Samarinda.</p>
                                </div>
                                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-black text-emerald-700 uppercase tracking-wider">Fixed</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="rounded-2xl bg-white border border-indigo-100 px-4 py-3">
                                    <div className="text-[9px] font-black uppercase tracking-wider text-indigo-400 mb-1">Kode</div>
                                    <div className="text-[14px] font-black text-slate-900">{WAREHOUSE_ORIGIN.code}</div>
                                </div>
                                <div className="rounded-2xl bg-white border border-indigo-100 px-4 py-3">
                                    <div className="text-[9px] font-black uppercase tracking-wider text-indigo-400 mb-1">Nama Gudang</div>
                                    <div className="text-[14px] font-black text-slate-900">{WAREHOUSE_ORIGIN.label}</div>
                                </div>
                                <div className="rounded-2xl bg-white border border-indigo-100 px-4 py-3">
                                    <div className="text-[9px] font-black uppercase tracking-wider text-indigo-400 mb-1">Koordinat</div>
                                    <div className="text-[14px] font-black text-slate-900">{WAREHOUSE_ORIGIN.lat}, {WAREHOUSE_ORIGIN.lng}</div>
                                </div>
                            </div>
                        </div>

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
                                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tahap Tracking</label>
                                    <select className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-[13px] font-bold" value={data.tracking_stage} onChange={(e) => setData('tracking_stage', e.target.value)}>
                                        {TRACKING_STAGE_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
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
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Barang Dikirim</div>
                                <button type="button" onClick={addItem} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg hover:bg-indigo-100 transition-colors">
                                    + Tambah Item
                                </button>
                            </div>
                            {data.items.length === 0 ? (
                                <div className="py-8 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                    <div className="text-[12px] font-bold text-gray-400">Belum ada barang ditambahkan</div>
                                    <div className="text-[11px] text-gray-300 mt-1">Klik "Tambah Item" untuk menambahkan</div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {data.items.map((item, index) => (
                                        <div key={index} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-black text-gray-500">Item #{index + 1}</span>
                                                <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 text-[11px] font-bold">Hapus</button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="col-span-2">
                                                    <label className="mb-1 block text-[9px] font-black uppercase tracking-wider text-gray-400">Produk dari Katalog</label>
                                                    <select className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-bold" value={item.product_id} onChange={(e) => updateItem(index, 'product_id', e.target.value)}>
                                                        <option value="">Pilih produk atau isi manual</option>
                                                        {products.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name} (stok: {p.available_stock})</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="mb-1 block text-[9px] font-black uppercase tracking-wider text-gray-400">Nama Produk *</label>
                                                    <input type="text" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-bold" value={item.product_name} onChange={(e) => updateItem(index, 'product_name', e.target.value)} required />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-[9px] font-black uppercase tracking-wider text-gray-400">SKU</label>
                                                    <input type="text" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-bold" value={item.sku} onChange={(e) => updateItem(index, 'sku', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-[9px] font-black uppercase tracking-wider text-gray-400">Jumlah *</label>
                                                    <input type="number" min="0" step="any" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-bold" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} required />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-[9px] font-black uppercase tracking-wider text-gray-400">Satuan</label>
                                                    <input type="text" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-bold" value={item.unit} onChange={(e) => updateItem(index, 'unit', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-[9px] font-black uppercase tracking-wider text-gray-400">Berat (kg)</label>
                                                    <input type="number" min="0" step="0.01" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-bold" value={item.weight_kg} onChange={(e) => updateItem(index, 'weight_kg', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
