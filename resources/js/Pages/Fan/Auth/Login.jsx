import { useEffect } from 'react';
import FrontLayout from '@/Layouts/FrontLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => { reset('password'); };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('fans.login'));
    };

    return (
        <FrontLayout>
            <Head title="Login to FAN-PORT" />

            <div className="max-w-md mx-auto py-24 px-6">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Welcome Back.</h1>
                    <p className="text-slate-500 mt-2 font-medium">ログインして、お気に入りの作品を応援しよう。</p>
                </div>

                {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500 font-bold">{errors.email}</p>}
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-500 font-bold">{errors.password}</p>}
                    </div>

                    <button
                        disabled={processing}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
                    >
                        {processing ? 'Connecting...' : 'SIGN IN'}
                    </button>
                </form>

                <div className="mt-8 text-center space-y-2">
                    <Link href={route('fans.register')} className="block text-sm font-bold text-slate-400 hover:text-indigo-600 transition">
                        新規登録はこちら（Join as Fan）
                    </Link>
                </div>
            </div>
        </FrontLayout>
    );
}