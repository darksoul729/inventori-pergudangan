import{i as e}from"./chunk-DseTPa7n.js";import{a as t,l as n,n as r}from"./app-C3O3CbeG.js";import{c as i,i as a,l as o,n as s,r as c,s as l,t as u,u as d}from"./TileLayer-Mieg3JLq.js";import{t as f}from"./Popup-Bzqi4aIE.js";var p=e(o(),1),m=l(function({positions:e,...t},n){let r=new p.Polyline(e,t);return i(r,d(n,{overlayContainer:r}))},function(e,t,n){t.positions!==n.positions&&e.setLatLngs(t.positions)}),h=e(n(),1),g=r(),_=[-2.5489,118.0149];function v(e){return e==null||e===``?!1:Number.isFinite(Number(e))}function y(e,t){return v(e)&&v(t)?[Number(e),Number(t)]:null}function b({color:e,icon:t,pulse:n=!1}){let r=t===`warehouse`?`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V11h6v10"/></svg>`:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`;return p.default.divIcon({className:`shipment-map-marker`,html:`
            <div class="shipment-marker ${n?`shipment-marker-pulse`:``}" style="--marker-color: ${e};">
                ${r}
            </div>
        `,iconSize:[32,32],iconAnchor:[16,16],popupAnchor:[0,-16]})}function x({shipments:e}){let t=a();return(0,h.useEffect)(()=>{if(!e||e.length===0)return;let n=[];if(e.forEach(e=>{let t=y(e.origin_lat,e.origin_lng),r=y(e.dest_lat,e.dest_lng),i=y(e.driver_lat,e.driver_lng);t&&n.push(t),r&&n.push(r),i&&n.push(i)}),n.length===1){t.flyTo(n[0],11,{duration:.6});return}n.length>1&&t.fitBounds(n,{padding:[72,72],maxZoom:9})},[e,t]),null}function S({origin:e,destination:t,driver:n,shipment:r}){let i=r.tracking_stage===`delivered`||r.status===`delivered`,a=!!n;return(0,g.jsxs)(g.Fragment,{children:[e&&t&&(0,g.jsx)(m,{positions:[e,t],color:`#2563eb`,weight:4,opacity:.55,dashArray:`10 12`}),e&&a&&(0,g.jsx)(m,{positions:[e,n],color:i?`#10b981`:`#059669`,weight:5,opacity:.9}),a&&t&&!i&&(0,g.jsx)(m,{positions:[n,t],color:`#f59e0b`,weight:4,opacity:.8,dashArray:`8 10`})]})}function C({shipments:e=[]}){let n=e.some(e=>y(e.driver_lat,e.driver_lng));return(0,g.jsxs)(`div`,{className:`relative h-full w-full overflow-hidden rounded-[20px] border border-gray-100 bg-slate-100`,children:[(0,g.jsxs)(c,{center:_,zoom:5,style:{height:`100%`,width:`100%`,background:`#eef2f7`},zoomControl:!1,scrollWheelZoom:!0,children:[(0,g.jsx)(u,{url:`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`,attribution:`Tiles © Esri`}),(0,g.jsx)(u,{url:`https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`,attribution:`Labels © Esri`,opacity:.8}),(0,g.jsx)(x,{shipments:e}),e.map((e,n)=>{let r=y(e.origin_lat,e.origin_lng),i=y(e.dest_lat,e.dest_lng),a=y(e.driver_lat,e.driver_lng),o=e.tracking_stage===`delivered`||e.status===`delivered`;return(0,g.jsxs)(h.Fragment,{children:[(0,g.jsx)(S,{origin:r,destination:i,driver:a,shipment:e}),r&&(0,g.jsx)(s,{position:r,icon:b({color:`#4f46e5`,icon:`warehouse`}),children:(0,g.jsxs)(f,{children:[(0,g.jsx)(`div`,{className:`text-[11px] font-black uppercase tracking-wide text-indigo-600`,children:`Asal Pengiriman`}),(0,g.jsx)(`div`,{className:`text-[13px] font-bold text-slate-900`,children:e.origin_name}),(0,g.jsx)(`div`,{className:`text-[11px] font-semibold text-slate-500`,children:e.origin})]})}),i&&(0,g.jsx)(s,{position:i,icon:b({color:`#2563eb`,icon:`flag`}),children:(0,g.jsxs)(f,{children:[(0,g.jsx)(`div`,{className:`text-[11px] font-black uppercase tracking-wide text-blue-600`,children:`Tujuan Akhir`}),(0,g.jsx)(`div`,{className:`text-[13px] font-bold text-slate-900`,children:e.destination_name}),(0,g.jsx)(`div`,{className:`text-[11px] font-semibold text-slate-500`,children:e.destination})]})}),a&&(0,g.jsx)(s,{position:a,icon:p.default.divIcon({className:`custom-div-icon`,html:`
                                            <div class="truck-marker-container" style="--marker-color: ${e.last_location_mock?`#ef4444`:`#10b981`};">
                                                <div class="truck-pulse"></div>
                                                <div class="truck-icon-bg">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M22.21 10.74c-.04-.08-.08-.16-.13-.23l-3-4C18.84 6.18 18.44 6 18 6H9c-1.1 0-2 .9-2 2v2H2c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h1c1.1 0 2-.9 2-2v-5.26c0-.28-.06-.56-.16-.8c-.06-.15-.14-.29-.24-.42l-.39-.58zM7 19c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm11 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-9.5V12h-3V7.5L18 9.5z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        `,iconSize:[40,40],iconAnchor:[20,20],popupAnchor:[0,-20]}),children:(0,g.jsxs)(f,{children:[(0,g.jsx)(`div`,{className:`mb-1 text-[11px] font-black uppercase tracking-wide ${o?`text-emerald-600`:`text-red-600`}`,children:o?`Pengiriman Selesai`:`Posisi Driver dari GPS App`}),(0,g.jsx)(`div`,{className:`text-[13px] font-bold text-slate-900`,children:e.driver_name||`Driver`}),(0,g.jsx)(`div`,{className:`text-[11px] font-semibold text-slate-500`,children:e.last_location_at?`Update ${e.last_location_at}`:`${a[0]}, ${a[1]}`}),e.driver_id&&(0,g.jsxs)(`button`,{onClick:()=>t.get(route(`drivers.index`),{tab:`tracking`,id:e.driver_id}),className:`mt-3 w-full flex items-center justify-center gap-2 bg-[#3632c0] hover:bg-[#2a27a3] text-white text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-lg transition-all shadow-md active:scale-95`,children:[(0,g.jsxs)(`svg`,{className:`w-3 h-3`,fill:`none`,stroke:`currentColor`,viewBox:`0 0 24 24`,children:[(0,g.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:2,d:`M15 12a3 3 0 11-6 0 3 3 0 016 0z`}),(0,g.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:2,d:`M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z`})]}),`Lihat di Live Tracking`]})]})})]},e.database_id||e.id||n)})]}),!n&&(0,g.jsxs)(`div`,{className:`absolute left-4 top-4 z-[1000] max-w-[280px] rounded-2xl border border-amber-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur`,children:[(0,g.jsx)(`div`,{className:`text-[11px] font-black uppercase tracking-[0.16em] text-amber-600`,children:`GPS Driver Belum Masuk`}),(0,g.jsx)(`div`,{className:`mt-1 text-[12px] font-semibold leading-relaxed text-slate-600`,children:`Marker driver akan muncul setelah driver app mengirim lokasi ke server.`})]}),(0,g.jsx)(`div`,{className:`absolute bottom-4 left-4 z-[1000] rounded-xl border border-gray-100 bg-white/95 px-3 py-2 shadow-sm backdrop-blur`,children:(0,g.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,g.jsx)(`span`,{className:`h-2 w-2 rounded-full bg-blue-600`}),(0,g.jsx)(`span`,{className:`text-[10px] font-black uppercase tracking-widest text-gray-500`,children:`Rute Asal - Tujuan`})]})}),(0,g.jsx)(`style`,{children:`
                .shipment-map-marker {
                    background: transparent;
                    border: 0;
                }

                .shipment-marker {
                    align-items: center;
                    background: var(--marker-color);
                    border: 3px solid #fff;
                    border-radius: 999px;
                    box-shadow: 0 10px 25px rgb(15 23 42 / 0.25);
                    color: #fff;
                    display: flex;
                    justify-content: center;
                    position: relative;
                    width: 32px;
                    height: 32px;
                }

                .shipment-marker svg {
                    width: 16px;
                    height: 16px;
                }

                .truck-marker-container {
                    position: relative;
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .truck-icon-bg {
                    width: 42px;
                    height: 42px;
                    background: var(--marker-color);
                    border: 3px solid white;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.25);
                    z-index: 2;
                }

                .truck-icon-bg svg {
                    width: 24px;
                    height: 24px;
                }

                .shipment-marker-pulse::after, .truck-pulse {
                    animation: shipment-marker-pulse 2s infinite;
                    border: 2px solid var(--marker-color);
                    border-radius: 999px;
                    content: '';
                    inset: -8px;
                    opacity: 0.45;
                    position: absolute;
                }
                
                .truck-pulse {
                    border-radius: 16px;
                    inset: -6px;
                }

                @keyframes shipment-marker-pulse {
                    0% { transform: scale(0.8); opacity: 0.6; }
                    70% { transform: scale(1.4); opacity: 0; }
                    100% { transform: scale(1.4); opacity: 0; }
                }
            `})]})}export{C as t};