-- Customer emails in the customer's language (Macedonian "mk" or Albanian "al"):
--   * Orders.Language: site language when the order was placed (order, status and cancellation emails).
--   * [User].User_Language: last site language the customer used (registration, login, orders);
--     marketing emails use it, then the language of their latest order, then Macedonian.
--   * MarketingEmailTemplates.*_Al: Albanian copy of each marketing email (empty = Macedonian copy is used).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('dbo.Orders', 'Language') IS NULL
    ALTER TABLE dbo.Orders ADD Language NVARCHAR(2) NULL;
GO

IF COL_LENGTH('dbo.[User]', 'User_Language') IS NULL
    ALTER TABLE dbo.[User] ADD User_Language NVARCHAR(2) NULL;
GO

IF COL_LENGTH('dbo.MarketingEmailTemplates', 'Subject_Al') IS NULL
    ALTER TABLE dbo.MarketingEmailTemplates ADD
        Subject_Al NVARCHAR(200) NULL,
        Preheader_Al NVARCHAR(300) NULL,
        Heading_Al NVARCHAR(200) NULL,
        Body_Al NVARCHAR(MAX) NULL,
        ButtonText_Al NVARCHAR(60) NULL,
        CouponText_Al NVARCHAR(300) NULL;
GO

UPDATE dbo.MarketingEmailTemplates SET
    Subject_Al = N'Mirë se erdhe në Proteini.si, {ime}! Këto janë ofertat për ty',
    Preheader_Al = N'Zbritje, produkte të reja dhe këshilla për rezultate më të mira, vetëm për anëtarët.',
    Heading_Al = N'Mirë se erdhe në ekip, {ime}!',
    Body_Al = N'Faleminderit që hape llogari në Proteini.si.

Si anëtar, je i pari që mëson për aksionet, produktet e reja dhe zbritjet ekskluzive. Më poshtë kemi veçuar disa produkte që aktualisht janë në zbritje.

Ke pyetje rreth zgjedhjes së proteinës, kreatinës apo vitaminave? Përgjigju këtij mesazhi dhe ekipi ynë do të të ndihmojë me kënaqësi.',
    ButtonText_Al = N'Shiko ofertat',
    CouponText_Al = N'Shkruaje kodin gjatë pagesës dhe kurse në porosinë e parë.'
WHERE Code = N'welcome' AND Subject_Al IS NULL;

UPDATE dbo.MarketingEmailTemplates SET
    Subject_Al = N'{ime}, porosia të pret, përfundoje për vetëm një minutë',
    Preheader_Al = N'Produktet ende të presin. Përfundoje porosinë para se të mbarojë stoku.',
    Heading_Al = N'E harrove porosinë?',
    Body_Al = N'Përshëndetje {ime}, vumë re se arrite deri te pagesa, por porosia nuk u përfundua.

Nëse diçka të ndaloi (pyetje për produktin, dorëzimin apo pagesën), thjesht përgjigju këtij mesazhi ose na telefono në +389 71 399 036 dhe do të të ndihmojmë menjëherë.

Pagesa është e mundur me kartelë ose me para në dorë gjatë dorëzimit.',
    ButtonText_Al = N'Përfundo porosinë',
    CouponText_Al = N'Me këtë kod merr zbritje nëse e përfundon porosinë sot.'
WHERE Code = N'abandoned_checkout' AND Subject_Al IS NULL;

UPDATE dbo.MarketingEmailTemplates SET
    Subject_Al = N'{ime}, {proizvod} yt së shpejti do të mbarojë',
    Preheader_Al = N'Porosit në kohë dhe mos i ndërprit stërvitjet dhe rezultatet.',
    Heading_Al = N'Mos mbetu pa {proizvod}',
    Body_Al = N'Përshëndetje {ime}, sipas numrit të dozave, {proizvod} yt së shpejti do të mbarojë.

Që të mos i ndërpresësh rezultatet, porosit në kohë. Dorëzimi zgjat 1 deri në 2 ditë pune.',
    ButtonText_Al = N'Porosit përsëri',
    CouponText_Al = N'Me këtë kod merr zbritje në porosinë e radhës.'
WHERE Code = N'replenishment' AND Subject_Al IS NULL;
GO
