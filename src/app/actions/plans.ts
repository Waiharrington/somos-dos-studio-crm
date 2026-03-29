"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export type PaymentType = "full" | "per_session" | "installments";
export type PlanStatus  = "active" | "completed" | "paused" | "cancelled";
export type Currency    = "USD" | "VES" | "COP";

export type CreatePlanInput = {
  patient_id:             string;
  treatment_name:         string;
  body_zone?:             string;
  total_sessions:         number;
  session_interval_days?: number;
  price_total?:           number | null;
  price_per_session?:     number | null;
  payment_type?:          PaymentType;
  currency?:              Currency;
  notes?:                 string;
};

export type UpdatePlanInput = Partial<Omit<CreatePlanInput, "patient_id">> & {
  status?:       PlanStatus;
  completed_at?: string | null;
};

// ─────────────────────────────────────────────
// CREAR PLAN DE servicio
// ─────────────────────────────────────────────

export async function createTreatmentPlanAction(input: CreatePlanInput) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("treatment_plans")
      .insert([
        {
          patient_id:             input.patient_id,
          treatment_name:         input.treatment_name,
          body_zone:              input.body_zone ?? null,
          total_sessions:         input.total_sessions,
          session_interval_days:  input.session_interval_days ?? 30,
          price_total:            input.price_total ?? null,
          price_per_session:      input.price_per_session ?? null,
          payment_type:           input.payment_type ?? "per_session",
          currency:               input.currency ?? "USD",
          notes:                  input.notes ?? null,
          status:                 "active",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creando plan:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/clientes/${input.patient_id}`);

    return { success: true, data };
  } catch (err: unknown) {
    console.error("createTreatmentPlanAction:", err);
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

// ─────────────────────────────────────────────
// OBTENER PLANES DE UNA cliente
// ─────────────────────────────────────────────

/**
 * Devuelve todos los planes de una cliente con su progreso real.
 * El progreso se calcula contando las visitas completadas de cada plan.
 */
export async function getPlansByPatientAction(patient_id: string) {
  try {
    const supabase = await createClient();
    const { data: plans, error } = await supabase
      .from("treatment_plans")
      .select(`
        *,
        visits (
          id,
          status
        )
      `)
      .eq("patient_id", patient_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Calcular sesiones completadas por plan
    const plansWithProgress = (plans ?? []).map((plan: any) => {
      const completedSessions = (plan.visits ?? []).filter(
        (v: { status: string }) => v.status === "completed"
      ).length;

      return {
        ...plan,
        completed_sessions: completedSessions,
        progress_percentage:
          plan.total_sessions > 0
            ? Math.round((completedSessions / plan.total_sessions) * 100)
            : 0,
        visits: undefined, // No exponer el array raw al componente
      };
    });

    return { success: true, data: plansWithProgress };
  } catch (err: unknown) {
    console.error("getPlansByPatientAction:", err);
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido", data: [] };
  }
}

// ─────────────────────────────────────────────
// OBTENER PLAN ACTIVO DE UNA cliente
// ─────────────────────────────────────────────

/**
 * Devuelve el plan activo más reciente de la cliente.
 * Usado en el resumen del perfil.
 */
export async function getActivePlanAction(patient_id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("treatment_plans")
      .select(`
        *,
        visits!inner (
          id,
          status
        )
      `)
      .eq("patient_id", patient_id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) return { success: true, data: null };

    const completedSessions = (data.visits ?? []).filter(
      (v: { status: string }) => v.status === "completed"
    ).length;

    return {
      success: true,
      data: {
        ...data,
        completed_sessions: completedSessions,
        progress_percentage:
          data.total_sessions > 0
            ? Math.round((completedSessions / data.total_sessions) * 100)
            : 0,
        visits: undefined,
      },
    };
  } catch (err: unknown) {
    console.error("getActivePlanAction:", err);
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido", data: null };
  }
}

// ─────────────────────────────────────────────
// ACTUALIZAR PLAN
// ─────────────────────────────────────────────

export async function updateTreatmentPlanAction(
  plan_id: string,
  patient_id: string,
  input: UpdatePlanInput
) {
  try {
    const supabase = await createClient();
    const payload: any = { ...input };

    // Si se marca como completado, guardamos la fecha
    if (input.status === "completed" && !input.completed_at) {
      payload.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("treatment_plans")
      .update(payload)
      .eq("id", plan_id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando plan:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/clientes/${patient_id}`);

    return { success: true, data };
  } catch (err: unknown) {
    console.error("updateTreatmentPlanAction:", err);
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

// ─────────────────────────────────────────────
// ELIMINAR PLAN
// ─────────────────────────────────────────────

export async function deleteTreatmentPlanAction(
  plan_id: string,
  patient_id: string
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("treatment_plans")
      .delete()
      .eq("id", plan_id);

    if (error) {
      console.error("Error eliminando plan:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/clientes/${patient_id}`);
    return { success: true };
  } catch (err: any) {
    console.error("deleteTreatmentPlanAction:", err);
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}

// ─────────────────────────────────────────────
// OBTENER TODOS LOS PROYECTOS (GLOBAL)
// ─────────────────────────────────────────────

export async function getAllProjectsAction() {
  try {
    const supabase = await createClient();
    const { data: projects, error } = await supabase
      .from("treatment_plans")
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name,
          phone
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: projects };
  } catch (err: any) {
    console.error("getAllProjectsAction:", err);
    return { success: false, error: err.message, data: [] };
  }
}
