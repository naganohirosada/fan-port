import { useForm } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function Create() {
    const [previews, setPreviews] = useState([]);
    
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        estimated_price: '',
        images: [], // 複数枚のファイル保持用
        target_locales: ['en', 'zh_CN', 'zh_TW', 'ko'], 
    });

    // ドラッグ＆ドロップ時の処理
    const onDrop = useCallback((acceptedFiles) => {
        // 1. フォームデータに追加
        setData('images', [...data.images, ...acceptedFiles]);

        // 2. プレビュー用URLの生成
        const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    }, [data.images]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] }
    });

    // 言語のオンオフを切り替える関数
    const handleLocaleChange = (locale) => {
        const current = data.target_locales;
        setData('target_locales', 
            current.includes(locale) 
            ? current.filter(l => l !== locale) 
            : [...current, locale]
        );
    };

    const submit = (e) => {
        e.preventDefault();
        // FormData形式で送信するため、Laravel側で正しく受け取れるようにします
        post(route('products.store'));
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">新規作品登録</h1>
            
            <form onSubmit={submit} className="space-y-6">
                {/* 画像アップロードエリア */}
                <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer
                        ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
                >
                    <input {...getInputProps()} />
                    <div className="space-y-2">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-gray-600">画像をドラッグ＆ドロップ、またはクリックして選択</p>
                        <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                    </div>
                </div>

                {/* プレビューグリッド */}
                {previews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                        {previews.map((url, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                <img src={url} className="w-full h-full object-cover" />
                                <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                                    #{index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* その他の入力項目 */}
                <div className="space-y-4">
                    {/* ★ 翻訳言語選択セクション */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <p className="text-sm font-bold text-gray-700 mb-3">AI翻訳する言語を選択</p>
                        <div className="flex flex-wrap gap-4">
                            {[
                                { id: 'en', label: 'English (英語)' },
                                { id: 'zh_CN', label: '简体中文 (簡体字)' },
                                { id: 'zh_TW', label: '繁體中文 (繁体字)' },
                                { id: 'ko', label: '한국어 (韓国語)' },
                            ].map(lang => (
                                <label key={lang.id} className="flex items-center space-x-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={data.target_locales.includes(lang.id)}
                                        onChange={() => handleLocaleChange(lang.id)}
                                    />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                        {lang.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {data.target_locales.length === 0 && (
                            <p className="text-[10px] text-red-500 mt-2">※ 言語を選択しない場合、日本語のみ公開されます</p>
                        )}
                        <input 
                            type="text" placeholder="作品タイトル" 
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.title} onChange={e => setData('title', e.target.value)}
                        />
                        <textarea 
                            placeholder="作品の説明（日本語でOK！自動翻訳されます）" rows="4"
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.description} onChange={e => setData('description', e.target.value)}
                        ></textarea>
                    </div>
                </div>

                {/* 予定価格入力欄 */}
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">¥</span>
                    <input 
                        type="number" placeholder="予定価格（半角数字）" 
                        className="w-full pl-8 border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data.estimated_price} onChange={e => setData('estimated_price', e.target.value)}
                    />
                </div>

                <button 
                    disabled={processing}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg disabled:opacity-50"
                >
                    {processing ? '翻訳・登録中...' : '世界に向けて公開する'}
                </button>
            </form>
        </div>
    );
}