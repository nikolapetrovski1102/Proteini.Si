-- "New discount" marketing email: when an automatic discount (Admin → Discounts) starts, everyone with
-- marketing consent gets one email listing the discounted products. Sent once per discount per person
-- (MarketingEmailLog reference "discount:<Discount_Id>:<email>"), at the template's send time, within
-- DelayValue days of the discount starting. Seeded switched OFF like every other template.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.MarketingEmailTemplates WHERE Code = N'new_discount')
    INSERT dbo.MarketingEmailTemplates (Code, Name, IsActive, SendTime, DelayValue, Subject, Preheader, Heading, Body,
        ButtonText, ButtonUrl, CouponCode, CouponText,
        Subject_Al, Preheader_Al, Heading_Al, Body_Al, ButtonText_Al, CouponText_Al)
    VALUES (N'new_discount', N'Нов попуст', 0, '10:00', 3,
        N'{ime}, нов попуст до {procent} е тука!',
        N'Попустот важи ограничено време. Погледни ги производите пред да снема залиха.',
        N'Нов попуст до {procent}',
        N'Здраво {ime}, штотуку пуштивме нов попуст: {popust}.

Подолу издвоивме дел од производите со намалена цена. Попустот се пресметува автоматски, без код.',
        N'Погледни ги попустите', N'/all-products', NULL, NULL,
        N'{ime}, zbritje e re deri në {procent} është këtu!',
        N'Zbritja vlen për kohë të kufizuar. Shiko produktet para se të mbarojë stoku.',
        N'Zbritje e re deri në {procent}',
        N'Përshëndetje {ime}, sapo nisëm një zbritje të re: {popust}.

Më poshtë veçuam disa nga produktet me çmim të ulur. Zbritja llogaritet automatikisht, pa kod.',
        N'Shiko zbritjet', NULL);
GO
