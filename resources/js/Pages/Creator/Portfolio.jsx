import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Portfolio({ creator, products }) {
    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <Head title={`${creator.name} Portfolio`} />

            {/* ヘッダーセクション */}
            <div className="bg-white border-b border-slate-200 pt-24 pb-12 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full mx-auto mb-6 p-1.5 shadow-xl">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-4xl">🎨</div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">{creator.name}</h1>
                    <div className="flex justify-center items-center space-x-4 text-sm text-slate-500 font-bold">
                        <span>🇯🇵 JAPAN</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span>{creator.products_count} PROJECTS</span>
                    </div>
                    <p className="mt-4 max-w-lg mx-auto text-slate-500 leading-relaxed">
                        Welcome to my global portfolio. Check out my upcoming projects and let me know your interest!
                    </p>
                </div>
            </div>

            {/* 作品グリッド */}
            <main className="max-w-5xl mx-auto py-12 px-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <Link 
                            href={route('products.show', product.slug)} 
                            key={product.id} 
                            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100"
                        >
                            <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                                {product.images[0] ? (
                                    <img 
                                        src={product.images[0].image_url} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        alt=""
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 shadow-sm">
                                    COMING SOON
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-slate-900 truncate mb-1 text-lg">
                                    {product.translations.find(t => t.column_name === 'title')?.text || 'Untitled'}
                                </h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-indigo-600 font-black">¥{Number(product.estimated_price).toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Details →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}