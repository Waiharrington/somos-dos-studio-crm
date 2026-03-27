"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export type ItemCategory    = "product" | "consumable" | "equipment";
export type MovementType    = "restock" | "sale" | "use" | "adjustment" | "loss";
export type StockStatus     = "ok" | "stock_bajo" | "sin_stock";

export type CreateItemInput = {
  name:           string;
  brand?:         string;
  description?:   string;
  category?:      ItemCategory;
  stock_qty?:     number;
  unit?:          string;
  cost_price?:    number | null;
  sale_price?:    number | null;
  currency?:      string;
  reorder_level?: number;
};

export type UpdateItemInput = Partial<CreateItemInput> & {
  is_active?: boolean;
};

export type AdjustStockInput = {
  item_id:       string;
  quantity:      number;           // positivo = entrada, negativo = salida
  movement_type: MovementType;
  patient_id?:   string | null;
  visit_id?:     string | null;
  unit_price?:   number | null;
  notes?:        string;
};

// ─────────────────────────────────────────────
// LISTAR INVENTARIO
// ─────────────────────────────────────────────

export async function getInventoryAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inventory_with_status")
      .select("*")
      .order("category",  { ascending: true })
      .order("name",      { ascending: true });

    if (error) throw error;
    return { success: true, data: data ?? [] };
  } catch (err: any) {
    console.error("getInventoryAction:", err);
    return { success: false, error: err.message, data: [] };
  }
}

// ─────────────────────────────────────────────
// ITEMS CON STOCK BAJO
// ─────────────────────────────────────────────

export async function getLowStockItemsAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inventory_with_status")
      .select("*")
      .in("stock_status", ["stock_bajo", "sin_stock"])
      .order("stock_qty", { ascending: true });

    if (error) throw error;
    return { success: true, data: data ?? [] };
  } catch (err: any) {
    console.error("getLowStockItemsAction:", err);
    return { success: false, error: err.message, data: [] };
  }
}

// ─────────────────────────────────────────────
// CREAR ITEM
// ─────────────────────────────────────────────

export async function createInventoryItemAction(input: CreateItemInput) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inventory_items")
      .insert([{
        name:          input.name,
        brand:         input.brand ?? null,
        description:   input.description ?? null,
        category:      input.category ?? "product",
        stock_qty:     input.stock_qty ?? 0,
        unit:          input.unit ?? "unidad",
        cost_price:    input.cost_price ?? null,
        sale_price:    input.sale_price ?? null,
        currency:      input.currency ?? "USD",
        reorder_level: input.reorder_level ?? 3,
        is_active:     true,
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creando item:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/inventario");
    return { success: true, data };
  } catch (err: any) {
    console.error("createInventoryItemAction:", err);
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}

// ─────────────────────────────────────────────
// ACTUALIZAR ITEM
// ─────────────────────────────────────────────

export async function updateInventoryItemAction(id: string, input: UpdateItemInput) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inventory_items")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando item:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/inventario");
    return { success: true, data };
  } catch (err: any) {
    console.error("updateInventoryItemAction:", err);
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}

// ─────────────────────────────────────────────
// AJUSTAR STOCK
// ─────────────────────────────────────────────

/**
 * Registra un movimiento de inventario.
 * El trigger SQL actualiza automáticamente el stock_qty del item.
 */
export async function adjustStockAction(input: AdjustStockInput) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inventory_movements")
      .insert([{
        item_id:       input.item_id,
        quantity:      input.quantity,
        movement_type: input.movement_type,
        patient_id:    input.patient_id ?? null,
        visit_id:      input.visit_id ?? null,
        unit_price:    input.unit_price ?? null,
        notes:         input.notes ?? null,
      }])
      .select()
      .single();

    if (error) {
      console.error("Error ajustando stock:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/inventario");
    return { success: true, data };
  } catch (err: any) {
    console.error("adjustStockAction:", err);
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}

// ─────────────────────────────────────────────
// HISTORIAL DE MOVIMIENTOS DE UN ITEM
// ─────────────────────────────────────────────

export async function getMovementsByItemAction(item_id: string, limit = 20) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inventory_movements")
      .select(`
        *,
        patients ( first_name, last_name )
      `)
      .eq("item_id", item_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data: data ?? [] };
  } catch (err: any) {
    console.error("getMovementsByItemAction:", err);
    return { success: false, error: err.message, data: [] };
  }
}

// ─────────────────────────────────────────────
// ELIMINAR ITEM
// ─────────────────────────────────────────────

export async function deleteInventoryItemAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("inventory_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando item:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/inventario");
    return { success: true };
  } catch (err: any) {
    console.error("deleteInventoryItemAction:", err);
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}
