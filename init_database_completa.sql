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
/*
╔══════════════════════════════════════════════════════════════════════╗
║              MAOLY CRM — MIGRACIÓN FASE 3                           ║
║              Corre este script en el SQL Editor de Supabase         ║
║                                                                      ║
║  PREREQUISITO: database.sql y migration_fase2.sql ya corridos.      ║
╚══════════════════════════════════════════════════════════════════════╝

TABLAS QUE CREA ESTE SCRIPT:
  1. services            → Catálogo de servicios con precios
  2. inventory_items     → Productos e insumos con control de stock
  3. inventory_movements → Registro de entradas/salidas del inventario

TAMBIÉN:
  - Índices de performance
  - RLS en todas las tablas
  - Función: update_inventory_stock (actualiza stock automáticamente)
  - Vista: inventory_with_status (incluye badge de nivel de stock)
*/

-- ══════════════════════════════════════════════════════════════════════
-- 1. SERVICES — Catálogo de servicios de la estudio
-- ══════════════════════════════════════════════════════════════════════
/*
  Lista de todos los servicios que ofrece la Somos Dos Studio con sus precios.
  Se usa como referencia rápida y como dropdown al crear planes de servicio.

  Categorías:
    laser      → Depilación láser, servicios fotónicos
    facial     → Rejuvenecimiento, limpiezas, peelings
    body       → Servicios corporales
    injectables → Botox, rellenos
    other      → Cualquier otro servicio
*/

CREATE TABLE IF NOT EXISTS services (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),

  name             TEXT NOT NULL,
  description      TEXT,
  category         TEXT DEFAULT 'other',
  -- 'laser' | 'facial' | 'body' | 'injectables' | 'other'

  price            DECIMAL(10, 2),
  currency         TEXT DEFAULT 'USD',

  duration_minutes INTEGER DEFAULT 60,
  -- Duración promedio de una sesión en minutos

  sessions_recommended INTEGER DEFAULT 1,
  -- Número de sesiones recomendadas para este servicio

  notes            TEXT,
  -- Contraindicaciones, preparación, post-servicio

  is_active        BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active   ON services(is_active);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRUD servicios" ON services FOR ALL USING (true) WITH CHECK (true);


-- ══════════════════════════════════════════════════════════════════════
-- 2. INVENTORY_ITEMS — Productos e insumos
-- ══════════════════════════════════════════════════════════════════════
/*
  Control de stock de todos los productos que vende o usa la Somos Dos Studio.

  Incluye:
    - Cremas y productos de skincare para venta
    - Insumos de uso clínico (geles, desinfectantes, etc.)
    - Equipos o accesorios (guantes, etc.)

  El campo reorder_level define el umbral de "stock bajo".
  Si stock_qty <= reorder_level → alerta de reposición.
*/

CREATE TABLE IF NOT EXISTS inventory_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),

  name             TEXT NOT NULL,
  brand            TEXT,
  description      TEXT,

  category         TEXT DEFAULT 'product',
  -- 'product' (venta) | 'consumable' (uso clínico) | 'equipment'

  stock_qty        DECIMAL(10, 2) DEFAULT 0,
  unit             TEXT DEFAULT 'unidad',
  -- 'unidad', 'ml', 'g', 'caja', 'frasco', 'par'

  cost_price       DECIMAL(10, 2),
  -- Precio de compra (referencia interna)

  sale_price       DECIMAL(10, 2),
  -- Precio de venta al público

  currency         TEXT DEFAULT 'USD',

  reorder_level    DECIMAL(10, 2) DEFAULT 3,
  -- Si stock_qty <= esto → "stock bajo"

  is_active        BOOLEAN DEFAULT TRUE
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_inventory_updated_at();

CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_active   ON inventory_items(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_stock    ON inventory_items(stock_qty);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRUD inventario" ON inventory_items FOR ALL USING (true) WITH CHECK (true);


-- ══════════════════════════════════════════════════════════════════════
-- 3. INVENTORY_MOVEMENTS — Registro de movimientos de stock
-- ══════════════════════════════════════════════════════════════════════
/*
  Cada entrada o salida de stock queda registrada aquí.
  Esto permite auditar cuándo y por qué cambió el inventario.

  Tipos de movimiento:
    restock     → Compra / reposición
    sale        → Venta a cliente
    use         → Uso clínico (consumible en sesión)
    adjustment  → Ajuste manual (corrección de inventario)
    loss        → Pérdida / vencimiento
*/

CREATE TABLE IF NOT EXISTS inventory_movements (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),

  item_id          UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  patient_id       UUID REFERENCES patients(id) ON DELETE SET NULL,
  visit_id         UUID REFERENCES visits(id) ON DELETE SET NULL,

  movement_type    TEXT NOT NULL,
  -- 'restock' | 'sale' | 'use' | 'adjustment' | 'loss'

  quantity         DECIMAL(10, 2) NOT NULL,
  -- Positivo = entrada, Negativo = salida

  unit_price       DECIMAL(10, 2),
  -- Precio al que se vendió/compró en este movimiento

  notes            TEXT,
  registered_by    TEXT DEFAULT 'Somos Dos Studio'
);

CREATE INDEX IF NOT EXISTS idx_movements_item    ON inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_movements_patient ON inventory_movements(patient_id);
CREATE INDEX IF NOT EXISTS idx_movements_date    ON inventory_movements(created_at DESC);

ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRUD movimientos" ON inventory_movements FOR ALL USING (true) WITH CHECK (true);


-- ══════════════════════════════════════════════════════════════════════
-- 4. FUNCIÓN: Actualizar stock al registrar movimiento
-- ══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory_items
  SET stock_qty = stock_qty + NEW.quantity
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_stock_on_movement
  AFTER INSERT ON inventory_movements
  FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();


-- ══════════════════════════════════════════════════════════════════════
-- 5. VISTA: Inventario con estado de stock
-- ══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW inventory_with_status AS
SELECT
  i.*,
  CASE
    WHEN i.stock_qty <= 0             THEN 'sin_stock'
    WHEN i.stock_qty <= i.reorder_level THEN 'stock_bajo'
    ELSE                                   'ok'
  END AS stock_status,
  (i.stock_qty * COALESCE(i.sale_price, 0)) AS stock_value
FROM inventory_items i
WHERE i.is_active = TRUE;


-- ══════════════════════════════════════════════════════════════════════
-- 6. SERVICIOS INICIALES DE MUESTRA
-- ══════════════════════════════════════════════════════════════════════
/*
  Datos de muestra para que Somos Dos Studio vea el catálogo funcionando.
  Ella puede editarlos o eliminarlos directamente desde la app.
  Los precios son referenciales — ella los ajusta según sus tarifas reales.
*/

INSERT INTO services (name, category, price, currency, duration_minutes, sessions_recommended, description)
VALUES
  ('Depilación Láser — Labio superior',  'laser', 15,  'USD', 30,  6,  'Zona labio superior. Intervalo de 4-6 semanas entre sesiones.'),
  ('Depilación Láser — Axilas',          'laser', 25,  'USD', 30,  6,  'Axilas completas. Intervalo de 4-6 semanas.'),
  ('Depilación Láser — Bikini simple',   'laser', 30,  'USD', 30,  6,  'Zona bikini línea. Intervalo de 4-6 semanas.'),
  ('Depilación Láser — Bikini completo', 'laser', 45,  'USD', 45,  6,  'Bikini completo + glúteos. Intervalo de 4-6 semanas.'),
  ('Depilación Láser — Piernas completas','laser',80,  'USD', 60,  6,  'Muslos + pantorrillas. Intervalo de 4-6 semanas.'),
  ('Depilación Láser — Cara completa',   'laser', 55,  'USD', 45,  6,  'Cara completa. Excluye cejas. Intervalo de 4-6 semanas.'),
  ('Rejuvenecimiento Facial',            'facial',80,  'USD', 60,  4,  'Rejuvenecimiento con tecnología de radiofrecuencia o fotónica.'),
  ('Limpieza Facial Profunda',           'facial',40,  'USD', 60,  1,  'Limpieza + extracción + mascarilla. Se puede repetir mensualmente.'),
  ('Peeling Químico',                    'facial',55,  'USD', 45,  3,  'Exfoliación química. Evitar sol por 7 días post-procedimiento.'),
  ('Botox — Frente',                     'injectables', 120,'USD', 30,1, 'Toxina botulínica. Efecto dura 4-6 meses.'),
  ('Relleno Ácido Hialurónico',          'injectables', 150,'USD', 45,1, 'Labios o surcos nasogenianos. Efecto 6-12 meses.'),
  ('Servicio Corporal Reafirmante',   'body',  90,  'USD', 60,  4,  'Venus Freeze o similar. 1 sesión por semana.')
ON CONFLICT DO NOTHING;


-- ══════════════════════════════════════════════════════════════════════
-- FIN DEL SCRIPT
-- ══════════════════════════════════════════════════════════════════════
/*
  ✅ Tablas creadas:
     - services
     - inventory_items
     - inventory_movements

  ✅ Funciones/Triggers:
     - update_inventory_updated_at (auto-timestamp)
     - update_inventory_stock (actualiza stock al insertar movimiento)

  ✅ Vista:
     - inventory_with_status

  ✅ Datos iniciales:
     - 12 servicios de muestra (editables desde la app)

  PRÓXIMO PASO:
  Correr este script en Supabase SQL Editor.
  Luego el deploy actualiza automáticamente la app en Vercel.
*/
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
-- 1. Crear enum para estados de cita
DO $$ BEGIN CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;

-- 2. Crear tabla de citas
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
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

-- 4. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE
UPDATE ON appointments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

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
-- Migration Phase 33: Quick Booking Support
-- Allows appointments without a formal patient record (guests)

-- 1. Make patient_id nullable
ALTER TABLE appointments ALTER COLUMN patient_id DROP NOT NULL;

-- 2. Add guest fields
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- 3. Update RLS policies (just in case they were restrictive)
-- Most policies are already using (true), but we ensure they remain inclusive.
DROP POLICY IF EXISTS "Inserción autorizada citas" ON appointments;
CREATE POLICY "Inserción autorizada citas" ON appointments FOR
INSERT WITH CHECK (true);
-- Migration Phase 34: Update Services List (Clean Setup with Laser Details)
-- Cleans up demo services and registers official services, including detailed laser zones.

-- 1. DELETE existing demo services to have a clean slate
DELETE FROM services;

-- 2. INSERT the official services (Merging detailed laser zones from demo)
INSERT INTO services (name, category, is_active, currency, price, duration_minutes, sessions_recommended)
SELECT name, category, true, 'USD', price, duration_minutes, sessions_recommended
FROM (
  VALUES 
    -- Facial
    ('Limpieza facial', 'facial', NULL, 60, 1),
    ('Plasma rico en plaquetas', 'facial', NULL, 60, 1),
    ('Peelings', 'facial', NULL, 60, 1),
    ('Servicios para ojeras', 'facial', NULL, 60, 1),
    ('Servicios para manchas', 'facial', NULL, 60, 1),
    ('Microneedling (Dermapen)', 'facial', NULL, 60, 1),
    ('Vitaminas faciales', 'facial', NULL, 60, 1),
    
    -- Inyectables
    ('Toxina botulínica', 'injectables', NULL, 60, 1),
    ('Armonización facial', 'injectables', NULL, 60, 1),
    ('Ácido hialurónico', 'injectables', NULL, 60, 1),
    ('Polirevitalizantes', 'injectables', NULL, 60, 1),
    
    -- Láser (Detailed from Demo)
    ('Láser', 'laser', NULL, 60, 1),
    ('Depilación Láser — Axilas', 'laser', 25, 30, 6),
    ('Depilación Láser — Bikini completo', 'laser', 45, 45, 6),
    ('Depilación Láser — Bikini simple', 'laser', 30, 30, 6),
    ('Depilación Láser — Cara completa', 'laser', 55, 45, 6),
    ('Depilación Láser — Labio superior', 'laser', 15, 30, 6),
    ('Depilación Láser — Piernas completas', 'laser', 80, 60, 6),
    
    -- Corporal
    ('Servicios reductivos', 'body', NULL, 60, 1),
    ('Servicios para celulitis', 'body', NULL, 60, 1),
    ('Servicios para estrías', 'body', NULL, 60, 1),
    
    -- Otros
    ('Masajes', 'other', NULL, 60, 1)
) AS new_services(name, category, price, duration_minutes, sessions_recommended);
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
