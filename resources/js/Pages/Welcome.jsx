import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Sistem Gudang" />

            <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] text-slate-900">
                <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
                    <header className="flex items-center justify-between py-4">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600">Operasional Gudang</p>
                            <h1 className="mt-2 text-[26px] font-black tracking-tight text-slate-900">Sistem Inventori Pergudangan</h1>
                        </div>

                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-[13px] font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
                                >
                                    Masuk ke Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-[13px] font-black text-white transition hover:bg-slate-800"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="flex flex-1 items-center">
                        <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                            <section className="rounded-[32px] border border-blue-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(37,99,235,0.08)] lg:p-12">
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Gudang Tunggal</p>
                                <h2 className="mt-4 max-w-2xl text-[44px] font-black leading-[1.05] tracking-tight text-slate-900">
                                    Satu tempat untuk stok, rak, mutasi barang, pemasok, dan laporan gudang.
                                </h2>
                                <p className="mt-6 max-w-2xl text-[16px] font-semibold leading-7 text-slate-500">
                                    Aplikasi ini dirancang untuk operasional satu gudang yang rapi: barang masuk, barang keluar, penempatan rak, purchase order, pengiriman, dan pelaporan berjalan dalam alur yang saling terhubung.
                                </p>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <div className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-[12px] font-black uppercase tracking-[0.15em] text-blue-700">
                                        Inventaris
                                    </div>
                                    <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[12px] font-black uppercase tracking-[0.15em] text-slate-600">
                                        Rack & Zona
                                    </div>
                                    <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[12px] font-black uppercase tracking-[0.15em] text-slate-600">
                                        Transaksi
                                    </div>
                                    <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[12px] font-black uppercase tracking-[0.15em] text-slate-600">
                                        Laporan
                                    </div>
                                </div>

                                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Alur Masuk</div>
                                        <p className="mt-3 text-[14px] font-bold leading-6 text-slate-700">PO, penerimaan barang, dan penambahan stok tercatat jelas.</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Lokasi Fisik</div>
                                        <p className="mt-3 text-[14px] font-bold leading-6 text-slate-700">Setiap barang dapat dikaitkan ke zona, rak, dan kapasitas aktual.</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Audit</div>
                                        <p className="mt-3 text-[14px] font-bold leading-6 text-slate-700">Mutasi dan laporan memudahkan pengecekan operasional harian.</p>
                                    </div>
                                </div>
                            </section>

                            <aside className="grid gap-4">
                                <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                                    <div className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Modul Utama</div>
                                    <ul className="mt-5 space-y-3 text-[14px] font-bold text-slate-700">
                                        <li>Dashboard ringkasan operasional gudang</li>
                                        <li>Manajemen inventaris dan stok per rak</li>
                                        <li>Riwayat transaksi barang masuk dan keluar</li>
                                        <li>Supplier, purchase order, dan pengiriman</li>
                                        <li>Laporan PDF, Excel, dan analisis inventaris</li>
                                    </ul>
                                </div>

                                <div className="rounded-[28px] border border-slate-200 bg-slate-900 p-7 text-white shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
                                    <div className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-200">Info Sistem</div>
                                    <div className="mt-5 space-y-4 text-[14px] font-bold text-slate-200">
                                        <p>Framework aplikasi menggunakan Laravel v{laravelVersion} dan PHP v{phpVersion}.</p>
                                        <p>Tampilan ini sudah diarahkan untuk kebutuhan gudang operasional dengan tema terang yang konsisten.</p>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
