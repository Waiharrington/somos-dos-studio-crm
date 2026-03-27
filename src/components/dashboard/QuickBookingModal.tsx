"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UserPlus, Calendar, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPatientByIdNumberAction } from "@/app/actions/patients";
import { createAppointmentAction } from "@/app/actions/appointments";
import { toast } from "sonner";

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
      const res = await getPatientByIdNumberAction(idNumber);
      if (res.success && res.data) {
        setFoundPatient(res.data);
        toast.success("cliente encontrado");
      } else {
        toast.error("cliente no encontrado");
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
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-brand-primary/100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 bg-brand-primary-soft border-b border-brand-primary/100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900">Agendado Rápido</h3>
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-1">Citas Directas</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 hover:bg-white rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="p-2 bg-gray-50 flex gap-2 mx-8 mt-6 rounded-2xl border border-gray-100">
          <button 
            onClick={() => setMode("recurring")}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
              mode === "recurring" ? "bg-white text-brand-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Search className="w-3.5 h-3.5" />
            Recurrente
          </button>
          <button 
            onClick={() => setMode("new")}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
              mode === "new" ? "bg-white text-brand-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Nuevo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Número de Cédula</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder="V-12345678" 
                        className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all"
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleSearch}
                      disabled={searchLoading || !idNumber}
                      className="h-12 px-6 bg-gray-900 hover:bg-black text-white rounded-xl font-bold"
                    >
                      {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                    </Button>
                  </div>
                </div>

                {foundPatient && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-xs font-black text-gray-900">{foundPatient.first_name} {foundPatient.last_name}</p>
                      <p className="text-[10px] font-medium text-green-600">{foundPatient.phone}</p>
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
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nombre del Invitado</Label>
                    <Input 
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Nombre completo" 
                      className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Teléfono (Opcional)</Label>
                    <Input 
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="0412-..." 
                      className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fecha</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hora</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">servicio</Label>
            <Input 
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="Ej: Botox, Limpieza facial..." 
              className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all"
            />
          </div>

          <Button 
            type="submit"
            disabled={isLoading || (mode === "recurring" && !foundPatient)}
            className="w-full h-14 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-pink-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Agendar Cita Ahora"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ");
