import { useState } from 'react';

export default function JoinModal({ isOpen, closeModal, group, product, addresses, paymentMethods, onConfirm }) {
    if (!isOpen || !group) return null;

    const [quantity, setQuantity] = useState(1); // 数量ステート
    const [selectedAddressId, setSelectedAddressId] = useState(addresses.find(a => a.is_default)?.id || addresses[0]?.id || '');
    const [selectedMethod, setSelectedMethod] = useState(paymentMethods.find(m => m.is_default) || paymentMethods[0] || null);

    // --- 金額計算ロジック ---
    const unitPrice = Number(product.estimated_price);
    const itemTotal = unitPrice * quantity; // 商品代合計
    
    // GOの送料設定：1人1台分固定、または個数比例にするかは運営次第ですが、
    // ここでは「参加枠としての送料」を1回分として計算する例にします
    const shippingPrice = Number(group.shared_shipping_cost); 
    
    const subtotal = itemTotal + shippingPrice;
    const fee = subtotal * 0.04;
    const total = subtotal + fee;

    const handleJoinSubmit = () => {
        if (!selectedAddressId || !selectedMethod) {
            alert("Please select address and payment method.");
            return;
        }

        onConfirm({
            quantity, // 個数を追加
            fan_address_id: selectedAddressId,
            payment_method_id: selectedMethod.id,
            payment_method_type: selectedMethod.table,
            total: total,
            item_price: itemTotal,
            shipping_price: shippingPrice,
            fee: fee
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-6">
            <div className="bg-white w-full max-w-xl rounded-[3.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
                
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic text-indigo-600">Join Group Order</h2>
                    <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
                </div>

                {/* 数量選択セクション */}
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Quantity</p>
                        <p className="text-sm font-bold text-slate-900">How many units?</p>
                    </div>
                    <div className="flex items-center space-x-4 bg-white rounded-full p-2 shadow-sm">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black transition-all"
                        >-</button>
                        <span className="text-xl font-black w-8 text-center italic">{quantity}</span>
                        <button 
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 h-10 rounded-full bg-slate-900 text-white hover:bg-black flex items-center justify-center font-black transition-all"
                        >+</button>
                    </div>
                </div>

                {/* 住所・決済選択 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Shipping To</label>
                        <select 
                            value={selectedAddressId}
                            onChange={(e) => setSelectedAddressId(e.target.value)}
                            className="w-full rounded-2xl border-slate-100 bg-slate-50 font-bold py-4 text-xs"
                        >
                            {addresses.map(addr => (
                                <option key={addr.id} value={addr.id}>{`[${addr.country?.name}] ${addr.address1}`}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Payment</label>
                        <select 
                            value={selectedMethod ? `${selectedMethod.table}:${selectedMethod.id}` : ''}
                            onChange={(e) => {
                                const [table, id] = e.target.value.split(':');
                                setSelectedMethod(paymentMethods.find(m => m.table === table && m.id == id));
                            }}
                            className="w-full rounded-2xl border-slate-100 bg-slate-50 font-bold py-4 text-xs"
                        >
                            {paymentMethods.map(m => (
                                <option key={`${m.table}:${m.id}`} value={`${m.table}:${m.id}`}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 金額内訳（動的） */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-[10px] font-bold opacity-50 uppercase tracking-widest">
                            <span>Item Price (¥{unitPrice.toLocaleString()} × {quantity})</span>
                            <span>¥{itemTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold opacity-50 uppercase tracking-widest">
                            <span>Shared Shipping (Per Slot)</span>
                            <span>¥{shippingPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold opacity-50 uppercase tracking-widest">
                            <span>Platform Fee</span>
                            <span>¥{Math.floor(fee).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block">Total Deposit</span>
                            <span className="text-[9px] text-slate-400 block uppercase">Balance for final shipping may apply</span>
                        </div>
                        <span className="text-4xl font-black italic">¥{Math.floor(total).toLocaleString()}</span>
                    </div>
                </div>

                <button 
                    onClick={handleJoinSubmit}
                    className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]"
                >
                    Confirm & Join GO
                </button>
            </div>
        </div>
    );
}