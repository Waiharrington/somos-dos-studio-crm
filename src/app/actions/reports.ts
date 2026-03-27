"use server";

import { createClient } from "@/lib/supabase-server";
import { format, subMonths, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";

// ─────────────────────────────────────────────
// STATS CARDS
// ─────────────────────────────────────────────

export async function getReportStatsAction() {
  try {
    const supabase = await createClient();
    const [patientsRes, visitsRes, plansRes, revenueRes] = await Promise.all([
      supabase.from("patients").select("id", { count: "exact", head: true }),
      supabase
        .from("visits")
        .select("id", { count: "exact", head: true })
        .gte(
          "visit_date",
          new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split("T")[0]
        ),
      supabase
        .from("treatment_plans")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("treatment_plans")
        .select("price_total, currency")
        .in("status", ["active", "completed"])
        .eq("currency", "USD"),
    ]);

    const totalRevenue = (revenueRes.data ?? []).reduce(
      (sum, p) => sum + (Number(p.price_total) || 0),
      0
    );

    return {
      success: true,
      data: {
        totalPatients:  patientsRes.count ?? 0,
        visitsThisMonth: visitsRes.count ?? 0,
        activePlans:    plansRes.count ?? 0,
        totalRevenue,
      },
    };
  } catch {
    return { success: false, error: "Error al cargar estadísticas" };
  }
}

// ─────────────────────────────────────────────
// PATIENTS PER MONTH (last 12 months)
// ─────────────────────────────────────────────

export async function getPatientsPerMonthAction() {
  try {
    const supabase = await createClient();
    const since = subMonths(new Date(), 11);
    const { data, error } = await supabase
      .from("patients")
      .select("created_at")
      .gte("created_at", startOfMonth(since).toISOString());

    if (error) throw error;

    // Build last-12-months buckets
    const buckets: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const key = format(subMonths(new Date(), i), "MMM yy", { locale: es });
      buckets[key] = 0;
    }

    (data ?? []).forEach((p) => {
      const key = format(new Date(p.created_at), "MMM yy", { locale: es });
      if (key in buckets) buckets[key]++;
    });

    return {
      success: true,
      data: Object.entries(buckets).map(([mes, total]) => ({ mes, total })),
    };
  } catch {
    return { success: false, error: "Error al cargar clientes por mes" };
  }
}

// ─────────────────────────────────────────────
// VISITS PER MONTH (last 12 months)
// ─────────────────────────────────────────────

export async function getVisitsPerMonthAction() {
  try {
    const supabase = await createClient();
    const since = subMonths(new Date(), 11);
    const sinceDate = startOfMonth(since).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("visits")
      .select("visit_date")
      .gte("visit_date", sinceDate);

    if (error) throw error;

    const buckets: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const key = format(subMonths(new Date(), i), "MMM yy", { locale: es });
      buckets[key] = 0;
    }

    (data ?? []).forEach((v) => {
      const key = format(new Date(v.visit_date + "T12:00:00"), "MMM yy", {
        locale: es,
      });
      if (key in buckets) buckets[key]++;
    });

    return {
      success: true,
      data: Object.entries(buckets).map(([mes, total]) => ({ mes, total })),
    };
  } catch {
    return { success: false, error: "Error al cargar visitas por mes" };
  }
}

// ─────────────────────────────────────────────
// TOP TREATMENTS
// ─────────────────────────────────────────────

export async function getTopTreatmentsAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("patients")
      .select("treatment_type");

    if (error) throw error;

    const counts: Record<string, number> = {};
    (data ?? []).forEach((p) => {
      const t = p.treatment_type?.trim();
      if (t) counts[t] = (counts[t] ?? 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    return { success: true, data: sorted };
  } catch {
    return { success: false, error: "Error al cargar servicios" };
  }
}

// ─────────────────────────────────────────────
// UPCOMING VISITS (for Agenda)
// ─────────────────────────────────────────────

export async function getUpcomingVisitsAction(days = 30) {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];
    const until = new Date(Date.now() + days * 86400000)
      .toISOString()
      .split("T")[0];

    const { data, error } = await supabase
      .from("visits")
      .select(
        `id, next_visit_date, treatment_applied, session_number,
         patients!inner(id, first_name, last_name, phone),
         treatment_plans(treatment_name)`
      )
      .gte("next_visit_date", today)
      .lte("next_visit_date", until)
      .order("next_visit_date", { ascending: true })
      .limit(100);

    if (error) throw error;

    return { success: true, data: data ?? [] };
  } catch {
    return { success: false, error: "Error al cargar agenda" };
  }
}

// ─────────────────────────────────────────────
// DASHBOARD AGGREGATES
// ─────────────────────────────────────────────

export async function getDashboardAnalyticsAction() {
  try {
    const supabase = await createClient();
    
    // 1. Treatment Distribution (Donut)
    const { data: treatmentData } = await supabase.from("patients").select("treatment_type");
    const distribution: Record<string, number> = {};
    (treatmentData ?? []).forEach(p => {
      const t = p.treatment_type || 'other';
      distribution[t] = (distribution[t] ?? 0) + 1;
    });

    // 2. Weekly Growth (Bars)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: weeklyData } = await supabase
      .from("patients")
      .select("created_at")
      .gte("created_at", startOfWeek.toISOString());

    const weekBuckets = [0, 0, 0, 0, 0, 0, 0]; // L, M, X, J, V, S, D
    (weeklyData ?? []).forEach(p => {
      const day = new Date(p.created_at).getDay();
      const index = day === 0 ? 6 : day - 1; // Map Sun to 6, Mon to 0
      weekBuckets[index]++;
    });

    // 3. Weekly Appointments (Stat Card)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const { count: weeklyAppointments } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("appointment_time", startOfWeek.toISOString())
      .lt("appointment_time", endOfWeek.toISOString());

    return {
      success: true,
      data: {
        distribution,
        weeklyGrowth: weekBuckets,
        weeklyAppointments: weeklyAppointments ?? 0
      }
    };
  } catch (err) {
    console.error("getDashboardAnalyticsAction Error:", err);
    return { success: false, error: "Error al cargar analíticas del dashboard" };
  }
}
