"use client";

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Legend, RadialBarChart, RadialBar
} from "recharts";
import { Activity, Wind, Sun, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { getClinicalReportDataAction } from "@/app/actions/reports_clinical_ops";

const COLORS = ["#D685A9", "#B34D7F", "#9D4D76", "#E5BCd4", "#F2A8C4", "#7A3A5C"];

export default function ClinicalTab() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await getClinicalReportDataAction();
            if (res.success) setData(res.data);
            setIsLoading(false);
        };
        load();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-brand-primary/400 animate-spin" />
                <p className="text-gray-400 text-sm font-medium">Analizando perfiles clínicos...</p>
            </div>
        );
    }

    const habitData = [
        { name: "Fumadores", value: data.lifestyle.smokes, fill: "#D685A9", icon: Wind },
        { name: "Ejercicio", value: data.lifestyle.exercises, fill: "#B34D7F", icon: Activity },
        { name: "Exp. Solar", value: data.lifestyle.sunExposure, fill: "#9D4D76", icon: Sun },
        { name: "Protector", value: data.lifestyle.usesSunscreen, fill: "#E5BCd4", icon: ShieldCheck },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── HABITS GRID ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {habitData.map((habit) => (
                    <div key={habit.name} className="bg-white p-5 rounded-[2rem] border border-brand-primary/50 shadow-sm shadow-pink-100/50 flex flex-col items-center text-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/50 flex items-center justify-center">
                            <habit.icon className="w-6 h-6 text-brand-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{habit.name}</p>
                            <p className="text-2xl font-black text-gray-800">{((habit.value / data.totalPatients) * 100).toFixed(0)}%</p>
                            <p className="text-[10px] text-gray-400 font-medium">{habit.value} de {data.totalPatients} clientes</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Body Zones Distribution */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-brand-primary/50 shadow-sm shadow-pink-100/50">
                    <div className="mb-6">
                        <h3 className="font-black text-gray-800 text-lg">Zonas más Tratadas</h3>
                        <p className="text-xs text-gray-400 font-medium">Distribución de frecuencias por zona corporal</p>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.bodyZones}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                >
                                    {data.bodyZones.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.2)" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Clinical Alerts Summary */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-brand-primary/50 shadow-sm shadow-pink-100/50 flex flex-col">
                    <div className="mb-6">
                        <h3 className="font-black text-gray-800 text-lg">Alertas y Sensibilidades</h3>
                        <p className="text-xs text-gray-400 font-medium">clientes que requieren atención especial</p>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-6">
                        <div className="flex items-center gap-6 p-6 rounded-3xl bg-red-50/50 border border-red-100">
                            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-red-600">{data.lifestyle.allergies}</p>
                                <p className="text-sm font-bold text-red-900/60 uppercase tracking-wide">clientes con Alergias</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-3xl bg-gray-50/80 border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Analizados</p>
                                <p className="text-xl font-black text-gray-700">{data.totalPatients}</p>
                            </div>
                            <div className="p-5 rounded-3xl bg-brand-primary/50/80 border border-brand-primary/100">
                                <p className="text-xs font-bold text-brand-primary/400 uppercase mb-1">Sin Alergias</p>
                                <p className="text-xl font-black text-brand-primary/700">{data.totalPatients - data.lifestyle.allergies}</p>
                            </div>
                        </div>

                        <p className="text-[11px] text-gray-400 text-center italic mt-4">
                            * Estos datos ayudan a preparar los protocolos de seguridad antes de cada sesión.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
