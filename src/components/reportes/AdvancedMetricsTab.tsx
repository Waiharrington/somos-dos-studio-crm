"use client";

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, Legend, ComposedChart, Line
} from "recharts";
import { Target, DollarSign, Award, ArrowUpRight, Loader2 } from "lucide-react";
import { getTreatmentRevenueAction, getInterestConversionAction } from "@/app/actions/reports_advanced";

const COLORS = ["#D685A9", "#B34D7F", "#9D4D76", "#E5BCd4", "#F2A8C4", "#7A3A5C"];

type RevenueData = { name: string; value: number };
type ConversionData = { category: string; leads: number; conversions: number; rate: number };

export default function AdvancedMetricsTab() {
    const [revenue, setRevenue] = useState<RevenueData[]>([]);
    const [conversion, setConversion] = useState<ConversionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const [revRes, convRes] = await Promise.all([
                getTreatmentRevenueAction(),
                getInterestConversionAction()
            ]);

            if (revRes.success) setRevenue(revRes.data as RevenueData[]);
            if (convRes.success) setConversion(convRes.data as ConversionData[]);
            setIsLoading(false);
        };
        load();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-brand-primary/400 animate-spin" />
                <p className="text-gray-400 text-sm font-medium">Analizando datos comerciales...</p>
            </div>
        );
    }

    const highestRevenue = revenue[0];
    const bestConversion = [...conversion].sort((a, b) => b.rate - a.rate)[0];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── INSIGHT CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#9D4D76] to-[#7A3A5C] p-6 rounded-[2rem] text-white shadow-xl shadow-pink-900/10 flex items-center justify-between">
                    <div>
                        <p className="text-brand-primary/100 text-xs font-bold uppercase tracking-widest mb-1">Mayor Rentabilidad</p>
                        <h4 className="text-xl font-bold truncate max-w-[200px]">{highestRevenue?.name || "N/A"}</h4>
                        <div className="flex items-center gap-1 mt-2 text-brand-primary/200">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-lg font-bold">${highestRevenue?.value.toLocaleString() || 0} USD</span>
                        </div>
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                        <Award className="w-8 h-8 text-brand-primary/100" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-brand-primary/50 shadow-sm shadow-pink-100/50 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Mejor Conversión</p>
                        <h4 className="text-xl font-bold text-gray-800 truncate max-w-[200px]">{bestConversion?.category || "N/A"}</h4>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl font-black text-[#9D4D76]">{(bestConversion?.rate * 100 || 0).toFixed(0)}%</span>
                            <div className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold flex items-center gap-0.5">
                                <ArrowUpRight className="w-3 h-3" /> TOP
                            </div>
                        </div>
                    </div>
                    <div className="w-14 h-14 bg-brand-primary/50 rounded-2xl flex items-center justify-center border border-brand-primary/100">
                        <Target className="w-8 h-8 text-[#9D4D76]" />
                    </div>
                </div>
            </div>

            {/* ── CHARTS ROW ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Profitability Ranking */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-brand-primary/50 shadow-sm shadow-pink-100/50">
                    <div className="mb-6">
                        <h3 className="font-black text-gray-800 text-lg">Ranking de Rentabilidad</h3>
                        <p className="text-xs text-gray-400 font-medium">Ingresos totales acumulados por servicio (USD)</p>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenue} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 11, fontWeight: 600, fill: "#6b7280" }}
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#fdf2f8' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                                    formatter={(v: any) => [`$${Number(v || 0).toLocaleString()} USD`, 'Ingresos']}
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                    {revenue.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion Funnel */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-brand-primary/50 shadow-sm shadow-pink-100/50">
                    <div className="mb-6">
                        <h3 className="font-black text-gray-800 text-lg">Tasa de Conversión</h3>
                        <p className="text-xs text-gray-400 font-medium">Comparativa: Interesados vs Planes Contratados</p>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={conversion}>
                                <XAxis
                                    dataKey="category"
                                    tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={24}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }} />
                                <Bar name="Interesados" dataKey="leads" fill="#E5BCd4" radius={[6, 6, 0, 0]} barSize={25} />
                                <Bar name="Contratados" dataKey="conversions" fill="#9D4D76" radius={[6, 6, 0, 0]} barSize={25} />
                                <Line name="% Cierre" type="monotone" dataKey={(v) => v.rate * 10} stroke="#B34D7F" strokeWidth={3} dot={{ r: 4, fill: '#B34D7F' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* ── TABLE OF DETAILS ── */}
            <div className="bg-white rounded-[2.5rem] border border-brand-primary/50 shadow-sm shadow-pink-100/50 overflow-hidden">
                <div className="p-6 border-b border-brand-primary/50 bg-brand-primary/50/30">
                    <h3 className="font-black text-gray-800">Detalle de Conversión por Categoría</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Categoría</th>
                                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Prospectos</th>
                                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Cierres</th>
                                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Tasa de Éxito</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pink-50">
                            {conversion.map((item, i) => (
                                <tr key={i} className="hover:bg-brand-primary/50/20 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-700">{item.category}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.leads}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.conversions}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-Somos Dos Studio-primary"
                                                    style={{ width: `${item.rate * 100}%` }}
                                                />
                                            </div>
                                            <span className="font-bold text-[#9D4D76]">{(item.rate * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
