"use client";

import { useState } from "react";
import { X, Loader2, Target, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTreatmentPlanAction, type CreatePlanInput, type PaymentType, type Currency } from "@/app/actions/plans";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const EMPTY_FORM = {
  treatment_name: "",
  body_zone: "",
  total_sessions: 5,
  session_interval_days: 15,
  price_total: "",
  price_per_session: "",
  payment_type: "full" as PaymentType,
  currency: "USD" as Currency,
  notes: "",
};

const COMMON_SERVICES = [
  "Desarrollo App Móvil",
  "Página Web (Next.js)",
  "E-commerce",
  "Landing Page",
  "SaaS MVP",
  "Diseño UI/UX (Figma)",
  "Consultoría Técnica",
  "Mantenimiento Mensual",
];

export function ModalNuevoPlan({ patientId, isOpen, onClose, onSuccess }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const set = (field: keyof typeof EMPTY_FORM, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.treatment_name.trim()) {
      toast.error("El nombre del servicio es obligatorio.");
      return;
    }
    if (!form.total_sessions || form.total_sessions < 1) {
      toast.error("Indica cuántos hitos tiene el roadmap.");
      return;
    }

    setIsSaving(true);

    const input: CreatePlanInput = {
      patient_id:            patientId,
      treatment_name:        form.treatment_name,
      body_zone:             form.body_zone || undefined,
      total_sessions:        Number(form.total_sessions),
      session_interval_days: Number(form.session_interval_days),
      price_total:           form.price_total ? Number(form.price_total) : null,
      price_per_session:     form.price_per_session ? Number(form.price_per_session) : null,
      payment_type:          form.payment_type,
      currency:              form.currency,
      notes:                 form.notes || undefined,
    };

    const result = await createTreatmentPlanAction(input);
    setIsSaving(false);

    if (result.success) {
      toast.success("Hoja de ruta creada correctamente.");
      setForm(EMPTY_FORM);
      onSuccess();
      onClose();
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />

      <motion.div 
        initial={{ y: 100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.95 }}
        className="relative glass-card w-full max-w-xl max-h-[90vh] flex flex-col border-white/10 overflow-hidden shadow-3xl"
      >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/5 flex-shrink-0 bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-primary/20 rounded-2xl text-brand-primary border border-brand-primary/30 shadow-xl shadow-brand-primary/10">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight font-heading">Nueva Hoja de Ruta</h2>
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1">Definición de hitos y entregables</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">

            {/* servicios rápidos */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                Selección de Servicios Estándar
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SERVICES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("treatment_name", t)}
                    className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl border transition-all",
                        form.treatment_name === t
                        ? "bg-brand-primary text-white border-brand-primary shadow-xl shadow-brand-primary/20"
                        : "bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <FieldWrapper label="Nombre del Proyecto / Roadmap *">
              <Input
                placeholder="Ej: Desarrollo de Plataforma E-learning Fase 1"
                value={form.treatment_name}
                onChange={(e) => set("treatment_name", e.target.value)}
                className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white placeholder:text-slate-700 focus:border-brand-primary/50"
              />
            </FieldWrapper>

            {/* Zona / Categoría */}
            <FieldWrapper label="Categoría / Framework Principal">
              <Input
                placeholder="Ej: Web (Next.js 15), Mobile (Flutter)"
                value={form.body_zone}
                onChange={(e) => set("body_zone", e.target.value)}
                className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white placeholder:text-slate-700 focus:border-brand-primary/50"
              />
            </FieldWrapper>

            {/* Sesiones e intervalo */}
            <div className="grid grid-cols-2 gap-4">
              <FieldWrapper label="Total Hitos / Sprints *">
                <Input
                  type="number"
                  min={1}
                  value={form.total_sessions}
                  onChange={(e) => set("total_sessions", e.target.value)}
                  className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white focus:border-brand-primary/50"
                />
              </FieldWrapper>

              <FieldWrapper label="Revisión (Días)">
                <Input
                  type="number"
                  min={1}
                  value={form.session_interval_days}
                  onChange={(e) => set("session_interval_days", e.target.value)}
                  className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white focus:border-brand-primary/50"
                />
              </FieldWrapper>
            </div>

            {/* Precios */}
            <div className="bg-white/[0.02] rounded-[2.5rem] p-8 space-y-8 border border-white/5 shadow-inner">
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] ml-2">
                Configuración Comercial
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWrapper label="Moneda">
                  <select
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value as Currency)}
                    className="w-full h-14 px-6 text-sm font-bold rounded-2xl border border-white/5 bg-brand-dark text-white focus:outline-none focus:border-brand-primary/50 transition-all appearance-none"
                  >
                    <option value="USD">Dólares (USD)</option>
                    <option value="VES">Bolívares (VES)</option>
                    <option value="COP">Pesos (COP)</option>
                  </select>
                </FieldWrapper>

                <FieldWrapper label="Esquema de Pago">
                  <select
                    value={form.payment_type}
                    onChange={(e) => set("payment_type", e.target.value as PaymentType)}
                    className="w-full h-14 px-6 text-sm font-bold rounded-2xl border border-white/5 bg-brand-dark text-white focus:outline-none focus:border-brand-primary/50 transition-all appearance-none"
                  >
                    <option value="full">Pago Único</option>
                    <option value="per_session">Hito a Hito</option>
                    <option value="installments">Retainer Mensual</option>
                  </select>
                </FieldWrapper>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWrapper label="Inversión Total">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.price_total}
                    onChange={(e) => set("price_total", e.target.value)}
                    className="rounded-2xl border-white/5 bg-brand-dark h-14 text-sm font-bold text-white placeholder:text-slate-700"
                  />
                </FieldWrapper>

                <FieldWrapper label="Monto por Hito">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.price_per_session}
                    onChange={(e) => set("price_per_session", e.target.value)}
                    className="rounded-2xl border-white/5 bg-brand-dark h-14 text-sm font-bold text-white placeholder:text-slate-700"
                  />
                </FieldWrapper>
              </div>
            </div>

            {/* Notas */}
            <FieldWrapper label="Acuerdos Específicos">
              <textarea
                placeholder="Detalles sobre entregas finales, alcances, y exclusiones técnicas..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
                className="w-full px-6 py-4 text-sm font-bold rounded-2xl border border-white/5 bg-white/5 text-white resize-none focus:outline-none focus:border-brand-primary/50 transition-all placeholder:text-slate-700 h-32"
              />
            </FieldWrapper>

          </div>

          {/* Footer */}
          <div className="p-8 border-t border-white/5 flex gap-4 bg-white/[0.01]">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-2xl h-16 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl h-16 shadow-xl shadow-brand-primary/20 transition-all font-black uppercase text-[10px] tracking-widest border-none"
            >
              {isSaving ? (
                <><Loader2 className="w-5 h-5 mr-3 animate-spin" />Iniciando...</>
              ) : (
                "Crear Hoja de Ruta"
              )}
            </Button>
          </div>

        </motion.div>
    </div>
  );
}

function FieldWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 flex-1">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
        {label}
      </label>
      {children}
    </div>
  );
}
