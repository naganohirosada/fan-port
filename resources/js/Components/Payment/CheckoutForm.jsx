// resources/js/Components/Payment/CheckoutForm.jsx

import { useForm } from '@inertiajs/react';

export default function CheckoutForm({ onCancel, methodType }) {
    const { data, setData, post, processing } = useForm({
        type: methodType,
        // Card
        card_name: '', card_number: '', exp: '', cvc: '',
        // PayPal / BNPL
        email: '', 
        // Cash App
        cashtag: '',
        // Digital Wallet
        wallet_device: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('fans.payments.store-mock'));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                
                {/* --- 1. Credit Card --- */}
                {methodType === 'card' && (
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Card Details</h4>
                        <input type="text" placeholder="NAME ON CARD" value={data.card_name} onChange={e => setData('card_name', e.target.value)} className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 font-bold" />
                        <input type="text" placeholder="CARD NUMBER" className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 font-bold" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="MM/YY" className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 font-bold" />
                            <input type="text" placeholder="CVC" className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 font-bold" />
                        </div>

                        {/* ブランド選択を追加 */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black ml-2 uppercase text-slate-400">Card Brand</label>
                            <div className="grid grid-cols-5 gap-2">
                                {['visa', 'mastercard', 'amex', 'discover', 'jcb'].map((b) => (
                                    <button
                                        key={b}
                                        type="button"
                                        onClick={() => setData('brand', b)}
                                        className={`py-2 rounded-xl border-2 text-[8px] font-black uppercase transition-all ${
                                            data.brand === b 
                                            ? 'border-slate-900 bg-slate-900 text-white shadow-md' 
                                            : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                        }`}
                                    >
                                        {b === 'mastercard' ? 'Master' : b}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 2. PayPal / BNPL (Email base) --- */}
                {(methodType === 'paypal' || methodType === 'bnpl') && (
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {methodType === 'paypal' ? 'PayPal Account' : 'BNPL Provider (Klarna/Affirm)'}
                        </h4>
                        <input type="email" placeholder="EMAIL ADDRESS" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 font-bold" />
                    </div>
                )}

                {/* --- 3. Digital Wallets --- */}
                {methodType === 'wallet' && (
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Digital Wallet Setup</h4>
                        <select value={data.wallet_device} onChange={e => setData('wallet_device', e.target.value)} className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 font-bold text-sm">
                            <option value="">Select Primary Device</option>
                            <option value="apple_pay">Apple Pay (iPhone / Mac)</option>
                            <option value="google_pay">Google Pay (Android / Chrome)</option>
                        </select>
                    </div>
                )}

                {/* --- 4. Cash App Pay --- */}
                {methodType === 'cashapp' && (
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cash App Details</h4>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                            <input type="text" placeholder="Cashtag" value={data.cashtag} onChange={e => setData('cashtag', e.target.value)} className="w-full bg-slate-50 border-0 rounded-2xl pl-10 pr-6 py-4 font-bold" />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex space-x-4">
                <button type="submit" disabled={processing} className="flex-1 bg-slate-900 text-white py-5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-colors">
                    {processing ? "Linking..." : `Link ${(methodType || 'payment').toUpperCase()}`}
                </button>
                <button type="button" onClick={onCancel} className="px-8 py-5 bg-white text-slate-400 rounded-full font-black uppercase text-[10px] tracking-widest border border-slate-200">
                    Cancel
                </button>
            </div>
        </form>
    );
}