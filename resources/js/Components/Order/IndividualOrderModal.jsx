import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function IndividualOrderModal({ isOpen, closeModal, product, addresses, paymentMethods }) {
    if (!isOpen) return null;

    const [quantity, setQuantity] = useState(1);
    const [selectedAddressId, setSelectedAddressId] = useState(addresses.find(a => a.is_default)?.id || addresses[0]?.id || '');
    
    // 決済手段の初期選択
    const [selectedMethod, setSelectedMethod] = useState(
        paymentMethods.find(m => m.is_default) || paymentMethods[0] || null
    );

    const subtotal = Number(product.estimated_price) * quantity;
    const fee = subtotal * 0.04; 
    const total = subtotal + fee;

    const handlePayment = () => {
        if (!selectedAddressId || !selectedMethod) {
            alert("Please select address and payment method.");
            return;
        }

        router.post(route('fans.orders.store', product.id), {
            quantity: quantity,
            fan_address_id: parseInt(selectedAddressId), // 数値型に変換
            payment_method_id: parseInt(selectedMethod.id), // 数値型に変換
            payment_method_type: selectedMethod.table, // 'fan_credit_cards' 等が飛ぶ
            total: parseFloat(total.toFixed(2)) // 数値型に変換
        }, { onSuccess: () => closeModal(),
            onError: (errors) => {
                // コンソールでどのフィールドがエラーか確認してください
                console.log("Validation Errors:", errors);
            }
         });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-6">
            <div className="bg-white w-full max-w-xl rounded-[3.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
                
                {/* --- 📦 商品情報の表示エリア --- */}
                <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                        {/* 商品画像を表示 */}
                        <img 
                            src={product.images[0]?.image_url} 
                            className="w-full h-full object-cover" 
                            alt={product.translations[0]?.text} 
                        />
                    </div>
                    <div>
                        <h3 className="text-md font-black uppercase tracking-tighter leading-tight text-slate-900">
                            {product.translations[0]?.text} {/* 商品名を表示 */}
                        </h3>
                        <p className="text-xs font-bold text-indigo-600 mt-1 italic">
                            ¥{Number(product.estimated_price).toLocaleString()} / unit
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- 住所選択部分の修正 --- */}
                <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-3">
                        Shipping Address
                    </label>
                    <select 
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="w-full rounded-2xl border-slate-100 bg-slate-50 font-bold py-4 text-sm focus:ring-indigo-500"
                    >
                        {addresses.length > 0 ? (
                            addresses.map(addr => (
                                <option key={addr.id} value={addr.id}>
                                    {/* 国名、地域名、住所1、住所2を連結して表示 */}
                                    {`[${addr.country?.name || ''}] ${addr.region?.name || ''} ${addr.address1} ${addr.address2 || ''}`}
                                </option>
                            ))
                        ) : (
                            <option disabled>No address registered</option>
                        )}
                    </select>
                    {addresses.length === 0 && (
                        <p className="text-[10px] text-rose-500 font-bold mt-2 uppercase">
                            ※ Please add a shipping address in your profile first.
                        </p>
                    )}
                </div>

                    {/* 決済方法選択 */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-3">Payment Method</label>
                        <select 
                            value={selectedMethod ? `${selectedMethod.table}:${selectedMethod.id}` : ''}
                            onChange={(e) => {
                                const [table, id] = e.target.value.split(':');
                                setSelectedMethod(paymentMethods.find(m => m.table === table && m.id == id));
                            }}
                            className="w-full rounded-2xl border-slate-100 bg-slate-50 font-bold py-4 text-sm"
                        >
                            {paymentMethods.length > 0 ? (
                                paymentMethods.map(m => (
                                    <option key={`${m.table}:${m.id}`} value={`${m.table}:${m.id}`}>{m.label}</option>
                                ))
                            ) : (
                                <option disabled>No payment method</option>
                            )}
                        </select>
                    </div>
                </div>

                {/* 数量と合計 */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <span className="text-[10px] font-black uppercase opacity-50">Order Quantity</span>
                        <div className="flex items-center space-x-4 bg-white/10 rounded-full p-1">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold">-</button>
                            <span className="text-xl font-black w-8 text-center italic">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold">+</button>
                        </div>
                    </div>

                    <div className="space-y-2 border-t border-white/10 pt-6 relative z-10">
                        <div className="flex justify-between text-xs font-bold opacity-60 italic">
                            <span>Subtotal</span>
                            <span>¥{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                            <span className="text-[10px] font-black uppercase text-indigo-400">Total Price</span>
                            <span className="text-4xl font-black italic">¥{Math.floor(total).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={closeModal} className="flex-1 py-6 bg-slate-100 text-slate-400 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                    <button 
                        onClick={handlePayment}
                        className="flex-[2] py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
                    >
                        Place Order
                    </button>
                </div>
            </div>
        </div>
    );
}