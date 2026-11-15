SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Proteins <-> Creatine and Proteins <-> Pre-Workout, both ways, so a protein page recommends creatine and
-- pre-workouts in "bought together" (usp_Product_GetRelated) and creatine / pre-workout pages recommend proteins.
-- Looked up by slug so the ids may differ between databases. Safe to run more than once.
INSERT INTO dbo.CategoryPairings (Category_Id, Paired_Category_Id)
SELECT a.Category_Id, b.Category_Id
FROM dbo.ProductCategories a
INNER JOIN dbo.ProductCategories b
    ON (a.Category_Slug = N'proteins' AND b.Category_Slug IN (N'creatine', N'pre-workout'))
    OR (a.Category_Slug IN (N'creatine', N'pre-workout') AND b.Category_Slug = N'proteins')
WHERE a.Parent_Category_Id IS NULL
  AND b.Parent_Category_Id IS NULL
  AND NOT EXISTS (
        SELECT 1 FROM dbo.CategoryPairings existing
        WHERE existing.Category_Id = a.Category_Id AND existing.Paired_Category_Id = b.Category_Id);
GO
