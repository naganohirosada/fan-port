import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const geoUrl = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

export default function Dashboard({ auth, stats, myProducts, geoStats }) {
    
    // 1. マッピング用の辞書を作成
    // Controllerで変換済みの 'map_key' (例: USA) をキーにして、予約数を格納
    const demandMap = geoStats.reduce((acc, cur) => {
        if (cur.map_key) {
            acc[cur.map_key] = cur.count;
        }
        return acc;
    }, {});

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Fan-Port Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12 px-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* ステータスカード */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        {stats.map((stat) => (
                            <div key={stat.name} className="bg-white shadow rounded-lg p-6 border-l-4 border-indigo-500">
                                <dt className="text-sm font-medium text-gray-500">{stat.name}</dt>
                                <dd className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</dd>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 世界地図 */}
                        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Global Demand Heatmap</h3>
                            <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden relative" style={{ height: "450px" }}>
                                <ComposableMap 
                                    projectionConfig={{ scale: 180, center: [10, 10] }}
                                    style={{ width: "100%", height: "100%" }}
                                >
                                    <Geographies geography={geoUrl}>
                                        {({ geographies }) =>
                                            geographies.map((geo) => {
                                                const countryCode = geo.id; 
                                                const countryName = geo.properties.name;

                                                const count = demandMap[countryCode] || 0;
                                                const hasDemand = count > 0;

                                                return (
                                                    <Geography
                                                        key={geo.rsmKey}
                                                        geography={geo}
                                                        data-tooltip-id="map-tooltip"
                                                        data-tooltip-content={`${countryName}: ${count} Wants!`}
                                                        fill={hasDemand ? "#6366F1" : "#E2E8F0"}
                                                        stroke="#FFFFFF"
                                                        strokeWidth={0.5}
                                                        style={{
                                                            default: { outline: "none", transition: "all 250ms" },
                                                            hover: { fill: "#4F46E5", outline: "none", cursor: "pointer" },
                                                            pressed: { outline: "none" },
                                                        }}
                                                    />
                                                );
                                            })
                                        }
                                    </Geographies>
                                </ComposableMap>
                                <Tooltip id="map-tooltip" />
                            </div>
                        </div>

                        {/* 作品リスト */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Products</h3>
                            <div className="space-y-3 max-h-[450px] overflow-y-auto">
                                {myProducts.map((product) => (
                                    <div key={product.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                                        <div className="truncate mr-2">
                                            <p className="text-sm font-bold text-gray-800 truncate">
                                                {product.translations.find(t => t.locale === 'ja')?.text || 'No Title'}
                                            </p>
                                            <p className="text-[10px] text-gray-500">Wants: {product.reservations_count}</p>
                                        </div>
                                        <Link href={`/p/${product.slug}`} target="_blank" className="text-[10px] text-indigo-600 hover:underline flex-shrink-0">
                                            View Page
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}