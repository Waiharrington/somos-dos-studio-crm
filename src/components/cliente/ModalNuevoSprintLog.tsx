"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp, Loader2, Calendar, Code, Zap, ClipboardList, MessageSquare, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createVisitAction, type CreateVisitInput, type VisitStatus } from "@/app/actions/visits";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// COMPONENTES DEL PROYECTO
// ─────────────────────────────────────────────

const PROJECT_COMPONENTS = [
  {
    group: "Frontend",
    zones: ["UI Components", "Landing Pages", "Dashboard", "Auth Flow", "Responsive Fixes", "Animations"],
  },
  {
    group: "Backend / API",
    zones: ["Database Schema", "Server Actions", "Supabase Edge Functions", "Webhooks", "Internal Logic"],
  },
  {
    group: "Diseño & UX",
    zones: ["Figma Mockups", "Brand Identity", "User Flow", "Design System"],
  },
  {
    group: "DevOps & Misc",
    zones: ["Deployment", "Performance", "Security", "Documentation", "Testing"],
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
  const [showReactions, setShowReactions] = useState(false);
  const [showZones, setShowZones] = useState(false);

  if (!isOpen) return null;

  const set = (field: keyof typeof EMPTY_FORM, value: any) =>
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
      toast.success("Sprint Log registrado correctamente.");
      setForm(EMPTY_FORM);
      onSuccess();
      onClose();
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  const activePlans = plans.filter((p) => (p as any).status === "active");

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center">
        <div className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] md:w-[640px] md:max-h-[90vh] w-full max-h-[92vh] flex flex-col shadow-2xl">

          {/* Handle + Header */}
          <div className="flex-shrink-0">
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Nuevo Sprint Log</h2>
                  <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest mt-0.5">Registrar progreso sesión</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

            {/* SECCIÓN 1: Básico */}
            <section className="space-y-4">
              <SectionTitle icon={<Calendar className="w-4 h-4" />} label="Información de la sesión" />
              
              <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="Fecha de trabajo">
                  <Input
                    type="date"
                    value={form.visit_date}
                    onChange={(e) => set("visit_date", e.target.value)}
                    className="rounded-2xl border-gray-100 h-12 text-sm font-bold"
                  />
                </FieldWrapper>

                <FieldWrapper label="Estado del Sprint">
                  <select
                    value={form.status}
                    onChange={(e) => set("status", e.target.value as VisitStatus)}
                    className="w-full h-12 px-4 text-sm rounded-2xl border border-gray-100 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-bold transition-all"
                  >
                    <option value="completed">Completado</option>
                    <option value="cancelled">Re-agendado</option>
                    <option value="no_show">Pendiente Feedback</option>
                    <option value="rescheduled">En revisión</option>
                  </select>
                </FieldWrapper>
              </div>

              {/* Plan vinculado */}
              {activePlans.length > 0 && (
                <FieldWrapper label="Roadmap vinculado (opcional)">
                  <select
                    value={form.plan_id}
                    onChange={(e) => set("plan_id", e.target.value)}
                    className="w-full h-12 px-4 text-sm rounded-2xl border border-gray-100 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-bold transition-all"
                  >
                    <option value="">Sin proyecto vinculado</option>
                    {activePlans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.treatment_name} {p.body_zone ? `(${p.body_zone})` : ""}
                        {" "}— Hito {p.completed_sessions + 1} de {p.total_sessions}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>
              )}

              <FieldWrapper label="Tarea / Hito Realizado *">
                <Input
                  placeholder="Ej: Implementación de Auth Flow con Supabase"
                  value={form.treatment_applied}
                  onChange={(e) => set("treatment_applied", e.target.value)}
                  className="rounded-2xl border-gray-100 h-12 text-sm"
                />
              </FieldWrapper>
            </section>

            {/* SECCIÓN 2: Componentes */}
            <section>
              <button
                type="button"
                onClick={() => setShowZones(!showZones)}
                className="w-full flex items-center justify-between py-2"
              >
                <SectionTitle icon={<Code className="w-4 h-4" />} label="Componentes afectados" />
                {showZones ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {!showZones && form.body_zones_treated.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.body_zones_treated.map((z) => (
                    <span key={z} className="text-[10px] font-black uppercase bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full border border-brand-primary/20">
                      {z}
                    </span>
                  ))}
                </div>
              )}

              {showZones && (
                <div className="mt-4 space-y-5">
                  {PROJECT_COMPONENTS.map((group) => (
                    <div key={group.group}>
                      <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest mb-3">
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
                                "text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-all",
                                selected
                                  ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                                  : "bg-white text-gray-600 border-gray-100 hover:border-brand-primary/20 hover:bg-brand-primary/5"
                              )}
                            >
                              {zone}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SECCIÓN 3: Notas de Desarrollo */}
            <section className="space-y-5">
              <SectionTitle icon={<ClipboardList className="w-4 h-4" />} label="Bitácora Técnica" />

              <FieldWrapper label="Estado del Código / Infra">
                <Input
                  placeholder="Ej: Testing OK, Sin regresiones, Estructura limpia"
                  value={form.skin_condition}
                  onChange={(e) => set("skin_condition", e.target.value)}
                  className="rounded-2xl border-gray-100 h-12 text-sm"
                />
              </FieldWrapper>

              <FieldWrapper label="Feedback del Cliente">
                <textarea
                  placeholder="Observaciones de la cliente, cambios de última hora, aprobación..."
                  value={form.patient_complaints}
                  onChange={(e) => set("patient_complaints", e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 text-sm rounded-2xl border border-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 h-24 transition-all"
                />
              </FieldWrapper>

              <FieldWrapper label="Notas de Desarrollo / Sprint">
                <textarea
                  placeholder="Detalles técnicos, retos superados, lógica implementada..."
                  value={form.clinical_notes}
                  onChange={(e) => set("clinical_notes", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-sm rounded-2xl border border-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 h-28 transition-all"
                />
              </FieldWrapper>

              <FieldWrapper label="Siguientes Pasos (Next Action)">
                <textarea
                  placeholder="Ej: Integrar pasarela de pagos. Revisar responsive en tablet."
                  value={form.recommendations}
                  onChange={(e) => set("recommendations", e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 text-sm rounded-2xl border border-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 h-24 transition-all"
                />
              </FieldWrapper>
            </section>

            {/* SECCIÓN 4: Métricas / Tech Stats (colapsable) */}
            <section>
              <button
                type="button"
                onClick={() => setShowEquipment(!showEquipment)}
                className="w-full flex items-center justify-between py-2"
              >
                <SectionTitle icon={<Zap className="w-4 h-4" />} label="Métricas & Tech Stats" />
                {showEquipment ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {showEquipment && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <FieldWrapper label="Stack / Tool">
                    <Input
                      placeholder="Ej: Next.js v15"
                      value={form.equipment_device}
                      onChange={(e) => set("equipment_device", e.target.value)}
                      className="rounded-2xl border-gray-100 h-12 text-sm"
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Perf / Lighthouse">
                    <Input
                      placeholder="Ej: 98/100"
                      value={form.equipment_fluence}
                      onChange={(e) => set("equipment_fluence", e.target.value)}
                      className="rounded-2xl border-gray-100 h-12 text-sm"
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Commits / PRs">
                    <Input
                      placeholder="Ej: #12, #13"
                      value={form.equipment_frequency}
                      onChange={(e) => set("equipment_frequency", e.target.value)}
                      className="rounded-2xl border-gray-100 h-12 text-sm"
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Ref. Logs">
                    <Input
                      placeholder="Ej: Log-ID: 45A"
                      value={form.equipment_notes}
                      onChange={(e) => set("equipment_notes", e.target.value)}
                      className="rounded-2xl border-gray-100 h-12 text-sm"
                    />
                  </FieldWrapper>
                </div>
              )}
            </section>

            {/* SECCIÓN 5: Próximo Check-in */}
            <section>
              <FieldWrapper label="Próxima sesión sugerida">
                <Input
                  type="date"
                  value={form.next_visit_date}
                  onChange={(e) => set("next_visit_date", e.target.value)}
                  className="rounded-2xl border-gray-100 h-12 text-sm font-bold"
                />
              </FieldWrapper>
            </section>

          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex gap-3 px-6 py-5 border-t border-gray-50 bg-white">
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
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</>
              ) : (
                "Guardar Log"
              )}
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// HELPERS DE UI
// ─────────────────────────────────────────────

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-brand-primary/40 text-emerald-500">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
    </div>
  );
}

function FieldWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}
