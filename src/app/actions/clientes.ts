"use server";

import { type ClienteFormData } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { sendNewPatientNotification } from "@/lib/email";
import { createClient } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";

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
        // Usamos limit(1) para evitar error si hay duplicados de prueba
        const { data: existingPatient, error: searchError } = await supabase
            .from("patients")
            .select("id, id_number")
            .eq("phone", personal.phone)
            .limit(1)
            .maybeSingle();

        if (searchError) throw searchError;

        if (existingPatient) {
            patientId = existingPatient.id;
            generatedId = existingPatient.id_number;
            
            const { error: updateError } = await supabase
                .from("patients")
                .update({
                    first_name: personal.firstName,
                    last_name: personal.lastName,
                    address: personal.address,
                    email: personal.email || null,
                })
                .eq("id", patientId);

            if (updateError) throw updateError;
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
        const budgetRaw = scope.agreedBudget?.replace(/[^0-9.]/g, '') || "0";
        const budgetValue = isNaN(parseFloat(budgetRaw)) ? 0 : parseFloat(budgetRaw);

        // Mapeo de modalidad de pago para cumplir con la restricción de DB (chk_treatment_plans_payment_type)
        // Valores permitidos: 'full', 'per_session', 'installments'
        let dbPaymentType = 'per_session';
        const mode = scope.paymentMode?.toLowerCase();
        if (mode === 'unico') {
            dbPaymentType = 'full';
        } else if (mode === 'quincenal' || mode === 'semanal' || mode === 'personalizado') {
            dbPaymentType = 'installments';
        }

        const { error: planError } = await supabase
            .from("treatment_plans")
            .insert([
                {
                    patient_id: patientId,
                    treatment_name: personal.projectName || "Nuevo Proyecto",
                    total_sessions: 1,
                    price_total: budgetValue,
                    payment_type: dbPaymentType,
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
        console.error("saveClienteAction Error:", err);
        
        let errorMessage = "Error desconocido al guardar";
        
        if (err instanceof Error) {
            errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null && 'message' in err) {
            errorMessage = String((err as Record<string, unknown>).message);
        }
        
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

/**
 * Busca un cliente por teléfono.
 */
export async function getClienteByPhoneAction(phone: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("patients")
            .select("id, first_name, last_name, id_number")
            .eq("phone", phone)
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return { success: true, data };
    } catch (err: unknown) {
        console.error("Phone Lookup Error:", err);
        return { success: false, error: "Error en búsqueda" };
    }
}

// ─────────────────────────────────────────────
// GESTION DE ACCESO AL PORTAL (ADMIN)
// ─────────────────────────────────────────────

/**
 * Establece o actualiza la contraseña de acceso al portal para un cliente.
 */
export async function setClientPasswordAction(patientId: string, plainPassword: string) {
    try {
        const supabase = await createClient();
        
        // Generar hash seguro
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        const { error } = await supabase
            .from("patients")
            .update({ portal_password: hashedPassword })
            .eq("id", patientId);

        if (error) throw error;

        revalidatePath(`/admin/clientes/${patientId}`);
        return { success: true };
    } catch (err: unknown) {
        console.error("setClientPasswordAction Error:", err);
        return { success: false, error: err instanceof Error ? err.message : "Error al establecer contraseña" };
    }
}
