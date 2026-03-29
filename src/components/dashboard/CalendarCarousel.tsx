"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Bell, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getAppointmentsAction } from "@/app/actions/appointments";
import { QuickBookingModal } from "./QuickBookingModal";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function CalendarCarousel() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = new Date();
  const currentDay = today.getDate();
  
  // Create a range of 7 days starting from 2 days ago
  const daysRange = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - 2 + i);
    return d;
  });

  const load = async () => {
    setIsLoading(true);
    const res = await getAppointmentsAction(7);
    if (res.success && res.data) {
      setAppointments(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-black text-white">Agenda Semanal</h4>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all shadow-sm border border-brand-primary/20"
            title="Agendado Rápido"
          >
            <span className="text-lg font-bold">+</span>
          </button>
          <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2 py-1 rounded-lg border border-brand-primary/20">
            {format(today, "MMMM yyyy", { locale: es })}
          </span>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
        {daysRange.map((date, i) => {
          const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "flex-shrink-0 w-12 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer",
                isToday 
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                  : "bg-white/5 text-slate-500 border border-white/10 hover:border-brand-primary/30"
              )}
            >
              <span className="text-[9px] font-black uppercase tracking-widest">
                {format(date, "eee", { locale: es })[0]}
              </span>
              <span className="text-base font-black">{date.getDate()}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="space-y-4 pt-2">
        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Próximas Citas</h5>
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 text-brand-primary/40 animate-spin" />
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-[10px] text-slate-500 font-medium italic text-center py-4">No hay citas programadas.</p>
          ) : (
            appointments.slice(0, 4).map((appt, i) => (
              <div key={i} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                  <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-white truncate">
                      {appt.is_guest ? appt.guest_name : `${appt.patients?.first_name} ${appt.patients?.last_name}`}
                    </p>
                    {appt.is_guest && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-amber-500/20">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-brand-primary">
                      {appt.appointment_time.slice(0, 5)}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 truncate">· {appt.treatment_type}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button className="w-full py-3 rounded-2xl bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all border border-white/10">
        Ver Calendario Completo
      </button>

      <QuickBookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={load}
      />
    </div>
  );
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ");
