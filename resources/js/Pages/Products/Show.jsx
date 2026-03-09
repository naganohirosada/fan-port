import FrontLayout from '@/Layouts/FrontLayout';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';

export default function Show({ product, wantsByCountry, countries, auth }) {
    const fan = auth.fan;

    const getFlagEmoji = (countryCode) => {
        if (!countryCode) return '🌐';
        return countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
    };

    const handleWantClick = () => {
        if (!fan) {
            router.get(route('fans.login'));
            return;
        }
        router.post(route('products.want', product.id), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(product.is_wanted ? 'Removed' : 'Added to Want list! ❤️')
        });
    };

    return (
        <FrontLayout>
            <Head title={product.translations[0]?.text} />

            <div className="max-w-7xl mx-auto pt-32 pb-24 px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    
                    {/* 左：巨大画像ギャラリー */}
                    <div className="space-y-6">
                        <div className="aspect-[3/4] rounded-[3rem] overflow-hidden bg-slate-100 shadow-2xl">
                            <img src={product.images[0]?.image_url} className="w-full h-full object-cover" />
                        </div>
                        {/* サムネイルがある場合はここに並べる */}
                    </div>

                    {/* 右：詳細・アクション */}
                    <div className="space-y-10">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <span className="px-4 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
                                    {product.category || 'Collectible'}
                                </span>
                                <span className="text-slate-400 font-bold text-xs uppercase tracking-tighter">
                                    ID: #{product.id.toString().padStart(5, '0')}
                                </span>
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 leading-none tracking-tighter uppercase mb-4">
                                {product.translations[0]?.text}
                            </h1>
                            <p className="text-3xl font-black text-indigo-600 tracking-tight">
                                ¥{Number(product.estimated_price).toLocaleString()}
                            </p>
                        </div>

                        {/* メインアクション：Want! ボタン */}
                        <button
                            onClick={handleWantClick}
                            className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all duration-500 shadow-xl flex items-center justify-center space-x-4 ${
                                product.is_wanted 
                                ? 'bg-rose-500 text-white hover:bg-rose-600 scale-[1.02]' 
                                : 'bg-slate-900 text-white hover:bg-black'
                            }`}
                        >
                            <svg className="w-8 h-8" fill={product.is_wanted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                            <span>{product.is_wanted ? 'WANTED!' : 'I WANT THIS!'}</span>
                        </button>

                        {/* グローバル熱狂統計：ここがアツい！ */}
                        <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                                Global Interest
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                {wantsByCountry.map((item) => (
                                    <div key={item.country_code} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                                        <span className="text-xl">{getFlagEmoji(item.country_code)}</span>
                                        <span className="font-bold text-slate-700 text-sm">{countries[item.country_code]}</span>
                                        <span className="text-indigo-600 font-black text-sm">{item.count}</span>
                                    </div>
                                ))}
                                {wantsByCountry.length === 0 && (
                                    <p className="text-slate-400 text-sm font-bold">No global interactions yet.</p>
                                )}
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase">
                                    Total Heat: <span className="text-rose-500 font-black text-lg ml-1">{product.wants_count} WANTS</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}