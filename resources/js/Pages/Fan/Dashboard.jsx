import FrontLayout from '../../Layouts/FrontLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, stats, products, fanStats }) {
    const { fan } = auth;
    const getFlagEmoji = (code) => code ? code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt())) : '🌐';

    return (
        <FrontLayout>
            <Head title="My Collections" />

            {/* --- ヒーローセクション --- */}
            <div className="bg-slate-900 pt-32 pb-48 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                        <div className="flex items-center space-x-8">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white/10 overflow-hidden shadow-2xl">
                                    <img src={fan.thumbnail_url} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 text-3xl">{getFlagEmoji(fan.country_code)}</div>
                            </div>
                            <div>
                                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {fanStats?.rank || 'Rising Fan'}
                                </span>
                                <h1 className="text-5xl font-black text-white leading-none tracking-tighter mt-4 uppercase">
                                    {fan.name}<span className="text-indigo-500">.</span>
                                </h1>
                            </div>
                        </div>

                        {/* 統計カードを横並びで強調 */}
                        <div className="flex flex-wrap gap-4">
                            {(stats || []).map((stat, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] min-w-[160px]">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{stat.name}</p>
                                    <p className="text-2xl font-black text-white">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- メインコンテンツ --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20 pb-24">
                <div className="bg-white shadow-2xl shadow-slate-900/10 rounded-[4rem] p-12 border border-slate-100">
                    
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">My Curated Gallery</h2>
                            <p className="text-slate-400 font-bold mt-2">あなたがこれまでに「Want!」した至高のコレクション</p>
                        </div>
                        <div className="hidden md:block bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-sm font-black text-slate-400">
                            {products.length} ITEMS COLLECTED
                        </div>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
                            {products.map((item) => (
                                <Link key={item.id} href={route('products.show', item.slug)} className="group">
                                    <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3">
                                        <img src={item.images[0]?.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        
                                        {/* グラデーションオーバーレイ */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        
                                        {/* ホバー時に浮き出る情報 */}
                                        <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">
                                                {item.category}
                                            </p>
                                            <h4 className="text-white font-bold text-sm leading-tight uppercase truncate mb-2">
                                                {item.translations[0]?.text}
                                            </h4>
                                            <div className="flex items-center justify-between pt-3 border-t border-white/20">
                                                <span className="text-white font-black text-xs">¥{Number(item.estimated_price).toLocaleString()}</span>
                                                <span className="text-rose-400 text-[10px] font-black">{item.wants_count} WANTS</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 px-2 group-hover:hidden transition-all">
                                        <h4 className="font-bold text-slate-800 text-xs truncate uppercase tracking-tighter">{item.translations[0]?.text}</h4>
                                        <p className="text-indigo-600 font-black text-[10px] mt-0.5">¥{Number(item.estimated_price).toLocaleString()}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-black uppercase tracking-widest">No items in your collection yet.</p>
                            <Link href="/" className="inline-block mt-6 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition">
                                DISCOVER PRODUCTS
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </FrontLayout>
    );
}