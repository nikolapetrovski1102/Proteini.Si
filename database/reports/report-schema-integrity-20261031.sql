/* Read-only schema integrity report. Safe to run in SSMS: it only SELECTs from catalog views and tables. */
SET NOCOUNT ON;

/* 1. Tables without a primary key. */
SELECT t.name AS TableWithoutPrimaryKey
FROM sys.tables t
WHERE t.is_ms_shipped = 0
  AND NOT EXISTS (SELECT 1 FROM sys.key_constraints k WHERE k.parent_object_id = t.object_id AND k.type = 'PK')
ORDER BY t.name;

/* 2. Every foreign key, with its delete/update rule and whether SQL Server trusts it. */
SELECT
    OBJECT_NAME(fk.parent_object_id) AS ChildTable,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ChildColumn,
    OBJECT_NAME(fk.referenced_object_id) AS ParentTable,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ParentColumn,
    fk.name AS ForeignKey,
    fk.delete_referential_action_desc AS OnDelete,
    fk.update_referential_action_desc AS OnUpdate,
    fk.is_disabled AS IsDisabled,
    fk.is_not_trusted AS IsNotTrusted
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
ORDER BY ChildTable, ChildColumn;

/* 3. Columns that look like references (…Id / …_Id) but have no foreign key. */
SELECT t.name AS TableName, c.name AS ColumnName
FROM sys.columns c
JOIN sys.tables t ON t.object_id = c.object_id
WHERE t.is_ms_shipped = 0
  AND (c.name LIKE '%[_]Id' OR c.name LIKE '%Id')
  AND c.is_identity = 0
  AND NOT EXISTS (
        SELECT 1 FROM sys.foreign_key_columns fkc
        WHERE fkc.parent_object_id = c.object_id AND fkc.parent_column_id = c.column_id)
  AND NOT EXISTS (
        SELECT 1 FROM sys.index_columns ic
        JOIN sys.indexes i ON i.object_id = ic.object_id AND i.index_id = ic.index_id AND i.is_primary_key = 1
        WHERE ic.object_id = c.object_id AND ic.column_id = c.column_id)
ORDER BY t.name, c.name;

/* 4. Foreign key columns without a supporting index (slow joins, slow parent deletes). */
SELECT OBJECT_NAME(fkc.parent_object_id) AS TableName,
       COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ColumnName,
       OBJECT_NAME(fkc.constraint_object_id) AS ForeignKey
FROM sys.foreign_key_columns fkc
WHERE fkc.constraint_column_id = 1
  AND NOT EXISTS (
        SELECT 1 FROM sys.index_columns ic
        WHERE ic.object_id = fkc.parent_object_id
          AND ic.column_id = fkc.parent_column_id
          AND ic.key_ordinal = 1)
ORDER BY TableName;

/* 5. Unique constraints/indexes and CHECK constraints that exist today. */
SELECT OBJECT_NAME(i.object_id) AS TableName, i.name AS UniqueIndex,
       STRING_AGG(COL_NAME(ic.object_id, ic.column_id), ', ') AS Columns
FROM sys.indexes i
JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
WHERE i.is_unique = 1 AND i.is_primary_key = 0 AND OBJECTPROPERTY(i.object_id, 'IsMsShipped') = 0
GROUP BY i.object_id, i.name
ORDER BY TableName;

SELECT OBJECT_NAME(parent_object_id) AS TableName, name AS CheckConstraint, definition, is_not_trusted
FROM sys.check_constraints
ORDER BY TableName;

/* 6. Specific rules the application assumes. Each query should return 0 rows / 0. */
SELECT User_Email, COUNT(*) AS DuplicateUsers
FROM [User] GROUP BY User_Email HAVING COUNT(*) > 1;

SELECT UserId, ProductId, COUNT(*) AS DuplicateFavorites
FROM FavoriteProducts GROUP BY UserId, ProductId HAVING COUNT(*) > 1;

SELECT User_Id, COUNT(*) AS DuplicateCarts
FROM ShoppingCart GROUP BY User_Id HAVING COUNT(*) > 1;

SELECT 'Products' AS TableName, COUNT(*) AS NegativeStockRows FROM Products WHERE Quantity < 0
UNION ALL
SELECT 'ProductVariants', COUNT(*) FROM ProductVariants WHERE Quantity < 0;

/* 7. Orphaned rows (child points to a parent that no longer exists). */
SELECT 'ProductVariants -> Products' AS Relation, COUNT(*) AS Orphans
FROM ProductVariants v WHERE NOT EXISTS (SELECT 1 FROM Products p WHERE p.Product_Id = v.Product_Id)
UNION ALL
SELECT 'ProductCategoryMapping -> Products', COUNT(*)
FROM ProductCategoryMapping m WHERE NOT EXISTS (SELECT 1 FROM Products p WHERE p.Product_Id = m.Product_Id)
UNION ALL
SELECT 'CartItems -> ShoppingCart', COUNT(*)
FROM CartItems ci WHERE NOT EXISTS (SELECT 1 FROM ShoppingCart sc WHERE sc.Cart_Id = ci.Cart_Id)
UNION ALL
SELECT 'CartItems -> Products', COUNT(*)
FROM CartItems ci WHERE NOT EXISTS (SELECT 1 FROM Products p WHERE p.Product_Id = ci.Product_Id)
UNION ALL
SELECT 'FavoriteProducts -> Products', COUNT(*)
FROM FavoriteProducts f WHERE NOT EXISTS (SELECT 1 FROM Products p WHERE p.Product_Id = f.ProductId)
UNION ALL
SELECT 'OrderItems -> Orders', COUNT(*)
FROM OrderItems oi WHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.Order_Id = oi.Order_Id)
UNION ALL
SELECT 'PromoCodeUsages -> PromoCodes', COUNT(*)
FROM PromoCodeUsages u WHERE NOT EXISTS (SELECT 1 FROM PromoCodes pc WHERE pc.PromoCodeId = u.PromoCodeId)
UNION ALL
SELECT 'PromoCodeUsages -> Orders', COUNT(*)
FROM PromoCodeUsages u WHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.Order_Id = u.OrderId)
UNION ALL
SELECT 'OrderFreeGifts -> Orders', COUNT(*)
FROM OrderFreeGifts g WHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.Order_Id = g.OrderId)
UNION ALL
SELECT 'FreeGifts -> Products', COUNT(*)
FROM FreeGifts g WHERE NOT EXISTS (SELECT 1 FROM Products p WHERE p.Product_Id = g.ProductId);
