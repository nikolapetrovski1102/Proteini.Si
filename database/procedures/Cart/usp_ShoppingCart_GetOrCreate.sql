SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ShoppingCart_GetOrCreate
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    DECLARE @CartId INT = (
        SELECT TOP 1 Cart_Id
        FROM dbo.ShoppingCart WITH (UPDLOCK, HOLDLOCK)
        WHERE User_Id = @UserId
        ORDER BY Cart_Id);

    IF @CartId IS NULL
    BEGIN
        INSERT INTO dbo.ShoppingCart (User_Id, CreatedAt, UpdatedAt)
        VALUES (@UserId, GETDATE(), GETDATE());

        SET @CartId = CAST(SCOPE_IDENTITY() AS INT);
    END

    COMMIT TRANSACTION;

    SELECT @CartId AS Cart_Id;
END
GO
