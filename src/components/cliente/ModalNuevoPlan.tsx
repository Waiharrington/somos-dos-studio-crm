"use client";

import { useState } from "react";
import { X, Loader2, Target, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTreatmentPlanAction, type CreatePlanInput, type PaymentType, type Currency } from "@/app/actions/plans";
import { toast } from "sonner";

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
      toast.success("Roadmap del proyecto creado.");
      setForm(EMPTY_FORM);
      onSuccess();
      onClose();
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center">
        <div className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] md:w-[540px] md:max-h-[85vh] w-full max-h-[90vh] flex flex-col shadow-2xl">

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Nuevo Roadmap</h2>
                <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest mt-0.5">Define los hitos del proyecto</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* servicios rápidos */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">
                Selección rápida de servicios
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SERVICES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("treatment_name", t)}
                    className={`text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl border transition-all ${
                      form.treatment_name === t
                        ? "bg-brand-primary text-white border-brand-primary shadow-md"
                        : "bg-white text-gray-600 border-gray-100 hover:border-brand-primary/20 hover:bg-brand-primary/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">
                Nombre del Proyecto / Servicio *
              </label>
              <Input
                placeholder="Ej: Desarrollo de App E-commerce para Tienda X"
                value={form.treatment_name}
                onChange={(e) => set("treatment_name", e.target.value)}
                className="rounded-2xl border-gray-100 focus-visible:ring-brand-primary h-12 text-sm"
              />
            </div>

            {/* Zona / Categoría */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">
                Categoría / Tecnología
              </label>
              <Input
                placeholder="Ej: Mobile (React Native), Web (Next.js)"
                value={form.body_zone}
                onChange={(e) => set("body_zone", e.target.value)}
                className="rounded-2xl border-gray-100 focus-visible:ring-brand-primary h-12 text-sm"
              />
            </div>

            {/* Sesiones e intervalo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">
                  Total Hitos / Entregas *
                </label>
                <Input
                  type="number"
                  min={1}
                  value={form.total_sessions}
                  onChange={(e) => set("total_sessions", e.target.value)}
                  className="rounded-2xl border-gray-100 focus-visible:ring-brand-primary h-12 text-sm font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">
                  Check-in (días)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={form.session_interval_days}
                  onChange={(e) => set("session_interval_days", e.target.value)}
                  className="rounded-2xl border-gray-100 focus-visible:ring-brand-primary h-12 text-sm font-bold"
                />
              </div>
            </div>

            {/* Precios */}
            <div className="bg-gray-50 rounded-[2rem] p-5 space-y-5 border border-gray-100">
              <p className="text-[10px] font-black text-brand-primary/60 uppercase tracking-widest">
                Estructura de Inversión (opcional)
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Moneda</label>
                  <select
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value as Currency)}
                    className="w-full h-12 px-4 text-sm rounded-2xl border border-gray-100 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="VES">VES (Bs.)</option>
                    <option value="COP">COP ($)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Tipo de Pago</label>
                  <select
                    value={form.payment_type}
                    onChange={(e) => set("payment_type", e.target.value as PaymentType)}
                    className="w-full h-12 px-4 text-sm rounded-2xl border border-gray-100 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold"
                  >
                    <option value="full">Pago Único</option>
                    <option value="per_session">Por Hito</option>
                    <option value="installments">Mensual / Cuotas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Inversión Total</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.price_total}
                    onChange={(e) => set("price_total", e.target.value)}
                    className="rounded-2xl border-gray-100 bg-white focus-visible:ring-brand-primary h-12 text-sm font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Monto x Hito</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.price_per_session}
                    onChange={(e) => set("price_per_session", e.target.value)}
                    className="rounded-2xl border-gray-100 bg-white focus-visible:ring-brand-primary h-12 text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">
                Acuerdos o Notas del Proyecto
              </label>
              <textarea
                placeholder="Detalles sobre entregables, exclusiones, fechas clave..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 text-sm rounded-2xl border border-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white text-gray-700 placeholder:text-gray-300 transition-all"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex gap-3 px-6 py-5 border-t border-gray-50">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-2xl border-gray-100 text-gray-600 hover:bg-gray-50 h-12 font-bold"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl shadow-lg shadow-brand-primary/20 transition-all active:scale-95 h-12 font-black uppercase tracking-widest text-xs"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Iniciando...</>
              ) : (
                "Crear Proyecto"
              )}
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}
