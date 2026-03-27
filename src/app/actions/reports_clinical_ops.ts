"use server";

import { createClient } from "@/lib/supabase-server";

/**
 * Fetches clinical and lifestyle metrics from patients and visits.
 */
export async function getClinicalReportDataAction() {
    try {
        const supabase = await createClient();
        const { data: patients, error: pError } = await supabase
            .from("patients")
            .select("smokes, exercises, sun_exposure, uses_sunscreen, has_allergies");

        if (pError) throw pError;

        const { data: visits, error: vError } = await supabase
            .from("visits")
            .select("body_zones_treated")
            .eq("status", "completed");

        if (vError) throw vError;

        // Lifestyle Stats
        const total = patients.length || 1;
        const lifestyle = {
            smokes: patients.filter(p => p.smokes).length,
            exercises: patients.filter(p => p.exercises).length,
            sunExposure: patients.filter(p => p.sun_exposure).length,
            usesSunscreen: patients.filter(p => p.uses_sunscreen).length,
            allergies: patients.filter(p => p.has_allergies).length,
        };

        // Body Zones Stats
        const zonesCount: Record<string, number> = {};
        visits.forEach(v => {
            if (Array.isArray(v.body_zones_treated)) {
                v.body_zones_treated.forEach(z => {
                    zonesCount[z] = (zonesCount[z] ?? 0) + 1;
                });
            }
        });

        const bodyZones = Object.entries(zonesCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, value]) => ({ name, value }));

        return {
            success: true,
            data: { lifestyle, bodyZones, totalPatients: total }
        };
    } catch (error) {
        console.error("Error in getClinicalReportDataAction:", error);
        return { success: false, error: "Error al cargar datos clínicos" };
    }
}

/**
 * Fetches operational efficiency metrics from appointments.
 */
export async function getOperationalReportDataAction() {
    try {
        const supabase = await createClient();
        const { data: appts, error } = await supabase
            .from("appointments")
            .select("status, appointment_time, appointment_date");

        if (error) throw error;

        // Status distribution
        const statusCounts: Record<string, number> = {
            completed: 0,
            cancelled: 0,
            confirmed: 0,
            pending: 0
        };

        // Hourly distribution (Peak Hours)
        const hourlyCounts: Record<number, number> = {};
        for (let i = 8; i <= 20; i++) hourlyCounts[i] = 0; // 8am to 8pm

        // Monthly activity (last 6 months)
        const dailyActivity: Record<string, number> = {
            "Lunes": 0, "Martes": 0, "Miércoles": 0, "Jueves": 0, "Viernes": 0, "Sábado": 0
        };

        const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

        appts.forEach(a => {
            if (a.status) statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1;

            const hour = parseInt(a.appointment_time.split(":")[0]);
            if (hour >= 8 && hour <= 20) hourlyCounts[hour]++;

            const date = new Date(a.appointment_date + "T12:00:00");
            const dayName = dayNames[date.getDay()];
            if (dailyActivity[dayName] !== undefined) dailyActivity[dayName]++;
        });

        return {
            success: true,
            data: {
                effectiveness: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
                peakHours: Object.entries(hourlyCounts).map(([hour, value]) => ({
                    hour: `${hour}:00`,
                    value
                })),
                dayActivity: Object.entries(dailyActivity).map(([day, value]) => ({ day, value }))
            }
        };
    } catch (error) {
        console.error("Error in getOperationalReportDataAction:", error);
        return { success: false, error: "Error al cargar datos operativos" };
    }
}
