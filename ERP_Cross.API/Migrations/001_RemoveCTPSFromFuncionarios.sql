-- Migration: Remove CTPS from Funcionarios table
-- Date: 2026-08-10
-- Description: Remove the CTPS column as it's no longer used. CTPS is now represented by CPF.

-- Drop CTPS column from Funcionarios table
ALTER TABLE Funcionarios DROP COLUMN Ctps;

-- Verification query (uncomment to verify column was removed):
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Funcionarios' AND TABLE_SCHEMA = DATABASE() ORDER BY ORDINAL_POSITION;
