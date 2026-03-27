"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export type VisitStatus = "completed" | "cancelled" | "no_show" | "rescheduled";

export type CreateVisitInput = {
  patient_id: string;
  plan_id?: string | null;
  visit_date: string;               // ISO: "2025-03-01"
  treatment_applied: string;
  body_zones_treated?: string[];
  skin_condition?: string;
  patient_complaints?: string;
  clinical_notes?: string;
  reaction_notes?: string;
  results_notes?: string;
  recommendations?: string;
  equipment_params?: Record<string, string>;
  next_visit_date?: string | null;  // ISO: "2025-04-01"
  status?: VisitStatus;
};

export type UpdateVisitInput = Partial<Omit<CreateVisitInput, "patient_id">> & {
  status?: VisitStatus;
};

// ─────────────────────────────────────────────
// CREAR VISITA
// ─────────────────────────────────────────────

/**
 * Registra una nueva sesión estudio.
 * El session_number se calcula automáticamente desde la base de datos.
 */
export async function createVisitAction(input: CreateVisitInput) {
  try {
    const supabase = await createClient();
    
    // Obtener el número de sesión desde la función SQL
    const { data: sessionData, error: sessionError } = await supabase
      .rpc("get_next_session_number", {
        p_patient_id: input.patient_id,
        p_plan_id: input.plan_id ?? null,
      });

    if (sessionError) {
      console.error("Error calculando nº de sesión:", sessionError);
      // Si falla la función, usamos 1 como fallback
    }

    const session_number = sessionData ?? 1;

    const { data, error } = await supabase
      .from("visits")
      .insert([
        {
          patient_id:         input.patient_id,
          plan_id:            input.plan_id ?? null,
          visit_date:         input.visit_date,
          session_number,
          treatment_applied:  input.treatment_applied,
          body_zones_treated: input.body_zones_treated ?? [],
          skin_condition:     input.skin_condition ?? null,
          patient_complaints: input.patient_complaints ?? null,
          clinical_notes:     input.clinical_notes ?? null,
          reaction_notes:     input.reaction_notes ?? null,
          results_notes:      input.results_notes ?? null,
          recommendations:    input.recommendations ?? null,
          equipment_params:   input.equipment_params ?? null,
          next_visit_date:    input.next_visit_date ?? null,
          status:             input.status ?? "completed",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creando visita:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/clientes/${input.patient_id}`);
    revalidatePath("/admin");

    return { success: true, data };
  } catch (err: any) {
    console.error("createVisitAction:", err);
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}

// ─────────────────────────────────────────────
// OBTENER VISITAS DE UNA cliente
// ─────────────────────────────────────────────

/**
 * Devuelve el historial completo de visitas de una cliente,
 * más reciente primero.
 */
export async function getVisitsByPatientAction(patient_id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("visits")
      .select(`
        *,
        treatment_plans (
          treatment_name,
          total_sessions
        )
      `)
      .eq("patient_id", patient_id)
      .order("visit_date", { ascending: false });

    if (error) throw error;
    return { success: true, data: data ?? [] };
  } catch (err: any) {
    console.error("getVisitsByPatientAction:", err);
    return { success: false, error: err.message, data: [] };
  }
}

// ─────────────────────────────────────────────
// OBTENER UNA VISITA POR ID
// ─────────────────────────────────────────────

export async function getVisitByIdAction(visit_id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("visits")
      .select("*")
      .eq("id", visit_id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("getVisitByIdAction:", err);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────
// ACTUALIZAR VISITA
// ─────────────────────────────────────────────

/**
 * Edita una visita existente. Solo se actualizan los campos enviados.
 */
export async function updateVisitAction(
  visit_id: string,
  patient_id: string,
  input: UpdateVisitInput
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("visits")
      .update(input)
      .eq("id", visit_id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando visita:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/clientes/${patient_id}`);

    return { success: true, data };
  } catch (err: any) {
    console.error("updateVisitAction:", err);
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}

// ─────────────────────────────────────────────
// ELIMINAR VISITA
// ─────────────────────────────────────────────

export async function deleteVisitAction(visit_id: string, patient_id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("visits")
      .delete()
      .eq("id", visit_id);

    if (error) {
      console.error("Error eliminando visita:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/clientes/${patient_id}`);

    return { success: true };
  } catch (err: any) {
    console.error("deleteVisitAction:", err);
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}

// ─────────────────────────────────────────────
// VISITAS RECIENTES — para el dashboard
// ─────────────────────────────────────────────

/**
 * Últimas N visitas realizadas en la estudio.
 * Incluye nombre de la cliente para el dashboard.
 */
export async function getRecentVisitsAction(limit = 10) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("visits")
      .select(`
        id,
        visit_date,
        treatment_applied,
        session_number,
        status,
        patients (
          first_name,
          last_name,
          id_number
        )
      `)
      .eq("status", "completed")
      .order("visit_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data: data ?? [] };
  } catch (err: any) {
    console.error("getRecentVisitsAction:", err);
    return { success: false, error: err.message, data: [] };
  }
}
