export default function OrderDetailsModal({ isOpen, closeModal, order }) {
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-6">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Receipt</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        Order #{order.order_type === 'group' ? 'GO' : 'ID'}-{order.id}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* 商品情報プレビュー */}
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                        <img src={order.thumbnail} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                        <div>
                            <p className="text-sm font-black uppercase leading-tight">{order.product_name}</p>
                            <p className="text-[10px] font-bold text-slate-400">Qty: {order.quantity}</p>
                        </div>
                    </div>

                    {/* 内訳明細 */}
                    <div className="space-y-3">
                        {order.breakdowns.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-900">{item.type.replace('_', ' ')}</p>
                                    <p className="text-[9px] text-slate-400 font-bold italic leading-none">{item.description}</p>
                                </div>
                                <span className="text-sm font-black text-slate-900">¥{Number(item.amount).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    {/* 合計金額 */}
                    <div className="pt-6 border-t-2 border-dashed border-slate-100 flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Total Paid</span>
                        <span className="text-4xl font-black italic text-slate-900">¥{Number(order.total_price).toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button onClick={() => window.print()} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                        Print / Save as PDF
                    </button>
                    <button onClick={closeModal} className="w-full py-4 bg-white text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-all">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}