"use server";

import { createClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

const JWT_SECRET = new TextEncoder().encode(
  process.env.PORTAL_JWT_SECRET || "somos-dos-secret-key-2026-portal-access"
);

// ─────────────────────────────────────────────
// LOGIN DEL PORTAL
// ─────────────────────────────────────────────

export async function loginPortalAction(email: string, password: string) {
  try {
    const supabase = await createClient();
    
    // Buscar cliente por email
    const { data: patient, error } = await supabase
      .from("patients")
      .select("id, email, first_name, last_name, portal_password")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;
    if (!patient) {
      return { success: false, error: "No se encontró una cuenta con ese correo." };
    }

    if (!patient.portal_password) {
      return { success: false, error: "Tu acceso al portal aún no ha sido configurado. Por favor, contacta con nosotros." };
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, patient.portal_password);
    if (!passwordMatch) {
      return { success: false, error: "La contraseña es incorrecta." };
    }

    // Crear JWT
    const token = await new SignJWT({
      sub: patient.id,
      email: patient.email,
      name: `${patient.first_name} ${patient.last_name}`,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // Guardar cookie de sesión
    const cookieStore = await cookies();
    cookieStore.set("portal_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("loginPortalAction Error:", err);
    return { success: false, error: "Error en el sistema de autenticación." };
  }
}

// ─────────────────────────────────────────────
// CERRAR SESIÓN
// ─────────────────────────────────────────────

export async function logoutPortalAction() {
    const cookieStore = await cookies();
    cookieStore.delete("portal_session");
    // No redirigimos aquí, lo hace el componente
    return { success: true };
}

// ─────────────────────────────────────────────
// OBTENER DATOS DEL CLIENTE LOGUEADO
// ─────────────────────────────────────────────

export async function getPortalDataAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("portal_session")?.value;

    if (!token) {
      return { success: false, error: "Sesión no iniciada" };
    }

    // Verificar JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const patientId = payload.sub as string;

    const supabase = await createClient();

    // 1. Datos personales
    const { data: profile, error: profileErr } = await supabase
      .from("patients")
      .select("id, first_name, last_name, email, id_number, status")
      .eq("id", patientId)
      .single();

    if (profileErr) throw profileErr;

    // 2. Proyectos y visitas
    const { data: projects, error: projectsErr } = await supabase
      .from("treatment_plans")
      .select(`
        *,
        visits (
          id,
          visit_date,
          session_number,
          treatment_applied,
          clinical_notes,
          status
        )
      `)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (projectsErr) throw projectsErr;

    // Calcular progreso para cada proyecto
    const projectsWithProgress = (projects ?? []).map((project: any) => {
        const completedSessions = (project.visits ?? []).filter(
            (v: any) => v.status === "completed"
        ).length;

        return {
            ...project,
            completed_sessions: completedSessions,
            progress_percentage: project.total_sessions > 0 
                ? Math.round((completedSessions / project.total_sessions) * 100) 
                : 0
        };
    });

    return {
      success: true,
      data: {
        profile,
        projects: projectsWithProgress,
      },
    };
  } catch (err: unknown) {
    console.error("getPortalDataAction Error:", err);
    return { success: false, error: "Error al recuperar datos del portal" };
  }
}
