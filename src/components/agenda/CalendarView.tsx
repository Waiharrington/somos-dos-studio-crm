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
        <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-pink-100/50 border border-brand-primary/50">
          
          {/* Header del Calendario */}
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-gray-900 capitalize">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={prevMonth}
                title="Mes Anterior"
                className="p-3 rounded-2xl border border-brand-primary/100 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/50 transition-all active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-6 py-2.5 rounded-2xl border border-brand-primary/100 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-brand-primary/50 transition-all active:scale-95"
              >
                Hoy
              </button>
              <button 
                onClick={nextMonth}
                title="Mes Siguiente"
                className="p-3 rounded-2xl border border-brand-primary/100 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/50 transition-all active:scale-90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 mb-4">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] py-4">
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
                    "relative h-24 md:h-32 rounded-3xl p-3 flex flex-col items-center border transition-all cursor-pointer group",
                    !isCurrentMonth ? "bg-gray-50/30 text-gray-200 border-transparent opacity-40" : "bg-white border-brand-primary/50/50 hover:border-brand-primary/200 hover:shadow-lg hover:shadow-pink-100/50",
                    isSelected && "border-brand-primary/20 ring-2 ring-Somos Dos Studio-primary/10 shadow-xl shadow-pink-100",
                    isToday && "bg-brand-primary/50/30"
                  )}
                >
                  <span className={cn(
                    "text-sm font-black mb-1",
                    isToday ? "text-brand-primary" : "text-gray-900",
                    !isCurrentMonth && "text-gray-300"
                  )}>
                    {format(day, "d")}
                  </span>

                  {/* Indicadores de citas */}
                  <div className="flex flex-wrap justify-center gap-1 mt-auto">
                    {dayAppointments.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-Somos Dos Studio-primary animate-pulse" />
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

      {/* 2. Detail Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-brand-primary-soft rounded-[3rem] p-8 min-h-64 border border-white shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Detalle del Día</p>
              <h3 className="text-xl font-black text-gray-900 capitalize">
                {format(selectedDate, "EEEE d", { locale: es })}
              </h3>
            </div>
            <div className="p-3 bg-white rounded-2xl shadow-sm text-brand-primary">
              <Filter className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-4">
            {appointmentsForSelectedDate.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-xs font-bold text-gray-400 italic">No hay citas para este día</p>
              </div>
            ) : (
              appointmentsForSelectedDate.map(app => (
                <div key={app.id} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-brand-primary" />
                        <span className="text-[10px] font-black text-brand-primary">{app.appointment_time.slice(0, 5)}</span>
                      </div>
                      <p className="text-sm font-black text-gray-900 group-hover:text-brand-primary transition-colors">
                        {app.is_guest ? app.guest_name : `${app.patients?.first_name} ${app.patients?.last_name}`}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{app.treatment_type}</p>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                      app.status === "confirmed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      app.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-gray-50 text-gray-400 border-gray-100"
                    )}>
                      {app.status === "confirmed" ? "CONF" : app.status === "pending" ? "PEND" : "COMP"}
                    </div>
                  </div>
                  {onDeleteAction && (
                    <div className="mt-3 pt-3 border-t border-white/50 flex justify-end">
                      <button 
                        onClick={() => onDeleteAction(app.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all"
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
