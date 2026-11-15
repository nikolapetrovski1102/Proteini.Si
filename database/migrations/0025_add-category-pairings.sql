SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Categories that go together. On the page of a product from Category_Id, products from Paired_Category_Id lead the
-- "bought together" row (usp_Product_GetRelated) and earn extra points in the home page "Because you ordered" row
-- (usp_Product_GetForCustomer). A top category covers its subcategories. One row per direction.
-- usp_ProductCategory_Delete removes a deleted category's pairings.
IF OBJECT_ID(N'dbo.CategoryPairings', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CategoryPairings
    (
        Category_Id        INT NOT NULL,
        Paired_Category_Id INT NOT NULL,
        CONSTRAINT PK_CategoryPairings PRIMARY KEY (Category_Id, Paired_Category_Id),
        CONSTRAINT FK_CategoryPairings_Category FOREIGN KEY (Category_Id)
            REFERENCES dbo.ProductCategories (Category_Id),
        CONSTRAINT FK_CategoryPairings_Paired FOREIGN KEY (Paired_Category_Id)
            REFERENCES dbo.ProductCategories (Category_Id),
        CONSTRAINT CK_CategoryPairings_NotSelf CHECK (Category_Id <> Paired_Category_Id)
    );
END
GO

-- Creatine <-> Pre-Workout, both ways (looked up by slug so the ids may differ between databases).
INSERT INTO dbo.CategoryPairings (Category_Id, Paired_Category_Id)
SELECT a.Category_Id, b.Category_Id
FROM dbo.ProductCategories a
INNER JOIN dbo.ProductCategories b
    ON (a.Category_Slug = N'creatine' AND b.Category_Slug = N'pre-workout')
    OR (a.Category_Slug = N'pre-workout' AND b.Category_Slug = N'creatine')
WHERE a.Parent_Category_Id IS NULL
  AND b.Parent_Category_Id IS NULL
  AND NOT EXISTS (
        SELECT 1 FROM dbo.CategoryPairings existing
        WHERE existing.Category_Id = a.Category_Id AND existing.Paired_Category_Id = b.Category_Id);
GO
