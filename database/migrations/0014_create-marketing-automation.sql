-- Automated marketing emails (welcome offers, abandoned checkout, "your product is running out"):
--   * MarketingContacts: marketing consent per email (from the cookie banner's "Маркетинг" choice,
--     guest checkout, or unsubscribe links). Active newsletter subscribers also count as consent.
--   * MarketingEmailTemplates: editable Macedonian copy, send time (Skopje) and on/off per email.
--     Every template starts switched OFF so nothing is sent before an admin has checked it.
--   * MarketingEmailLog: every send (dedupe + frequency cap + stats)
--   * MarketingRuns: one run per template per day

IF OBJECT_ID('dbo.MarketingContacts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.MarketingContacts (
        Email NVARCHAR(320) NOT NULL CONSTRAINT PK_MarketingContacts PRIMARY KEY,
        UserId INT NULL,
        Consent BIT NOT NULL,
        ConsentSource NVARCHAR(100) NULL,
        ConsentAt DATETIME2 NULL,
        UnsubscribedAt DATETIME2 NULL,
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_MarketingContacts_UpdatedAt DEFAULT (GETDATE())
    );
    CREATE INDEX IX_MarketingContacts_UserId ON dbo.MarketingContacts (UserId);
END
GO

IF OBJECT_ID('dbo.MarketingEmailTemplates', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.MarketingEmailTemplates (
        Code NVARCHAR(40) NOT NULL CONSTRAINT PK_MarketingEmailTemplates PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_MarketingEmailTemplates_IsActive DEFAULT (0),
        SendTime TIME(0) NOT NULL,
        DelayValue INT NOT NULL,
        Subject NVARCHAR(200) NOT NULL,
        Preheader NVARCHAR(300) NULL,
        Heading NVARCHAR(200) NOT NULL,
        Body NVARCHAR(MAX) NOT NULL,
        ButtonText NVARCHAR(60) NOT NULL,
        ButtonUrl NVARCHAR(300) NULL,
        CouponCode NVARCHAR(50) NULL,
        CouponText NVARCHAR(300) NULL,
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_MarketingEmailTemplates_UpdatedAt DEFAULT (GETDATE()),
        UpdatedBy NVARCHAR(320) NULL
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.MarketingEmailTemplates WHERE Code = N'welcome')
    INSERT dbo.MarketingEmailTemplates (Code, Name, SendTime, DelayValue, Subject, Preheader, Heading, Body, ButtonText, ButtonUrl, CouponCode, CouponText)
    VALUES (N'welcome', N'Добредојде, понуди и попусти', '15:00', 2,
        N'Добредојде во Proteini.si, {ime}! Ова се понудите за тебе',
        N'Попусти, нови производи и совети за подобри резултати, само за членовите.',
        N'Добредојде во тимот, {ime}!',
        N'Ти благодариме што отвори профил на Proteini.si.

Како член прв дознаваш за акциите, новите производи и ексклузивните попусти. Подолу издвоивме неколку производи што моментално се на попуст.

Имаш прашање околу изборот на протеин, креатин или витамини? Одговори на оваа порака и нашиот тим со задоволство ќе ти помогне.',
        N'Погледни ги понудите', N'/all-products', NULL,
        N'Внеси го кодот при наплата и заштеди на првата нарачка.');

IF NOT EXISTS (SELECT 1 FROM dbo.MarketingEmailTemplates WHERE Code = N'abandoned_checkout')
    INSERT dbo.MarketingEmailTemplates (Code, Name, SendTime, DelayValue, Subject, Preheader, Heading, Body, ButtonText, ButtonUrl, CouponCode, CouponText)
    VALUES (N'abandoned_checkout', N'Незавршена нарачка', '18:30', 3,
        N'{ime}, нарачката те чека, заврши ја за само една минута',
        N'Производите се уште те чекаат. Заврши ја нарачката пред да снема залиха.',
        N'Ја заборави нарачката?',
        N'Здраво {ime}, забележавме дека стигна до наплата, но нарачката не беше завршена.

Ако нешто те запре (прашање за производ, достава или плаќање), само одговори на оваа порака или јави ни се на +389 71 399 036 и ќе ти помогнеме веднаш.

Плаќањето е можно и со картичка и во готово при достава.',
        N'Заврши ја нарачката', N'/checkout', NULL,
        N'Со овој код добиваш попуст ако ја завршиш нарачката денес.');

IF NOT EXISTS (SELECT 1 FROM dbo.MarketingEmailTemplates WHERE Code = N'replenishment')
    INSERT dbo.MarketingEmailTemplates (Code, Name, SendTime, DelayValue, Subject, Preheader, Heading, Body, ButtonText, ButtonUrl, CouponCode, CouponText)
    VALUES (N'replenishment', N'Производот наскоро ќе ти заврши', '11:00', 5,
        N'{ime}, твојот {proizvod} наскоро ќе заврши',
        N'Нарачај навреме и не прекинувај со тренинзите и резултатите.',
        N'Не останувај без {proizvod}',
        N'Здраво {ime}, според бројот на дози, твојот {proizvod} наскоро ќе заврши.

За да не прекинеш со резултатите, нарачај навреме. Доставата трае 1 до 2 работни дена.',
        N'Нарачај повторно', NULL, NULL,
        N'Со овој код добиваш попуст на повторната нарачка.');
GO

IF OBJECT_ID('dbo.MarketingEmailLog', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.MarketingEmailLog (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_MarketingEmailLog PRIMARY KEY,
        TemplateCode NVARCHAR(40) NOT NULL,
        Email NVARCHAR(320) NOT NULL,
        UserId INT NULL,
        ReferenceKey NVARCHAR(120) NOT NULL,
        Status NVARCHAR(20) NOT NULL,
        Error NVARCHAR(500) NULL,
        SentAt DATETIME2 NOT NULL CONSTRAINT DF_MarketingEmailLog_SentAt DEFAULT (GETDATE())
    );
    CREATE UNIQUE INDEX UX_MarketingEmailLog_Reference ON dbo.MarketingEmailLog (TemplateCode, ReferenceKey) WHERE Status = 'sent';
    CREATE INDEX IX_MarketingEmailLog_Email ON dbo.MarketingEmailLog (Email, SentAt) INCLUDE (TemplateCode, Status);
    CREATE INDEX IX_MarketingEmailLog_SentAt ON dbo.MarketingEmailLog (SentAt) INCLUDE (TemplateCode, Status);
END
GO

IF OBJECT_ID('dbo.MarketingRuns', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.MarketingRuns (
        TemplateCode NVARCHAR(40) NOT NULL,
        RunDate DATE NOT NULL,
        StartedAt DATETIME2 NOT NULL CONSTRAINT DF_MarketingRuns_StartedAt DEFAULT (GETDATE()),
        CONSTRAINT PK_MarketingRuns PRIMARY KEY (TemplateCode, RunDate)
    );
END
GO
