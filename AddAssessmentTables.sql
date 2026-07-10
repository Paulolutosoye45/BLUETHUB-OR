-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: Add Assessment System Tables
-- Database: Bluethub / TechHubSchoolManagement
-- Purpose: Support teacher assessment creation, student attempts, and grading
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Assessments ─────────────────────────────────────────────────────────────
IF OBJECT_ID('dbo.Assessments', 'U') IS NULL
BEGIN
    CREATE TABLE Assessments (
        Id                UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Code              NVARCHAR(50)  NOT NULL,
        Title             NVARCHAR(300) NOT NULL,
        [Description]     NVARCHAR(1000) NULL,
        SchoolId          UNIQUEIDENTIFIER NOT NULL,
        CreatedByUserId   UNIQUEIDENTIFIER NOT NULL,

        -- Configuration
        TimeLimitMinutes      INT  NOT NULL DEFAULT 30,
        ShuffleQuestions      BIT  NOT NULL DEFAULT 0,
        PassMarkPercent       INT  NOT NULL DEFAULT 50,
        ShowResultImmediately BIT  NOT NULL DEFAULT 1,

        -- Difficulty scoring
        EasyMarks       INT NOT NULL DEFAULT 1,
        MediumMarks     INT NOT NULL DEFAULT 2,
        HardMarks       INT NOT NULL DEFAULT 3,
        ExpertMarks     INT NOT NULL DEFAULT 4,

        -- Status tracking
        [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Draft', -- Draft | Published | Archived
        TotalMarks      INT NOT NULL DEFAULT 0,
        QuestionCount   INT NOT NULL DEFAULT 0,

        -- Metadata
        CreatedAt       DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt       DATETIME2 NULL,
        PublishedAt     DATETIME2 NULL,

        -- Soft delete
        IsDeleted       BIT NOT NULL DEFAULT 0,
        DeletedAt       DATETIME2 NULL,

        CONSTRAINT UQ_Assessments_Code UNIQUE (Code),
        CONSTRAINT FK_Assessments_School    FOREIGN KEY (SchoolId)        REFERENCES Schools(Id),
        CONSTRAINT FK_Assessments_Creator   FOREIGN KEY (CreatedByUserId) REFERENCES Users(Id)
    );

    CREATE INDEX IX_Assessments_SchoolId    ON Assessments(SchoolId);
    CREATE INDEX IX_Assessments_Code        ON Assessments(Code);
    CREATE INDEX IX_Assessments_Status      ON Assessments([Status]);
    CREATE INDEX IX_Assessments_IsDeleted   ON Assessments(IsDeleted);
    CREATE INDEX IX_Assessments_CreatedAt   ON Assessments(CreatedAt);
END
GO

-- ── 2. AssessmentQuestions (junction: Assessment ↔ Question) ───────────────────
IF OBJECT_ID('dbo.AssessmentQuestions', 'U') IS NULL
BEGIN
    CREATE TABLE AssessmentQuestions (
        Id                UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        AssessmentId      UNIQUEIDENTIFIER NOT NULL,
        QuestionId        UNIQUEIDENTIFIER NOT NULL,
        DisplayOrder      INT NOT NULL DEFAULT 0,
        MarksAllocation   INT NOT NULL DEFAULT 1,

        CONSTRAINT FK_AQ_Assessment FOREIGN KEY (AssessmentId) REFERENCES Assessments(Id) ON DELETE CASCADE,
        CONSTRAINT FK_AQ_Question   FOREIGN KEY (QuestionId)   REFERENCES Questions(Id),
        CONSTRAINT UQ_AQ_AssessmentQuestion UNIQUE (AssessmentId, QuestionId)
    );

    CREATE INDEX IX_AssessmentQuestions_AssessmentId ON AssessmentQuestions(AssessmentId);
    CREATE INDEX IX_AssessmentQuestions_QuestionId   ON AssessmentQuestions(QuestionId);
END
GO

-- ── 3. AssessmentAssignments (assign to Student / Classroom / Subject) ─────────
IF OBJECT_ID('dbo.AssessmentAssignments', 'U') IS NULL
BEGIN
    CREATE TABLE AssessmentAssignments (
        Id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        AssessmentId  UNIQUEIDENTIFIER NOT NULL,
        TargetType    NVARCHAR(50) NOT NULL,   -- 'Student' | 'Subject' | 'Classroom'
        TargetId      UNIQUEIDENTIFIER NOT NULL,
        AssignedAt    DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        AssignedBy    UNIQUEIDENTIFIER NOT NULL,

        CONSTRAINT FK_AA_Assessment FOREIGN KEY (AssessmentId) REFERENCES Assessments(Id) ON DELETE CASCADE,
        CONSTRAINT FK_AA_AssignedBy FOREIGN KEY (AssignedBy)   REFERENCES Users(Id)
    );

    CREATE INDEX IX_Assignment_AssessmentId ON AssessmentAssignments(AssessmentId);
    CREATE INDEX IX_Assignment_Target       ON AssessmentAssignments(TargetType, TargetId);
END
GO

-- ── 4. AssessmentAttempts ──────────────────────────────────────────────────────
IF OBJECT_ID('dbo.AssessmentAttempts', 'U') IS NULL
BEGIN
    CREATE TABLE AssessmentAttempts (
        Id                   UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        AssessmentId         UNIQUEIDENTIFIER NOT NULL,
        StudentId            UNIQUEIDENTIFIER NOT NULL,

        AttemptNumber        INT  NOT NULL DEFAULT 1,
        IsOfficial           BIT  NOT NULL DEFAULT 1,

        -- Timestamps
        StartedAt            DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        SubmittedAt          DATETIME2 NULL,
        TimeTakenSeconds     INT NULL,

        -- Results (auto-calculated on submit)
        TotalMarks           INT NOT NULL DEFAULT 0,
        MarksObtained        DECIMAL(10,2) NOT NULL DEFAULT 0,
        AutoMarksObtained    DECIMAL(10,2) NOT NULL DEFAULT 0,
        ManualMarksObtained  DECIMAL(10,2) NOT NULL DEFAULT 0,
        FinalScorePercent    DECIMAL(5,2)  NOT NULL DEFAULT 0,
        IsPassed             BIT NULL,

        -- Status
        [Status]             NVARCHAR(50) NOT NULL DEFAULT 'InProgress', -- InProgress | Completed | TimedOut

        CONSTRAINT FK_Attempts_Assessment FOREIGN KEY (AssessmentId) REFERENCES Assessments(Id),
        CONSTRAINT FK_Attempts_Student    FOREIGN KEY (StudentId)    REFERENCES Users(Id)
    );

    CREATE INDEX IX_Attempts_AssessmentId ON AssessmentAttempts(AssessmentId);
    CREATE INDEX IX_Attempts_StudentId    ON AssessmentAttempts(StudentId);
    CREATE INDEX IX_Attempts_Status       ON AssessmentAttempts([Status]);
END
GO

-- ── 5. AssessmentAnswers (individual question answers per attempt) ─────────────
IF OBJECT_ID('dbo.AssessmentAnswers', 'U') IS NULL
BEGIN
    CREATE TABLE AssessmentAnswers (
        Id                UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        AttemptId         UNIQUEIDENTIFIER NOT NULL,
        QuestionId        UNIQUEIDENTIFIER NOT NULL,

        -- Answer data
        SelectedOptionId  UNIQUEIDENTIFIER NULL,
        TypedAnswer       NVARCHAR(MAX) NULL,
        BoardSessionId    UNIQUEIDENTIFIER NULL,
        AudioUrl          NVARCHAR(500) NULL,
        IsSkipped         BIT NOT NULL DEFAULT 0,

        -- Grading
        MaxMarks          INT NOT NULL DEFAULT 0,
        MarksObtained     DECIMAL(10,2) NOT NULL DEFAULT 0,
        IsCorrect         BIT NULL,
        TeacherFeedback   NVARCHAR(1000) NULL,

        -- Metadata
        AnsweredAt        DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

        CONSTRAINT FK_Answers_Attempt  FOREIGN KEY (AttemptId)  REFERENCES AssessmentAttempts(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Answers_Question FOREIGN KEY (QuestionId) REFERENCES Questions(Id)
    );

    CREATE INDEX IX_Answers_AttemptId  ON AssessmentAnswers(AttemptId);
    CREATE INDEX IX_Answers_QuestionId ON AssessmentAnswers(QuestionId);
END
GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- Helper: Generate unique assessment codes (6-char alphanumeric, e.g. "ABC123")
-- ═══════════════════════════════════════════════════════════════════════════════
IF OBJECT_ID('dbo.GenerateAssessmentCode', 'FN') IS NOT NULL
    DROP FUNCTION dbo.GenerateAssessmentCode;
GO

CREATE FUNCTION dbo.GenerateAssessmentCode()
RETURNS NVARCHAR(50)
AS
BEGIN
    DECLARE @Code NVARCHAR(50);
    DECLARE @Exists INT = 1;

    WHILE @Exists = 1
    BEGIN
        SET @Code = UPPER(
            SUBSTRING(
                CONVERT(NVARCHAR(36), NEWID()),
                1, 6
            )
        );

        SELECT @Exists = COUNT(*) FROM Assessments WHERE Code = @Code;
    END

    RETURN @Code;
END
GO

PRINT 'Assessment tables created successfully.';
