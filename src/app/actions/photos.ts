"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export type PhotoType = "before" | "after" | "progress" | "reference";

export type UploadPhotoInput = {
  patient_id:        string;
  visit_id?:         string | null;
  photo_type:        PhotoType;
  body_zone?:        string;
  session_number?:   number;
  notes?:            string;
  taken_at?:         string;    // ISO date "2025-03-01"
  // El archivo llega como base64 desde el cliente (ya comprimido)
  file_base64:       string;    // "data:image/webp;base64,..."
  file_name:         string;    // nombre original del archivo
  file_size_kb?:     number;    // tamaño después de comprimir
};

// ─────────────────────────────────────────────
// SUBIR FOTO
// ─────────────────────────────────────────────

/**
 * Recibe la imagen como base64 (ya comprimida en el cliente con
 * browser-image-compression), la sube a Supabase Storage y
 * guarda los metadatos en patient_photos.
 */
export async function uploadPhotoAction(input: UploadPhotoInput) {
  try {
    const supabase = await createClient();

    // 1. Convertir base64 → Buffer para Supabase Storage
    const base64Data = input.file_base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // 2. Construir path único en Storage
    const date    = input.taken_at ?? new Date().toISOString().split("T")[0];
    const uuid    = crypto.randomUUID();
    const zone    = (input.body_zone ?? "zona")
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    const storagePath = `${input.patient_id}/${input.photo_type}/${date}_${zone}_${uuid}.webp`;

    // 3. Subir a Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("patient-photos")
      .upload(storagePath, buffer, {
        contentType:  "image/webp",
        cacheControl: "3600",
        upsert:       false,
      });

    if (storageError) {
      console.error("Error subiendo al Storage:", storageError);
      return { success: false, error: storageError.message };
    }

    // 4. Guardar metadatos en la tabla patient_photos
    const { data, error: dbError } = await supabase
      .from("patient_photos")
      .insert([
        {
          patient_id:        input.patient_id,
          visit_id:          input.visit_id ?? null,
          storage_path:      storagePath,
          file_size_kb:      input.file_size_kb ?? null,
          original_filename: input.file_name,
          photo_type:        input.photo_type,
          body_zone:         input.body_zone ?? null,
          session_number:    input.session_number ?? null,
          taken_at:          date,
          notes:             input.notes ?? null,
        },
      ])
      .select()
      .single();

    if (dbError) {
      // Si falla el registro en DB, borramos el archivo del Storage
      await supabase.storage
        .from("patient-photos")
        .remove([storagePath]);

      console.error("Error guardando metadatos de foto:", dbError);
      return { success: false, error: dbError.message };
    }

    revalidatePath(`/admin/clientes/${input.patient_id}`);

    return { success: true, data };
  } catch (err: any) {
    console.error("uploadPhotoAction:", err);
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}

// ─────────────────────────────────────────────
// OBTENER FOTOS DE UNA cliente
// ─────────────────────────────────────────────

export async function getPhotosByPatientAction(
  patient_id: string,
  options?: { photo_type?: PhotoType; body_zone?: string }
) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("patient_photos")
      .select("*")
      .eq("patient_id", patient_id)
      .order("taken_at", { ascending: false });

    if (options?.photo_type) {
      query = query.eq("photo_type", options.photo_type);
    }

    if (options?.body_zone) {
      query = query.eq("body_zone", options.body_zone);
    }

    const { data: photos, error } = await query;

    if (error) throw error;
    if (!photos || photos.length === 0) return { success: true, data: [] };

    // Generar URLs firmadas para cada foto
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        const { data: signedData } = await supabase.storage
          .from("patient-photos")
          .createSignedUrl(photo.storage_path, 3600);

        return {
          ...photo,
          url: signedData?.signedUrl ?? null,
        };
      })
    );

    return { success: true, data: photosWithUrls };
  } catch (err: any) {
    console.error("getPhotosByPatientAction:", err);
    return { success: false, error: err.message, data: [] };
  }
}

// ─────────────────────────────────────────────
// OBTENER FOTOS DE UNA VISITA
// ─────────────────────────────────────────────

export async function getPhotosByVisitAction(visit_id: string) {
  try {
    const supabase = await createClient();
    const { data: photos, error } = await supabase
      .from("patient_photos")
      .select("*")
      .eq("visit_id", visit_id)
      .order("taken_at", { ascending: true });

    if (error) throw error;
    if (!photos || photos.length === 0) return { success: true, data: [] };

    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        const { data: signedData } = await supabase.storage
          .from("patient-photos")
          .createSignedUrl(photo.storage_path, 3600);

        return { ...photo, url: signedData?.signedUrl ?? null };
      })
    );

    return { success: true, data: photosWithUrls };
  } catch (err: any) {
    console.error("getPhotosByVisitAction:", err);
    return { success: false, error: err.message, data: [] };
  }
}

// ─────────────────────────────────────────────
// ACTUALIZAR NOTAS DE UNA FOTO
// ─────────────────────────────────────────────

export async function updatePhotoNotesAction(
  photo_id: string,
  patient_id: string,
  notes: string
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("patient_photos")
      .update({ notes })
      .eq("id", photo_id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando notas de foto:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/clientes/${patient_id}`);
    return { success: true, data };
  } catch (err: any) {
    console.error("updatePhotoNotesAction:", err);
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}

// ─────────────────────────────────────────────
// ELIMINAR FOTO
// ─────────────────────────────────────────────

export async function deletePhotoAction(
  photo_id: string,
  patient_id: string,
  storage_path: string
) {
  try {
    const supabase = await createClient();
    // 1. Eliminar del Storage
    const { error: storageError } = await supabase.storage
      .from("patient-photos")
      .remove([storage_path]);

    if (storageError) {
      console.error("Error eliminando del Storage:", storageError);
      return { success: false, error: storageError.message };
    }

    // 2. Eliminar de la base de datos
    const { error: dbError } = await supabase
      .from("patient_photos")
      .delete()
      .eq("id", photo_id);

    if (dbError) {
      console.error("Error eliminando registro de foto:", dbError);
      return { success: false, error: dbError.message };
    }

    revalidatePath(`/admin/clientes/${patient_id}`);
    return { success: true };
  } catch (err: any) {
    console.error("deletePhotoAction:", err);
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}

// ─────────────────────────────────────────────
// OBTENER URL FIRMADA INDIVIDUAL
// ─────────────────────────────────────────────

export async function getSignedPhotoUrlAction(
  storage_path: string,
  expires_in_seconds = 3600
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from("patient-photos")
      .createSignedUrl(storage_path, expires_in_seconds);

    if (error) throw error;
    return { success: true, url: data.signedUrl };
  } catch (err: any) {
    console.error("getSignedPhotoUrlAction:", err);
    return { success: false, error: err.message, url: null };
  }
}
