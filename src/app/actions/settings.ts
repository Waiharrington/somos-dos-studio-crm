"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type ClinicSettings = {
  id:                  string;
  doctor_name:         string;
  doctor_specialty:    string;
  doctor_portrait_url: string | null;
  clinic_name:         string;
  clinic_address:      string;
  updated_at:          string;
};

/**
 * Obtiene la configuración global de la estudio.
 * Si no existe, intenta crear una por defecto.
 */
export async function getClinicSettingsAction() {
  try {
    const supabase = await createClient();
    let { data, error } = await supabase
      .from("clinic_settings")
      .select("*")
      .single();

    if (error && error.code === "PGRST116") {
      // No existe, creamos la fila inicial
      const { data: newData, error: insertError } = await supabase
        .from("clinic_settings")
        .insert([{
          doctor_name:      "Somos Dos Studio",
          doctor_specialty: "Estudio Avanzada",
          clinic_name:      "Somos Dos Studio Estudio Avanzada",
          clinic_address:   "Av. Libertador 1234, Piso 5, Oficina B"
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      return { success: true, data: newData as ClinicSettings };
    }

    if (error) {
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        throw new Error("La tabla 'clinic_settings' no existe en la base de datos. Por favor, ejecuta la migración SQL.");
      }
      throw error;
    }
    return { success: true, data: data as ClinicSettings };
  } catch (err: any) {
    console.error("getClinicSettingsAction:", err);
    return { success: false, error: err.message || "Error al obtener configuración" };
  }
}

/**
 * Actualiza los campos de texto de la configuración.
 */
export async function updateClinicSettingsAction(input: Partial<ClinicSettings>) {
  try {
    const supabase = await createClient();
    
    // Obtenemos el ID de la única fila
    const { data: current } = await supabase.from("clinic_settings").select("id").single();
    if (!current) throw new Error("No se encontró la configuración para actualizar");

    const { data, error } = await supabase
      .from("clinic_settings")
      .update({
        doctor_name:      input.doctor_name,
        doctor_specialty: input.doctor_specialty,
        clinic_name:      input.clinic_name,
        clinic_address:   input.clinic_address,
        updated_at:       new Date().toISOString()
      })
      .eq("id", current.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/admin/config");
    return { success: true, data: data as ClinicSettings };
  } catch (err: any) {
    console.error("updateClinicSettingsAction:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Sube el retrato del doctor a Supabase Storage y actualiza la URL en la DB.
 */
export async function updateDoctorPortraitAction(fileBase64: string, fileName: string) {
  try {
    const supabase = await createClient();

    // 1. Convertir base64 → Buffer
    const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // 2. Path único y normalizar extensión/mime
    const rawExt = fileName.split('.').pop()?.toLowerCase() || 'webp';
    const ext = (rawExt === 'jpg' || rawExt === 'jpeg' || rawExt === 'jfif') ? 'jpeg' : rawExt;
    const contentType = ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
    
    const uuid = crypto.randomUUID();
    const storagePath = `doctor/portrait_${uuid}.${ext}`;

    // 3. Subir a bucket verificado
    const bucket = "patient-photos";
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: `image/${ext}`,
        cacheControl: "3600",
        upsert: true
      });
 
    if (storageError) throw storageError;
 
    // 4. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);
 
    // 5. Actualizar la DB
    const { data: settings, error: getError } = await supabase.from("clinic_settings").select("id").single();
    if (getError || !settings) throw new Error("No se pudo obtener la configuración para actualizar el retrato");
 
    const { error: dbError } = await supabase
      .from("clinic_settings")
      .update({ doctor_portrait_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", settings.id);
 
    if (dbError) throw dbError;
 
    revalidatePath("/admin");
    revalidatePath("/admin/config");
 
    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error("updateDoctorPortraitAction:", err);
    return { success: false, error: err.message || "Error desconocido en el servidor" };
  }
}
