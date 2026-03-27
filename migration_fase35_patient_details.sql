-- Migration Phase 35: Patient Summary Enhancement (Fixed Dependencies & Permissions)
-- Includes all clinical and lifestyle fields in the summary view for detailed profile access.

-- 1. Drop dependent objects first
DROP FUNCTION IF EXISTS search_patients_fuzzy(text);
DROP VIEW IF EXISTS patient_summary;

-- 2. Create the enhanced view
CREATE VIEW patient_summary AS
SELECT
  p.id,
  p.created_at, -- Importante para ordenamiento en el backend
  p.first_name,
  p.last_name,
  p.first_name || ' ' || p.last_name AS full_name,
  p.age,
  p.id_number,
  p.phone,
  p.address,
  p.email,
  p.created_at AS registered_at,

  -- Estado calculado dinámicamente
  get_patient_status(p.id) AS status,

  -- Última visita
  (
    SELECT MAX(v.visit_date)
    FROM visits v
    WHERE v.patient_id = p.id AND v.status = 'completed'
  ) AS last_visit_date,

  -- Próxima cita sugerida
  (
    SELECT v.next_visit_date
    FROM visits v
    WHERE v.patient_id = p.id AND v.status = 'completed'
    ORDER BY v.visit_date DESC
    LIMIT 1
  ) AS next_visit_date,

  -- Total de sesiones realizadas
  (
    SELECT COUNT(*)
    FROM visits v
    WHERE v.patient_id = p.id AND v.status = 'completed'
  ) AS total_sessions,

  -- Plan activo
  (
    SELECT tp.treatment_name
    FROM treatment_plans tp
    WHERE tp.patient_id = p.id AND tp.status = 'active'
    ORDER BY tp.created_at DESC
    LIMIT 1
  ) AS active_plan,

  -- Progreso del plan activo (sesiones completadas / total)
  (
    SELECT COUNT(v.id)
    FROM visits v
    JOIN treatment_plans tp ON v.plan_id = tp.id
    WHERE tp.patient_id = p.id AND tp.status = 'active'
  ) AS plan_sessions_done,

  (
    SELECT tp.total_sessions
    FROM treatment_plans tp
    WHERE tp.patient_id = p.id AND tp.status = 'active'
    ORDER BY tp.created_at DESC
    LIMIT 1
  ) AS plan_sessions_total,

  -- Datos Clínicos Completos
  p.has_allergies,
  p.allergies_details,
  p.has_illnesses,
  p.illnesses_details,
  p.has_surgeries,
  p.surgeries_details,
  p.takes_medication,
  p.medication_details,

  -- Estilo de Vida
  p.smokes,
  p.smoking_amount,
  p.exercises,
  p.exercise_details,
  p.sun_exposure,
  p.uses_sunscreen,
  p.skin_routine,

  -- Servicio Inicial
  p.treatment_type,
  p.treatment_details,
  
  -- Alertas
  p.status as patient_status_db

FROM patients p;

-- 3. Recreate the search function (it depends on patient_summary type)
CREATE OR REPLACE FUNCTION search_patients_fuzzy(search_text TEXT)
RETURNS SETOF patient_summary AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM patient_summary
  WHERE 
    full_name % search_text
    OR first_name % search_text
    OR last_name % search_text
    OR id_number ILIKE '%' || search_text || '%'
  ORDER BY 
    similarity(full_name, search_text) DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RESTAURAR PERMISOS (Vital para que el Admin los vea)
GRANT SELECT ON public.patient_summary TO anon, authenticated, service_role;
