"use server";

import { type ClienteFormData } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { sendNewPatientNotification } from "@/lib/email"; // TODO: Rename this too later
import { createClient } from "@/lib/supabase-server";

/**
 * Guarda un nuevo cliente en la base de datos de Somos Dos Studio.
 * Mapea el objeto de registro de proyecto al esquema de PostgreSQL.
 */
export async function saveClienteAction(formData: ClienteFormData) {
    try {
        const supabase = await createClient();
        const { personal, discovery, scope, treatment } = formData;

        // Se generará un ID temporal porque la DB lo requiere,
        // pero ya no lo pedimos en el formulario.
        const generatedId = `SD-${Date.now()}`;

        const { data, error } = await supabase
            .from("patients")
            .insert([
                {
                    first_name: personal.firstName,
                    last_name: personal.lastName,
                    age: null,
                    id_number: generatedId,
                    phone: personal.phone,
                    address: personal.address,
                    email: personal.email || null,

                    // Legacy database columns that we keep for backward compatibility
                    // but won't use for agency CRM leads
                    has_surgeries: false,
                    surgeries_details: null,
                    has_allergies: false,
                    allergies_details: null,
                    has_illnesses: false,
                    illnesses_details: null,
                    takes_medication: false,
                    medication_details: null,

                    smokes: false,
                    smoking_amount: null,
                    exercises: false,
                    exercise_details: null,
                    sun_exposure: false,
                    skin_routine: null,

                    treatment_type: "agency_project",
                    treatment_details: {
                        services: discovery,
                        scope: scope,
                        project: treatment
                    },

                    signature_data: null,
                    consent_accepted: true,
                    status: 'Prospecto'
                }
            ])
            .select();

        if (error) {
            console.error("Supabase Error:", error);
            return { success: false, error: error.message };
        }

        sendNewPatientNotification({
            firstName: personal.firstName,
            lastName: personal.lastName,
            idNumber: generatedId,
            treatmentType: "agency_project"
        }).catch(err => console.error("Error disparando notificación:", err));

        revalidatePath("/admin");
        revalidatePath("/admin/clientes");

        return { success: true, data: data[0] };
    } catch (err: unknown) {
        console.error("Action Error:", err);
        const errorMessage = err instanceof Error ? err.message : "Error desconocido al guardar";
        return { success: false, error: errorMessage };
    }
}

/**
 * Obtiene la lista de clientes.
 */
export async function getClientesAction(searchQuery?: string) {
    try {
        const supabase = await createClient();
        if (searchQuery && searchQuery.trim().length > 0) {
            const { data, error } = await supabase
                .rpc("search_patients_fuzzy", { search_text: searchQuery });
            
            if (error) throw error;
            return { success: true, data };
        }

        const { data, error } = await supabase
            .from("patient_summary")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (err: unknown) {
        console.error("Fetch Error:", err);
        return { success: false, error: "Error al obtener clientes" };
    }
}

/**
 * Obtiene el detalle de un cliente.
 */
export async function getClienteByIdAction(id: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("patient_summary")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (err: unknown) {
        console.error("Detail Error:", err);
        return { success: false, error: "Error al obtener detalle" };
    }
}

/**
 * Elimina un cliente.
 */
export async function deleteClienteAction(id: string) {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from("patients")
            .delete()
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/admin");
        revalidatePath("/admin/clientes");

        return { success: true };
    } catch (err: unknown) {
        console.error("Delete Error:", err);
        return { success: false, error: "Error al eliminar" };
    }
}

/**
 * Busca un cliente por cédula.
 */
export async function getClienteByIdNumberAction(idNumber: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("patients")
            .select("id, first_name, last_name, phone")
            .eq("id_number", idNumber)
            .maybeSingle();

        if (error) throw error;
        return { success: true, data };
    } catch (err: unknown) {
        console.error("Lookup Error:", err);
        return { success: false, error: "Error en búsqueda" };
    }
}
