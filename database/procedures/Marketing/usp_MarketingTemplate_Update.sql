SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_MarketingTemplate_Update
    @Code NVARCHAR(40),
    @IsActive BIT,
    @SendTime TIME(0),
    @DelayValue INT,
    @Subject NVARCHAR(200),
    @Preheader NVARCHAR(300),
    @Heading NVARCHAR(200),
    @Body NVARCHAR(MAX),
    @ButtonText NVARCHAR(60),
    @ButtonUrl NVARCHAR(300),
    @CouponCode NVARCHAR(50),
    @CouponText NVARCHAR(300),
    @UpdatedBy NVARCHAR(320),
    @SubjectAl NVARCHAR(200) = NULL,
    @PreheaderAl NVARCHAR(300) = NULL,
    @HeadingAl NVARCHAR(200) = NULL,
    @BodyAl NVARCHAR(MAX) = NULL,
    @ButtonTextAl NVARCHAR(60) = NULL,
    @CouponTextAl NVARCHAR(300) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.MarketingEmailTemplates
    SET IsActive = @IsActive, SendTime = @SendTime, DelayValue = @DelayValue, Subject = @Subject,
        Preheader = @Preheader, Heading = @Heading, Body = @Body, ButtonText = @ButtonText,
        ButtonUrl = @ButtonUrl, CouponCode = @CouponCode, CouponText = @CouponText,
        Subject_Al = @SubjectAl, Preheader_Al = @PreheaderAl, Heading_Al = @HeadingAl, Body_Al = @BodyAl,
        ButtonText_Al = @ButtonTextAl, CouponText_Al = @CouponTextAl,
        UpdatedAt = GETDATE(), UpdatedBy = @UpdatedBy
    WHERE Code = @Code;

    SELECT @@ROWCOUNT AS Updated;
END
GO
