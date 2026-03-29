"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { MessageCircle, Loader2, CheckCircle, Clock, Check, XCircle, CalendarPlus, Trash2, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { getAppointmentsAction, updateAppointmentStatusAction, deleteAppointmentAction, type AppointmentStatus } from "@/app/actions/appointments";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { QuickBookingModal } from "@/components/dashboard/QuickBookingModal";
import { CalendarView } from "@/components/agenda/CalendarView";
import { motion, AnimatePresence } from "framer-motion";

type Appointment = {
    id: string;
    appointment_date: string;
    appointment_time: string;
    treatment_type: string;
    status: AppointmentStatus;
    is_guest?: boolean;
    guest_name?: string;
    guest_phone?: string;
    patients?: {
        id: string;
        first_name: string;
        last_name: string;
        phone: string;
    };
};

type GroupedAppointment = {
    dateLabel: string;
    dateKey: string;
    appointments: Appointment[];
};

const STATUS_CONFIG: Record<AppointmentStatus, { label: string, color: string, icon: React.ElementType }> = {
    pending: { label: "Pendiente", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
    confirmed: { label: "Confirmada", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
    cancelled: { label: "Cancelada", color: "bg-white/5 text-slate-500 border-white/10", icon: XCircle },
    completed: { label: "Completada", color: "bg-brand-primary/10 text-brand-primary border-brand-primary/20", icon: Check },
};

function groupByDate(appointments: Appointment[]): GroupedAppointment[] {
    const map: Record<string, Appointment[]> = {};
    appointments.forEach(a => {
        const key = a.appointment_date;
        if (!map[key]) map[key] = [];
        map[key].push(a);
    });

    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, appointments]) => {
            const date = parseISO(key + "T12:00:00");
            let label = format(date, "EEEE d 'de' MMMM", { locale: es });
            if (isToday(date)) label = `Hoy · ${format(date, "d MMM", { locale: es })}`;
            if (isTomorrow(date)) label = `Mañana · ${format(date, "d MMM", { locale: es })}`;
            return { dateKey: key, dateLabel: label, appointments: appointments.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time)) };
        });
}

export default function AgendaPage() {
    const [groups, setGroups] = useState<GroupedAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"30" | "14" | "7">("30");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
    const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);

    const load = useCallback(async () => {
        setIsLoading(true);
        const res = await getAppointmentsAction(parseInt(filter));
        if (res.success) {
            setAllAppointments(res.data as Appointment[]);
            setGroups(groupByDate(res.data as Appointment[]));
        }
        setIsLoading(false);
    }, [filter]);

    useEffect(() => {
        load();
    }, [load]);

    const handleStatusChange = async (id: string, status: AppointmentStatus) => {
        const res = await updateAppointmentStatusAction(id, status);
        if (res.success) {
            toast.success(`Cita actualizada a ${status}`);
            load();
        } else {
            toast.error("Error al actualizar estado");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.")) return;
        const res = await deleteAppointmentAction(id);
        if (res.success) {
            toast.success("Cita eliminada correctamente");
            load();
        } else {
            toast.error("Error al eliminar la cita");
        }
    };

    const totalAppointments = groups.reduce((s, g) => s + g.appointments.length, 0);

    return (
        <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-4 lg:px-8">

            {/* 1. Header Section */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-white/5 pb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black tracking-widest uppercase border border-brand-primary/20">
                        Gestión de Agenda
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight font-heading">
                        Agenda de <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-500">Sesiones</span>
                    </h1>
                    <p className="text-slate-400 font-medium">
                        {isLoading ? "Sincronizando disponibilidad..." : `${totalAppointments} sesiones programadas para el periodo seleccionado`}
                    </p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="h-14 px-8 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 transition-all border-none active:scale-95"
                    >
                        <CalendarPlus className="w-5 h-5 mr-3" />
                        Nueva Cita
                    </Button>

                    <div className="flex p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-inner">
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "p-3 rounded-xl transition-all",
                                viewMode === "list" ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/10" : "text-slate-500 hover:text-white"
                            )}
                            title="Vista Lista"
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode("calendar")}
                            className={cn(
                                "p-3 rounded-xl transition-all",
                                viewMode === "calendar" ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/10" : "text-slate-500 hover:text-white"
                            )}
                            title="Vista Calendario"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-inner">
                        {(["7", "14", "30"] as const).map(d => (
                            <button
                                key={d}
                                onClick={() => setFilter(d)}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filter === d
                                        ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/10"
                                        : "text-slate-500 hover:text-white"
                                )}
                            >
                                {d} días
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Timeline Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
                    <p className="text-brand-primary font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Sincronizando Agenda...</p>
                </div>
            ) : groups.length === 0 ? (
                <div className="glass-card p-24 text-center border-2 border-dashed border-white/5 max-w-2xl mx-auto flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10">
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white font-heading">Todo en orden</h3>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                            No hay citas programadas para los próximos {filter} días. ¡Buen momento para planificar nuevos proyectos!
                        </p>
                    </div>
                </div>
            ) : viewMode === "calendar" ? (
                <div className="glass-card p-8 border-white/5 overflow-hidden">
                    <CalendarView appointments={allAppointments} onDeleteAction={handleDelete} />
                </div>
            ) : (
                <div className="space-y-16">
                    {groups.map(group => (
                        <div key={group.dateKey} className="space-y-8">
                            <div className="flex items-center gap-6">
                                <span className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-xl shadow-xl">
                                    {group.dateLabel}
                                </span>
                                <div className="flex-1 h-px bg-white/5" />
                                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">
                                    {group.appointments.length} {group.appointments.length === 1 ? 'Cita' : 'Citas'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {group.appointments.map(app => {
                                    const isGuest = app.is_guest;
                                    const name = isGuest
                                        ? (app.guest_name || "Invitado")
                                        : `${app.patients?.first_name} ${app.patients?.last_name}`;
                                    const config = STATUS_CONFIG[app.status];
                                    const StatusIcon = config.icon;
                                    const waUrl = !isGuest && app.patients?.phone
                                        ? buildWhatsAppUrl(app.patients.phone, name, app.treatment_type, app.appointment_date)
                                        : null;

                                    return (
                                        <div
                                            key={app.id}
                                            className="group relative glass-card p-8 border-white/5 transition-all duration-500 flex flex-col justify-between h-full hover:border-brand-primary/30 hover:scale-[1.02] shadow-2xl"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 radial-glow-purple opacity-5 group-hover:opacity-20 transition-opacity blur-3xl" />
                                            
                                            <div className="relative z-10 space-y-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="p-3 bg-brand-primary/20 rounded-2xl border border-white/10 text-brand-primary">
                                                        <Clock className="w-5 h-5" />
                                                    </div>
                                                    
                                                    <div className={cn(
                                                        "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-xl flex items-center gap-2",
                                                        config.color
                                                    )}>
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                        {config.label}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.25em]">Hora: {app.appointment_time.slice(0, 5)}</h3>
                                                    {isGuest ? (
                                                        <div className="space-y-1">
                                                            <p className="text-xl font-black text-white leading-none font-heading">{name}</p>
                                                            <span className="inline-block text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg uppercase tracking-widest border border-amber-500/20">Lead Nuevo</span>
                                                        </div>
                                                    ) : (
                                                        <Link
                                                            href={`/admin/clientes/${app.patients?.id}`}
                                                            className="text-xl font-black text-white group-hover:text-brand-primary transition-colors block leading-none font-heading"
                                                        >
                                                            {name}
                                                        </Link>
                                                    )}
                                                    <p className="text-sm text-slate-400 font-bold truncate tracking-tight">{app.treatment_type}</p>
                                                </div>

                                                {/* Acciones Rápidas */}
                                                <div className="flex items-center gap-2 pt-6 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <div className="flex flex-1 items-center gap-1.5 overflow-x-auto no-scrollbar">
                                                        {(['confirmed', 'cancelled', 'completed'] as AppointmentStatus[]).map((status) => (
                                                            <button
                                                                key={status}
                                                                onClick={() => handleStatusChange(app.id, status)}
                                                                className={cn(
                                                                    "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                                                                    app.status === status 
                                                                        ? "bg-brand-primary text-white border-brand-primary/50 shadow-lg shadow-brand-primary/10" 
                                                                        : "bg-white/5 text-slate-500 border-white/10 hover:border-white/20 hover:text-white"
                                                                )}
                                                            >
                                                                {STATUS_CONFIG[status].label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDelete(app.id)}
                                                        className="p-2.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                                                        title="Eliminar Cita"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="relative z-10 mt-8 flex items-center gap-3">
                                                {waUrl && (
                                                    <a
                                                        href={waUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 h-12 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/5 group"
                                                    >
                                                        <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                        WhatsApp
                                                    </a>
                                                )}

                                                <div className="flex gap-2">
                                                    {app.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleStatusChange(app.id, 'confirmed')}
                                                            className="w-12 h-12 rounded-2xl bg-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white flex items-center justify-center transition-all shadow-xl shadow-brand-primary/10 active:scale-90 border border-brand-primary/30"
                                                            title="Confirmar Cita"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {app.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleStatusChange(app.id, 'completed')}
                                                            className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all shadow-xl shadow-emerald-500/10 active:scale-90 border border-emerald-500/30"
                                                            title="Marcar como Completada"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <QuickBookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={load}
            />
        </div>
    );
}
