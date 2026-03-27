"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageCircle, Loader2, CheckCircle, Clock, Check, XCircle, CalendarPlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { getAppointmentsAction, updateAppointmentStatusAction, deleteAppointmentAction, type AppointmentStatus } from "@/app/actions/appointments";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { QuickBookingModal } from "@/components/dashboard/QuickBookingModal";
import { CalendarView } from "@/components/agenda/CalendarView";
import { LayoutGrid, List } from "lucide-react";

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
    pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    confirmed: { label: "Confirmada", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
    cancelled: { label: "Cancelada", color: "bg-gray-100 text-gray-500 border-gray-200", icon: XCircle },
    completed: { label: "Completada", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Check },
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
        <>
        <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-4 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-brand-primary/50 pb-10">
                <div className="space-y-2">
                    <div className="inline-flex items-center px-4 py-1 rounded-full bg-brand-primary/50 text-brand-primary text-[10px] font-black tracking-widest uppercase border border-brand-primary/100/50">
                        Calendario Médico
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        Agenda de <span className="text-transparent bg-clip-text bg-brand-primary">Citas</span>
                    </h1>
                    <p className="text-gray-600 font-semibold">
                        {isLoading ? "Consultando disponibilidad..." : `${totalAppointments} citas programadas para el periodo seleccionado`}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-brand-primary text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-pink-200 hover:scale-105 active:scale-95 transition-all"
                    >
                        <CalendarPlus className="w-4 h-4" />
                        Agendar Rápido
                    </button>

                    <div className="flex p-1.5 bg-white/60 backdrop-blur-md rounded-[1.5rem] border border-brand-primary/50 shadow-sm">
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "px-4 py-2.5 rounded-xl transition-all",
                                viewMode === "list" ? "bg-brand-primary text-white shadow-lg shadow-pink-200" : "text-gray-400 hover:text-brand-primary"
                            )}
                            title="Vista Lista"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("calendar")}
                            className={cn(
                                "px-4 py-2.5 rounded-xl transition-all",
                                viewMode === "calendar" ? "bg-brand-primary text-white shadow-lg shadow-pink-200" : "text-gray-400 hover:text-brand-primary"
                            )}
                            title="Vista Calendario"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex p-1.5 bg-white/60 backdrop-blur-md rounded-[1.5rem] border border-brand-primary/50 shadow-sm">
                        {(["7", "14", "30"] as const).map(d => (
                            <button
                                key={d}
                                onClick={() => setFilter(d)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                    filter === d
                                        ? "bg-brand-primary text-white shadow-lg shadow-pink-200"
                                        : "text-gray-400 hover:text-brand-primary hover:bg-white"
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
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                    <p className="text-brand-primary font-black text-xs uppercase tracking-[0.2em] animate-pulse">Sincronizando Agenda...</p>
                </div>
            ) : groups.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center border border-brand-primary/50 shadow-sm max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800">Todo en orden</h3>
                    <p className="text-gray-600 font-semibold mt-2 max-w-xs mx-auto">
                        No hay citas programadas para los próximos {filter} días. ¡Buen momento para un descanso!
                    </p>
                </div>
            ) : viewMode === "calendar" ? (
                <CalendarView appointments={allAppointments} onDeleteAction={handleDelete} />
            ) : (
                <div className="space-y-14">
                    {groups.map(group => (
                        <div key={group.dateKey} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="px-5 py-2 rounded-2xl bg-white border border-brand-primary/50 text-sm font-black text-gray-700 capitalize shadow-sm">
                                    {group.dateLabel}
                                </span>
                                <div className="flex-1 h-px bg-brand-primary-soft opacity-20" />
                                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">
                                    {group.appointments.length} {group.appointments.length === 1 ? 'Cita' : 'Citas'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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
                                            className="group relative bg-white rounded-[2.5rem] p-7 border border-brand-primary/50 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(255,182,193,0.3)] transition-all duration-500 overflow-hidden flex flex-col justify-between h-full"
                                        >
                                            {/* Decorative Background Element */}
                                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary-soft rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 blur-2xl" />
                                            
                                            <div className="relative z-10 space-y-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="p-3 bg-brand-primary/50 rounded-2xl">
                                                        <Clock className="w-5 h-5 text-brand-primary" />
                                                    </div>
                                                    {/* Acciones */}
                                                        <div className="flex items-center gap-2 pt-2 border-t border-brand-primary/50/50">
                                                            <div className="flex flex-1 items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                                                                {(['confirmed', 'cancelled', 'completed'] as AppointmentStatus[]).map((status) => (
                                                                    <button
                                                                        key={status}
                                                                        onClick={() => handleStatusChange(app.id, status)}
                                                                        className={cn(
                                                                            "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap border",
                                                                            app.status === status ? "bg-somos-dos-primary text-white border-brand-primary/20 shadow-sm" : "bg-white text-gray-400 border-brand-primary/50 hover:border-brand-primary/200"
                                                                        )}
                                                                    >
                                                                        {STATUS_CONFIG[status].label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <button 
                                                                onClick={() => handleDelete(app.id)}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                                title="Eliminar Cita"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    <div className={cn(
                                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm",
                                                        config.color
                                                    )}>
                                                        <div className="flex items-center gap-2">
                                                            <StatusIcon className="w-3 h-3" />
                                                            {config.label}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Hora: {app.appointment_time.slice(0, 5)}</h3>
                                                    {isGuest ? (
                                                        <div>
                                                            <p className="text-xl font-black text-gray-900 leading-tight">{name}</p>
                                                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Nuevo</span>
                                                        </div>
                                                    ) : (
                                                        <Link
                                                            href={`/admin/clientes/${app.patients?.id}`}
                                                            className="text-xl font-black text-gray-900 group-hover:text-brand-primary transition-colors block leading-tight"
                                                        >
                                                            {name}
                                                        </Link>
                                                    )}
                                                    <p className="text-sm text-gray-600 font-semibold truncate">{app.treatment_type}</p>
                                                </div>
                                            </div>

                                            <div className="relative z-10 mt-8 flex items-center gap-3 border-t border-brand-primary/50 pt-6">
                                                {waUrl && (
                                                    <a
                                                        href={waUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 h-12 rounded-[1.2rem] bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-wider shadow-sm"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                        WhatsApp
                                                    </a>
                                                )}

                                                <div className="flex gap-2">
                                                    {app.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleStatusChange(app.id, 'confirmed')}
                                                            className="w-12 h-12 rounded-[1.2rem] bg-brand-primary/50 text-brand-primary hover:bg-brand-primary hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-90"
                                                            title="Confirmar Cita"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {app.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleStatusChange(app.id, 'completed')}
                                                            className="w-12 h-12 rounded-[1.2rem] bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-90"
                                                            title="Marcar como Completada"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {(app.status !== 'cancelled' && app.status !== 'completed') && (
                                                        <button
                                                            onClick={() => handleStatusChange(app.id, 'cancelled')}
                                                            className="w-12 h-12 rounded-[1.2rem] bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all shadow-sm active:scale-90"
                                                            title="Anular Cita"
                                                        >
                                                            <XCircle className="w-5 h-5" />
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
        </div>
        <QuickBookingModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={load}
        />
        </>
    );
}
