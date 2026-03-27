/*
╔══════════════════════════════════════════════════════════════════════╗
║              MAOLY CRM — MIGRACIÓN FASE 18 (FUZZY SEARCH)           ║
║              Corre este script en el SQL Editor de Supabase         ║
║                                                                      ║
║  Este script habilita la búsqueda por similitud de texto para que   ║
║  el buscador sea tolerante a errores ortográficos (Ej: Maoli -> Somos Dos Studio)║
╚══════════════════════════════════════════════════════════════════════╝
*/

-- 1. Habilitar la extensión de trigramas (necesaria para fuzzy search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Crear una función de búsqueda inteligente
-- Esta función busca en nombre, apellido y cédula simultáneamente
CREATE OR REPLACE FUNCTION search_patients_fuzzy(search_text TEXT)
RETURNS SETOF patient_summary AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM patient_summary
  WHERE 
    -- Buscamos similitud en el nombre completo
    full_name % search_text
    OR first_name % search_text
    OR last_name % search_text
    -- También permitimos búsqueda exacta o parcial por cédula
    OR id_number ILIKE '%' || search_text || '%'
  ORDER BY 
    -- Ordenamos por los que más se parecen (Similitud de Trigramas)
    similarity(full_name, search_text) DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. (Opcional) Crear un índice GIST para que la búsqueda sea ultra rápida 
-- aunque tengamos miles de clientes.
CREATE INDEX IF NOT EXISTS idx_patients_name_trgm ON patients USING gist (first_name gist_trgm_ops, last_name gist_trgm_ops);

/*
✅ LISTO. Una vez corrido esto, el backend podrá usar la función 
'search_patients_fuzzy' para dar resultados más inteligentes.
*/
