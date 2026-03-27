"use client";

import { useState, useEffect } from "react";
import { getClientesAction } from "@/app/actions/clientes";
import { WidgetRecordatorios } from "@/components/dashboard/WidgetRecordatorios";
import { WelcomeHero } from "@/components/dashboard/WelcomeHero";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RecentClientsList } from "@/components/dashboard/RecentClientsList";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { CalendarCarousel } from "@/components/dashboard/CalendarCarousel";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDashboardAnalyticsAction } from "@/app/actions/reports";

export default function AdminDashboard() {
    const [patients, setPatients] = useState<{
        id: string;
        first_name: string;
        last_name: string;
        id_number: string;
        treatment_type: string;
        created_at: string;
        alert_level?: number;
    }[]>([]);
    const [weeklyAppointments, setWeeklyAppointments] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const result = await getClientesAction();
                if (result.success) {
                    setPatients(result.data || []);
                }
                
                const analyticsRes = await getDashboardAnalyticsAction();
                if (analyticsRes.success && analyticsRes.data) {
                    setWeeklyAppointments(analyticsRes.data.weeklyAppointments);
                }
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const recentPatients = patients.slice(0, 4);
    const totalPatients = patients.length;
    const newToday = patients.filter(p => {
        const today = new Date().toISOString().split('T')[0];
        const regDate = new Date(p.created_at).toISOString().split('T')[0];
        return regDate === today;
    }).length;
    const activeAlerts = patients.filter(p => (p.alert_level || 0) > 0).length;

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-brand-primary/400 animate-spin" />
                <p className="text-brand-primary/400 font-black animate-pulse uppercase tracking-widest text-xs">Sincronizando Estudio...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-4 lg:px-8">
            
            {/* 1. Header & Welcome (New Medical Look) */}
            <WelcomeHero />

            {/* 2. Compact Stats (Full Width) */}
            <StatsGrid 
                totalPatients={totalPatients} 
                newToday={newToday} 
                activeAlerts={activeAlerts} 
                weeklyAppointments={weeklyAppointments}
            />

            {/* 3. Main Content Grid (3 Columns Architecture) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* --- LADO IZQUIERDO / CENTRO (8 de 12) --- */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Minimalist Charts */}
                    <DashboardCharts />

                    {/* Recent Patients */}
                    <RecentClientsList patients={recentPatients} />
                </div>

                {/* --- LADO DERECHO (4 de 12) --- */}
                <div className="lg:col-span-4 space-y-10">
                    
                    {/* Compact Calendar & Upcoming */}
                    <CalendarCarousel />

                    {/* Reminders / Tasks */}
                    <WidgetRecordatorios />
                    
                    {/* Bonus Card: Inventario o Stock */}
                    <div className="glass-card p-8 bg-brand-primary-soft border border-brand-primary/100/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <Plus className="w-20 h-20 text-brand-primary" />
                        </div>
                        <h4 className="font-black text-xl text-gray-900 mb-2">Suministros</h4>
                        <p className="text-gray-500 text-xs mb-6 font-medium leading-relaxed">
                            Controla tu stock de botox y rellenos para que nunca te falte nada.
                        </p>
                        <Link href="/admin/inventario">
                            <Button className="w-full bg-white text-brand-primary hover:bg-brand-primary/50 rounded-2xl font-bold border border-brand-primary/100 shadow-sm transition-all hover:shadow-md">
                                Gestionar Inventario
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}
