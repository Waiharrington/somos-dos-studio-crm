/*
 FASE 13: GESTIÓN DE CITAS PROFESIONALES
 --------------------------------------
 Este script crea la tabla de citas y sus políticas de seguridad.
 */
-- 1. Crear enum para estados de cita
DO $$ BEGIN CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- 2. Crear tabla de citas
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    treatment_type TEXT NOT NULL,
    status appointment_status DEFAULT 'pending',
    notes TEXT,
    -- Metadatos para auditoría
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. Habilitar RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- 4. Políticas de Acceso
CREATE POLICY "Lectura autorizada citas" ON appointments FOR
SELECT USING (true);
CREATE POLICY "Inserción autorizada citas" ON appointments FOR
INSERT WITH CHECK (true);
CREATE POLICY "Actualización autorizada citas" ON appointments FOR
UPDATE USING (true);
CREATE POLICY "Eliminación autorizada citas" ON appointments FOR DELETE USING (true);
-- 5. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_appointments_updated_at BEFORE
UPDATE ON appointments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
