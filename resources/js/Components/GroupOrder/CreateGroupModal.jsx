import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';

export default function CreateGroupModal({ isOpen, closeModal, productId, countries }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: productId,
        region_name: '',
        country_code: 'US',
        max_members: 10,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('fans.group-orders.store'), {
            onSuccess: () => {
                reset();
                closeModal();
            },
        });
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={closeModal}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[3rem] bg-white p-10 shadow-2xl transition-all border border-slate-100">
                                <Dialog.Title as="h3" className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 text-center">
                                    🚀 Start New Group
                                </Dialog.Title>

                                <form onSubmit={submit} className="space-y-6">
                                    {/* Region Name */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Region / City Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Toronto, Canada"
                                            className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                            value={data.region_name}
                                            onChange={e => setData('region_name', e.target.value)}
                                        />
                                        {errors.region_name && <p className="mt-1 text-[10px] text-rose-500 font-black uppercase ml-2">{errors.region_name}</p>}
                                    </div>

                                    {/* Country Select */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Country</label>
                                        <select
                                            className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                            value={data.country_code}
                                            onChange={e => setData('country_code', e.target.value)}
                                        >
                                            {Object.entries(countries).map(([code, name]) => (
                                                <option key={code} value={code}>{name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Max Members */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Max Group Size</label>
                                        <input
                                            type="number"
                                            min="2"
                                            max="50"
                                            className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                            value={data.max_members}
                                            onChange={e => setData('max_members', e.target.value)}
                                        />
                                        <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase ml-2 leading-tight">
                                            ※ Larger groups reduce shipping costs more, but take longer to fill.
                                        </p>
                                    </div>

                                    <div className="pt-4 flex flex-col space-y-3">
                                        <button type="submit" disabled={processing} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50">
                                            Launch Group
                                        </button>
                                        <button type="button" onClick={closeModal} className="w-full py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-900 transition-all">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}