"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export type ServiceCategory = "laser" | "facial" | "body" | "injectables" | "other";

export type CreateServiceInput = {
  name:                  string;
  description?:          string;
  category?:             ServiceCategory;
  price?:                number | null;
  currency?:             string;
  duration_minutes?:     number;
  sessions_recommended?: number;
  notes?:                string;
};

export type UpdateServiceInput = Partial<CreateServiceInput> & {
  is_active?: boolean;
};

// ─────────────────────────────────────────────
// LISTAR SERVICIOS
// ─────────────────────────────────────────────

export async function getServicesAction(includeInactive = false) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("services")
      .select("*")
      .order("category", { ascending: true })
      .order("name",     { ascending: true });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data ?? [] };
  } catch (err: any) {
    console.error("getServicesAction:", err);
    return { success: false, error: err.message, data: [] };
  }
}

// ─────────────────────────────────────────────
// CREAR SERVICIO
// ─────────────────────────────────────────────

export async function createServiceAction(input: CreateServiceInput) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .insert([{
        name:                  input.name,
        description:           input.description ?? null,
        category:              input.category ?? "other",
        price:                 input.price ?? null,
        currency:              input.currency ?? "USD",
        duration_minutes:      input.duration_minutes ?? 60,
        sessions_recommended:  input.sessions_recommended ?? 1,
        notes:                 input.notes ?? null,
        is_active:             true,
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creando servicio:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/config");
    return { success: true, data };
  } catch (err: any) {
    console.error("createServiceAction:", err);
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}

// ─────────────────────────────────────────────
// ACTUALIZAR SERVICIO
// ─────────────────────────────────────────────

export async function updateServiceAction(id: string, input: UpdateServiceInput) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando servicio:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/config");
    return { success: true, data };
  } catch (err: any) {
    console.error("updateServiceAction:", err);
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}

// ─────────────────────────────────────────────
// ACTIVAR / DESACTIVAR SERVICIO
// ─────────────────────────────────────────────

export async function toggleServiceAction(id: string, is_active: boolean) {
  return updateServiceAction(id, { is_active });
}

// ─────────────────────────────────────────────
// ELIMINAR SERVICIO
// ─────────────────────────────────────────────

export async function deleteServiceAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando servicio:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/config");
    return { success: true };
  } catch (err: any) {
    console.error("deleteServiceAction:", err);
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}
