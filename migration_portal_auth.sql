/*
  MIGRACIÓN: PORTAL DE CLIENTES
  ---------------------------
  Corre este script en el SQL Editor de Supabase para habilitar 
  la autenticación de clientes y los recursos por proyecto.
*/

-- 1. Añadir campo de contraseña al cliente
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS portal_password TEXT;

-- 2. Añadir campos de recursos al proyecto (treatment_plans)
ALTER TABLE treatment_plans
ADD COLUMN IF NOT EXISTS drive_url TEXT,
ADD COLUMN IF NOT EXISTS contract_url TEXT;

-- 3. Habilitar lectura para el portal (RLS)
-- Nota: En la acción del portal usaremos un cliente de Supabase con Service Role 
-- o manejaremos la sesión manualmente para mayor seguridad.
-- Por ahora, permitimos que el sistema lea estos campos si es necesario.
COMMENT ON COLUMN patients.portal_password IS 'Contraseña hasheada para el acceso al portal de clientes';
COMMENT ON COLUMN treatment_plans.drive_url IS 'Enlace a la carpeta de Drive con multimedia del proyecto';
COMMENT ON COLUMN treatment_plans.contract_url IS 'Enlace al documento del contrato firmado';
