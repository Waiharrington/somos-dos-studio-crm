-- MIGRACIÓN: Configuración Global de la Estudio y Perfil Médico
-- FASE 45: Implementación de ajustes dinámicos y retrato del doctor

-- 1. Crear la tabla de configuración
CREATE TABLE IF NOT EXISTS clinic_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_name TEXT NOT NULL DEFAULT 'Somos Dos Studio',
    doctor_specialty TEXT NOT NULL DEFAULT 'Estudio Avanzada',
    doctor_portrait_url TEXT,
    clinic_name TEXT NOT NULL DEFAULT 'Somos Dos Studio Estudio Avanzada',
    clinic_address TEXT NOT NULL DEFAULT 'Av. Libertador 1234, Piso 5, Oficina B',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acceso (Solo lectura pública para evitar errores de renderizado si es necesario, pero idealmente solo lectura autorizada)
CREATE POLICY "Lectura autorizada de configuración" ON clinic_settings 
FOR SELECT USING (true);

CREATE POLICY "Actualización autorizada de configuración" ON clinic_settings 
FOR UPDATE USING (true);

CREATE POLICY "Inserción autorizada de configuración" ON clinic_settings 
FOR INSERT WITH CHECK (true);

-- 4. Insertar fila inicial si no existe
INSERT INTO clinic_settings (id, doctor_name, doctor_specialty, clinic_name, clinic_address)
SELECT uuid_generate_v4(), 'Somos Dos Studio', 'Estudio Avanzada', 'Somos Dos Studio Estudio Avanzada', 'Av. Libertador 1234, Piso 5, Oficina B'
WHERE NOT EXISTS (SELECT 1 FROM clinic_settings);
