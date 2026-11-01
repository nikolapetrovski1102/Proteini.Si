SET NOCOUNT ON;

-- Read-only data-quality report for the catalogue team. Values are deliberately
-- not guessed: the real serving and package weights must come from each label.
SELECT
    p.Product_Id,
    p.Name,
    p.GPerServing,
    p.Servings,
    p.GNutrition,
    p.HasVariants,
    COUNT(pv.Variant_Id) AS ActiveVariantCount,
    SUM(CASE WHEN pkg.Weight_Grams IS NULL OR pkg.Weight_Grams <= 0 THEN 1 ELSE 0 END)
        AS VariantsMissingPackageWeight
FROM Products p
LEFT JOIN ProductVariants pv
    ON pv.Product_Id = p.Product_Id
   AND pv.IsActive = 1
LEFT JOIN Packaging pkg
    ON pkg.Packaging_Id = pv.Packaging_Id
WHERE
    ISNULL(p.GPerServing, 0) <= 0
    OR ISNULL(p.Servings, 0) <= 0
    OR (p.HasVariants = 1 AND (pkg.Weight_Grams IS NULL OR pkg.Weight_Grams <= 0))
GROUP BY
    p.Product_Id,
    p.Name,
    p.GPerServing,
    p.Servings,
    p.GNutrition,
    p.HasVariants
ORDER BY p.Name, p.Product_Id;
