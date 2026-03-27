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
