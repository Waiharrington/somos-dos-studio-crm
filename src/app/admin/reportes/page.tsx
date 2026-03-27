"use client";

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Users, Calendar, DollarSign, Loader2, BarChart2, PieChart as PieChartIcon, Activity } from "lucide-react";
import {
    getReportStatsAction,
    getPatientsPerMonthAction,
    getVisitsPerMonthAction,
    getTopTreatmentsAction,
} from "@/app/actions/reports";
import { cn } from "@/lib/utils";
import AdvancedMetricsTab from "@/components/reportes/AdvancedMetricsTab";
import ClinicalTab from "@/components/reportes/ClinicalTab";
import OperationalTab from "@/components/reportes/OperationalTab";

// ─────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────

const PIE_COLORS = ["#D685A9", "#B34D7F", "#9D4D76", "#E5BCd4", "#F2A8C4", "#7A3A5C"];
const BAR_COLOR_PATIENTS = "#D685A9";
const BAR_COLOR_VISITS = "#9D4D76";

type Stats = {
    totalPatients: number;
    visitsThisMonth: number;
    activePlans: number;
    totalRevenue: number;
};

type MonthData = { mes: string; total: number };
type Treatment = { name: string; value: number };

export default function ReportesPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [patients, setPatients] = useState<MonthData[]>([]);
    const [visits, setVisits] = useState<MonthData[]>([]);
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"general" | "advanced" | "clinical" | "operational">("general");

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const [statsRes, patientsRes, visitsRes, treatmentsRes] = await Promise.all([
                getReportStatsAction(),
                getPatientsPerMonthAction(),
                getVisitsPerMonthAction(),
                getTopTreatmentsAction(),
            ]);

            if (statsRes.success) setStats(statsRes.data as Stats);
            if (patientsRes.success) setPatients(patientsRes.data as MonthData[]);
            if (visitsRes.success) setVisits(visitsRes.data as MonthData[]);
            if (treatmentsRes.success) setTreatments(treatmentsRes.data as Treatment[]);
            setIsLoading(false);
        };
        load();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
                <p className="text-brand-primary font-black uppercase tracking-[0.2em] text-xs animate-pulse">Generando Analíticas...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 1. Header & Tab Switcher */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-brand-primary/50 pb-10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[1.8rem] bg-brand-primary flex items-center justify-center shadow-xl shadow-pink-200/50 flex-shrink-0">
                        <BarChart2 className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <div className="inline-flex items-center px-4 py-1 rounded-full bg-brand-primary/50 text-brand-primary text-[10px] font-black tracking-widest uppercase border border-brand-primary/100/50 mb-2">
                           Business Intelligence
                        </div>
                        <h1 className="text-4xl font-black text-gray-950 tracking-tight leading-none">Reportes <span className="text-transparent bg-clip-text bg-brand-primary">& Métricas</span></h1>
                        <p className="text-sm text-gray-600 font-semibold mt-2">Monitorea el crecimiento y salud operativa de Somos Dos Studio con datos en tiempo real.</p>
                    </div>
                </div>

                <div className="flex bg-white/60 p-1.5 rounded-[1.5rem] border border-brand-primary/50 backdrop-blur-md shadow-sm overflow-x-auto gap-1">
                    {[
                        { id: "general", label: "Generales", icon: PieChartIcon },
                        { id: "advanced", label: "Avanzadas", icon: TrendingUp },
                        { id: "clinical", label: "Clínicos", icon: Activity },
                        { id: "operational", label: "Operativos", icon: Calendar }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as "general" | "advanced" | "clinical" | "operational")}
                            className={cn(
                                "flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-brand-primary text-white shadow-lg shadow-pink-200"
                                    : "text-gray-400 hover:text-brand-primary hover:bg-white"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-white" : "text-brand-primary/300")} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Content Selection */}
            {activeTab === "general" && (
                <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                    
                    {/* Stat Cards Compactas (Estilo Dashboard) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
                        <StatCard
                            icon={<Users className="w-5 h-5 text-brand-primary" />}
                            label="Total clientes"
                            value={stats?.totalPatients || 0}
                            trend="+12%"
                        />
                        <StatCard
                            icon={<Calendar className="w-5 h-5 text-brand-primary" />}
                            label="Visitas Mensuales"
                            value={stats?.visitsThisMonth || 0}
                            trend="+5%"
                        />
                        <StatCard
                            icon={<TrendingUp className="w-5 h-5 text-brand-primary" />}
                            label="Planes Activos"
                            value={stats?.activePlans || 0}
                            trend="+8%"
                        />
                        <StatCard
                            icon={<DollarSign className="w-5 h-5 text-brand-primary" />}
                            label="Ingresos (Est.)"
                            value={`$${stats?.totalRevenue.toLocaleString() || 0}`}
                            trend="+15%"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        
                        <ChartCard title="Crecimiento de clientes" subtitle="Nuevos registros por periodo">
                            <div className="h-[250px] w-full pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={patients}>
                                        <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "900", fill: "#9ca3af" }} />
                                        <YAxis hide />
                                        <Tooltip 
                                            cursor={{ fill: '#fdf2f8', radius: 10 }}
                                            contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)", fontWeight: "bold" }} 
                                        />
                                        <Bar dataKey="total" fill={BAR_COLOR_PATIENTS} radius={[10, 10, 10, 10]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Flujo de Visitas" subtitle="Consultas completadas mensualmente">
                            <div className="h-[250px] w-full pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={visits}>
                                        <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "900", fill: "#9ca3af" }} />
                                        <YAxis hide />
                                        <Tooltip 
                                            cursor={{ fill: '#fdf2f8', radius: 10 }}
                                            contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)", fontWeight: "bold" }} 
                                        />
                                        <Bar dataKey="total" fill={BAR_COLOR_VISITS} radius={[10, 10, 10, 10]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="servicios Populares" subtitle="Demanda por categoría">
                            <div className="flex flex-col md:flex-row lg:flex-col items-center gap-6 pt-4">
                                <div className="h-[210px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={treatments}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={85}
                                                paddingAngle={4}
                                            >
                                                {treatments.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: "15px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full space-y-2.5">
                                    {treatments.slice(0, 4).map((t, i) => (
                                        <div key={t.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", i === 0 && "bg-[#D685A9]", i === 1 && "bg-[#B34D7F]", i === 2 && "bg-[#9D4D76]", i === 3 && "bg-[#E5BCd4]")} />
                                                <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest truncate max-w-[120px]">{t.name}</span>
                                            </div>
                                            <span className="font-black text-gray-800 text-xs">{t.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ChartCard>

                    </div>
                </div>
            )}

            {activeTab === "advanced" && <AdvancedMetricsTab />}
            {activeTab === "clinical" && <ClinicalTab />}
            {activeTab === "operational" && <OperationalTab />}
        </div>
    );
}

// ─────────────────────────────────────────────
// REFINED HELPERS
// ─────────────────────────────────────────────

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: number | string; trend?: string }) {
    return (
        <div className="relative group overflow-hidden bg-white rounded-[2rem] p-6 border border-brand-primary/50 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(255,182,193,0.3)] transition-all duration-500">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary-soft opacity-10 rounded-full blur-2xl group-hover:opacity-40 transition-opacity" />
            
            <div className="relative z-10 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-brand-primary/50 flex items-center justify-center text-brand-primary shadow-inner">
                        {icon}
                    </div>
                    {trend && (
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100/50">
                            {trend}
                        </span>
                    )}
                </div>
                <div>
                   <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1">{label}</p>
                   <p className="text-3xl font-black text-gray-900 tracking-tighter">{value}</p>
                </div>
            </div>
        </div>
    );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-brand-primary/50 shadow-sm hover:shadow-[0_25px_50px_-20px_rgba(0,0,0,0.04)] transition-all duration-500 flex flex-col">
            <div className="space-y-1 mb-2">
                <h3 className="font-black text-gray-900 tracking-tight text-lg">{title}</h3>
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{subtitle}</p>
            </div>
            <div className="flex-1">
               {children}
            </div>
        </div>
    );
}
