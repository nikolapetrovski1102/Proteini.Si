IF OBJECT_ID('dbo.HomepageCards', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.HomepageCards (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Section NVARCHAR(20) NOT NULL,
        TitleMk NVARCHAR(200) NOT NULL,
        TitleAl NVARCHAR(200) NULL,
        Slug NVARCHAR(160) NOT NULL,
        FilterValue NVARCHAR(200) NOT NULL,
        ImagePath NVARCHAR(500) NULL,
        DisplayOrder INT NOT NULL CONSTRAINT DF_HomepageCards_DisplayOrder DEFAULT (0),
        IsActive BIT NOT NULL CONSTRAINT DF_HomepageCards_IsActive DEFAULT (1),
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_HomepageCards_CreatedAt DEFAULT (GETDATE()),
        UpdatedAt DATETIME2 NULL
    );
END
GO

IF COL_LENGTH('dbo.HomepageCards', 'DestinationUrl') IS NULL
    ALTER TABLE dbo.HomepageCards ADD DestinationUrl NVARCHAR(500) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.HomepageCards)
BEGIN
    INSERT INTO dbo.HomepageCards
        (Section, TitleMk, TitleAl, Slug, FilterValue, ImagePath, DisplayOrder, IsActive)
    VALUES
        ('goal', N'Слабеење', N'Humbni peshë', 'weight-loss', 'Weight Loss', '/img/homepage-cards/lose-weight.webp', 1, 1),
        ('goal', N'Добивање мускулна маса', N'Fitoni masë muskulore', 'gain-muscle-mass', 'Muscle Mass', '/img/homepage-cards/gain-muscle-mass.webp', 2, 1),
        ('goal', N'Подобрување на формата и издржливоста', N'Përmirësoni formën dhe qëndrueshmërinë', 'improve-your-form-and-endurance', 'Endurance and Recovery', '/img/homepage-cards/improve-form-endurance.webp', 3, 1),
        ('goal', N'Виталност како начин на живот', N'Vitaliteti si mënyrë jetese', 'vitality-as-a-lifestyle', 'Active Lifestyle', '/img/homepage-cards/vitality-lifestyle.webp', 4, 1),
        ('sport', N'Велосипедизам', N'Çiklizëm', 'road-cycling', 'Road Cycling', '/img/gym-5.jpg', 1, 1),
        ('sport', N'Трчање', N'Vrapimi', 'running', 'Running', '/img/homepage-cards/running.webp', 2, 1),
        ('sport', N'Екипни спортови', N'Sportet ekipore', 'swimming', 'Swimming', '/img/homepage-cards/team-sports.webp', 3, 1),
        ('sport', N'Фитнес и бодибилдинг', N'Fitnesi dhe bodybuilding', 'fitness-bodybuilding', 'Fitness and Bodybuilding', '/img/homepage-cards/fitness-bodybuilding.webp', 4, 1);
END
GO
