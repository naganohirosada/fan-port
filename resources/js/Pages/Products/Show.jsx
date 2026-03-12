import FrontLayout from '@/Layouts/FrontLayout';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import JoinModal from '@/Components/GroupOrder/JoinModal';
import CreateGroupModal from '@/Components/GroupOrder/CreateGroupModal';
import IndividualOrderModal from '@/Components/Order/IndividualOrderModal';

export default function Show({ 
    product, 
    wantsByCountry, 
    countries, 
    auth, 
    groupOrders,
    addresses = [],      // 追加
    paymentMethods = []  // 追加
}) {
    const fan = auth.fan;

    // --- モーダル制御用の状態 ---
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
    const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false); 

    // 進捗計算
    const targetWants = product.target_wants || 100;
    const progress = Math.min((product.wants_count / targetWants) * 100, 100);
    const isConfirmed = progress >= 100;

    const getFlagEmoji = (countryCode) => {
        if (!countryCode) return '🌐';
        return countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
    };

    const handleWantClick = () => {
        if (!fan) {
            router.get(route('fans.login'));
            return;
        }
        router.post(route('fans.products.want', product.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                if (!product.is_wanted) {
                    toast.success('Added to Want list! ❤️');
                } else {
                    toast('Removed from list', { icon: '🗑️' });
                }
            }
        });
    };

    const handleJoinClick = (go) => {
        if (!fan) {
            router.get(route('fans.login'));
            return;
        }
        setSelectedGroup(go);
        setIsModalOpen(true);
    };

    const confirmJoin = (paymentData) => {
        router.post(route('fans.group-orders.join', selectedGroup.id), paymentData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                toast.success('Joined the Group Order! 🚢');
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Payment or Join failed.');
            }
        });
    };

    const handleLeaveGO = (goId) => {
        if (confirm("Are you sure you want to leave this group? Shipping costs will increase.")) {
            router.post(route('fans.group-orders.leave', goId), {}, {
                preserveScroll: true,
                onSuccess: () => toast('Left the group', { icon: '🏃' })
            });
        }
    };

    return (
        <FrontLayout user={auth.fan}>
            <Head title={product.translations[0]?.text} />

            <div className="max-w-7xl mx-auto pt-32 pb-24 px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    
                    {/* 左：画像 */}
                    <div className="space-y-6 sticky top-32">
                        <div className="aspect-[3/4] rounded-[3rem] overflow-hidden bg-slate-100 shadow-2xl relative group">
                            <img src={product.images[0]?.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            {isConfirmed && (
                                <div className="absolute top-8 left-8 bg-emerald-500 text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-lg animate-bounce">
                                    Production Confirmed!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 右：詳細 */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <span className="px-4 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
                                    {product.category || 'Collectible'}
                                </span>
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 leading-none tracking-tighter uppercase mb-4">
                                {product.translations[0]?.text}
                            </h1>
                            <p className="text-3xl font-black text-indigo-600 tracking-tight">
                                ¥{Number(product.estimated_price).toLocaleString()}
                                <span className="text-sm text-slate-400 font-bold ml-2 uppercase">Est. Price</span>
                            </p>
                        </div>

                        {/* アクションボタン */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handleWantClick}
                                className={`py-6 rounded-[2rem] font-black text-xl transition-all duration-500 shadow-xl flex items-center justify-center space-x-4 group ${
                                    product.is_wanted ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'
                                }`}
                            >
                                <span className="tracking-widest italic">{product.is_wanted ? 'WANTED!' : 'I WANT THIS!'}</span>
                            </button>

                            <button 
                                onClick={() => fan ? setIsIndividualModalOpen(true) : router.get(route('fans.login'))}
                                className="py-6 rounded-[2rem] font-black text-xl transition-all duration-500 shadow-xl flex flex-col items-center justify-center bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50"
                            >
                                <span className="tracking-widest italic text-sm">BUY NOW (DIRECT)</span>
                                <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">Skip Group Wait</span>
                            </button>
                        </div>

                        {/* 進捗バー */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-end justify-between mb-4">
                                    <div>
                                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Production Goal</h3>
                                        <p className="text-4xl font-black italic tracking-tighter">
                                            {Math.floor(progress)}% <span className="text-sm not-italic opacity-50">Reached</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Current Heat</p>
                                        <p className="text-xl font-black text-rose-500">{product.wants_count} / {targetWants}</p>
                                    </div>
                                </div>
                                <div className="h-4 bg-slate-800 rounded-full overflow-hidden p-1 border border-slate-700">
                                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isConfirmed ? 'bg-gradient-to-r from-emerald-400 to-indigo-500' : 'bg-gradient-to-r from-indigo-600 to-rose-500'}`} style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* GOセクション */}
                        <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center">
                                <span className="text-xl mr-2">🌍</span> Community Group Orders
                            </h3>
                            <div className="space-y-4">
                                {groupOrders && groupOrders.length > 0 ? (
                                    groupOrders.map((go) => {
                                        const isJoined = product.joined_group_id === go.id;
                                        return (
                                            <div 
                                                key={go.id} 
                                                className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                                                    isJoined ? 'border-indigo-500 bg-indigo-50/30' : 'bg-slate-50 border-transparent hover:border-indigo-500'
                                                }`}
                                                onClick={() => !isJoined && handleJoinClick(go)}
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">
                                                        {getFlagEmoji(go.country_code)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 uppercase text-xs">{go.region_name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                            Shipping: <span className="text-indigo-600 font-black">¥{Number(go.shared_shipping_cost).toLocaleString()}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    {isJoined ? (
                                                        <button onClick={(e) => { e.stopPropagation(); handleLeaveGO(go.id); }} className="text-[10px] bg-rose-500 text-white px-3 py-1 rounded-full font-black uppercase">Leave</button>
                                                    ) : (
                                                        <div className="text-xs font-black text-slate-900 italic">{go.current_members}/{go.max_members}</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-xs font-bold text-slate-400 py-4 uppercase italic">No active groups</p>
                                )}
                            </div>
                            <button onClick={() => fan ? setIsCreateModalOpen(true) : router.get(route('fans.login'))} className="w-full mt-6 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                                + Create New Group
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* モーダル群 */}
            <JoinModal 
                isOpen={isModalOpen} 
                closeModal={() => setIsModalOpen(false)} 
                group={selectedGroup} 
                product={product}
                addresses={addresses}
                paymentMethods={paymentMethods}
                onConfirm={confirmJoin} 
            />
            <CreateGroupModal isOpen={isCreateModalOpen} closeModal={() => setIsCreateModalOpen(false)} productId={product.id} countries={countries} />
            <IndividualOrderModal 
                isOpen={isIndividualModalOpen} 
                closeModal={() => setIsIndividualModalOpen(false)} 
                product={product}
                auth={auth}
                addresses={addresses} 
                paymentMethods={paymentMethods}
            />
        </FrontLayout>
    );
}