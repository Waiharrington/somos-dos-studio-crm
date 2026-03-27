"use server";

import { createClient } from "@/lib/supabase-server";

/**
 * Calculates the total revenue per treatment type based on active/completed plans.
 */
export async function getTreatmentRevenueAction() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("treatment_plans")
            .select("treatment_name, price_total, currency")
            .in("status", ["active", "completed"]);

        if (error) throw error;

        const revenueByTreatment: Record<string, number> = {};

        (data ?? []).forEach((plan) => {
            const name = plan.treatment_name.trim();
            const price = Number(plan.price_total) || 0;

            // Basic normalization: for now we assume USD but we could add conversion logic here
            // if (plan.currency === 'VES') price = price / exchangeRate;

            revenueByTreatment[name] = (revenueByTreatment[name] ?? 0) + price;
        });

        const result = Object.entries(revenueByTreatment)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value }));

        return { success: true, data: result };
    } catch (error) {
        console.error("Error in getTreatmentRevenueAction:", error);
        return { success: false, error: "Error al cargar rentabilidad de servicios" };
    }
}

/**
 * Calculates the conversion rate: how many patients interested in a treatment 
 * actually ended up signing a treatment plan for it.
 */
export async function getInterestConversionAction() {
    try {
        const supabase = await createClient();
        // 1. Get all patient interests (Leads)
        const { data: leads, error: leadsError } = await supabase
            .from("patients")
            .select("treatment_type");

        if (leadsError) throw leadsError;

        // 2. Get all treatment plans (Conversions)
        const { data: plans, error: plansError } = await supabase
            .from("treatment_plans")
            .select("treatment_name");

        if (plansError) throw plansError;

        const leadCounts: Record<string, number> = {};
        const planCounts: Record<string, number> = {};

        // Map lead IDs to labels for consistency
        const treatmentLabels: Record<string, string> = {
            "laser": "Depilación Láser",
            "facial": "Limpieza / Hidratación",
            "injectables": "Botox / Ácido / Plasma",
            "rejuvenation": "Dermapen / PRN",
            "body": "Corporal / Enzimas",
            "armonizacion": "Armonización Facial",
            "other": "Otro Servicio"
        };

        leads.forEach(l => {
            const type = l.treatment_type || 'other';
            const label = treatmentLabels[type] || 'Otro';
            leadCounts[label] = (leadCounts[label] ?? 0) + 1;
        });

        plans.forEach(p => {
            const name = p.treatment_name;
            // Logic to match plan names back to interest categories might be fuzzy,
            // so we'll try to categorize them or just search for keywords.
            let category = "Otro";
            if (name.toLowerCase().includes("láser") || name.toLowerCase().includes("aser")) category = "Depilación Láser";
            else if (name.toLowerCase().includes("facial") || name.toLowerCase().includes("limpieza")) category = "Limpieza / Hidratación";
            else if (name.toLowerCase().includes("botox") || name.toLowerCase().includes("ácido") || name.toLowerCase().includes("plasma")) category = "Botox / Ácido / Plasma";
            else if (name.toLowerCase().includes("dermapen") || name.toLowerCase().includes("rejuvenecimiento")) category = "Dermapen / PRN";
            else if (name.toLowerCase().includes("corporal") || name.toLowerCase().includes("enzima")) category = "Corporal / Enzimas";
            else if (name.toLowerCase().includes("armonización")) category = "Armonización Facial";

            planCounts[category] = (planCounts[category] ?? 0) + 1;
        });

        const conversionData = Object.keys(leadCounts).map(cat => ({
            category: cat,
            leads: leadCounts[cat] || 0,
            conversions: planCounts[cat] || 0,
            rate: leadCounts[cat] > 0 ? (planCounts[cat] || 0) / leadCounts[cat] : 0
        })).sort((a, b) => b.leads - a.leads);

        return { success: true, data: conversionData };
    } catch (error) {
        console.error("Error in getInterestConversionAction:", error);
        return { success: false, error: "Error al cargar tasa de conversión" };
    }
}
