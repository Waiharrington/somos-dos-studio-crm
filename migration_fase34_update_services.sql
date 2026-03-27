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
