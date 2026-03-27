"use client";

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, Legend, PieChart, Pie, AreaChart, Area, CartesianGrid
} from "recharts";
import { Clock, CalendarCheck, TrendingUp, Filter, Loader2 } from "lucide-react";
import { getOperationalReportDataAction } from "@/app/actions/reports_clinical_ops";

const COLORS = ["#9D4D76", "#B34D7F", "#D685A9", "#E5BCd4", "#F2A8C4"];

export default function OperationalTab() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await getOperationalReportDataAction();
            if (res.success) setData(res.data);
            setIsLoading(false);
        };
        load();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-brand-primary/400 animate-spin" />
                <p className="text-gray-400 text-sm font-medium">Calculando eficiencia operativa...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── TOP STATS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-somos-dos-primary to-[#9D4D76] p-6 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl shadow-pink-900/10">
                    <div>
                        <p className="text-brand-primary/100 text-[10px] font-black uppercase tracking-widest mb-1">Efectividad Global</p>
                        <h4 className="text-3xl font-black">
                            {((data.effectiveness.find((e: any) => e.name === "completed")?.value /
                                data.effectiveness.reduce((acc: number, curr: any) => acc + curr.value, 0)) * 100 || 0).toFixed(0)}%
                        </h4>
                        <p className="text-brand-primary/200 text-xs mt-1 font-medium">Citas completadas con éxito</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md border border-white/20">
                        <CalendarCheck className="w-8 h-8" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-brand-primary/50 shadow-sm shadow-pink-100/50 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Hora Pico</p>
                        <h4 className="text-3xl font-black text-gray-800">
                            {[...data.peakHours].sort((a, b) => b.value - a.value)[0]?.hour || "N/A"}
                        </h4>
                        <p className="text-gray-500 text-xs mt-1 font-medium">Mayor volumen de clientes</p>
                    </div>
                    <div className="w-16 h-16 bg-brand-primary/50 rounded-[1.5rem] flex items-center justify-center border border-brand-primary/100">
                        <Clock className="w-8 h-8 text-brand-primary" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* peak hours Area Chart */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-brand-primary/50 shadow-sm shadow-pink-100/50">
                    <div className="mb-6">
                        <h3 className="font-black text-gray-800 text-lg">Distribución Horaria</h3>
                        <p className="text-xs text-gray-400 font-medium">Actividad por hora del día (8:00 - 20:00)</p>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.peakHours}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#B34D7F" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#B34D7F" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="hour"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(val) => [val, "Citas"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#B34D7F"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Activity */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-brand-primary/50 shadow-sm shadow-pink-100/50">
                    <div className="mb-6">
                        <h3 className="font-black text-gray-800 text-lg">Días de Mayor Actividad</h3>
                        <p className="text-xs text-gray-400 font-medium">Volumen de citas por día de la semana</p>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.dayActivity} barGap={8}>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 600, fill: '#6b7280' }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#fdf2f8' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={32}>
                                    {data.dayActivity.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Effectiveness Detail Table */}
            <div className="bg-white rounded-[2.5rem] border border-brand-primary/50 shadow-sm shadow-pink-100/50 overflow-hidden">
                <div className="p-6 border-b border-brand-primary/50 bg-brand-primary/50/30 flex items-center justify-between">
                    <h3 className="font-black text-gray-800">Estado de Gestión de Citas</h3>
                    <TrendingUp className="w-5 h-5 text-brand-primary/400" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">Estado</th>
                                <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">Volumen</th>
                                <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">Porcentaje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pink-50">
                            {data.effectiveness.map((item: any, i: number) => {
                                const total = data.effectiveness.reduce((a: any, b: any) => a + b.value, 0);
                                const percentage = ((item.value / total) * 100).toFixed(1);
                                return (
                                    <tr key={i} className="hover:bg-brand-primary/50/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="capitalize font-bold text-gray-700">{item.name}</span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-gray-500">{item.value}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-somos-dos-primary"
                                                        style={{ width: `${percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
                                                    />
                                                </div>
                                                <span className="font-bold text-gray-400">{percentage}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
