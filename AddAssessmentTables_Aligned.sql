-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: Add Assessment Tables (Aligned with Backend CreateAssessment)
-- Backend repo pattern: custom Dapper/ADO.NET (_assessmentCommand, _configCommand, _questionCommand)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Assessments ─────────────────────────────────────────────────────────────
-- Matches: _assessmentCommand.Create(Id, Code, Title, Description, SchoolId, CreatedBy, CreatedAt, UpdatedAt)
-- Query checks: IsDeleted = 0
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
        IsDeleted     BIT NOT NULL DEFAULT 0,

        CONSTRAINT UQ_Assessments_Code UNIQUE (Code)
    );

    CREATE INDEX IX_Assessments_SchoolId  ON Assessments(SchoolId);
    CREATE INDEX IX_Assessments_Code      ON Assessments(Code);
    CREATE INDEX IX_Assessments_IsDeleted ON Assessments(IsDeleted);
END
ELSE
BEGIN
    -- If table exists but missing columns the service expects
    IF COL_LENGTH('dbo.Assessments', 'CreatedBy') IS NULL
        ALTER TABLE Assessments ADD CreatedBy VARCHAR(100) NULL;

    IF COL_LENGTH('dbo.Assessments', 'IsDeleted') IS NULL
        ALTER TABLE Assessments ADD IsDeleted BIT NOT NULL DEFAULT 0;
END
GO

-- ── 2. AssessmentConfigs ───────────────────────────────────────────────────────
-- Matches: _configCommand.Create(Id, AssessmentId, TimeLimitMinutes, ShuffleQuestions,
--          PassMarkPercent, ShowResultImmediately, EasyMarks, MediumMarks, HardMarks,
--          ExamLevelMarks, CreatedBy, CreationDate, ModifiedDate, IsActive)
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
        IsActive              BIT NOT NULL DEFAULT 1,

        CONSTRAINT FK_Config_Assessment FOREIGN KEY (AssessmentId) REFERENCES Assessments(Id) ON DELETE CASCADE
    );

    CREATE INDEX IX_AssessmentConfigs_AssessmentId ON AssessmentConfigs(AssessmentId);
END
GO

-- ── 3. AssessmentQuestions ─────────────────────────────────────────────────────
-- Matches: _questionCommand.CreateBatchAsync(Id, AssessmentId, QuestionId, SchoolId,
--          DisplayOrder, CreatedAt, IsActive)
IF OBJECT_ID('dbo.AssessmentQuestions', 'U') IS NULL
BEGIN
    CREATE TABLE AssessmentQuestions (
        Id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        AssessmentId  UNIQUEIDENTIFIER NOT NULL,
        QuestionId    UNIQUEIDENTIFIER NOT NULL,
        SchoolId      UNIQUEIDENTIFIER NOT NULL,
        DisplayOrder  INT NOT NULL DEFAULT 0,
        CreatedAt     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        IsActive      BIT NOT NULL DEFAULT 1,

        CONSTRAINT FK_AQ_Assessment FOREIGN KEY (AssessmentId) REFERENCES Assessments(Id) ON DELETE CASCADE,
        CONSTRAINT FK_AQ_Question   FOREIGN KEY (QuestionId)   REFERENCES Questions(Id),
        CONSTRAINT UQ_AQ_AssessmentQuestion UNIQUE (AssessmentId, QuestionId)
    );

    CREATE INDEX IX_AssessmentQuestions_AssessmentId ON AssessmentQuestions(AssessmentId);
    CREATE INDEX IX_AssessmentQuestions_QuestionId   ON AssessmentQuestions(QuestionId);
END
GO

PRINT 'Assessment tables aligned with backend service created successfully.';
