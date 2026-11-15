SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Remembers the site language a customer last used, so emails sent later (marketing) match it.
CREATE OR ALTER PROCEDURE dbo.usp_User_SetLanguage
    @UserId INT,
    @Language NVARCHAR(2)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.[User]
    SET User_Language = @Language
    WHERE User_Id = @UserId
      AND ISNULL(User_Language, N'') <> @Language;
END
GO
