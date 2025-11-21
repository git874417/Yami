-- Script para añadir la columna created_at a la tabla Orders
-- Ejecutar este script en Supabase SQL Editor

-- Añadir la columna created_at con valor por defecto NOW()
ALTER TABLE sisinf_p3."Orders" 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Para los pedidos existentes, asignarles la fecha actual
-- (Opcional: si quieres que los pedidos antiguos tengan fechas distribuidas en el pasado)
UPDATE sisinf_p3."Orders" 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- Crear índice para mejorar el rendimiento de consultas por fecha
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON sisinf_p3."Orders"(created_at DESC);

-- Verificar que la columna se creó correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'sisinf_p3' 
  AND table_name = 'Orders' 
  AND column_name = 'created_at';
