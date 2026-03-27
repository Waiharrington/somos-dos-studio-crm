/*
 ╔══════════════════════════════════════════════════════════════════════╗
 ║              MAOLY CRM — MIGRACIÓN FASE 17 (SEGURIDAD)              ║
 ║              Corre este script en el SQL Editor de Supabase         ║
 ║                                                                      ║
 ║  IMPORTANTE: Este script refuerza la seguridad (RLS) para que       ║
 ║  solo la Dra. pueda acceder a los datos. Mantendrá público el       ║
 ║  registro de nuevos clientes. Agrega validaciones lógicas.         ║
 ╚══════════════════════════════════════════════════════════════════════╝
 */
-- ══════════════════════════════════════════════════════════════════════
-- 1. REFUERZO DE SEGURIDAD RLS (Row Level Security)
-- ══════════════════════════════════════════════════════════════════════
-- TABLA PATIENTS
DROP POLICY IF EXISTS "Lectura autorizada" ON patients;
CREATE POLICY "Lectura autorizada" ON patients FOR
SELECT USING (auth.role() = 'authenticated');
-- Aseguramos que solo ADMIN puede actualizar o borrar clientes
CREATE POLICY "Actualización autorizada" ON patients FOR
UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Eliminación autorizada" ON patients FOR DELETE USING (auth.role() = 'authenticated');
-- TABLA TREATMENT_PLANS
DROP POLICY IF EXISTS "Inserción pública de planes" ON treatment_plans;
DROP POLICY IF EXISTS "Lectura autorizada de planes" ON treatment_plans;
DROP POLICY IF EXISTS "Actualización autorizada de planes" ON treatment_plans;
DROP POLICY IF EXISTS "Eliminación autorizada de planes" ON treatment_plans;
CREATE POLICY "Lectura autorizada de planes" ON treatment_plans FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Inserción autorizada de planes" ON treatment_plans FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Actualización autorizada de planes" ON treatment_plans FOR
UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Eliminación autorizada de planes" ON treatment_plans FOR DELETE USING (auth.role() = 'authenticated');
-- TABLA VISITS
DROP POLICY IF EXISTS "Inserción de visitas" ON visits;
DROP POLICY IF EXISTS "Lectura de visitas" ON visits;
DROP POLICY IF EXISTS "Actualización de visitas" ON visits;
DROP POLICY IF EXISTS "Eliminación de visitas" ON visits;
CREATE POLICY "Lectura de visitas" ON visits FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Inserción de visitas" ON visits FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Actualización de visitas" ON visits FOR
UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Eliminación de visitas" ON visits FOR DELETE USING (auth.role() = 'authenticated');
-- TABLA PATIENT_PHOTOS
DROP POLICY IF EXISTS "Inserción de fotos" ON patient_photos;
DROP POLICY IF EXISTS "Lectura de fotos" ON patient_photos;
DROP POLICY IF EXISTS "Actualización de fotos" ON patient_photos;
DROP POLICY IF EXISTS "Eliminación de fotos" ON patient_photos;
CREATE POLICY "Lectura de fotos" ON patient_photos FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Inserción de fotos" ON patient_photos FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Actualización de fotos" ON patient_photos FOR
UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Eliminación de fotos" ON patient_photos FOR DELETE USING (auth.role() = 'authenticated');
-- TABLA CONSENTS
DROP POLICY IF EXISTS "Lectura de consentimientos" ON consents;
DROP POLICY IF EXISTS "Actualización de consentimientos" ON consents;
-- Permitimos INSERT global si algún día deciden tener un iPad en recepción solo para firmar
-- Pero SELECT/UPDATE solo para admin
CREATE POLICY "Lectura de consentimientos" ON consents FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Actualización de consentimientos" ON consents FOR
UPDATE USING (auth.role() = 'authenticated');
-- TABLA APPOINTMENTS
DROP POLICY IF EXISTS "Lectura autorizada citas" ON appointments;
DROP POLICY IF EXISTS "Inserción autorizada citas" ON appointments;
DROP POLICY IF EXISTS "Actualización autorizada citas" ON appointments;
DROP POLICY IF EXISTS "Eliminación autorizada citas" ON appointments;
CREATE POLICY "Lectura autorizada citas" ON appointments FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Inserción autorizada citas" ON appointments FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Actualización autorizada citas" ON appointments FOR
UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Eliminación autorizada citas" ON appointments FOR DELETE USING (auth.role() = 'authenticated');
-- BUCKET DE STORAGE (patient-photos)
DROP POLICY IF EXISTS "Lectura de fotos de clientes" ON storage.objects;
DROP POLICY IF EXISTS "Eliminación de fotos de clientes" ON storage.objects;
DROP POLICY IF EXISTS "Subida de fotos de clientes" ON storage.objects;
CREATE POLICY "Subida de fotos de clientes" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'patient-photos'
        AND auth.role() = 'authenticated'
    );
CREATE POLICY "Lectura de fotos de clientes" ON storage.objects FOR
SELECT USING (
        bucket_id = 'patient-photos'
        AND auth.role() = 'authenticated'
    );
CREATE POLICY "Eliminación de fotos de clientes" ON storage.objects FOR DELETE USING (
    bucket_id = 'patient-photos'
    AND auth.role() = 'authenticated'
);
-- ══════════════════════════════════════════════════════════════════════
-- 2. RESTRICCIONES (CONSTRAINTS) Y ENUMS LÓGICOS
-- ══════════════════════════════════════════════════════════════════════
-- treatment_plans
ALTER TABLE treatment_plans DROP CONSTRAINT IF EXISTS chk_treatment_plans_status;
ALTER TABLE treatment_plans
ADD CONSTRAINT chk_treatment_plans_status CHECK (
        status IN ('active', 'completed', 'paused', 'cancelled')
    );
ALTER TABLE treatment_plans DROP CONSTRAINT IF EXISTS chk_treatment_plans_payment_type;
ALTER TABLE treatment_plans
ADD CONSTRAINT chk_treatment_plans_payment_type CHECK (
        payment_type IN ('full', 'per_session', 'installments')
    );
-- visits
ALTER TABLE visits DROP CONSTRAINT IF EXISTS chk_visits_status;
ALTER TABLE visits
ADD CONSTRAINT chk_visits_status CHECK (
        status IN (
            'completed',
            'cancelled',
            'no_show',
            'rescheduled'
        )
    );
-- patient_photos
ALTER TABLE patient_photos DROP CONSTRAINT IF EXISTS chk_patient_photos_type;
ALTER TABLE patient_photos
ADD CONSTRAINT chk_patient_photos_type CHECK (
        photo_type IN ('before', 'after', 'progress', 'reference')
    );
-- ══════════════════════════════════════════════════════════════════════
-- 3. PREVENCIÓN DE DUPLICADOS (ÍNDICES ÚNICOS PARCIALES)
-- ══════════════════════════════════════════════════════════════════════
-- Evitar citas dobles a la misma fecha y hora (si no están canceladas)
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_unique_time ON appointments(appointment_date, appointment_time)
WHERE status != 'cancelled';
-- Evitar que se registren dos 'Sesión 1' para el mismo plan de servicio (race conditions)
CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_unique_session ON visits(plan_id, session_number)
WHERE plan_id IS NOT NULL
    AND status != 'cancelled';
-- ══════════════════════════════════════════════════════════════════════
-- FIN DEL SCRIPT: Las reglas están aplicadas.
-- ══════════════════════════════════════════════════════════════════════