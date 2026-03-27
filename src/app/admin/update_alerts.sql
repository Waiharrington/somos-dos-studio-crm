-- ══════════════════════════════════════════════════════════════════════
-- Somos Dos Studio CRM — ACTUALIZACIÓN DE ALERTAS MÉDICAS (CORREGIDO)
-- ══════════════════════════════════════════════════════════════════════
-- 1. FUNCIÓN: Calcular nivel de alerta de un cliente
CREATE OR REPLACE FUNCTION get_patient_alert_level(p_id UUID) RETURNS INTEGER AS $$
DECLARE v_alert_score INTEGER := 0;
v_patient RECORD;
BEGIN
SELECT has_allergies,
    takes_medication,
    has_illnesses,
    has_surgeries INTO v_patient
FROM patients
WHERE id = p_id;
IF v_patient.has_allergies THEN v_alert_score := 2;
ELSIF v_patient.has_illnesses
OR v_patient.takes_medication
OR v_patient.has_surgeries THEN v_alert_score := 1;
END IF;
RETURN v_alert_score;
END;
$$ LANGUAGE plpgsql;
-- 2. ACTUALIZAR VISTA: patient_summary
DROP VIEW IF EXISTS patient_summary;
CREATE OR REPLACE VIEW patient_summary AS
SELECT p.*,
    -- Incluir todos los campos originales (incluyendo created_at)
    p.first_name || ' ' || p.last_name AS full_name,
    get_patient_alert_level(p.id) AS alert_level,
    get_patient_status(p.id) AS status,
    -- Última visita completada
    (
        SELECT MAX(v.visit_date)
        FROM visits v
        WHERE v.patient_id = p.id
            AND v.status = 'completed'
    ) AS last_visit_date,
    -- Próxima cita sugerida
    (
        SELECT v.next_visit_date
        FROM visits v
        WHERE v.patient_id = p.id
            AND v.status = 'completed'
        ORDER BY v.visit_date DESC
        LIMIT 1
    ) AS next_visit_date,
    -- Total de sesiones realizadas
    (
        SELECT COUNT(*)
        FROM visits v
        WHERE v.patient_id = p.id
            AND v.status = 'completed'
    ) AS total_sessions,
    -- Plan de servicio activo
    (
        SELECT tp.treatment_name
        FROM treatment_plans tp
        WHERE tp.patient_id = p.id
            AND tp.status = 'active'
        ORDER BY tp.created_at DESC
        LIMIT 1
    ) AS active_plan
FROM patients p;
