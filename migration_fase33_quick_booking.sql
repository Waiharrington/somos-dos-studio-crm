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
