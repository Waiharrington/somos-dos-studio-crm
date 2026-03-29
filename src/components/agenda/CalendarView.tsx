"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, Filter, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  treatment_type: string;
  status: string;
  is_guest?: boolean;
  guest_name?: string;
  patients?: {
    first_name: string;
    last_name: string;
  };
};

type Props = {
  appointments: Appointment[];
  onDeleteAction?: (id: string) => void;
};

export function CalendarView({ appointments, onDeleteAction }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const appointmentsForSelectedDate = appointments.filter(app => 
    isSameDay(parseISO(app.appointment_date + "T12:00:00"), selectedDate)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Calendario Grid */}
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-card rounded-[3rem] p-8 shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 radial-glow-purple opacity-20 -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />
          
          {/* Header del Calendario */}
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-white capitalize relative z-10">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={prevMonth}
                title="Mes Anterior"
                className="p-3 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90 relative z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-6 py-2.5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-95 relative z-10"
              >
                Hoy
              </button>
              <button 
                onClick={nextMonth}
                title="Mes Siguiente"
                className="p-3 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90 relative z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 mb-4 relative z-10">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] py-4">
                {day}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const dayAppointments = appointments.filter(app => 
                isSameDay(parseISO(app.appointment_date + "T12:00:00"), day)
              );
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative h-24 md:h-32 rounded-3xl p-3 flex flex-col items-center border transition-all cursor-pointer group z-10",
                    !isCurrentMonth ? "bg-white/[0.02] text-slate-600 border-transparent opacity-40" : "bg-white/5 border-white/5 hover:border-brand-primary/50 hover:shadow-lg hover:shadow-brand-primary/20",
                    isSelected && "border-brand-primary ring-2 ring-brand-primary/20 shadow-xl shadow-brand-primary/20 bg-brand-primary/10",
                    isToday && "bg-brand-primary/20 border-brand-primary/30"
                  )}
                >
                  <span className={cn(
                    "text-sm font-black mb-1",
                    isToday ? "text-brand-primary" : "text-white",
                    !isCurrentMonth && "text-slate-500"
                  )}>
                    {format(day, "d")}
                  </span>

                  {/* Indicadores de citas */}
                  <div className="flex flex-wrap justify-center gap-1 mt-auto">
                    {dayAppointments.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    ))}
                    {dayAppointments.length > 3 && (
                      <span className="text-[8px] font-black text-brand-primary/60">+{dayAppointments.length - 3}</span>
                    )}
                  </div>

                  {/* Detalle pequeño hover */}
                  {dayAppointments.length > 0 && isCurrentMonth && (
                    <div className="absolute top-2 right-2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Aquí podríamos poner minicons de estado si fuera necesario */}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card rounded-[3rem] p-8 min-h-[400px] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/10 rounded-full -translate-y-24 translate-x-12 blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Detalle del Día</p>
              <h3 className="text-xl font-black text-white capitalize">
                {format(selectedDate, "EEEE d", { locale: es })}
              </h3>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl shadow-sm text-brand-primary">
              <Filter className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            {appointmentsForSelectedDate.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center mx-auto">
                  <Clock className="w-5 h-5 text-slate-500" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">Sin sesiones asignadas</p>
              </div>
            ) : (
              appointmentsForSelectedDate.map(app => (
                <div key={app.id} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/5 hover:border-brand-primary/30 transition-all group shadow-xl">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-primary" />
                        <span className="text-[10px] font-black text-white">{app.appointment_time.slice(0, 5)}</span>
                      </div>
                      <p className="text-sm font-black text-slate-200 group-hover:text-brand-primary transition-colors leading-tight">
                        {app.is_guest ? app.guest_name : `${app.patients?.first_name} ${app.patients?.last_name}`}
                      </p>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{app.treatment_type}</p>
                    </div>
                    <div className={cn(
                      "px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border",
                      app.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      app.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                    )}>
                      {app.status === "confirmed" ? "CONF" : app.status === "pending" ? "PEND" : "COMP"}
                    </div>
                  </div>
                  {onDeleteAction && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onDeleteAction(app.id)}
                        className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/20 rounded-xl transition-all"
                        title="Eliminar Cita"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Final de componente
