import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        country_code: 'JP',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.register'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <Head title="Join as Creator" />

            <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden flex flex-col md:flex-row-reverse">
                
                {/* 左側（配置上は右）：ビジュアル */}
                <div className="md:w-1/2 bg-indigo-600 p-12 flex flex-col justify-between relative overflow-hidden text-white">
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full -ml-20 -mb-20"></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-4xl font-black leading-tight tracking-tighter uppercase">
                            Start Your <br />
                            <span className="text-indigo-200">Global Journey.</span>
                        </h2>
                        <p className="mt-6 font-medium text-indigo-100">
                            あなたの作品を世界へ。
                            Nexusはクリエイターの情熱を、国境を越えてファンに届けます。
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">1</div>
                            <p className="text-xs font-bold uppercase tracking-widest">Create Profile</p>
                        </div>
                        <div className="flex items-center space-x-3 opacity-50">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">2</div>
                            <p className="text-xs font-bold uppercase tracking-widest">Upload Artworks</p>
                        </div>
                    </div>
                </div>

                {/* 右側（配置上は左）：フォーム */}
                <div className="md:w-1/2 p-12 md:p-16">
                    <div className="mb-8">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Apply as Creator</h3>
                        <p className="text-slate-400 text-sm font-bold mt-2">クリエイターとして登録する</p>
                    </div>

                    <form onSubmit={submit} className="grid grid-cols-1 gap-5">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Creator Name</label>
                            <input
                                type="text"
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Your Artist Name"
                            />
                            {errors.name && <p className="mt-2 text-xs text-rose-500 font-bold">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="email@example.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Password</label>
                                <input
                                    type="password"
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Confirm</label>
                                <input
                                    type="password"
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 mt-4"
                        >
                            Complete Registration
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link href={route('creator.login')} className="text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest">
                            Already have an account? <span className="underline">Login</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}