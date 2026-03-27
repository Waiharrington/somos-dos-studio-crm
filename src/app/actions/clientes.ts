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
        const { personal, discovery, scope, treatment, signature } = formData;

        // 1. Protección básica contra duplicados
        const { count } = await supabase
            .from("patients") // Keep table name for now to avoid breaking existing DB
            .select("*", { count: 'exact', head: true })
            .eq("id_number", personal.idNumber);

        if (count && count > 0) {
            return { success: false, error: "Ya existe un cliente con esta identificación." };
        }

        const { data, error } = await supabase
            .from("patients")
            .insert([
                {
                    first_name: personal.firstName,
                    last_name: personal.lastName,
                    age: personal.age ? parseInt(personal.age) : null,
                    id_number: personal.idNumber,
                    phone: personal.phone,
                    address: personal.address,
                    email: personal.email || null,

                    // Mapeo de Descubrimiento Técnico
                    has_surgeries: discovery.hasExistingCode,
                    surgeries_details: discovery.existingCodeDetails || null,
                    has_allergies: discovery.hasSpecificTechStack,
                    allergies_details: discovery.techStackDetails || null,
                    has_illnesses: discovery.hasFigmaDesign,
                    illnesses_details: discovery.figmaLink || null,
                    takes_medication: discovery.isUrgent,
                    medication_details: discovery.deadlineDetails || null,

                    // Mapeo de Alcance y Negocio
                    smokes: scope.hasBudget,
                    smoking_amount: scope.budgetRange || null,
                    exercises: scope.isNewBusiness,
                    exercise_details: scope.targetAudience || null,
                    sun_exposure: scope.mainCompetitors ? true : false,
                    skin_routine: scope.mainCompetitors || null,

                    treatment_type: treatment.treatmentType,
                    treatment_details: {
                        discovery: discovery,
                        scope: scope,
                        project: {
                            objective: treatment.objective,
                            references: treatment.references
                        }
                    },

                    signature_data: signature.signatureData,
                    consent_accepted: signature.consent,
                    status: 'Prospecto'
                }
            ])
            .select();

        if (error) {
            console.error("Supabase Error:", error);
            return { success: false, error: error.message };
        }

        // 2. Notificación (Podemos adaptar el template de email luego)
        sendNewPatientNotification({
            firstName: personal.firstName,
            lastName: personal.lastName,
            idNumber: personal.idNumber,
            treatmentType: treatment.treatmentType
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
