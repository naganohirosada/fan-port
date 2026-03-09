import { Link, usePage } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';

export default function FrontLayout({ children }) {
    // 共有データからファンの情報を取得
    const { auth, countries } = usePage().props;
    const fan = auth.fan;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Toaster position="bottom-center" reverseOrder={false} />
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black tracking-tighter text-indigo-600">
                        FAN-PORT<span className="text-slate-400">.</span>
                    </Link>

                    <div className="flex items-center space-x-8">
                        <Link href="/" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition">Gallery</Link>

                        {fan ? (
                            /* --- ログイン中（ファン） --- */
                            <div className="flex items-center space-x-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-black text-slate-900 leading-none">{fan.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        {countries[fan.country_code] || fan.country_code}
                                    </p>
                                </div>
                                <Link href={route('fans.dashboard')} className="group relative">
                                    <div className="w-10 h-10 rounded-full border-2 border-indigo-100 overflow-hidden group-hover:border-indigo-500 transition-all">
                                        {fan.thumbnail_url ? (
                                            <img src={fan.thumbnail_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xs text-slate-400">?</div>
                                        )}
                                    </div>
                                    {/* ログアウトボタン（簡易版） */}
                                    <Link 
                                        method="post" 
                                        href={route('fans.logout')} 
                                        as="button"
                                        className="absolute -top-1 -right-1 bg-white shadow-sm border border-slate-100 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-2 h-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </Link>
                                </Link>
                            </div>
                        ) : (
                            /* --- 未ログイン --- */
                            <div className="flex items-center space-x-6">
                                <Link href={route('fans.login')} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition">Login</Link>
                                <Link 
                                    href={route('fans.register')} 
                                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                                >
                                    Join as Fan
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main>{children}</main>
        </div>
    );
}