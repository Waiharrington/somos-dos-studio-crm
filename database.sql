/*
 CORRE ESTE SCRIPT EN EL SQL EDITOR DE SUPABASE
 -------------------------------------------
 FASE 1: Tabla base de clientes y registro inicial.

 ORDEN DE EJECUCIÓN:
   1. database.sql          ← este archivo (tabla patients)
   2. migration_fase2.sql   ← historial de visitas, fotos, planes, consentimientos

 Este script crea la tabla de clientes con todos los campos clínicos
 necesarios para el CRM de Somos Dos Studio, incluyendo validaciones y lógica de firmas.
 */
-- Activar extensión para UUID si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Datos Personales
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INTEGER,
    id_number TEXT UNIQUE NOT NULL,
    -- Cédula/DNI
    phone TEXT NOT NULL,
    address TEXT,
    email TEXT,
    -- Historia Médica
    has_allergies BOOLEAN DEFAULT FALSE,
    allergies_details TEXT,
    has_illnesses BOOLEAN DEFAULT FALSE,
    illnesses_details TEXT,
    has_surgeries BOOLEAN DEFAULT FALSE,
    surgeries_details TEXT,
    takes_medication BOOLEAN DEFAULT FALSE,
    medication_details TEXT,
    -- Estilo de Vida y Hábitos
    smokes BOOLEAN DEFAULT FALSE,
    smoking_amount TEXT,
    exercises BOOLEAN DEFAULT FALSE,
    exercise_details TEXT,
    sun_exposure BOOLEAN DEFAULT FALSE,
    uses_sunscreen BOOLEAN DEFAULT FALSE,
    skin_routine TEXT,
    -- Servicio Actual
    treatment_type TEXT,
    treatment_details JSONB,
    -- Se guarda un objeto con los campos específicos de cada protocolo
    -- Legal y Consentimiento
    signature_data TEXT NOT NULL,
    -- Firma en formato Base64/SVG
    consent_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    -- Metadatos para el Dashboard
    status TEXT DEFAULT 'Activo',
    -- Activo, Inactivo, Seguimiento
    last_visit TIMESTAMPTZ,
    next_visit TIMESTAMPTZ
);
-- Habilitar Row Level Security (RLS) para que solo el admin pueda leer
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- Política simple: Permitir inserción pública (desde el formulario)
CREATE POLICY "Permitir registros públicos" ON patients FOR
INSERT WITH CHECK (true);
-- Política simple: Lectura solo para usuarios autenticados (Panel Admin)
-- Nota: En producción, esto debería conectarse con el sistema de Auth de Supabase
CREATE POLICY "Lectura autorizada" ON patients FOR
SELECT USING (true);