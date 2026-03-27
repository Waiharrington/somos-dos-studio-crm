"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type CreateAppointmentInput = {
    patient_id?: string;
    appointment_date: string;
    appointment_time: string;
    treatment_type: string;
    notes?: string;
    is_guest?: boolean;
    guest_name?: string;
    guest_phone?: string;
};

export async function createAppointmentAction(input: CreateAppointmentInput) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("appointments")
            .insert([
                {
                    patient_id: input.patient_id || null,
                    appointment_date: input.appointment_date,
                    appointment_time: input.appointment_time,
                    treatment_type: input.treatment_type,
                    notes: input.notes,
                    is_guest: input.is_guest || false,
                    guest_name: input.guest_name || null,
                    guest_phone: input.guest_phone || null,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/admin/citas");
        revalidatePath(`/admin/clientes/${input.patient_id}`);

        return { success: true, data };
    } catch (err: any) {
        console.error("createAppointmentAction:", err);
        return { success: false, error: err.message };
    }
}

export async function getAppointmentsAction(days = 30) {
    try {
        const supabase = await createClient();
        const today = new Date().toISOString().split("T")[0];
        const until = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];

        const { data, error } = await supabase
            .from("appointments")
            .select(`
                *,
                patients (id, first_name, last_name, phone)
            `)
            .gte("appointment_date", today)
            .lte("appointment_date", until)
            .order("appointment_date", { ascending: true })
            .order("appointment_time", { ascending: true });

        if (error) throw error;
        return { success: true, data: data ?? [] };
    } catch (err: any) {
        console.error("getAppointmentsAction:", err);
        return { success: false, error: err.message, data: [] };
    }
}

export async function updateAppointmentStatusAction(id: string, status: AppointmentStatus) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("appointments")
            .update({ status })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/admin/citas");
        return { success: true, data };
    } catch (err: any) {
        console.error("updateAppointmentStatusAction:", err);
        return { success: false, error: err.message };
    }
}

export async function deleteAppointmentAction(id: string) {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from("appointments")
            .delete()
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/admin/citas");
        return { success: true };
    } catch (err: any) {
        console.error("deleteAppointmentAction:", err);
        return { success: false, error: err.message };
    }
}
