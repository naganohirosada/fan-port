import FrontLayout from '../Layouts/FrontLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';

export default function Welcome({ products, ranking, countryStats, countries }) {
    const { auth } = usePage().props;
    const fan = auth.fan;

    // 国コード(JP)を国旗絵文字(🇯🇵)に変換する関数
    const getFlagEmoji = (countryCode) => {
        if (!countryCode) return '🌐';
        return countryCode
            .toUpperCase()
            .replace(/./g, (char) => 
                String.fromCodePoint(127397 + char.charCodeAt())
            );
    };

    const handleWantClick = (e, product) => {
        e.preventDefault();
        if (!fan) {
            router.get(route('fans.login'));
            return;
        }

        router.post(route('products.want', product.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                if (!product.is_wanted) {
                    toast.success('Added to your Want list! ❤️', {
                        style: {
                            borderRadius: '16px',
                            background: '#333',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 'bold',
                        },
                    });
                } else {
                    toast('Removed from Want list', { icon: '🗑️' });
                }
            },
        });
    };

    return (
        <FrontLayout>
            <Head title="Global Otaku Showcase" />

            {/* ヒーローセクション */}
            <div className="bg-white pt-20 pb-16 px-6 border-b border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-none tracking-tighter">
                        DISCOVER THE <br />
                        <span className="text-indigo-600 underline decoration-indigo-200 decoration-8 underline-offset-4">NEXT HYPE.</span>
                    </h1>
                    <p className="mt-6 text-lg text-slate-500 font-medium max-w-xl">
                        世界中のクリエイターが放つ、まだ見ぬ熱狂をいち早くチェック。
                        あなたの「Want!」が、新しいプロジェクトを動かす。
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-12 px-6 space-y-24">
                
                {/* --- 1. 国別トレンド (Global Trends) --- */}
                <section>
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                {/* リアルタイム感を出す動くドット */}
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                </span>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                                    Live Global Trends
                                </h2>
                            </div>
                            <p className="text-slate-400 font-bold text-sm">
                                24Hリアルタイム集計：世界各地で今、最も熱い作品
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {countryStats.map((stat) => (
                            <div key={stat.country_code} className="bg-white rounded-[2.5rem] border border-slate-100 p-2 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                                <div className="flex items-center p-5 space-x-4">
                                    {/* 国旗 */}
                                    <span className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500 transform-gpu">
                                        {getFlagEmoji(stat.country_code)}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">
                                                {countries[stat.country_code]}
                                            </h4>
                                            <div className="flex items-center space-x-1">
                                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Hot</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {stat.total_wants.toLocaleString()} Global Interaction
                                        </p>
                                    </div>
                                </div>

                                {/* その国で人気の作品ミニカード */}
                                {stat.top_product ? (
                                    <Link 
                                        href={route('products.show', stat.top_product.slug)}
                                        className="flex items-center space-x-4 bg-slate-50 p-4 rounded-[2rem] hover:bg-indigo-50 transition-all duration-300 relative overflow-hidden"
                                    >
                                        {/* ランクインしている感の装飾 */}
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <svg className="w-12 h-12 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                            </svg>
                                        </div>

                                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-md border border-white">
                                            {stat.top_product.images?.[0] ? (
                                                <img 
                                                    src={stat.top_product.images[0].image_url} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[8px] text-slate-400">NO IMG</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 z-10">
                                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter mb-0.5">Top of this Region</p>
                                            <p className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">
                                                {stat.top_product.translations?.[0]?.text || 'Untitled'}
                                            </p>
                                        </div>
                                        <div className="text-right pr-2 z-10">
                                            <p className="text-sm font-black text-indigo-600 leading-none">
                                                {stat.top_product.wants_count || 0}
                                            </p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">Wants</p>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="p-6 text-center bg-slate-50 rounded-[2rem] mx-2 mb-2 border border-dashed border-slate-200">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No data available yet</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- 2. HOT RANKING TOP 5 --- */}
                <section>
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Hot Ranking</h2>
                            <p className="text-slate-400 font-bold text-sm">世界中から愛されるトップ5</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {ranking.map((item, index) => (
                            <Link key={item.id} href={route('products.show', item.slug)} className="group relative">
                                <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-lg transition-transform duration-500 group-hover:-translate-y-2">
                                    <img 
                                        src={item.images[0]?.image_url} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        alt={item.translations[0]?.text}
                                    />
                                    <div className="absolute top-0 left-0 w-10 h-10 bg-indigo-600 text-white flex items-center justify-center font-black text-lg rounded-br-2xl z-10">
                                        {index + 1}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <h4 className="mt-4 font-bold text-slate-800 text-xs truncate uppercase tracking-tight group-hover:text-indigo-600">
                                    {item.translations[0]?.text || 'Untitled'}
                                </h4>
                                <div className="flex items-center space-x-1 mt-1">
                                    <span className="text-rose-500 text-[10px] font-black">{item.wants_count}</span>
                                    <span className="text-slate-400 text-[10px] font-bold uppercase">Wants</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* --- 3. 作品一覧グリッド (New Arrivals) --- */}
                <section>
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">New Arrivals</h2>
                            <p className="text-slate-400 font-bold text-sm">最新のクリエイション</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <div key={product.id} className="group flex flex-col relative">
                                <div className="absolute top-4 right-4 z-20">
                                    <button
                                        onClick={(e) => handleWantClick(e, product)}
                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg backdrop-blur-md active:scale-90 ${
                                            product.is_wanted 
                                            ? 'bg-rose-500 text-white scale-105' 
                                            : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'
                                        }`}
                                    >
                                        <svg 
                                            className={`w-5 h-5 transition-transform duration-300 ${product.is_wanted ? 'scale-110' : 'scale-100'}`} 
                                            fill={product.is_wanted ? "currentColor" : "none"} 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24" 
                                            strokeWidth="2.5"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                    </button>
                                </div>

                                <Link href={route('products.show', product.slug)} className="flex flex-col h-full">
                                    <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-slate-200 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                                        {product.images[0] ? (
                                            <img 
                                                src={product.images[0].image_url} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                alt={product.translations[0]?.text}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">No Preview</div>
                                        )}
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                                            <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 shadow-sm uppercase tracking-tighter">
                                                {product.wants_count || 0} WANTS
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 px-2">
                                        <h3 className="font-bold text-slate-900 truncate leading-tight group-hover:text-indigo-600 transition uppercase text-sm tracking-tight">
                                            {product.translations[0]?.text || 'Untitled'}
                                        </h3>
                                        <p className="text-sm font-black text-slate-400 mt-1">
                                            ¥{Number(product.estimated_price).toLocaleString()}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </FrontLayout>
    );
}