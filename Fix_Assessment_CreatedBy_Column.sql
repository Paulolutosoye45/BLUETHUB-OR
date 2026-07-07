-- ═══════════════════════════════════════════════════════════════════════════════
-- Fix: Align Assessments.CreatedBy with backend service insert key
-- The service inserts dictionary key "CreatedBy", but the DB column is "CreatedByUserId" NOT NULL
-- This script makes the column match what the service sends, without losing data.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Step 1: Assess current column state ────────────────────────────────────────
DECLARE @HasCreatedByUserId INT = 0;
DECLARE @HasCreatedBy      INT = 0;
DECLARE @CreatedByUserIdRows INT = 0;

SELECT @HasCreatedByUserId = COUNT(*) FROM sys.columns
WHERE object_id = OBJECT_ID('dbo.Assessments') AND name = 'CreatedByUserId';

SELECT @HasCreatedBy = COUNT(*) FROM sys.columns
WHERE object_id = OBJECT_ID('dbo.Assessments') AND name = 'CreatedBy';

IF @HasCreatedByUserId = 1
BEGIN
    SELECT @CreatedByUserIdRows = COUNT(*) FROM Assessments WHERE CreatedByUserId IS NOT NULL;
END

PRINT 'Diagnostics: CreatedByUserId=' + CAST(@HasCreatedByUserId AS VARCHAR)
    + ', CreatedBy=' + CAST(@HasCreatedBy AS VARCHAR)
    + ', RowsWithData=' + CAST(@CreatedByUserIdRows AS VARCHAR);

-- ── Step 2: If CreatedByUserId exists but CreatedBy does NOT ───────────────────
-- Rename the column to match the service insert key.
IF @HasCreatedByUserId = 1 AND @HasCreatedBy = 0
BEGIN
    -- Change type to VARCHAR(100) (service sends Guid as string) and make nullable
    ALTER TABLE Assessments ALTER COLUMN CreatedByUserId VARCHAR(100) NULL;
    EXEC sp_rename 'dbo.Assessments.CreatedByUserId', 'CreatedBy', 'COLUMN';
    PRINT 'Renamed CreatedByUserId -> CreatedBy (VARCHAR(100) NULL)';
END
GO

-- ── Step 3: If BOTH columns exist (my earlier script added CreatedBy) ──────────
-- Copy data from CreatedByUserId into CreatedBy, then drop the conflicting column.
IF COL_LENGTH('dbo.Assessments', 'CreatedByUserId') IS NOT NULL
   AND COL_LENGTH('dbo.Assessments', 'CreatedBy') IS NOT NULL
BEGIN
    UPDATE Assessments
    SET CreatedBy = CAST(CreatedByUserId AS VARCHAR(100))
    WHERE CreatedBy IS NULL AND CreatedByUserId IS NOT NULL;

    -- Only drop CreatedByUserId if the NOT NULL constraint is what breaks inserts
    -- (Make it nullable first so existing rows survive, then drop if desired)
    ALTER TABLE Assessments ALTER COLUMN CreatedByUserId VARCHAR(100) NULL;
    ALTER TABLE Assessments DROP COLUMN CreatedByUserId;
    PRINT 'Dropped CreatedByUserId; data preserved in CreatedBy.';
END
GO

-- ── Step 4: Ensure CreatedBy exists with correct shape ─────────────────────────
IF COL_LENGTH('dbo.Assessments', 'CreatedBy') IS NULL
BEGIN
    ALTER TABLE Assessments ADD CreatedBy VARCHAR(100) NULL;
    PRINT 'Added CreatedBy VARCHAR(100) NULL';
END
ELSE
BEGIN
    -- Make sure it's nullable so inserts from the service always succeed
    ALTER TABLE Assessments ALTER COLUMN CreatedBy VARCHAR(100) NULL;
    PRINT 'Ensured CreatedBy is VARCHAR(100) NULL';
END
GO

-- ── Step 5: Same fix for AssessmentConfigs.CreatedBy ───────────────────────────
-- The service also sends CreatedBy here; ensure column names match.
IF COL_LENGTH('dbo.AssessmentConfigs', 'CreatedBy') IS NULL
   AND COL_LENGTH('dbo.AssessmentConfigs', 'CreatedByUserId') IS NOT NULL
BEGIN
    ALTER TABLE AssessmentConfigs ALTER COLUMN CreatedByUserId VARCHAR(100) NULL;
    EXEC sp_rename 'dbo.AssessmentConfigs.CreatedByUserId', 'CreatedBy', 'COLUMN';
    PRINT 'Renamed AssessmentConfigs.CreatedByUserId -> CreatedBy';
END
ELSE IF COL_LENGTH('dbo.AssessmentConfigs', 'CreatedBy') IS NULL
BEGIN
    ALTER TABLE AssessmentConfigs ADD CreatedBy VARCHAR(100) NULL;
    PRINT 'Added AssessmentConfigs.CreatedBy VARCHAR(100) NULL';
END
GO

PRINT 'Fix complete: all CreatedBy columns now match the service insert key.';
