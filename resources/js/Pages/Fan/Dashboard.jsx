import FanLayout from "@/Layouts/FrontLayout";
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/Components/Payment/CheckoutForm';
import axios from 'axios';
import OrderDetailsModal from '@/Components/Order/OrderDetailsModal';

const stripePromise = import.meta.env.VITE_STRIPE_KEY 
    ? loadStripe(import.meta.env.VITE_STRIPE_KEY) 
    : null;

export default function Dashboard({ auth, activeGroups = [], orders = [], countries = [], wants = [] }) {
    // URLパラメータに tab=payments があれば初期タブを切り替え
    const urlParams = new URLSearchParams(window.location.search);
    const [activeTab, setActiveTab] = useState(urlParams.get('tab') || 'wants');
    
    const [paymentMode, setPaymentMode] = useState('list');
    const [selectedMethodType, setSelectedMethodType] = useState(null);
    const [clientSecret, setClientSecret] = useState('');

    const [shippingMode, setShippingMode] = useState('list'); 
    const [editingAddress, setEditingAddress] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null); // 追加
    const [isReceiptOpen, setIsReceiptOpen] = useState(false); // 追加
    const { data: profileData, setData: setProfileData, post: postProfile, processing: profileProcessing, errors: profileErrors } = useForm({
        name: auth.fan?.name || '',
        email: auth.fan?.email || '',
        password: '', // パスワードは空で開始
        country_code: auth.fan?.country_code || '',
        bio: auth.fan?.bio || '',
        thumbnail_image: null,
        _method: 'PATCH', 
    });

    // --- 全ての決済手段を一つのリストに統合するロジック ---
    const allPaymentMethods = useMemo(() => {
        const methods = [];
        if (auth.fan.credit_cards) auth.fan.credit_cards.forEach(item => methods.push({ ...item, m_type: 'card' }));
        if (auth.fan.paypal_accounts) auth.fan.paypal_accounts.forEach(item => methods.push({ ...item, m_type: 'paypal' }));
        if (auth.fan.digital_wallets) auth.fan.digital_wallets.forEach(item => methods.push({ ...item, m_type: 'wallet' }));
        if (auth.fan.bnpl_accounts) auth.fan.bnpl_accounts.forEach(item => methods.push({ ...item, m_type: 'bnpl' }));
        return methods.sort((a, b) => b.is_default - a.is_default);
    }, [auth.fan]);

    const handleStartSetup = async (type) => {
        setSelectedMethodType(type);
        if (!import.meta.env.VITE_STRIPE_KEY) {
            setClientSecret('seti_mock_' + Math.random().toString(36).substring(7));
            setPaymentMode('input');
            return;
        }
        try {
            const response = await axios.post(route('fans.payments.setup-intent'), { type });
            setClientSecret(response.data.client_secret);
            setPaymentMode('input');
        } catch (error) {
            alert("Connection failed. Mock mode activated.");
            setClientSecret('seti_mock_fallback');
            setPaymentMode('input');
        }
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        postShipping(route('fans.shipping.store'), {
            onSuccess: () => { 
                setShippingMode('list'); 
                resetShipping(); 
            },
            onError: (errors) => console.log(errors)
        });
    };

    const handleUpdateAddress = (e) => {
        e.preventDefault();
        // editingAddress.id を使って更新
        patchShipping(route('fans.shipping.update', editingAddress.id), {
            onSuccess: () => { 
                setShippingMode('list'); 
                setEditingAddress(null); 
                resetShipping(); 
            },
            onError: (errors) => console.log(errors)
        });
    };

    const handleDeleteAddress = (id) => {
        if (confirm('Are you sure you want to delete this address?')) {
            deleteShipping(route('fans.shipping.destroy', id), {
                preserveScroll: true
            });
        }
    };

    const startEditing = (addr) => {
        setEditingAddress(addr);
        // フォームに現在の値をセット
        setShippingData({
            country_id: addr.country_id || '',
            region_id: addr.region_id || '',
            zip_code: addr.zip_code || '',
            address1: addr.address1 || '',
            address2: addr.address2 || '',
            phone_number: addr.phone_number || '',
        });
        setShippingMode('edit');
    };

    const appearance = {
        theme: 'flat',
        variables: { colorPrimary: '#0f172a', borderRadius: '20px', colorBackground: '#f8fafc' },
    };

    const { data: shippingData, setData: setShippingData, post: postShipping, patch: patchShipping, delete: deleteShipping, processing: shippingProcessing, reset: resetShipping } = useForm({
        country_id: '', region_id: '', zip_code: '', address1: '', address2: '', phone_number: '',
    });

    const availableRegions = useMemo(() => {
        const selectedCountry = countries.find(c => c.id == shippingData.country_id);
        return selectedCountry?.regions || [];
    }, [shippingData.country_id, countries]);

    const submitProfile = (e) => {
        e.preventDefault();
        postProfile(route('fans.profile.update'), { preserveScroll: true, forceFormData: true });
    };

    return (
        <FanLayout user={auth.fan}>
            <Head title="Fan Dashboard" />
            <div className="max-w-7xl mx-auto py-12 px-6">
                <div className="flex flex-col md:flex-row gap-8">
                    
                    <aside className="w-full md:w-64 space-y-2">
                        <div className="p-4 mb-6">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">My Studio</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Fan HQ</p>
                        </div>
                        {[
                            { id: 'wants', label: 'My Wants', icon: '❤️' },
                            { id: 'profile', label: 'Profile Settings', icon: '👤' },
                            { id: 'shipping', label: 'Shipping Addresses', icon: '📦' },
                            { id: 'payments', label: 'Payment Methods', icon: '💳' },
                            { id: 'groups', label: 'My Group Orders', icon: '🌍' },
                            { id: 'orders', label: 'My Orders', icon: '🛍️' },
                            { id: 'tracking', label: 'Tracking', icon: '✈️' },
                        ].map((item) => (
                            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg translate-x-2' : 'text-slate-400 hover:bg-slate-100'}`}>
                                <span>{item.icon}</span><span className="uppercase tracking-widest">{item.label}</span>
                            </button>
                        ))}
                    </aside>

                    <main className="flex-1 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm min-h-[600px]">
                        {/* --- Wants コンテンツエリア --- */}
                        {activeTab === 'wants' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-8">Items You Want</h3>
                                
                                {wants.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {wants.map((item) => (
                                            <div key={item.id} className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-4 transition-all hover:shadow-xl hover:-translate-y-1">
                                                <Link href={route('products.show', item.id)}>
                                                    <div className="aspect-square bg-slate-50 rounded-[2rem] overflow-hidden mb-4">
                                                        <img 
                                                            src={item.thumbnail} 
                                                            alt={item.title} 
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                                        />
                                                    </div>
                                                    <div className="px-2">
                                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                                                            {/* カテゴリ名など */}
                                                            Limited Edition
                                                        </p>
                                                        <h4 className="text-sm font-black text-slate-900 uppercase leading-tight truncate">
                                                            {item.title}
                                                        </h4>
                                                        <p className="text-lg font-black text-slate-900 mt-2">
                                                            ${item.price}
                                                        </p>
                                                    </div>
                                                </Link>
                                                
                                                {/* 削除ボタンや「今すぐ購入(GO作成)」ボタンを置くスペース */}
                                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600">
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest italic">Your want list is empty. Explore products!</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* --- Profile Tab --- */}
                        {activeTab === 'profile' && (
                            <form onSubmit={submitProfile} className="space-y-8 max-w-2xl animate-in fade-in duration-500">
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Profile Settings</h3>
                                
                                <div className="grid grid-cols-1 gap-6">
                                    
                                    {/* Thumbnail Upload */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Profile Picture</label>
                                        <div className="flex items-center space-x-6 bg-slate-50 p-6 rounded-[2rem]">
                                            <img 
                                                src={auth.fan.thumbnail_url || '/images/default-avatar.png'} 
                                                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm" 
                                            />
                                            <input 
                                                type="file" 
                                                onChange={e => setProfileData('thumbnail_image', e.target.files[0])}
                                                className="text-xs font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-white hover:file:bg-slate-700 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Name & Email */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Display Name</label>
                                            <input type="text" value={profileData.name} onChange={e => setProfileData('name', e.target.value)} className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-slate-900" />
                                            {profileErrors.name && <div className="text-rose-500 text-[10px] font-bold ml-2">{profileErrors.name}</div>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                                            <input type="email" value={profileData.email} onChange={e => setProfileData('email', e.target.value)} className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-slate-900" />
                                        </div>
                                    </div>

                                    {/* Password (Optional) */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">New Password (Leave blank to keep current)</label>
                                        <input type="password" value={profileData.password} onChange={e => setProfileData('password', e.target.value)} className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 font-bold" placeholder="••••••••" />
                                    </div>

                                    {/* Country Selection (from countries table) */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Resident Country</label>
                                        <select 
                                            value={profileData.country_code} 
                                            onChange={e => setProfileData('country_code', e.target.value)} 
                                            className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-slate-900 appearance-none"
                                        >
                                            <option value="">Select your country</option>
                                            {countries.map(c => (
                                                <option key={c.id} value={c.code}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Bio */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Bio / Introduction</label>
                                        <textarea 
                                            value={profileData.bio} 
                                            onChange={e => setProfileData('bio', e.target.value)} 
                                            className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 font-bold min-h-[120px] focus:ring-2 focus:ring-slate-900"
                                            placeholder="Tell the community about yourself..."
                                        />
                                    </div>

                                </div>

                                <button type="submit" disabled={profileProcessing} className="px-10 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:scale-95 transition-all">
                                    {profileProcessing ? 'Updating...' : 'Save Changes'}
                                </button>
                            </form>
                        )}

                        {/* --- Payment Methods Tab (統合版一覧) --- */}
                        {activeTab === 'payments' && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Payment Methods</h3>
                                    {paymentMode === 'list' && (
                                        <button onClick={() => setPaymentMode('select')} className="bg-slate-900 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase shadow-lg">+ Add New</button>
                                    )}
                                </div>

                                {paymentMode === 'list' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {allPaymentMethods.length > 0 ? allPaymentMethods.map((method, idx) => (
                                            <div key={idx} className={`p-8 rounded-[2.5rem] relative overflow-hidden transition-all border-2 flex flex-col justify-between min-h-[200px] ${
                                                method.m_type === 'card' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-100 shadow-sm'
                                            }`}>
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${method.m_type === 'card' ? 'text-slate-400' : 'text-indigo-500'}`}>
                                                            {method.m_type === 'card' ? method.brand : method.m_type === 'wallet' ? method.type : method.m_type}
                                                        </span>
                                                        
                                                        {/* is_default が 1 (真) の時だけ表示。0の時は何も出さない */}
                                                        {!!method.is_default && (
                                                            <span className="bg-indigo-500 text-[8px] font-black px-3 py-1 rounded-full text-white uppercase shadow-lg shadow-indigo-500/20">
                                                                Primary
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <p className={`text-lg font-bold ${method.m_type === 'card' ? 'font-mono tracking-widest' : ''}`}>
                                                        {method.m_type === 'card' ? `•••• ${method.last4}` : 
                                                        method.m_type === 'paypal' ? method.paypal_email :
                                                        method.account_identifier || method.external_id}
                                                    </p>
                                                    
                                                    {method.m_type === 'card' && (
                                                        <p className="text-[10px] opacity-50 mt-1 uppercase font-black">Exp: {method.exp_month}/{method.exp_year}</p>
                                                    )}
                                                </div>

                                                {/* デフォルトじゃない場合のみ「Set as Primary」ボタンを表示 */}
                                                {!method.is_default && (
                                                    <div className="mt-6 flex justify-end">
                                                        <button 
                                                            onClick={() => router.patch(route('fans.payments.set-default'), { 
                                                                id: method.id, 
                                                                type: method.m_type 
                                                            })}
                                                            className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${
                                                                method.m_type === 'card' 
                                                                ? 'border-slate-700 text-slate-400 hover:bg-white hover:text-slate-900' 
                                                                : 'border-slate-200 text-slate-400 hover:border-indigo-500 hover:text-indigo-500'
                                                            }`}
                                                        >
                                                            Set as Primary
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )) : (
                                            <div className="md:col-span-2 py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
                                                <p className="text-slate-400 font-bold uppercase tracking-widest italic">No payment methods saved.</p>
                                            </div>
                                        )}
                                        {allPaymentMethods.length > 0 && (
                                             <button onClick={() => setPaymentMode('select')} className="border-2 border-dashed border-slate-200 p-8 rounded-[2.5rem] flex items-center justify-center hover:bg-slate-50 transition-all min-h-[160px]">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">+ Add New Method</span>
                                            </button>
                                        )}
                                    </div>
                                ) : paymentMode === 'select' ? (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                        <button onClick={() => setPaymentMode('list')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">← Back to List</button>
                                        <div className="grid grid-cols-1 gap-4">
                                            {[
                                                { id: 'paypal', label: 'PayPal', bg: 'bg-[#0070ba]/5', color: '#0070ba' },
                                                { id: 'card', label: 'Credit / Debit Card', bg: 'bg-slate-50', color: 'slate-900' },
                                                { id: 'wallet', label: 'Digital Wallets', bg: 'bg-slate-100', color: 'slate-900' },
                                                { id: 'cashapp', label: 'Cash App Pay', bg: 'bg-[#00d632]/5', color: '#00d632' },
                                                { id: 'bnpl', label: 'Buy Now, Pay Later', bg: 'bg-rose-50', color: 'rose-500' },
                                            ].map((method) => (
                                                <button key={method.id} onClick={() => handleStartSetup(method.id)} className={`flex items-center justify-between p-8 ${method.bg} rounded-[2.5rem] hover:bg-white hover:ring-2 transition-all group text-left`}>
                                                    <span className="font-black uppercase text-sm tracking-[0.2em]">{method.label}</span>
                                                    <span className="opacity-30 group-hover:translate-x-2 transition-transform font-black">→</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <button onClick={() => {setPaymentMode('select'); setClientSecret('');}} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">← Choose another method</button>
                                        
                                        {import.meta.env.VITE_STRIPE_KEY && !clientSecret.includes('mock') ? (
                                            <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                                                <CheckoutForm methodType={selectedMethodType} onCancel={() => {setPaymentMode('select'); setClientSecret('');}} />
                                            </Elements>
                                        ) : (
                                            <CheckoutForm isMock={true} methodType={selectedMethodType} onCancel={() => {setPaymentMode('select'); setClientSecret('');}} />
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- Shipping --- */}
                        {activeTab === 'shipping' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Shipping Addresses</h3>
                                    {shippingMode === 'list' && (
                                        <button 
                                            onClick={() => { resetShipping(); setShippingMode('create'); }} 
                                            className="bg-indigo-600 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase shadow-lg hover:bg-indigo-700 transition-all"
                                        >
                                            + Add New Address
                                        </button>
                                    )}
                                </div>

                                {shippingMode === 'list' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {auth.fan.addresses?.map(addr => (
                                            <div key={addr.id} className={`bg-white p-8 rounded-[2.5rem] border transition-all group relative ${addr.is_default ? 'border-indigo-500 ring-2 ring-indigo-50' : 'border-slate-100 shadow-sm'}`}>
                                                {!!addr.is_default && <span className="absolute -top-3 -right-3 bg-indigo-600 text-white text-[8px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg">Primary</span>}
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{addr.country?.name} — {addr.region?.name}</p>
                                                        <p className="font-black text-slate-900 leading-tight text-lg">{addr.address1}</p>
                                                        {addr.address2 && <p className="text-sm font-bold text-slate-600">{addr.address2}</p>}
                                                        <p className="text-xs text-slate-400 font-bold">{addr.zip_code}</p>
                                                        
                                                        {!addr.is_default && (
                                                            <button onClick={() => router.patch(route('fans.shipping.set-default', addr.id))} className="mt-4 text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors underline decoration-slate-200 underline-offset-4">
                                                                Set as primary
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => startEditing(addr)} className="text-slate-400 hover:text-indigo-600 font-bold text-[10px] uppercase">Edit</button>
                                                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-slate-400 hover:text-rose-500 font-bold text-[10px] uppercase">Delete</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {auth.fan.addresses?.length === 0 && (
                                            <div className="md:col-span-2 py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
                                                <p className="text-slate-400 font-bold uppercase tracking-widest italic">No shipping addresses saved.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Address Form (Create / Edit) */
                                    <div className="bg-slate-50 p-10 rounded-[3rem] animate-in slide-in-from-bottom-4 duration-500">
                                        <form onSubmit={shippingMode === 'create' ? handleAddAddress : handleUpdateAddress} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Country</label>
                                                    <select value={shippingData.country_id} onChange={e => { setShippingData('country_id', e.target.value); setShippingData('region_id', ''); }} className="w-full bg-white border-0 rounded-2xl px-6 py-4 font-bold shadow-sm">
                                                        <option value="">Select Country</option>
                                                        {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">State / Region</label>
                                                    <select value={shippingData.region_id} onChange={e => setShippingData('region_id', e.target.value)} disabled={!shippingData.country_id} className="w-full bg-white border-0 rounded-2xl px-6 py-4 font-bold shadow-sm disabled:opacity-50">
                                                        <option value="">Select Region</option>
                                                        {availableRegions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Address Line 1</label>
                                                    <input type="text" value={shippingData.address1} onChange={e => setShippingData('address1', e.target.value)} className="w-full bg-white border-0 rounded-2xl px-6 py-4 font-bold shadow-sm" placeholder="Street address, P.O. box" />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Address Line 2 (Optional)</label>
                                                    <input type="text" value={shippingData.address2} onChange={e => setShippingData('address2', e.target.value)} className="w-full bg-white border-0 rounded-2xl px-6 py-4 font-bold shadow-sm" placeholder="Apartment, suite, unit, building, floor" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Zip / Postal Code</label>
                                                    <input type="text" value={shippingData.zip_code} onChange={e => setShippingData('zip_code', e.target.value)} className="w-full bg-white border-0 rounded-2xl px-6 py-4 font-bold shadow-sm" />
                                                </div>
                                            </div>
                                            <div className="flex space-x-4 pt-4">
                                                <button type="submit" disabled={shippingProcessing} className="px-10 py-4 bg-slate-900 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg hover:-translate-y-1 transition-all">
                                                    {shippingProcessing ? 'Processing...' : 'Save Address'}
                                                </button>
                                                <button type="button" onClick={() => { setShippingMode('list'); resetShipping(); }} className="px-10 py-4 bg-white text-slate-400 rounded-full font-black uppercase text-[10px] tracking-widest border border-slate-200">
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* --- My Group Orders Tab --- */}
                        {activeTab === 'groups' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">My Group Orders</h3>

                                <div className="grid grid-cols-1 gap-6">
                                    {activeGroups.length > 0 ? activeGroups.map((group) => (
                                        <div key={group.id} className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex flex-col md:flex-row gap-8">
                                                {/* 商品画像 */}
                                                <div className="w-full md:w-40 h-40 bg-slate-100 rounded-[2rem] overflow-hidden flex items-center justify-center">
                                                    {group.thumbnail ? (
                                                        <img src={group.thumbnail} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] font-black text-slate-300 uppercase">No Image</span>
                                                    )}
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <div className="flex gap-2 mb-1">
                                                                {group.role === 'organizer' ? (
                                                                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[8px] font-black uppercase rounded-full border border-amber-100">👑 Host</span>
                                                                ) : (
                                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-full">Joined</span>
                                                                )}
                                                                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[8px] font-black uppercase rounded-full">
                                                                    {group.status}
                                                                </span>
                                                            </div>

                                                            {/* 1. グループ名を大きく表示 */}
                                                            <h4 className="text-xl font-black uppercase tracking-tighter leading-none">
                                                                {group.group_name}
                                                            </h4>
                                                            
                                                            {/* 2. 商品名を小さく、補足として表示 */}
                                                            <p className="text-xs font-bold text-indigo-500/80 uppercase tracking-tight">
                                                                Item: {group.product_title}
                                                            </p>

                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-1">
                                                                {group.role === 'organizer' ? 'Managed by You' : `GOM: @${group.gom_name}`}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase">Order ID</p>
                                                            <p className="text-sm font-bold">#GO-{group.id.toString().padStart(5, '0')}</p>
                                                        </div>
                                                    </div>

                                                    {/* 動的プログレスバー */}
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                                                            <span className={group.progress >= 25 ? 'text-indigo-600' : ''}>Ordered</span>
                                                            <span className={group.progress >= 50 ? 'text-indigo-600' : ''}>Warehouse</span>
                                                            <span className={group.progress >= 75 ? 'text-indigo-600' : ''}>In Transit</span>
                                                            <span className={group.progress >= 100 ? 'text-indigo-600' : ''}>Delivered</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                                                style={{ width: `${group.progress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50 items-center">
                                                        <div className="bg-slate-50 px-4 py-3 rounded-2xl">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase">Payment</p>
                                                            <p className={`text-xs font-black uppercase ${group.payment_status === 'paid' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                {group.payment_status === 'paid' ? 'Paid in Full ✅' : 'Balance Due ⚠️'}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="bg-slate-50 px-4 py-3 rounded-2xl flex-1">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                                {group.role === 'organizer' ? 'Participants Count' : 'Tracking'}
                                                            </p>
                                                            <p className="text-xs font-black text-slate-900">
                                                                {/* 主催者なら参加人数、参加者なら追跡番号を表示する工夫 */}
                                                                {group.role === 'organizer' 
                                                                    ? `${group.participants_count || 1} Members Joined` 
                                                                    : (group.tracking_number || 'Not Assigned')
                                                                }
                                                            </p>
                                                        </div>

                                                        <Link 
                                                            href={route('fans.groups.show', group.id)} 
                                                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                                                group.role === 'organizer' 
                                                                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200' 
                                                                : 'bg-slate-900 text-white hover:bg-black'
                                                            }`}
                                                        >
                                                            {group.role === 'organizer' ? 'Manage GO' : 'View Details'}
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
                                            <p className="text-slate-400 font-bold uppercase tracking-widest italic">You haven't joined any group orders yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Purchase History</h3>

                                <div className="grid grid-cols-1 gap-6">
                                    {orders.length > 0 ? orders.map((order) => (
                                        <div key={order.id} className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                                
                                                {/* 1. 商品画像エリア + 注文タイプバッジ */}
                                                <div className="relative w-32 h-32 flex-shrink-0">
                                                    <div className="w-full h-full bg-slate-100 rounded-[2.5rem] overflow-hidden">
                                                        {order.thumbnail ? (
                                                            <img src={order.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300">No Image</div>
                                                        )}
                                                    </div>
                                                    {/* 左上のフローティングバッジ */}
                                                    <div className={`absolute -top-2 -left-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg z-10 ${
                                                        order.order_type === 'group' 
                                                            ? 'bg-indigo-600 text-white shadow-indigo-200' 
                                                            : 'bg-white text-slate-900 border border-slate-100'
                                                    }`}>
                                                        {order.order_type === 'group' ? '🌍 Group' : '👤 Direct'}
                                                    </div>
                                                </div>

                                                {/* 2. 中央：商品情報エリア */}
                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        {/* タイプ別ラベル */}
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                                                                order.order_type === 'group' ? 'text-indigo-500' : 'text-slate-400'
                                                            }`}>
                                                                {order.order_type === 'group' ? 'Group Order Participant' : 'Individual Purchase'}
                                                            </span>
                                                        </div>

                                                        <h4 className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-tight">
                                                            {order.product_name}
                                                        </h4>
                                                        
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                                Qty: <span className="text-slate-900">{order.quantity}</span>
                                                            </p>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                                Total: <span className="text-indigo-600">¥{Number(order.total_price).toLocaleString()}</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Order ID 表示をタイプ別に接頭辞を変更 */}
                                                    <div className="inline-block bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Order ID</p>
                                                        <p className="text-[10px] font-bold text-slate-900 font-mono">
                                                            #{order.order_type === 'group' ? 'GO' : 'ID'}-{order.id.toString().padStart(6, '0')}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* 3. 右側：ステータス & ボタンエリア */}
                                                <div className="w-full lg:w-48 space-y-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                                                    <div className="flex lg:flex-col justify-between items-center lg:items-end gap-1">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${
                                                            order.status === 'paid' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-400 shadow-slate-400/20'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                                                            Ordered on {order.created_at}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setIsReceiptOpen(true);
                                                            }}
                                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all"
                                                        >
                                                            View Receipt
                                                        </button>
                                                        
                                                        {/* 注文タイプによってセカンダリボタンの役割を変える */}
                                                        {order.order_type === 'group' ? (
                                                            /* --- View Group ボタン (共同購入用) --- */
                                                            <Link 
                                                                href={route('fans.groups.show', order.group_order_id)} 
                                                                className="w-full py-4 bg-indigo-50 border-2 border-indigo-100 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-sm shadow-indigo-100"
                                                            >
                                                                <span>🌍</span>
                                                                <span>View Group</span>
                                                            </Link>
                                                        ) : (
                                                            /* --- Contact ボタン (直接注文用) --- */
                                                            <button className="w-full py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:border-slate-900 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center space-x-2">
                                                                <span>💬</span>
                                                                <span>Contact</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
                                            <p className="text-slate-400 font-bold uppercase tracking-widest italic">You haven't made any purchases yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <OrderDetailsModal 
                isOpen={isReceiptOpen} 
                closeModal={() => setIsReceiptOpen(false)} 
                order={selectedOrder} 
            />
        </FanLayout>
    );
}