"use server";

import { createClient } from "@/lib/supabase-server";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export type FollowUp = {
  patientId:         string;
  patientName:       string;
  phone:             string;
  treatmentApplied:  string;
  nextVisitDate:     string;   // ISO "2025-03-01"
  daysUntilVisit:    number;   // negativo = ya pasó
  isOverdue:         boolean;
  visitId:           string;
};

// ─────────────────────────────────────────────
// OBTENER clienteS CON SEGUIMIENTO PENDIENTE
// ─────────────────────────────────────────────

/**
 * Devuelve clientes cuya próxima cita ya pasó o es en los próximos N días.
 * Solo devuelve UNA fila por cliente (la visita más reciente con next_visit_date).
 */
export async function getPendingFollowUpsAction(daysAhead = 14) {
  try {
    const supabase = await createClient();
    const today     = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + daysAhead);

    const todayStr  = today.toISOString().split("T")[0];
    const futureStr = futureDate.toISOString().split("T")[0];

    // Traer todas las visitas con next_visit_date en rango (pasadas o próximas)
    const { data, error } = await supabase
      .from("visits")
      .select(`
        id,
        visit_date,
        next_visit_date,
        treatment_applied,
        patient_id,
        patients (
          id,
          first_name,
          last_name,
          phone
        )
      `)
      .not("next_visit_date", "is", null)
      .lte("next_visit_date", futureStr)
      .eq("status", "completed")
      .order("next_visit_date", { ascending: true });

    if (error) throw error;
    if (!data) return { success: true, data: [] as FollowUp[] };

    // Deduplicar: una sola entrada por cliente (la más reciente)
    const byPatient = new Map<string, typeof data[0]>();
    for (const visit of data) {
      const pid = visit.patient_id;
      const existing = byPatient.get(pid);
      if (!existing || visit.visit_date > existing.visit_date) {
        byPatient.set(pid, visit);
      }
    }

    const todayMs = today.setHours(0, 0, 0, 0);

    const followUps: FollowUp[] = Array.from(byPatient.values()).map((v) => {
      const nextDate    = new Date(v.next_visit_date + "T12:00:00");
      const nextMs      = nextDate.setHours(0, 0, 0, 0);
      const diffDays    = Math.round((nextMs - todayMs) / (1000 * 60 * 60 * 24));
      const patient     = v.patients as any;

      return {
        visitId:          v.id,
        patientId:        v.patient_id,
        patientName:      `${patient.first_name} ${patient.last_name}`,
        phone:            patient.phone ?? "",
        treatmentApplied: v.treatment_applied,
        nextVisitDate:    v.next_visit_date,
        daysUntilVisit:   diffDays,
        isOverdue:        diffDays < 0,
      };
    });

    // Ordenar: vencidas primero, luego por fecha más próxima
    followUps.sort((a, b) => a.daysUntilVisit - b.daysUntilVisit);

    return { success: true, data: followUps };
  } catch (err: any) {
    console.error("getPendingFollowUpsAction:", err);
    return { success: false, error: err.message, data: [] as FollowUp[] };
  }
}

