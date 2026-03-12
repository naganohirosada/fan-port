import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function FrontLayout({ user, children }) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* --- Fan Header --- */}
            <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
                            Fan-Port<span className="text-indigo-600">.</span>
                        </Link>
                        <div className="hidden md:flex space-x-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <Link href="/" className="hover:text-indigo-600 transition-colors">Explore Projects</Link>
                            <Link href="#" className="hover:text-indigo-600 transition-colors">Global GO List</Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        {user ? (
                            /* --- ログイン済み：ユーザー情報 ＆ マイページリンク --- */
                            <>
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-black text-slate-900 leading-none mb-1">
                                        {user.name}
                                    </p>
                                    <Link 
                                        href={route('fans.dashboard')} 
                                        className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter hover:text-indigo-700 transition-colors"
                                    >
                                        Go to Studio →
                                    </Link>
                                </div>
                                
                                <Link 
                                    href={route('fans.dashboard')}
                                    className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border-2 border-indigo-100 shadow-sm flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all duration-300"
                                >
                                    {user.thumbnail_url ? (
                                        <img src={user.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>👤</span>
                                    )}
                                </Link>
                            </>
                        ) : (
                            /* --- 未ログイン：ログイン ＆ 新規登録ボタン --- */
                            <div className="flex items-center space-x-4">
                                <Link 
                                    href={route('fans.login')} 
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    Login
                                </Link>
                                
                                <Link 
                                    href={route('fans.register')}
                                    className="px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all active:translate-y-0"
                                >
                                    Join the Crew
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* --- Main Content --- */}
            <main>{children}</main>

            {/* --- Simple Footer --- */}
            <footer className="py-12 border-t border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    &copy; 2026 Fan-Port Global Studio
                </p>
            </footer>
        </div>
    );
}