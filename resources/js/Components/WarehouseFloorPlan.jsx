import React, { useEffect, useState, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';

/* ─── Zone color palette by type ─── */
const ZONE_PALETTE = {
    storage:      { bg: '#f2d0cf', border: '#d4a5a3', rack: '#c9908e', text: '#8b3a38' },
    high_pick:    { bg: '#fde4c8', border: '#f0c99a', rack: '#e5b576', text: '#8b5e24' },
    bulk_storage: { bg: '#c8daf0', border: '#9ab8de', rack: '#7da3d1', text: '#2d5a8e' },
    electronics:  { bg: '#d8cef5', border: '#b5a5e8', rack: '#9d8dda', text: '#4a3694' },
    cross_dock:   { bg: '#c8e8e0', border: '#8dcdb8', rack: '#6bba9f', text: '#1a6b4a' },
    hazmat:       { bg: '#fdd', border: '#f99', rack: '#e77', text: '#a00' },
};
const DEFAULT_PAL = { bg: '#e8ecf1', border: '#b0bac8', rack: '#8e9bb0', text: '#3d4f66' };

function getPalette(type) {
    const key = (type || '').toLowerCase().replace(/[-\s]/g, '_');
    return ZONE_PALETTE[key] || DEFAULT_PAL;
}

function occColor(pct) {
    if (pct >= 90) return '#ef4444';
    if (pct >= 70) return '#f97316';
    if (pct >= 40) return '#eab308';
    return '#22c55e';
}

/* ─── Truck SVG icon ─── */
function TruckIcon({ x, y, flip }) {
    return (
        <g transform={`translate(${x},${y}) scale(${flip ? -0.7 : 0.7}, 0.7)`}>
            <rect x="0" y="4" width="28" height="16" rx="2" fill="#555" />
            <rect x="28" y="8" width="12" height="12" rx="2" fill="#777" />
            <circle cx="8" cy="22" r="3" fill="#333" />
            <circle cx="22" cy="22" r="3" fill="#333" />
            <circle cx="36" cy="22" r="3" fill="#333" />
        </g>
    );
}

/* ─── Rack block (small rectangle mimicking shelf top-view) ─── */
function RackBlock({ x, y, w, h, rack, zoneId, pal, isSelected, containerRef, setTooltip, goToRack }) {
    return (
        <g>
            <rect
                x={x} y={y} width={w} height={h}
                fill={isSelected ? '#28106F' : '#fff'}
                stroke={isSelected ? '#312e81' : pal.border}
                strokeWidth={isSelected ? 1.5 : 0.8}
                rx="1"
                style={{ cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); goToRack(zoneId, rack.id); }}
                onMouseEnter={(ev) => {
                    const r = containerRef.current?.getBoundingClientRect();
                    setTooltip({
                        x: ev.clientX - (r?.left ?? 0),
                        y: ev.clientY - (r?.top ?? 0) - 10,
                        text: `${rack.code} — ${rack.name}\nBarang: ${rack.items} | SKU: ${rack.skus}\nKeterisian: ${rack.occupancy}%`,
                    });
                }}
                onMouseLeave={() => setTooltip(null)}
            />
            <text x={x + w / 2} y={y + h / 2 + 3} textAnchor="middle" fontSize="5" fontWeight="700"
                fill={isSelected ? '#fff' : pal.text} style={{ pointerEvents: 'none' }}>
                {rack.code?.substring(0, 5)}
            </text>
        </g>
    );
}

export default function WarehouseFloorPlan({ zoneSummaries, rackSummaries, selectedZone, selectedRack, warehouseName }) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0 });
    const translateStart = useRef({ x: 0, y: 0 });
    const [tooltip, setTooltip] = useState(null);

    const MIN_SCALE = 0.4, MAX_SCALE = 3;

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setScale((p) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, p + (e.deltaY > 0 ? -0.12 : 0.12))));
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    const onMouseDown = (e) => {
        if (e.button !== 0) return;
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY };
        translateStart.current = { ...translate };
    };
    const onMouseMove = (e) => {
        if (!isPanning) return;
        setTranslate({
            x: translateStart.current.x + (e.clientX - panStart.current.x),
            y: translateStart.current.y + (e.clientY - panStart.current.y),
        });
    };
    const onMouseUp = () => setIsPanning(false);

    const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, s + 0.25));
    const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, s - 0.25));
    const zoomReset = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

    const goToZone = (zoneId) => router.get('/warehouse', { zone: zoneId }, { preserveScroll: true, preserveState: true });
    const goToRack = (zoneId, rackId) => router.get('/warehouse', { zone: zoneId, rack: rackId }, { preserveScroll: true, preserveState: true });
    const goToInbound = () => router.get('/wms-documents');
    const goToOutbound = () => router.get('/shipments');

    /* ─── SVG Dimensions ─── */
    const W = 1100, H = 700;
    const WALL = 8;
    const WX = 50, WY = 100, WW = W - 100, WH = H - 130; // warehouse interior

    /* ─── Classify zones into layout regions ─── */
    const allZones = zoneSummaries.map((z) => ({
        ...z,
        racks: rackSummaries.filter((r) => r.zone_id === z.id),
        pal: getPalette(z.type),
    }));

    // Find special zones
    const bulkIdx = allZones.findIndex((z) => z.type?.toLowerCase().includes('bulk'));
    const bulkZone = bulkIdx >= 0 ? allZones.splice(bulkIdx, 1)[0] : null;

    const prodIdx = allZones.findIndex((z) => z.type?.toLowerCase().includes('cross') || z.name?.toLowerCase().includes('prod'));
    const prodZone = prodIdx >= 0 ? allZones.splice(prodIdx, 1)[0] : null;

    // Split remaining: main zones (first 2) and bottom corner zones (rest)
    const mainZones = allZones.slice(0, Math.min(2, allZones.length));
    const cornerZones = allZones.slice(2);

    /* ─── Layout regions ─── */
    const headerH = 80;
    const topStripH = 45;
    const bulkStripH = bulkZone ? 35 : 0;
    const bottomRowH = cornerZones.length > 0 ? 80 : 0;
    const mainH = WH - headerH - topStripH - bulkStripH - bottomRowH - 20;

    const headerY = WY;
    const topStripY = WY + headerH;
    const mainY = topStripY + topStripH + 8;
    const bulkY = mainY + mainH + 8;
    const bottomY = bulkY + bulkStripH + 8;

    /* ─── Draw racks along edges of a zone ─── */
    function drawRacksInZone(zone, zx, zy, zw, zh) {
        if (!zone.racks || zone.racks.length === 0) return [];
        const rackW = 14, rackH = 8, gap = 2;
        const elements = [];
        const racks = zone.racks;
        let ri = 0;

        // Top edge racks
        for (let i = 0; ri < racks.length && i * (rackW + gap) + 8 < zw - 16; i++, ri++) {
            elements.push(
                <RackBlock key={racks[ri].id} x={zx + 8 + i * (rackW + gap)} y={zy + 4} w={rackW} h={rackH}
                    rack={racks[ri]} zoneId={zone.id} pal={zone.pal}
                    isSelected={selectedRack?.id === racks[ri].id}
                    containerRef={containerRef} setTooltip={setTooltip} goToRack={goToRack} />
            );
        }
        // Bottom edge racks
        for (let i = 0; ri < racks.length && i * (rackW + gap) + 8 < zw - 16; i++, ri++) {
            elements.push(
                <RackBlock key={racks[ri].id} x={zx + 8 + i * (rackW + gap)} y={zy + zh - rackH - 4} w={rackW} h={rackH}
                    rack={racks[ri]} zoneId={zone.id} pal={zone.pal}
                    isSelected={selectedRack?.id === racks[ri].id}
                    containerRef={containerRef} setTooltip={setTooltip} goToRack={goToRack} />
            );
        }
        // Left edge racks (vertical)
        for (let i = 0; ri < racks.length && i * (rackW + gap) + 20 < zh - 16; i++, ri++) {
            elements.push(
                <RackBlock key={racks[ri].id} x={zx + 4} y={zy + 16 + i * (rackH + gap + 2)} w={rackH} h={rackW}
                    rack={racks[ri]} zoneId={zone.id} pal={zone.pal}
                    isSelected={selectedRack?.id === racks[ri].id}
                    containerRef={containerRef} setTooltip={setTooltip} goToRack={goToRack} />
            );
        }
        // Right edge racks (vertical)
        for (let i = 0; ri < racks.length && i * (rackW + gap) + 20 < zh - 16; i++, ri++) {
            elements.push(
                <RackBlock key={racks[ri].id} x={zx + zw - rackH - 4} y={zy + 16 + i * (rackH + gap + 2)} w={rackH} h={rackW}
                    rack={racks[ri]} zoneId={zone.id} pal={zone.pal}
                    isSelected={selectedRack?.id === racks[ri].id}
                    containerRef={containerRef} setTooltip={setTooltip} goToRack={goToRack} />
            );
        }
        return elements;
    }

    /* ─── Zone rect with label ─── */
    function renderZone(zone, x, y, w, h) {
        const isSelected = selectedZone?.id === zone.id;
        return (
            <g key={zone.id}>
                <rect x={x} y={y} width={w} height={h}
                    fill={zone.pal.bg} stroke={isSelected ? '#28106F' : zone.pal.border}
                    strokeWidth={isSelected ? 3 : 1.5} rx="4"
                    style={{ cursor: 'pointer' }}
                    onClick={() => goToZone(zone.id)}
                    onMouseEnter={(e) => {
                        const r = containerRef.current?.getBoundingClientRect();
                        setTooltip({
                            x: e.clientX - (r?.left ?? 0),
                            y: e.clientY - (r?.top ?? 0) - 10,
                            text: `${zone.code} — ${zone.name}\nTipe: ${zone.type} | Kapasitas: ${zone.capacity}\nKeterisian: ${zone.occupancy}% | Rak: ${zone.rack_count}`,
                        });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                />
                {/* Zone label */}
                <text x={x + w / 2} y={y + h / 2 - 4} textAnchor="middle" fontSize="13" fontWeight="800" fill={zone.pal.text} style={{ pointerEvents: 'none' }}>
                    {zone.name || zone.code}
                </text>
                <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fontSize="9" fontWeight="700" fill={zone.pal.text} opacity="0.6" style={{ pointerEvents: 'none' }}>
                    {zone.code}
                </text>
                {/* Occupancy badge */}
                <rect x={x + w - 40} y={y + 5} width="34" height="16" fill="white" rx="4" opacity="0.8" />
                <text x={x + w - 23} y={y + 16} textAnchor="middle" fontSize="8" fontWeight="900" fill={occColor(zone.occupancy)} style={{ pointerEvents: 'none' }}>
                    {zone.occupancy}%
                </text>
                {/* Racks */}
                {drawRacksInZone(zone, x, y, w, h)}
            </g>
        );
    }

    return (
        <div className="rounded-[24px] border border-[#EDE8FC] bg-white p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-[18px] font-black text-[#28106F]">Visualisasi Denah Gudang</h3>
                    <p className="mt-1 text-[13px] font-semibold text-gray-500">
                        Peta tata letak zona dan rak — klik zona atau rak untuk navigasi
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="mr-2 text-[11px] font-bold text-gray-400">{Math.round(scale * 100)}%</span>
                    <button type="button" onClick={zoomOut} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dbe4f0] bg-white text-[16px] font-black text-gray-500 transition hover:bg-gray-50">−</button>
                    <button type="button" onClick={zoomReset} className="rounded-lg border border-[#dbe4f0] bg-white px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-500 transition hover:bg-gray-50">Reset</button>
                    <button type="button" onClick={zoomIn} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dbe4f0] bg-white text-[16px] font-black text-gray-500 transition hover:bg-gray-50">+</button>
                    <span className="ml-2 rounded-full bg-[#eef2ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#28106F]">
                        Interaktif
                    </span>
                </div>
            </div>

            {/* SVG Container */}
            <div
                ref={containerRef}
                className="relative overflow-hidden rounded-[18px] border border-[#EDE8FC] bg-[#f5f5f0]"
                style={{ height: 560, cursor: isPanning ? 'grabbing' : 'grab', userSelect: 'none' }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            >
                <svg
                    width={W} height={H}
                    style={{
                        transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                        transformOrigin: '0 0',
                        transition: isPanning ? 'none' : 'transform 0.15s ease-out',
                    }}
                >
                    {/* Background */}
                    <rect width={W} height={H} fill="#f5f5f0" />

                    {/* ═══ Warehouse outer walls ═══ */}
                    <rect x={WX} y={WY} width={WW} height={WH} fill="#fff" stroke="#9ca3af" strokeWidth={WALL} rx="6" />

                    {/* ═══ Header area (top, inside walls) ═══ */}
                    <line x1={WX} y1={WY + headerH} x2={WX + WW} y2={WY + headerH} stroke="#9ca3af" strokeWidth="2" />

                    {/* Header labels */}
                    <text x={WX + 80} y={WY + 35} textAnchor="middle" fontSize="16" fontWeight="700" fill="#374151">Purchase</text>
                    <text x={WX + WW / 2} y={WY + 30} textAnchor="middle" fontSize="18" fontWeight="800" fill="#1f2937">
                        {warehouseName || 'Warehouse'}
                    </text>
                    <text x={WX + WW / 2} y={WY + 50} textAnchor="middle" fontSize="10" fontWeight="600" fill="#6b7280">FLOOR PLAN</text>
                    <text x={WX + WW - 80} y={WY + 35} textAnchor="middle" fontSize="16" fontWeight="700" fill="#374151">Sales</text>

                    {/* Production board box */}
                    <rect x={WX + WW / 2 - 60} y={WY + 58} width="120" height="18" fill="white" stroke="#9ca3af" strokeWidth="1" rx="3" />
                    <text x={WX + WW / 2} y={WY + 71} textAnchor="middle" fontSize="8" fontWeight="600" fill="#6b7280">Production Board</text>

                    {/* ═══ Top strip zone (Production) ═══ */}
                    {prodZone && (() => {
                        const stripX = WX + WALL + 80;
                        const stripW = WW - WALL * 2 - 160;
                        return renderZone(prodZone, stripX, topStripY, stripW, topStripH);
                    })()}

                    {/* ═══ Main zones (1-2 large zones side by side) ═══ */}
                    {mainZones.map((zone, idx) => {
                        const count = mainZones.length;
                        const gap = 12;
                        const availW = WW - WALL * 2 - gap * (count - 1);
                        const zw = availW / count;
                        const zx = WX + WALL + idx * (zw + gap);
                        return renderZone(zone, zx, mainY, zw, mainH);
                    })}

                    {/* ═══ Bulk zone strip ═══ */}
                    {bulkZone && renderZone(bulkZone, WX + WALL, bulkY, WW - WALL * 2, bulkStripH)}

                    {/* ═══ Bottom corner zones ═══ */}
                    {cornerZones.length > 0 && (() => {
                        const gap = 10;
                        const count = cornerZones.length;
                        const availW = WW - WALL * 2 - gap * (count - 1);
                        const zw = availW / count;
                        return cornerZones.map((zone, idx) => {
                            const zx = WX + WALL + idx * (zw + gap);
                            return renderZone(zone, zx, bottomY, zw, bottomRowH);
                        });
                    })()}

                    {/* ═══ Inbound dock (left) ═══ */}
                    <rect x={WX - 30} y={WY + WH - 80} width="30" height="50" fill="#f5f5f0" stroke="#9ca3af" strokeWidth="2" rx="3"
                        style={{ cursor: 'pointer' }} onClick={goToInbound} />
                    <text x={WX - 38} y={WY + WH - 30} fontSize="11" fontWeight="700" fill="#374151" textAnchor="end"
                        style={{ cursor: 'pointer' }} onClick={goToInbound}>Inbound</text>
                    <TruckIcon x={WX - 48} y={WY + WH - 72} flip={false} />

                    {/* ═══ Outbound dock (right) ═══ */}
                    <rect x={WX + WW} y={WY + WH - 80} width="30" height="50" fill="#f5f5f0" stroke="#9ca3af" strokeWidth="2" rx="3"
                        style={{ cursor: 'pointer' }} onClick={goToOutbound} />
                    <text x={WX + WW + 38} y={WY + WH - 30} fontSize="11" fontWeight="700" fill="#374151" textAnchor="start"
                        style={{ cursor: 'pointer' }} onClick={goToOutbound}>Outbound</text>
                    <TruckIcon x={WX + WW + 2} y={WY + WH - 72} flip={true} />

                    {/* ═══ Wall openings (dock doors) ═══ */}
                    <rect x={WX - 2} y={WY + WH - 78} width={WALL + 4} height="46" fill="#f5f5f0" />
                    <rect x={WX + WW - WALL - 2} y={WY + WH - 78} width={WALL + 4} height="46" fill="#f5f5f0" />

                    {/* ═══ Empty state ═══ */}
                    {zoneSummaries.length === 0 && (
                        <text x={W / 2} y={H / 2} textAnchor="middle" fill="#94a3b8" fontSize="16" fontWeight="700">
                            Belum ada zona — buat zona baru untuk memulai
                        </text>
                    )}
                </svg>

                {/* Tooltip */}
                {tooltip && (
                    <div
                        className="pointer-events-none absolute z-50 max-w-[240px] rounded-xl border border-[#e2e8f0] bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                        style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
                    >
                        {tooltip.text.split('\n').map((line, i) => (
                            <div key={i} className={`text-[11px] font-semibold ${i === 0 ? 'font-black text-[#28106F]' : 'text-gray-500'}`}>
                                {line}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Legend:</span>
                {Object.entries(ZONE_PALETTE).map(([type, c]) => (
                    <div key={type} className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }} />
                        <span className="text-[10px] font-bold capitalize text-gray-500">{type.replace(/_/g, ' ')}</span>
                    </div>
                ))}
                <div className="ml-auto flex items-center gap-3 text-[10px] font-bold text-gray-400">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#22c55e]" /> &lt;40%</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#eab308]" /> 40-70%</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#f97316]" /> 70-90%</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#ef4444]" /> &gt;90%</span>
                </div>
            </div>
        </div>
    );
}
