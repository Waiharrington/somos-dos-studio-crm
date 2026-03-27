/*
╔══════════════════════════════════════════════════════════════════════╗
║              MAOLY CRM — MIGRACIÓN FASE 2                           ║
║              Corre este script en el SQL Editor de Supabase         ║
║                                                                      ║
║  IMPORTANTE: Corre PRIMERO database.sql si no lo has hecho.         ║
║  Este script depende de que la tabla `patients` ya exista.          ║
╚══════════════════════════════════════════════════════════════════════╝

TABLAS QUE CREA ESTE SCRIPT:
  1. treatment_plans  → Planes de servicio por cliente
  2. visits           → Historial clínico de cada sesión
  3. patient_photos   → Fotos antes/después vinculadas a visitas
  4. consents         → Consentimientos firmados por tipo de servicio

TAMBIÉN:
  - Índices de performance para búsquedas frecuentes
  - RLS (Row Level Security) en todas las tablas
  - Storage bucket para fotos de clientes
*/

-- ══════════════════════════════════════════════════════════════════════
-- 0. EXTENSIONES
-- ══════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ══════════════════════════════════════════════════════════════════════
-- 1. TREATMENT_PLANS — Planes de servicio contratados
-- ══════════════════════════════════════════════════════════════════════
/*
  Cada cliente puede tener uno o varios planes activos.
  Un plan define el servicio, cuántas sesiones son en total,
  y cómo se paga.

  Ejemplo real:
    - Depilación Láser Piernas: 6 sesiones, $120 total, pagadas por sesión.
    - Rejuvenecimiento Facial: 4 sesiones, $200 total, pagado completo.
*/

CREATE TABLE IF NOT EXISTS treatment_plans (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),

  -- Relación con la cliente
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Descripción del plan
  treatment_name   TEXT NOT NULL,
  -- Ej: "Depilación Láser Piernas Completas", "Rejuvenecimiento Facial"

  body_zone        TEXT,
  -- Ej: "Piernas", "Axilas", "Cara", "Abdomen"

  total_sessions   INTEGER NOT NULL CHECK (total_sessions > 0),
  -- Número total de sesiones acordadas

  session_interval_days  INTEGER DEFAULT 30,
  -- Cada cuántos días aproximadamente va la siguiente sesión

  -- Información de pago (opcional, para referencia)
  price_total      DECIMAL(10, 2),
  price_per_session DECIMAL(10, 2),
  payment_type     TEXT DEFAULT 'per_session',
  -- Valores: 'full' | 'per_session' | 'installments'

  currency         TEXT DEFAULT 'USD',
  -- 'USD' | 'VES' | 'COP'

  -- Notas adicionales del plan
  notes            TEXT,

  -- Estado del plan
  status           TEXT DEFAULT 'active',
  -- Valores: 'active' | 'completed' | 'paused' | 'cancelled'

  completed_at     TIMESTAMPTZ
  -- Fecha en que se completó o canceló el plan
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient
  ON treatment_plans(patient_id);

CREATE INDEX IF NOT EXISTS idx_treatment_plans_status
  ON treatment_plans(status);

-- RLS
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inserción pública de planes" ON treatment_plans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura autorizada de planes" ON treatment_plans
  FOR SELECT USING (true);

CREATE POLICY "Actualización autorizada de planes" ON treatment_plans
  FOR UPDATE USING (true);

CREATE POLICY "Eliminación autorizada de planes" ON treatment_plans
  FOR DELETE USING (true);


-- ══════════════════════════════════════════════════════════════════════
-- 2. VISITS — Historial clínico de sesiones
-- ══════════════════════════════════════════════════════════════════════
/*
  Cada vez que la Somos Dos Studio atiende a una cliente, se registra una visita.
  Una visita está ligada a un plan de servicio (opcional) y contiene:
    - Qué se hizo
    - Cómo reaccionó la cliente
    - Parámetros técnicos del equipo usado (específico de láser)
    - Notas estudios
    - Próxima cita sugerida

  El número de sesión (session_number) se calcula automáticamente
  contando las visitas previas del mismo plan. Si no hay plan vinculado,
  se cuenta globalmente por servicio.
*/

CREATE TABLE IF NOT EXISTS visits (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),

  -- Relaciones
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  plan_id          UUID REFERENCES treatment_plans(id) ON DELETE SET NULL,
  -- Puede existir una visita sin plan formal (consulta de evaluación, etc.)

  -- Datos de la visita
  visit_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  session_number   INTEGER NOT NULL DEFAULT 1,
  -- Calculado por la app, no por la doctora

  treatment_applied TEXT NOT NULL,
  -- Ej: "Láser Alexandrita 755nm — Depilación piernas"

  body_zones_treated TEXT[],
  -- Array: ["Pierna izquierda", "Pierna derecha", "Zona inguinal"]

  -- Evaluación estudio
  skin_condition   TEXT,
  -- Estado de la piel al inicio de la sesión

  patient_complaints TEXT,
  -- Lo que reportó la cliente ("sensación de ardor en zona inguinal")

  clinical_notes   TEXT,
  -- Observaciones de la doctora durante y después del procedimiento

  reaction_notes   TEXT,
  -- ¿Hubo reacción adversa? Eritema, edema, etc.

  results_notes    TEXT,
  -- Resultados observables: "Reducción visible del 40% del vello"

  recommendations  TEXT,
  -- Instrucciones post-sesión: "Evitar sol 7 días, hidratante 2x/día"

  -- Parámetros técnicos del equipo (JSONB para flexibilidad)
  equipment_params JSONB,
  /*
    Ejemplo para láser:
    {
      "device": "Soprano ICE",
      "wavelength": "810nm",
      "fluence": "18 J/cm²",
      "pulse_duration": "300ms",
      "frequency": "3 Hz",
      "spot_size": "12mm",
      "cooling": "Contact cooling"
    }

    Ejemplo para rejuvenecimiento:
    {
      "device": "Venus Freeze",
      "protocol": "Face V2",
      "temperature_reached": "41°C",
      "pulses": "300"
    }
  */

  -- Seguimiento
  next_visit_date  DATE,
  -- Fecha sugerida para la próxima sesión

  -- Estado de la visita
  status           TEXT DEFAULT 'completed',
  -- Valores: 'completed' | 'cancelled' | 'no_show' | 'rescheduled'

  -- Quién registró (para futuro multi-usuario)
  registered_by    TEXT DEFAULT 'Somos Dos Studio'
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_visits_patient
  ON visits(patient_id);

CREATE INDEX IF NOT EXISTS idx_visits_plan
  ON visits(plan_id);

CREATE INDEX IF NOT EXISTS idx_visits_date
  ON visits(visit_date DESC);

CREATE INDEX IF NOT EXISTS idx_visits_patient_date
  ON visits(patient_id, visit_date DESC);

-- RLS
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inserción de visitas" ON visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura de visitas" ON visits
  FOR SELECT USING (true);

CREATE POLICY "Actualización de visitas" ON visits
  FOR UPDATE USING (true);

CREATE POLICY "Eliminación de visitas" ON visits
  FOR DELETE USING (true);


-- ══════════════════════════════════════════════════════════════════════
-- 3. PATIENT_PHOTOS — Fotos estudios antes/después
-- ══════════════════════════════════════════════════════════════════════
/*
  Las fotos se almacenan en Supabase Storage (bucket: patient-photos).
  Esta tabla guarda los metadatos: dónde está, qué tipo, a qué visita
  pertenece, y notas sobre la foto.

  La ruta en Storage sigue este patrón:
    patient-photos/{patient_id}/{photo_type}/{YYYY-MM-DD}_{body_zone}_{uuid}.webp

  Ejemplo:
    patient-photos/abc123/before/2025-03-01_piernas_xyz789.webp
*/

CREATE TABLE IF NOT EXISTS patient_photos (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),

  -- Relaciones
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id         UUID REFERENCES visits(id) ON DELETE SET NULL,
  -- Puede haber fotos no asociadas a una visita específica (foto de referencia inicial)

  -- Información del archivo
  storage_path     TEXT NOT NULL,
  -- Ruta completa en Supabase Storage
  -- Ej: "patient-photos/abc123/before/2025-03-01_cara_xyz.webp"

  file_size_kb     INTEGER,
  -- Tamaño en KB después de compresión (referencia)

  original_filename TEXT,
  -- Nombre original del archivo que subió la doctora

  -- Clasificación estudio
  photo_type       TEXT NOT NULL,
  -- Valores: 'before' | 'after' | 'progress' | 'reference'
  -- 'reference' = foto de zona a tratar antes de cualquier sesión

  body_zone        TEXT,
  -- Ej: "Cara completa", "Axilas", "Piernas", "Zona inguinal"

  session_number   INTEGER,
  -- En qué sesión se tomó esta foto (para el comparador)

  taken_at         DATE NOT NULL DEFAULT CURRENT_DATE,

  notes            TEXT
  -- Ej: "Foto tomada bajo luz natural. Se aprecia reducción del 60%."
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_photos_patient
  ON patient_photos(patient_id);

CREATE INDEX IF NOT EXISTS idx_photos_visit
  ON patient_photos(visit_id);

CREATE INDEX IF NOT EXISTS idx_photos_type
  ON patient_photos(patient_id, photo_type);

CREATE INDEX IF NOT EXISTS idx_photos_zone
  ON patient_photos(patient_id, body_zone);

-- RLS
ALTER TABLE patient_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inserción de fotos" ON patient_photos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura de fotos" ON patient_photos
  FOR SELECT USING (true);

CREATE POLICY "Actualización de fotos" ON patient_photos
  FOR UPDATE USING (true);

CREATE POLICY "Eliminación de fotos" ON patient_photos
  FOR DELETE USING (true);


-- ══════════════════════════════════════════════════════════════════════
-- 4. CONSENTS — Consentimientos informados por servicio
-- ══════════════════════════════════════════════════════════════════════
/*
  El consentimiento inicial del registro cubre el uso de datos.
  Pero cada tipo de servicio requiere su propio consentimiento médico.

  Ejemplo:
    - Depilación láser: advierte sobre posibles quemaduras, zonas prohibidas
    - Botox: advierte sobre efectos secundarios, contraindicaciones
    - Peelings: advierte sobre fotosensibilidad post-procedimiento

  Cada consentimiento guarda la firma digital y el timestamp exacto
  para validez médico-legal.
*/

CREATE TABLE IF NOT EXISTS consents (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),

  -- Relaciones
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id         UUID REFERENCES visits(id) ON DELETE SET NULL,

  -- Tipo y versión del consentimiento
  consent_type     TEXT NOT NULL,
  -- Valores: 'general' | 'laser_depilation' | 'laser_rejuvenation'
  --          | 'botox' | 'facial_peel' | 'body_treatment' | 'other'

  form_version     TEXT NOT NULL DEFAULT '1.0',
  -- Para saber qué versión del formulario firmó

  -- Firma y validez legal
  signature_data   TEXT NOT NULL,
  -- SVG o Base64 de la firma

  signed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  ip_address       TEXT,
  -- IP del dispositivo que firmó (ayuda a validar autenticidad)

  device_info      TEXT,
  -- User agent del dispositivo (opcional, para registro)

  -- Texto del consentimiento que firmó (snapshot)
  consent_text_snapshot TEXT,
  -- Guardamos el texto exacto que vio al firmar.
  -- CRÍTICO: si el texto cambia en el futuro, sabemos qué firmó exactamente.

  notes            TEXT
  -- Ej: "Cliente solicitó explicación adicional sobre zona de cejas"
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_consents_patient
  ON consents(patient_id);

CREATE INDEX IF NOT EXISTS idx_consents_type
  ON consents(patient_id, consent_type);

-- RLS
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inserción de consentimientos" ON consents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura de consentimientos" ON consents
  FOR SELECT USING (true);

CREATE POLICY "Actualización de consentimientos" ON consents
  FOR UPDATE USING (true);


-- ══════════════════════════════════════════════════════════════════════
-- 5. STORAGE BUCKET — Configuración para fotos
-- ══════════════════════════════════════════════════════════════════════
/*
  IMPORTANTE: Este bloque puede fallar si el bucket ya existe.
  Si falla, ve a Supabase → Storage → New bucket y créalo manualmente
  con estos parámetros:
    - Nombre: patient-photos
    - Público: NO (privado)
    - Tamaño máximo: 5MB por archivo
    - MIME types permitidos: image/webp, image/jpeg, image/png
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patient-photos',
  'patient-photos',
  false,
  5242880, -- 5MB en bytes
  ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Política de Storage: cualquiera puede subir (viene del admin logueado)
CREATE POLICY "Subida de fotos de clientes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'patient-photos');

-- Política de Storage: cualquiera puede leer (en prod: solo auth)
CREATE POLICY "Lectura de fotos de clientes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'patient-photos');

-- Política de Storage: eliminar fotos
CREATE POLICY "Eliminación de fotos de clientes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'patient-photos');


-- ══════════════════════════════════════════════════════════════════════
-- 6. FUNCIÓN: Calcular número de sesión automáticamente
-- ══════════════════════════════════════════════════════════════════════
/*
  Esta función se llama antes de insertar una visita.
  Cuenta las visitas previas del mismo plan y devuelve el siguiente número.
  Si no hay plan, cuenta las visitas del mismo tipo de servicio.
*/

CREATE OR REPLACE FUNCTION get_next_session_number(
  p_patient_id UUID,
  p_plan_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_plan_id IS NOT NULL THEN
    -- Cuenta visitas del mismo plan
    SELECT COUNT(*) INTO v_count
    FROM visits
    WHERE patient_id = p_patient_id
      AND plan_id = p_plan_id
      AND status != 'cancelled';
  ELSE
    -- Cuenta todas las visitas completadas de esta cliente
    SELECT COUNT(*) INTO v_count
    FROM visits
    WHERE patient_id = p_patient_id
      AND status = 'completed';
  END IF;

  RETURN v_count + 1;
END;
$$ LANGUAGE plpgsql;


-- ══════════════════════════════════════════════════════════════════════
-- 7. FUNCIÓN: Calcular estado de cliente basado en actividad
-- ══════════════════════════════════════════════════════════════════════
/*
  Devuelve el estado real de la cliente según su última visita.
  Se usa en el dashboard y en el perfil para mostrar el badge correcto.

  Resultados:
    'Nueva'       → Sin visitas registradas
    'Activa'      → Última visita hace menos de 30 días
    'Seguimiento' → Última visita hace 30-90 días
    'Inactiva'    → Última visita hace más de 90 días
*/

CREATE OR REPLACE FUNCTION get_patient_status(p_patient_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_last_visit DATE;
  v_days_since INTEGER;
BEGIN
  SELECT MAX(visit_date) INTO v_last_visit
  FROM visits
  WHERE patient_id = p_patient_id
    AND status = 'completed';

  IF v_last_visit IS NULL THEN
    RETURN 'Nueva';
  END IF;

  v_days_since := CURRENT_DATE - v_last_visit;

  IF v_days_since < 30 THEN
    RETURN 'Activa';
  ELSIF v_days_since < 90 THEN
    RETURN 'Seguimiento';
  ELSE
    RETURN 'Inactiva';
  END IF;
END;
$$ LANGUAGE plpgsql;


-- ══════════════════════════════════════════════════════════════════════
-- 8. VISTA: Resumen de cliente para el dashboard
-- ══════════════════════════════════════════════════════════════════════
/*
  Esta vista une toda la información relevante de una cliente
  en una sola consulta optimizada. La usa el listado de clientes
  y el panel de admin.
*/

CREATE OR REPLACE VIEW patient_summary AS
SELECT
  p.id,
  p.first_name,
  p.last_name,
  p.first_name || ' ' || p.last_name AS full_name,
  p.id_number,
  p.phone,
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

  -- Alertas estudios (para mostrar en el perfil)
  p.has_allergies,
  p.allergies_details,
  p.takes_medication,
  p.medication_details

FROM patients p;


-- ══════════════════════════════════════════════════════════════════════
-- FIN DEL SCRIPT
-- ══════════════════════════════════════════════════════════════════════
/*
  ✅ Tablas creadas:
     - treatment_plans
     - visits
     - patient_photos
     - consents

  ✅ Storage bucket: patient-photos (privado, max 5MB)

  ✅ Funciones:
     - get_next_session_number(patient_id, plan_id?)
     - get_patient_status(patient_id)

  ✅ Vista:
     - patient_summary

  PRÓXIMO PASO:
  Instala las dependencias de la Fase 2 en el proyecto:

    npm install react-compare-slider browser-image-compression date-fns

  Luego implementa las Server Actions en:
    src/app/actions/visits.ts
    src/app/actions/photos.ts
    src/app/actions/plans.ts
    src/app/actions/consents.ts
*/
