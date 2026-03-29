"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp, Loader2, Calendar, Code, Zap, ClipboardList, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createVisitAction, type CreateVisitInput, type VisitStatus } from "@/app/actions/visits";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────
// COMPONENTES DEL PROYECTO
// ─────────────────────────────────────────────

const PROJECT_COMPONENTS = [
  {
    group: "Frontend",
    zones: ["Componentes UI", "Páginas de Aterrizaje", "Panel de Control", "Flujo de Auth", "Ajustes Responsive", "Animaciones"],
  },
  {
    group: "Backend / API",
    zones: ["Esquema de Base de Datos", "Acciones del Servidor", "Funciones del Borde", "Webhooks", "Lógica Interna"],
  },
  {
    group: "Diseño & UX",
    zones: ["Mockups en Figma", "Identidad de Marca", "Flujo de Usuario", "Sistema de Diseño"],
  },
  {
    group: "DevOps & Varios",
    zones: ["Despliegue / Deploy", "Rendimiento", "Seguridad", "Documentación", "Pruebas / QA"],
  },
];

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type Plan = {
  id: string;
  treatment_name: string;
  body_zone: string | null;
  total_sessions: number;
  completed_sessions: number;
  status?: string;
};

type Props = {
  patientId: string;
  plans: Plan[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const EMPTY_FORM = {
  visit_date: new Date().toISOString().split("T")[0],
  plan_id: "",
  treatment_applied: "",
  body_zones_treated: [] as string[],
  skin_condition: "",
  patient_complaints: "",
  clinical_notes: "",
  reaction_notes: "",
  results_notes: "",
  recommendations: "",
  next_visit_date: "",
  status: "completed" as VisitStatus,
  equipment_device: "",
  equipment_fluence: "",
  equipment_frequency: "",
  equipment_notes: "",
};

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

export function ModalNuevoSprintLog({ patientId, plans, isOpen, onClose, onSuccess }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showZones, setShowZones] = useState(false);

  if (!isOpen) return null;

  const set = <K extends keyof typeof EMPTY_FORM>(field: K, value: (typeof EMPTY_FORM)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleZone = (zone: string) => {
    setForm((prev) => ({
      ...prev,
      body_zones_treated: prev.body_zones_treated.includes(zone)
        ? prev.body_zones_treated.filter((z) => z !== zone)
        : [...prev.body_zones_treated, zone],
    }));
  };

  const handleSubmit = async () => {
    if (!form.treatment_applied.trim()) {
      toast.error("Indica qué hito o tarea se realizó.");
      return;
    }

    setIsSaving(true);

    const equipmentParams: Record<string, string> = {};
    if (form.equipment_device) equipmentParams.device = form.equipment_device;
    if (form.equipment_fluence) equipmentParams.fluence = form.equipment_fluence;
    if (form.equipment_frequency) equipmentParams.frequency = form.equipment_frequency;
    if (form.equipment_notes) equipmentParams.notes = form.equipment_notes;

    const input: CreateVisitInput = {
      patient_id:         patientId,
      plan_id:            form.plan_id || null,
      visit_date:         form.visit_date,
      treatment_applied:  form.treatment_applied,
      body_zones_treated: form.body_zones_treated,
      skin_condition:     form.skin_condition || undefined,
      patient_complaints: form.patient_complaints || undefined,
      clinical_notes:     form.clinical_notes || undefined,
      reaction_notes:     form.reaction_notes || undefined,
      results_notes:      form.results_notes || undefined,
      recommendations:    form.recommendations || undefined,
      equipment_params:   Object.keys(equipmentParams).length > 0 ? equipmentParams : undefined,
      next_visit_date:    form.next_visit_date || null,
      status:             form.status,
    };

    const result = await createVisitAction(input);
    setIsSaving(false);

    if (result.success) {
      toast.success("Log de avance registrado correctamente.");
      setForm(EMPTY_FORM);
      onSuccess();
      onClose();
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  const activePlans = plans.filter((p) => p.status === "active");

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
        className="relative glass-card w-full max-w-2xl max-h-[92vh] flex flex-col border-white/10 overflow-hidden shadow-3xl"
      >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/5 flex-shrink-0 bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-primary/20 rounded-2xl text-brand-primary border border-brand-primary/30 shadow-xl shadow-brand-primary/10">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight font-heading">Nuevo Registro de Avance</h2>
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1">Bitácora técnica de sesión</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">

            {/* SECCIÓN 1: Básico */}
            <section className="space-y-6">
              <SectionTitle icon={<Calendar className="w-4 h-4" />} label="Datos de la Sesión" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWrapper label="Fecha">
                  <Input
                    type="date"
                    value={form.visit_date}
                    onChange={(e) => set("visit_date", e.target.value)}
                    className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white focus:border-brand-primary/50"
                  />
                </FieldWrapper>

                <FieldWrapper label="Estado Final">
                  <select
                    value={form.status}
                    onChange={(e) => set("status", e.target.value as VisitStatus)}
                    className="w-full h-14 px-6 text-sm font-bold rounded-2xl border border-white/5 bg-white/5 text-white focus:outline-none focus:border-brand-primary/50 transition-all appearance-none"
                  >
                    <option value="completed" className="bg-brand-dark">Completado</option>
                    <option value="cancelled" className="bg-brand-dark">Re-agendado</option>
                    <option value="no_show" className="bg-brand-dark">Pendiente Feedback</option>
                    <option value="rescheduled" className="bg-brand-dark">En revisión</option>
                  </select>
                </FieldWrapper>
              </div>

              {/* Plan vinculado */}
              {activePlans.length > 0 && (
                <FieldWrapper label="Hoja de Ruta / Roadmap">
                  <select
                    value={form.plan_id}
                    onChange={(e) => set("plan_id", e.target.value)}
                    className="w-full h-14 px-6 text-sm font-bold rounded-2xl border border-white/5 bg-white/5 text-white focus:outline-none focus:border-brand-primary/50 transition-all appearance-none"
                  >
                    <option value="" className="bg-brand-dark">Sin proyecto vinculado</option>
                    {activePlans.map((p) => (
                      <option key={p.id} value={p.id} className="bg-brand-dark">
                        {p.treatment_name} {p.body_zone ? `(${p.body_zone})` : ""}
                        {" "}— Hito {p.completed_sessions + 1} de {p.total_sessions}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>
              )}

              <FieldWrapper label="Tarea / Hito Realizado *">
                <Input
                  placeholder="Ej: Maquetación Hero Section y navegación móvil..."
                  value={form.treatment_applied}
                  onChange={(e) => set("treatment_applied", e.target.value)}
                  className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white placeholder:text-slate-700 focus:border-brand-primary/50"
                />
              </FieldWrapper>
            </section>

            {/* SECCIÓN 2: Componentes */}
            <section className="space-y-4">
              <button
                type="button"
                onClick={() => setShowZones(!showZones)}
                className="w-full flex items-center justify-between group"
              >
                <SectionTitle icon={<Code className="w-5 h-5" />} label="Componentes Afectados" />
                <div className="p-2 bg-white/5 rounded-lg text-slate-500 group-hover:text-white transition-colors">
                    {showZones ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {!showZones && form.body_zones_treated.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {form.body_zones_treated.map((z) => (
                    <span key={z} className="text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-xl border border-brand-primary/20">
                      {z}
                    </span>
                  ))}
                </div>
              )}

              <AnimatePresence>
                {showZones && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-6 pt-4 overflow-hidden"
                  >
                    {PROJECT_COMPONENTS.map((group) => (
                      <div key={group.group} className="space-y-3">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                          {group.group}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {group.zones.map((zone) => {
                            const selected = form.body_zones_treated.includes(zone);
                            return (
                              <button
                                key={zone}
                                type="button"
                                onClick={() => toggleZone(zone)}
                                className={cn(
                                  "text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border transition-all",
                                  selected
                                    ? "bg-brand-primary text-white border-brand-primary shadow-xl shadow-brand-primary/20"
                                    : "bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white"
                                )}
                              >
                                {zone}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* SECCIÓN 3: Notas de Desarrollo */}
            <section className="space-y-8">
              <SectionTitle icon={<ClipboardList className="w-4 h-4" />} label="Bitácora Técnica" />

              <FieldWrapper label="Estado del Entorno / QA">
                <Input
                  placeholder="Ej: Builds estables, Test de componentes OK..."
                  value={form.skin_condition}
                  onChange={(e) => set("skin_condition", e.target.value)}
                  className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white placeholder:text-slate-700"
                />
              </FieldWrapper>

              <FieldWrapper label="Feedback del Cliente">
                <textarea
                  placeholder="Observaciones de la reunión, ajustes solicitados, aprobaciones..."
                  value={form.patient_complaints}
                  onChange={(e) => set("patient_complaints", e.target.value)}
                  className="w-full px-6 py-4 text-sm font-bold rounded-2xl border border-white/5 bg-white/5 text-white resize-none focus:outline-none focus:border-brand-primary/50 h-32 transition-all placeholder:text-slate-700"
                />
              </FieldWrapper>

              <FieldWrapper label="Notas Técnicas del Sprint">
                <textarea
                  placeholder="Detalles de implementación, retos técnicos, lógica de negocio..."
                  value={form.clinical_notes}
                  onChange={(e) => set("clinical_notes", e.target.value)}
                  className="w-full px-6 py-4 text-sm font-bold rounded-2xl border border-white/5 bg-white/5 text-white resize-none focus:outline-none focus:border-brand-primary/50 h-40 transition-all placeholder:text-slate-700"
                />
              </FieldWrapper>

              <FieldWrapper label="Próximas Acciones Sugeridas">
                <textarea
                  placeholder="Ej: Integración con API de pagos, Auditoria de accesibilidad..."
                  value={form.recommendations}
                  onChange={(e) => set("recommendations", e.target.value)}
                  className="w-full px-6 py-4 text-sm font-bold rounded-2xl border border-white/5 bg-white/5 text-white resize-none focus:outline-none focus:border-brand-primary/50 h-32 transition-all placeholder:text-slate-700"
                />
              </FieldWrapper>
            </section>

            {/* SECCIÓN 4: Métricas */}
            <section className="space-y-4">
              <button
                type="button"
                onClick={() => setShowEquipment(!showEquipment)}
                className="w-full flex items-center justify-between group"
              >
                <SectionTitle icon={<Zap className="w-5 h-5" />} label="Métricas & Tech Stats" />
                <div className="p-2 bg-white/5 rounded-lg text-slate-500 group-hover:text-white transition-colors">
                    {showEquipment ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              <AnimatePresence>
                {showEquipment && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 overflow-hidden"
                  >
                    <FieldWrapper label="Stack / Herramienta">
                      <Input
                        placeholder="Ej: Next.js + Tailwind"
                        value={form.equipment_device}
                        onChange={(e) => set("equipment_device", e.target.value)}
                        className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white placeholder:text-slate-700"
                      />
                    </FieldWrapper>

                    <FieldWrapper label="Performance Score">
                      <Input
                        placeholder="Ej: 98% Lighthouse"
                        value={form.equipment_fluence}
                        onChange={(e) => set("equipment_fluence", e.target.value)}
                        className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white placeholder:text-slate-700"
                      />
                    </FieldWrapper>

                    <FieldWrapper label="Commits / Refs">
                      <Input
                        placeholder="Ej: #102, #104"
                        value={form.equipment_frequency}
                        onChange={(e) => set("equipment_frequency", e.target.value)}
                        className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white placeholder:text-slate-700"
                      />
                    </FieldWrapper>

                    <FieldWrapper label="Logs de Error Ref.">
                      <Input
                        placeholder="Ej: Sentry-452"
                        value={form.equipment_notes}
                        onChange={(e) => set("equipment_notes", e.target.value)}
                        className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white placeholder:text-slate-700"
                      />
                    </FieldWrapper>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* SECCIÓN 5: Próximo Check-in */}
            <section className="pt-4">
              <FieldWrapper label="Próximo Check-in Sugerido">
                <Input
                  type="date"
                  value={form.next_visit_date}
                  onChange={(e) => set("next_visit_date", e.target.value)}
                  className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white focus:border-brand-primary/50"
                />
              </FieldWrapper>
            </section>

          </div>

          {/* Footer */}
          <div className="p-8 border-t border-white/5 flex gap-4 bg-white/[0.01]">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-2xl h-16 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all"
              disabled={isSaving}
            >
              Cerrar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl h-16 shadow-xl shadow-brand-primary/20 transition-all font-black uppercase text-[10px] tracking-widest border-none"
            >
              {isSaving ? (
                <><Loader2 className="w-5 h-5 mr-3 animate-spin" />Guardando...</>
              ) : (
                "Guardar Registro"
              )}
            </Button>
          </div>

        </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HELPERS DE UI
// ─────────────────────────────────────────────

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-brand-primary/60">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>
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
