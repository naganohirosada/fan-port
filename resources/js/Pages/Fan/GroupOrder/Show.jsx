import FanLayout from "@/Layouts/FrontLayout";
import { Head, Link, useForm, router } from '@inertiajs/react'; // routerをインポート

export default function Show({ auth, order }) {
    // デフォルトの配送先住所を取得
    const primaryAddress = auth.fan.addresses?.find(a => a.is_default) || auth.fan.addresses?.[0];

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        content: '',
        status_tag: order.details.status,
    });

    const submitUpdate = (e) => {
        e.preventDefault();
        post(route('fans.group-orders.updates.store', order.id), {
            onSuccess: () => reset(),
        });
    };

    // --- 主催者専用：ステータス一括更新処理 ---
    const handleStatusUpdate = (newStatus) => {
        if (confirm(`Change project status to "${newStatus.toUpperCase()}" for all participants?`)) {
            router.post(route('fans.group-orders.status.update', order.id), { status: newStatus }, {
                preserveScroll: true,
            });
        }
    };

    return (
        <FanLayout user={auth.fan}>
            <Head title={`Order Details - ${order.group_name}`} />
            
            <div className="max-w-6xl mx-auto py-12 px-6">
                {/* Back Button */}
                <Link href={route('fans.dashboard', {tab: 'groups'})} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all flex items-center gap-2">
                    <span className="text-lg">←</span> Back to Dashboard
                </Link>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Left Column: Updates & Timeline */}
                    <div className="lg:col-span-2 space-y-12">
                        
                        {/* 1. Header Section */}
                        <section className="flex flex-col md:flex-row gap-8 items-start md:items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                            <div className="relative">
                                <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] overflow-hidden flex-shrink-0 shadow-inner border border-slate-50">
                                    {order.thumbnail ? (
                                        <img src={order.thumbnail} alt={order.product_title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-slate-300 uppercase">No Image</div>
                                    )}
                                </div>
                                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black italic shadow-lg">
                                    x{order.details.quantity}
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase rounded-full tracking-widest">
                                        Status: {order.details.status}
                                    </span>
                                    {order.details.role === 'organizer' && (
                                        <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[8px] font-black uppercase rounded-full tracking-widest">
                                            👑 You are Organizer
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-slate-900">
                                    {order.group_name}
                                </h1>
                                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide italic">Item: {order.product_title}</p>
                            </div>
                        </section>

                        {/* 2. Organizer Tools (Update Form & Status Control) */}
                        {order.details.role === 'organizer' && (
                            <div className="space-y-6">
                                {/* クイックステータス制御 */}
                                <div className="bg-slate-50 rounded-[2.5rem] p-8 border-2 border-slate-100">
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="text-lg">⚙️</span>
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Quick Progress Control</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {['ordered', 'warehouse', 'transit', 'delivered'].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => handleStatusUpdate(s)}
                                                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    order.details.status === s 
                                                    ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                                                    : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-500 hover:text-indigo-600'
                                                }`}
                                            >
                                                {s === order.details.status && <span className="mr-2">●</span>}
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-4 text-[9px] text-slate-400 font-bold uppercase italic">* Changing status will notify all participants.</p>
                                </div>

                                {/* タイムライン投稿フォーム */}
                                <section className="bg-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">📣</div>
                                            <div>
                                                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Broadcast Update</h3>
                                                <p className="text-[10px] text-white/50 font-bold uppercase mt-0.5">Notify all participants about the progress</p>
                                            </div>
                                        </div>
                                        <form onSubmit={submitUpdate} className="space-y-4">
                                            <input 
                                                type="text" 
                                                placeholder="Subject (e.g. Package arrived at Warehouse!)"
                                                className="w-full bg-white/10 border-none rounded-2xl p-5 text-sm font-bold placeholder:text-white/30 focus:ring-2 focus:ring-indigo-400"
                                                value={data.title}
                                                onChange={e => setData('title', e.target.value)}
                                            />
                                            <textarea 
                                                placeholder="Write detailed progress here..."
                                                className="w-full bg-white/10 border-none rounded-[2rem] p-5 text-sm font-bold placeholder:text-white/30 h-32 focus:ring-2 focus:ring-indigo-400"
                                                value={data.content}
                                                onChange={e => setData('content', e.target.value)}
                                            />
                                            <button 
                                                type="submit" 
                                                disabled={processing}
                                                className="bg-white text-indigo-900 font-black px-10 py-4 rounded-full text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg"
                                            >
                                                {processing ? 'Posting...' : 'Post to Timeline'}
                                            </button>
                                        </form>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* 3. Timeline */}
                        <section className="space-y-8 pl-4">
                            <h3 className="text-xl font-black uppercase tracking-tighter border-b-4 border-slate-900 inline-block">Project Timeline</h3>
                            <div className="relative pl-10 space-y-12 border-l-2 border-slate-100">
                                {order.updates && order.updates.length > 0 ? (
                                    order.updates.map((update, idx) => (
                                        <div key={idx} className="relative animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <div className="absolute -left-[49px] top-0 w-6 h-6 rounded-full bg-white border-4 border-indigo-500 shadow-md flex items-center justify-center z-10">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{update.date}</p>
                                            <h4 className="font-black text-slate-900 uppercase mt-1 text-lg">{update.title}</h4>
                                            <p className="text-slate-600 text-sm mt-3 leading-relaxed bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                                {update.content}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                        <p className="text-slate-400 italic font-bold uppercase tracking-widest text-[10px]">No updates posted yet. Stay tuned! 📦</p>
                                    </div>
                                )}
                                {order.details.role === 'organizer' && (
                                    <section className="mt-16 space-y-8">
                                        <div className="flex justify-between items-end border-b-4 border-slate-900 pb-2">
                                            <h3 className="text-xl font-black uppercase tracking-tighter">Participant Management</h3>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Total: {order.participant_list.length} Members
                                            </span>
                                        </div>

                                        <div className="overflow-x-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-100">
                                                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Fan</th>
                                                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Qty</th>
                                                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Payment</th>
                                                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {order.participant_list.map((p) => (
                                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="p-6">
                                                                <p className="font-black text-slate-900 uppercase text-xs">{p.name}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold">{p.email}</p>
                                                            </td>
                                                            <td className="p-6 text-center">
                                                                <span className="bg-slate-100 px-3 py-1 rounded-full font-black text-[10px] italic">x{p.quantity}</span>
                                                            </td>
                                                            <td className="p-6 text-center">
                                                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                                                                    p.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                                                }`}>
                                                                    {p.payment_status}
                                                                </span>
                                                            </td>
                                                            <td className="p-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                {p.status}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        <div className="flex gap-4">
                                            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                                                📥 Export CSV for Shipping
                                            </button>
                                        </div>
                                    </section>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sidebar Summary */}
                    <div className="space-y-8">
                        {/* 💰 Payment Card */}
                        <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-8">Project Status</h3>
                            
                            <div className="space-y-6">
                                {/* 全体の注文数 */}
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="opacity-50 text-[10px] uppercase font-black tracking-widest">Total Units</span>
                                        <span className="text-2xl font-black italic">{order.project_stats.total_quantity} <span className="text-xs opacity-30">PCS</span></span>
                                    </div>
                                    <div className="text-right flex flex-col">
                                        <span className="opacity-50 text-[10px] uppercase font-black tracking-widest">Members</span>
                                        <span className="text-2xl font-black italic">{order.project_stats.member_count}</span>
                                    </div>
                                </div>

                                {/* 全体の集金額 */}
                                <div className="pt-6 border-t border-white/10">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Pooled Funds</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black italic">¥{Number(order.project_stats.total_amount).toLocaleString()}</span>
                                        <span className="text-[10px] opacity-30 font-bold uppercase">JPY</span>
                                    </div>
                                </div>

                                {/* 自分の貢献分（小さく表示） */}
                                <div className="mt-4 p-4 bg-white/5 rounded-2xl flex justify-between items-center">
                                    <span className="text-[9px] font-black uppercase opacity-40 tracking-widest">Your Contribution</span>
                                    <span className="text-xs font-black text-indigo-300">{order.details.my_quantity} Units (¥{Number(order.details.my_paid_amount).toLocaleString()})</span>
                                </div>
                            </div>
                        </div>

                        {/* 📦 Shipping Card */}
                        <div className="bg-white border border-slate-100 rounded-[3.5rem] p-10 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                <span>📍</span> Destination
                            </h3>
                            {primaryAddress ? (
                                <div className="space-y-2">
                                    <p className="font-black text-slate-900 uppercase leading-none text-lg">{auth.fan.name}</p>
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                        {primaryAddress.address1}<br />
                                        {primaryAddress.address2 && <>{primaryAddress.address2}<br /></>}
                                        {primaryAddress.region?.name}, {primaryAddress.country?.name} {primaryAddress.zip_code}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs font-bold text-rose-500 uppercase">No address registered</p>
                            )}
                            
                            <div className="mt-8 pt-8 border-t border-slate-50">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Tracking Number</p>
                                <p className="font-mono text-sm font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl inline-block">
                                    {order.details.tracking_number || 'AWAITING SHIPMENT'}
                                </p>
                            </div>
                        </div>

                        {/* 👤 GOM Info */}
                        <div className="flex items-center gap-4 px-8">
                            <img src={order.gom.avatar || '/images/default-avatar.png'} className="w-10 h-10 rounded-full grayscale" />
                            <div className="flex-1">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Organized by</p>
                                <p className="text-xs font-black text-slate-900">@{order.gom.name}</p>
                            </div>
                            <button className="text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-700 transition-colors tracking-widest">
                                Contact
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </FanLayout>
    );
}