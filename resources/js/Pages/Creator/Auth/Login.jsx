import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.login'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <Head title="Creator Login" />

            <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden flex flex-col md:flex-row">
                
                {/* 左側：ビジュアルセクション */}
                <div className="md:w-1/2 bg-slate-900 p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
                    
                    <div className="relative z-10">
                        <Link href="/" className="text-white font-black text-2xl tracking-tighter uppercase">
                            Nexus<span className="text-indigo-500">.</span> <span className="text-sm font-bold text-slate-500">CREATOR</span>
                        </Link>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-4xl font-black text-white leading-tight tracking-tighter uppercase">
                            Empower Your <br />
                            <span className="text-indigo-500">Creativity.</span>
                        </h2>
                        <p className="mt-4 text-slate-400 font-medium">
                            世界中のファンと繋がり、あなたの情熱を形にする。
                            クリエイターダッシュボードへようこそ。
                        </p>
                    </div>

                    <div className="relative z-10 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        © 2026 Nexus Global Showcase
                    </div>
                </div>

                {/* 右側：フォームセクション */}
                <div className="md:w-1/2 p-12 md:p-20">
                    <div className="mb-10">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Login to Studio</h3>
                        <p className="text-slate-400 text-sm font-bold mt-2">クリエイターアカウントでログイン</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                            <input
                                type="email"
                                value={data.email}
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900"
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="studio@example.com"
                            />
                            {errors.email && <p className="mt-2 text-xs text-rose-500 font-bold">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
                            <input
                                type="password"
                                value={data.password}
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="text-xs font-bold text-slate-500 uppercase">Remember me</span>
                            </label>
                            <Link className="text-xs font-black text-indigo-600 hover:underline uppercase">Forgot?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                        >
                            Enter Dashboard
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase">
                            まだ登録がお済みでないですか？
                            <Link 
                                href={route('creator.register')} 
                                className="ml-2 text-indigo-600 font-black hover:underline"
                            >
                                Apply as Creator
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}