/*
 ╔══════════════════════════════════════════════════════════════════════╗
 ║              MAOLY CRM — MIGRACIÓN FASE 17 (DATA FLOW - FOTOS)      ║
 ║              Corre este script en el SQL Editor de Supabase         ║
 ║                                                                      ║
 ║  IMPORTANTE: Este script crea un trigger que borra físicamente      ║
 ║  las fotos del "Storage" cuando se borra el registro de la BD.      ║
 ╚══════════════════════════════════════════════════════════════════════╝
 */
-- 1. Habilitar extensiones necesarias (pg_net es requerida por supabase_functions)
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA extensions;
-- 2. Crear función para llamar a la API de Storage y borrar el archivo
CREATE OR REPLACE FUNCTION public.delete_storage_object() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE project_url text;
service_role_key text;
BEGIN 
  -- Variables de configuración (puestas directamente aquí para evitar errores de permisos)
  project_url := 'https://aqlwdtngqcazjlankpsr.supabase.co';
  service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbHdkdG5ncWNhempsYW5rcHNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ1NzQ4MSwiZXhwIjoyMDg4MDMzNDgxfQ.KOlYU4RW2dg8hNgTd-I5stjw1wrsqSH_b--KZS7nMmg';
-- Si las variables no están seteadas (en local o no configuradas), fallar silenciosamente o lanzar un error claro
IF project_url IS NULL
OR project_url = '' THEN RAISE WARNING 'custom.project_url no está configurado. El archivo físico % no se borró.',
OLD.storage_path;
RETURN OLD;
END IF;
-- Llamar a la API REST de Supabase Storage para borrar el objeto
PERFORM extensions.http(
    (
        'DELETE',
        project_url || '/storage/v1/object/patient-photos/' || OLD.storage_path,
        ARRAY [
      extensions.http_header('authorization', 'Bearer ' || service_role_key),
      extensions.http_header('apikey', service_role_key)
    ],
        NULL,
        NULL
    )::extensions.http_request
);
RETURN OLD;
EXCEPTION
WHEN OTHERS THEN RAISE WARNING 'Error al intentar borrar el archivo del storage: %',
SQLERRM;
RETURN OLD;
END;
$$;
-- 3. Crear el Trigger en la tabla patient_photos
DROP TRIGGER IF EXISTS tr_delete_photo_from_storage ON public.patient_photos;
CREATE TRIGGER tr_delete_photo_from_storage
AFTER DELETE ON public.patient_photos FOR EACH ROW EXECUTE FUNCTION public.delete_storage_object();
-- 4. Instrucción: Simplemente copia todo este script y dale a Run en Supabase.
-- He puesto los datos de acceso directamente en la función de arriba para evitar el error de permisos.