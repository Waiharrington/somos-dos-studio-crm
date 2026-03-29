"use server";

import { type ClienteFormData } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { sendNewPatientNotification } from "@/lib/email";
import { createClient } from "@/lib/supabase-server";

/**
 * Guarda un nuevo cliente en la base de datos de Somos Dos Studio.
 * Mapea el objeto de registro de proyecto al esquema de PostgreSQL.
 */
export async function saveClienteAction(formData: ClienteFormData) {
    try {
        const supabase = await createClient();
        const { personal, discovery, scope, treatment } = formData;
        let patientId: string;
        let generatedId = `SD-${Date.now()}`;

        // 1. BUSCAR CLIENTE EXISTENTE POR TELÉFONO
        const { data: existingPatient, error: searchError } = await supabase
            .from("patients")
            .select("id, id_number")
            .eq("phone", personal.phone)
            .maybeSingle();

        if (searchError) throw searchError;

        if (existingPatient) {
            patientId = existingPatient.id;
            generatedId = existingPatient.id_number;
            
            // Opcional: Actualizar datos (email, dirección, nombre) si cambiaron
            await supabase
                .from("patients")
                .update({
                    first_name: personal.firstName,
                    last_name: personal.lastName,
                    address: personal.address,
                    email: personal.email || null,
                })
                .eq("id", patientId);
        } else {
            // 2. CREAR NUEVO CLIENTE
            const { data: newPatient, error: insertError } = await supabase
                .from("patients")
                .insert([
                    {
                        first_name: personal.firstName,
                        last_name: personal.lastName,
                        id_number: generatedId,
                        phone: personal.phone,
                        address: personal.address,
                        email: personal.email || null,
                        signature_data: "N/A (CRM Interno)",
                        consent_accepted: true,
                        status: 'Prospecto'
                    }
                ])
                .select()
                .single();

            if (insertError) throw insertError;
            patientId = newPatient.id;
        }

        // 3. CREAR EL PROYECTO (TREATMENT PLAN)
        // Mapeamos los campos del formulario a la estructura del plan
        const projectName = discovery.selectedServices?.join(", ") || "Nuevo Proyecto";
        const budgetValue = parseFloat(scope.agreedBudget?.replace(/[^0-9.]/g, '') || "0");

        const { error: planError } = await supabase
            .from("treatment_plans")
            .insert([
                {
                    patient_id: patientId,
                    treatment_name: projectName,
                    total_sessions: 1, // En agencia, 1 proyecto = 1 plan usualmente
                    price_total: budgetValue,
                    payment_type: scope.paymentMode?.toLowerCase() || "custom",
                    notes: `
OBJETIVO: ${treatment.objective || "N/A"}
REFERENCIAS: ${treatment.references || "N/A"}
RESUMEN ACORDADO: ${discovery.agreedSummary || "N/A"}
PAGO PERSONALIZADO: ${scope.customPaymentDetails || "N/A"}
                    `.trim(),
                    status: "active"
                }
            ]);

        if (planError) throw planError;

        // 4. NOTIFICACIÓN
        sendNewPatientNotification({
            firstName: personal.firstName,
            lastName: personal.lastName,
            idNumber: generatedId,
            treatmentType: "agency_project"
        }).catch(err => console.error("Error disparando notificación:", err));

        revalidatePath("/admin");
        revalidatePath("/admin/clientes");
        revalidatePath(`/admin/clientes/${patientId}`);

        return { success: true, data: { id: patientId } };
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
