import { useEffect, useState } from 'react';
import FrontLayout from '@/Layouts/FrontLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register({ countries }) {
	const { data, setData, post, processing, errors, reset } = useForm({
		name: '',
		email: '',
		password: '',
		password_confirmation: '',
		country_code: '',
		bio: '',
		avatar: null, // ファイルアップロード用
	});

	const [preview, setPreview] = useState(null);

	useEffect(() => {
		return () => { reset('password', 'password_confirmation'); };
	}, []);

	const handleAvatarChange = (e) => {
		const file = e.target.files[0];
		setData('avatar', file);
		if (file) {
			setPreview(URL.createObjectURL(file));
		}
	};

	const submit = (e) => {
		e.preventDefault();
		// Inertiaはファイルが含まれると自動的にmultipart/form-dataで送信します
		post(route('fans.register'));
	};

	return (
		<FrontLayout>
			<Head title="Join FAN-PORT" />

			<div className="max-w-xl mx-auto py-20 px-6">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
						Join the <br /><span className="text-indigo-600">Global Community.</span>
					</h1>
					<p className="mt-4 text-slate-500 font-medium">Create your profile to support creators.</p>
				</div>

				<form onSubmit={submit} className="space-y-6 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
					
					{/* アバターアップロードセクション */}
					<div className="flex flex-col items-center mb-4">
						<div className="relative w-28 h-28 group">
							<div className="w-full h-full rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-300">
								{preview ? (
									<img src={preview} className="w-full h-full object-cover" />
								) : (
									<div className="text-center text-slate-400">
										<span className="text-2xl block">📷</span>
										<span className="text-[10px] font-bold uppercase">Upload</span>
									</div>
								)}
							</div>
							<input 
								type="file" 
								className="absolute inset-0 opacity-0 cursor-pointer" 
								onChange={handleAvatarChange} 
								accept="image/*" 
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-[10px] font-black text-slate-400 mb-1 ml-2 uppercase tracking-widest">Public Name</label>
							<input 
								type="text" 
								className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" 
								value={data.name} 
								onChange={(e) => setData('name', e.target.value)} 
								required 
							/>
							{errors.name && <div className="text-red-500 text-xs mt-1 ml-2">{errors.name}</div>}
						</div>
						<div>
							<label className="block text-[10px] font-black text-slate-400 mb-1 ml-2 uppercase tracking-widest">Country</label>
							<select 
								className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 appearance-none" 
								value={data.country_code} 
								onChange={(e) => setData('country_code', e.target.value)} 
								required
							>
								<option value="">Select Region</option>
								{Object.entries(countries).map(([code, name]) => (
									<option key={code} value={code}>{name}</option>
								))}
							</select>
							{errors.country_code && <div className="text-red-500 text-xs mt-1 ml-2">{errors.country_code}</div>}
						</div>
					</div>

					<div>
						<label className="block text-[10px] font-black text-slate-400 mb-1 ml-2 uppercase tracking-widest">Email Address</label>
						<input 
							type="email" 
							className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" 
							value={data.email} 
							onChange={(e) => setData('email', e.target.value)} 
							required 
						/>
						{errors.email && <div className="text-red-500 text-xs mt-1 ml-2">{errors.email}</div>}
					</div>

					<div>
						<label className="block text-[10px] font-black text-slate-400 mb-1 ml-2 uppercase tracking-widest">Bio (Introduction)</label>
						<textarea 
							className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 min-h-[100px]" 
							value={data.bio} 
							onChange={(e) => setData('bio', e.target.value)} 
							placeholder="I love Japanese art!" 
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<input 
								type="password" 
								placeholder="Password" 
								className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" 
								value={data.password} 
								onChange={(e) => setData('password', e.target.value)} 
								required 
							/>
							{errors.password && <div className="text-red-500 text-xs mt-1 ml-2">{errors.password}</div>}
						</div>
						<div>
							<input 
								type="password" 
								placeholder="Confirm" 
								className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" 
								value={data.password_confirmation} 
								onChange={(e) => setData('password_confirmation', e.target.value)} 
								required 
							/>
						</div>
					</div>

					<button 
						disabled={processing} 
						className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
					>
						{processing ? 'Creating...' : 'JOIN FAN-PORT'}
					</button>
				</form>
			</div>
		</FrontLayout>
	);
}