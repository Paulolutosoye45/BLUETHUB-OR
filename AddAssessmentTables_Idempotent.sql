-- ═══════════════════════════════════════════════════════════════════════════════
-- Idempotent Migration: Add Assessment Tables
-- Safe to re-run — checks existence before creating anything
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Helpers: drop + recreate procedure approach for idempotent index/constraints ──
IF OBJECT_ID('tempdb..#CheckColumn') IS NOT NULL DROP TABLE #CheckColumn;
GO

-- ── 1. Assessments ─────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.Assessments', 'U') IS NULL
BEGIN
    CREATE TABLE Assessments (
        Id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Code          NVARCHAR(50)  NOT NULL,
        Title         NVARCHAR(300) NOT NULL,
        [Description] NVARCHAR(1000) NULL,
        SchoolId      UNIQUEIDENTIFIER NOT NULL,
        CreatedBy     VARCHAR(100) NULL,
        CreatedAt     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt     DATETIME2 NULL,
        IsDeleted     BIT NOT NULL DEFAULT 0
    );
END
GO

-- Add missing columns (idempotent)
IF COL_LENGTH('dbo.Assessments', 'CreatedBy') IS NULL
    ALTER TABLE Assessments ADD CreatedBy VARCHAR(100) NULL;
GO

IF COL_LENGTH('dbo.Assessments', 'IsDeleted') IS NULL
    ALTER TABLE Assessments ADD IsDeleted BIT NOT NULL DEFAULT 0;
GO

-- Unique constraint on Code (idempotent)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_NAME = 'UQ_Assessments_Code' AND TABLE_NAME = 'Assessments'
)
    ALTER TABLE Assessments ADD CONSTRAINT UQ_Assessments_Code UNIQUE (Code);
GO

-- Indexes (idempotent)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Assessments_SchoolId'  AND object_id = OBJECT_ID('dbo.Assessments'))
    CREATE INDEX IX_Assessments_SchoolId  ON Assessments(SchoolId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Assessments_Code'      AND object_id = OBJECT_ID('dbo.Assessments'))
    CREATE INDEX IX_Assessments_Code      ON Assessments(Code);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Assessments_IsDeleted' AND object_id = OBJECT_ID('dbo.Assessments'))
    CREATE INDEX IX_Assessments_IsDeleted ON Assessments(IsDeleted);
GO

-- ── 2. AssessmentConfigs ───────────────────────────────────────────────────────
IF OBJECT_ID('dbo.AssessmentConfigs', 'U') IS NULL
BEGIN
    CREATE TABLE AssessmentConfigs (
        Id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        AssessmentId          UNIQUEIDENTIFIER NOT NULL,
        TimeLimitMinutes      INT  NOT NULL DEFAULT 30,
        ShuffleQuestions      BIT  NOT NULL DEFAULT 0,
        PassMarkPercent       INT  NOT NULL DEFAULT 50,
        ShowResultImmediately BIT  NOT NULL DEFAULT 1,
        EasyMarks             INT  NOT NULL DEFAULT 1,
        MediumMarks           INT  NOT NULL DEFAULT 2,
        HardMarks             INT  NOT NULL DEFAULT 3,
        ExamLevelMarks        INT  NOT NULL DEFAULT 5,
        CreatedBy             VARCHAR(100) NULL,
        CreationDate          DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        ModifiedDate          DATETIME2 NULL,
        IsActive              BIT NOT NULL DEFAULT 1
    );
END
GO

-- Add FK if table was just created (idempotent)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_NAME = 'FK_Config_Assessment' AND TABLE_NAME = 'AssessmentConfigs'
)
    ALTER TABLE AssessmentConfigs ADD CONSTRAINT FK_Config_Assessment FOREIGN KEY (AssessmentId) REFERENCES Assessments(Id) ON DELETE CASCADE;
GO

-- Index (idempotent)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AssessmentConfigs_AssessmentId' AND object_id = OBJECT_ID('dbo.AssessmentConfigs'))
    CREATE INDEX IX_AssessmentConfigs_AssessmentId ON AssessmentConfigs(AssessmentId);
GO

-- ── 3. AssessmentQuestions ─────────────────────────────────────────────────────
IF OBJECT_ID('dbo.AssessmentQuestions', 'U') IS NULL
BEGIN
    CREATE TABLE AssessmentQuestions (
        Id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        AssessmentId  UNIQUEIDENTIFIER NOT NULL,
        QuestionId    UNIQUEIDENTIFIER NOT NULL,
        SchoolId      UNIQUEIDENTIFIER NOT NULL,
        DisplayOrder  INT NOT NULL DEFAULT 0,
        CreatedAt     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        IsActive      BIT NOT NULL DEFAULT 1
    );
END
GO

-- FKs (idempotent)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_NAME = 'FK_AQ_Assessment' AND TABLE_NAME = 'AssessmentQuestions'
)
    ALTER TABLE AssessmentQuestions ADD CONSTRAINT FK_AQ_Assessment FOREIGN KEY (AssessmentId) REFERENCES Assessments(Id) ON DELETE CASCADE;
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_NAME = 'FK_AQ_Question' AND TABLE_NAME = 'AssessmentQuestions'
)
    ALTER TABLE AssessmentQuestions ADD CONSTRAINT FK_AQ_Question FOREIGN KEY (QuestionId) REFERENCES Questions(Id);
GO

-- Unique constraint (idempotent)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_NAME = 'UQ_AQ_AssessmentQuestion' AND TABLE_NAME = 'AssessmentQuestions'
)
    ALTER TABLE AssessmentQuestions ADD CONSTRAINT UQ_AQ_AssessmentQuestion UNIQUE (AssessmentId, QuestionId);
GO

-- Indexes (idempotent)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AssessmentQuestions_AssessmentId' AND object_id = OBJECT_ID('dbo.AssessmentQuestions'))
    CREATE INDEX IX_AssessmentQuestions_AssessmentId ON AssessmentQuestions(AssessmentId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AssessmentQuestions_QuestionId' AND object_id = OBJECT_ID('dbo.AssessmentQuestions'))
    CREATE INDEX IX_AssessmentQuestions_QuestionId ON AssessmentQuestions(QuestionId);
GO

-- ═══════════════════════════════════════════════════════════════════════════════
PRINT 'Idempotent assessment migration completed successfully (or already up-to-date).';
