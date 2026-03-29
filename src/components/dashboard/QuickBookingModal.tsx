"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UserPlus, Calendar, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClienteByIdNumberAction } from "@/app/actions/clientes";
import { createAppointmentAction } from "@/app/actions/appointments";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuickBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickBookingModal({ isOpen, onClose, onSuccess }: QuickBookingModalProps) {
  const [mode, setMode] = useState<"recurring" | "new">("recurring");
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [foundPatient, setFoundPatient] = useState<any>(null);
  
  // Form State
  const [idNumber, setIdNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00");
  const [treatment, setTreatment] = useState("");

  const handleSearch = async () => {
    if (!idNumber) return;
    setSearchLoading(true);
    setFoundPatient(null);
    try {
      const res = await getClienteByIdNumberAction(idNumber);
      if (res.success && res.data) {
        setFoundPatient(res.data);
        toast.success("Cliente encontrado");
      } else {
        toast.error("Cliente no encontrado");
      }
    } catch (error) {
      toast.error("Error al buscar cliente");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        appointment_date: date,
        appointment_time: time,
        treatment_type: treatment || "Consulta General",
        patient_id: mode === "recurring" ? foundPatient?.id : undefined,
        is_guest: mode === "new",
        guest_name: mode === "new" ? guestName : undefined,
        guest_phone: mode === "new" ? guestPhone : undefined,
      };

      const res = await createAppointmentAction(payload);
      if (res.success) {
        toast.success("Cita agendada correctamente");
        onSuccess?.();
        onClose();
        // Reset
        setFoundPatient(null);
        setIdNumber("");
        setGuestName("");
        setGuestPhone("");
        setTreatment("");
      } else {
        toast.error(res.error || "Error al agendar");
      }
    } catch (error) {
      toast.error("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-lg glass-card rounded-[2rem] shadow-3xl border border-white/10 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 radial-glow-purple opacity-20 -translate-y-1/2 translate-x-1/2 blur-[80px]" />

        {/* Header */}
        <div className="p-8 bg-white/[0.01] border-b border-white/5 flex items-center justify-between relative z-10">
          <div>
            <h3 className="text-xl font-black text-white">Agendado Rápido</h3>
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-1">Citas Directas</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="p-2 bg-white/5 flex gap-2 mx-8 mt-6 rounded-2xl border border-white/10 relative z-10">
          <button 
            type="button"
            onClick={() => setMode("recurring")}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
              mode === "recurring" ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-slate-500 hover:text-white"
            )}
          >
            <Search className="w-3.5 h-3.5" />
            Recurrente
          </button>
          <button 
            type="button"
            onClick={() => setMode("new")}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
              mode === "new" ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-slate-500 hover:text-white"
            )}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Nuevo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 relative z-10">
          <AnimatePresence mode="wait">
            {mode === "recurring" ? (
              <motion.div 
                key="recurring"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Número de Identificación</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input 
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder="V-12345678" 
                        className="pl-10 h-12 rounded-xl bg-white/5 border-white/10 focus:border-brand-primary/50 text-white placeholder:text-slate-600 transition-all"
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleSearch}
                      disabled={searchLoading || !idNumber}
                      className="h-12 px-6 bg-brand-primary/20 hover:bg-brand-primary text-brand-primary hover:text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all border border-brand-primary/30"
                    >
                      {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                    </Button>
                  </div>
                </div>

                {foundPatient && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-xs font-black text-white">{foundPatient.first_name} {foundPatient.last_name}</p>
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{foundPatient.phone}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="new"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nombre del Lead</Label>
                    <Input 
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Nombre completo" 
                      className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-brand-primary/50 text-white placeholder:text-slate-600 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Teléfono (Opcional)</Label>
                    <Input 
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+58 412..." 
                      className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-brand-primary/50 text-white placeholder:text-slate-600 transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fecha</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-white/5 border-white/10 focus:border-brand-primary/50 text-white transition-all [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hora</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-white/5 border-white/10 focus:border-brand-primary/50 text-white transition-all [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Servicio / Hito</Label>
            <Input 
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="Ej: Revisión diseño web..." 
              className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-brand-primary/50 text-white placeholder:text-slate-600 transition-all"
            />
          </div>

          <Button 
            type="submit"
            disabled={isLoading || (mode === "recurring" && !foundPatient)}
            className="w-full h-14 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Agendar Cita Ahora"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
