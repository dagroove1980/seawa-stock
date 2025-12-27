-- Dummy Data for SEAWA SOAP Stock Manager
-- Run this in Supabase SQL Editor to populate with sample data
-- This script creates a complete, realistic dataset for testing

-- ===== Clear existing data (optional - comment out if you want to keep existing data) =====
-- To clear all data, use the clear-all-data.sql file or uncomment below:
-- DELETE FROM products;
-- DELETE FROM formula_materials;
-- DELETE FROM formulas;
-- DELETE FROM materials;

-- ===== Insert 10 Base Materials =====

-- Material 1: Shea Butter
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Shea Butter',
    12.5,
    'kg',
    45.00,
    'Natural Supplies Co.',
    'https://example.com/supplier1',
    2.0,
    2.0,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '5 days'
);

-- Material 2: Almond Oil
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Almond Oil',
    6.5,
    'L',
    35.00,
    'Organic Oils Ltd',
    'https://example.com/supplier2',
    1.0,
    1.5,
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '3 days'
);

-- Material 3: Lavender Essential Oil
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Lavender Essential Oil',
    0.6,
    'L',
    120.00,
    'Essential Essences',
    'https://example.com/supplier3',
    0.1,
    0.1,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '2 days'
);

-- Material 4: Coconut Oil
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Coconut Oil',
    10.0,
    'kg',
    28.00,
    'Tropical Oils Inc',
    'https://example.com/supplier4',
    2.0,
    2.0,
    NOW() - INTERVAL '28 days',
    NOW() - INTERVAL '4 days'
);

-- Material 5: Eucalyptus Essential Oil
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Eucalyptus Essential Oil',
    0.4,
    'L',
    95.00,
    'Essential Essences',
    'https://example.com/supplier3',
    0.1,
    0.1,
    NOW() - INTERVAL '22 days',
    NOW() - INTERVAL '1 day'
);

-- Material 6: Olive Oil
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Olive Oil',
    8.0,
    'L',
    32.00,
    'Mediterranean Oils',
    'https://example.com/supplier5',
    1.5,
    0.5,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '6 days'
);

-- Material 7: Castile Soap Base
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Castile Soap Base',
    15.0,
    'kg',
    18.00,
    'Soap Base Supplies',
    'https://example.com/supplier6',
    3.0,
    5.0,
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '7 days'
);

-- Material 8: Peppermint Essential Oil
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Peppermint Essential Oil',
    0.3,
    'L',
    110.00,
    'Essential Essences',
    'https://example.com/supplier3',
    0.1,
    0.05,
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '2 days'
);

-- Material 9: Jojoba Oil
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Jojoba Oil',
    2.5,
    'L',
    85.00,
    'Organic Oils Ltd',
    'https://example.com/supplier2',
    0.5,
    0.3,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '1 day'
);

-- Material 10: Rose Essential Oil
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Rose Essential Oil',
    0.2,
    'L',
    250.00,
    'Essential Essences',
    'https://example.com/supplier3',
    0.05,
    0.02,
    NOW() - INTERVAL '8 days',
    NOW()
);

-- ===== Insert 7 Formulas =====

-- Formula 1: Lavender Soap Bar
WITH formula1 AS (
    INSERT INTO formulas (id, name, batch_size, min_stock, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Lavender Soap Bar',
        20,
        10,
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '5 days'
    )
    RETURNING id
),
shea_butter AS (SELECT id FROM materials WHERE name = 'Shea Butter' LIMIT 1),
almond_oil AS (SELECT id FROM materials WHERE name = 'Almond Oil' LIMIT 1),
lavender_oil AS (SELECT id FROM materials WHERE name = 'Lavender Essential Oil' LIMIT 1)
INSERT INTO formula_materials (formula_id, material_id, quantity, unit, created_at)
SELECT 
    (SELECT id FROM formula1),
    (SELECT id FROM shea_butter),
    1500,
    'g',
    NOW() - INTERVAL '25 days'
UNION ALL
SELECT 
    (SELECT id FROM formula1),
    (SELECT id FROM almond_oil),
    200,
    'mL',
    NOW() - INTERVAL '25 days'
UNION ALL
SELECT 
    (SELECT id FROM formula1),
    (SELECT id FROM lavender_oil),
    15,
    'mL',
    NOW() - INTERVAL '25 days';

-- Formula 2: Eucalyptus Mint Soap
WITH formula2 AS (
    INSERT INTO formulas (id, name, batch_size, min_stock, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Eucalyptus Mint Soap',
        15,
        8,
        NOW() - INTERVAL '22 days',
        NOW() - INTERVAL '3 days'
    )
    RETURNING id
),
shea_butter AS (SELECT id FROM materials WHERE name = 'Shea Butter' LIMIT 1),
coconut_oil AS (SELECT id FROM materials WHERE name = 'Coconut Oil' LIMIT 1),
eucalyptus_oil AS (SELECT id FROM materials WHERE name = 'Eucalyptus Essential Oil' LIMIT 1),
peppermint_oil AS (SELECT id FROM materials WHERE name = 'Peppermint Essential Oil' LIMIT 1)
INSERT INTO formula_materials (formula_id, material_id, quantity, unit, created_at)
SELECT 
    (SELECT id FROM formula2),
    (SELECT id FROM shea_butter),
    1200,
    'g',
    NOW() - INTERVAL '22 days'
UNION ALL
SELECT 
    (SELECT id FROM formula2),
    (SELECT id FROM coconut_oil),
    800,
    'g',
    NOW() - INTERVAL '22 days'
UNION ALL
SELECT 
    (SELECT id FROM formula2),
    (SELECT id FROM eucalyptus_oil),
    10,
    'mL',
    NOW() - INTERVAL '22 days'
UNION ALL
SELECT 
    (SELECT id FROM formula2),
    (SELECT id FROM peppermint_oil),
    5,
    'mL',
    NOW() - INTERVAL '22 days';

-- Formula 3: Classic Almond Soap
WITH formula3 AS (
    INSERT INTO formulas (id, name, batch_size, min_stock, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Classic Almond Soap',
        25,
        12,
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '7 days'
    )
    RETURNING id
),
shea_butter AS (SELECT id FROM materials WHERE name = 'Shea Butter' LIMIT 1),
almond_oil AS (SELECT id FROM materials WHERE name = 'Almond Oil' LIMIT 1),
coconut_oil AS (SELECT id FROM materials WHERE name = 'Coconut Oil' LIMIT 1)
INSERT INTO formula_materials (formula_id, material_id, quantity, unit, created_at)
SELECT 
    (SELECT id FROM formula3),
    (SELECT id FROM shea_butter),
    1800,
    'g',
    NOW() - INTERVAL '20 days'
UNION ALL
SELECT 
    (SELECT id FROM formula3),
    (SELECT id FROM almond_oil),
    300,
    'mL',
    NOW() - INTERVAL '20 days'
UNION ALL
SELECT 
    (SELECT id FROM formula3),
    (SELECT id FROM coconut_oil),
    500,
    'g',
    NOW() - INTERVAL '20 days';

-- Formula 4: Pure Lavender Soap
WITH formula4 AS (
    INSERT INTO formulas (id, name, batch_size, min_stock, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Pure Lavender Soap',
        18,
        9,
        NOW() - INTERVAL '18 days',
        NOW() - INTERVAL '1 day'
    )
    RETURNING id
),
shea_butter AS (SELECT id FROM materials WHERE name = 'Shea Butter' LIMIT 1),
lavender_oil AS (SELECT id FROM materials WHERE name = 'Lavender Essential Oil' LIMIT 1)
INSERT INTO formula_materials (formula_id, material_id, quantity, unit, created_at)
SELECT 
    (SELECT id FROM formula4),
    (SELECT id FROM shea_butter),
    2000,
    'g',
    NOW() - INTERVAL '18 days'
UNION ALL
SELECT 
    (SELECT id FROM formula4),
    (SELECT id FROM lavender_oil),
    20,
    'mL',
    NOW() - INTERVAL '18 days';

-- Formula 5: Coconut Delight Soap
WITH formula5 AS (
    INSERT INTO formulas (id, name, batch_size, min_stock, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Coconut Delight Soap',
        22,
        11,
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '4 days'
    )
    RETURNING id
),
shea_butter AS (SELECT id FROM materials WHERE name = 'Shea Butter' LIMIT 1),
coconut_oil AS (SELECT id FROM materials WHERE name = 'Coconut Oil' LIMIT 1),
almond_oil AS (SELECT id FROM materials WHERE name = 'Almond Oil' LIMIT 1)
INSERT INTO formula_materials (formula_id, material_id, quantity, unit, created_at)
SELECT 
    (SELECT id FROM formula5),
    (SELECT id FROM shea_butter),
    1600,
    'g',
    NOW() - INTERVAL '15 days'
UNION ALL
SELECT 
    (SELECT id FROM formula5),
    (SELECT id FROM coconut_oil),
    1000,
    'g',
    NOW() - INTERVAL '15 days'
UNION ALL
SELECT 
    (SELECT id FROM formula5),
    (SELECT id FROM almond_oil),
    150,
    'mL',
    NOW() - INTERVAL '15 days';

-- Formula 6: Mediterranean Olive Soap
WITH formula6 AS (
    INSERT INTO formulas (id, name, batch_size, min_stock, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Mediterranean Olive Soap',
        20,
        10,
        NOW() - INTERVAL '12 days',
        NOW() - INTERVAL '2 days'
    )
    RETURNING id
),
olive_oil AS (SELECT id FROM materials WHERE name = 'Olive Oil' LIMIT 1),
castile_base AS (SELECT id FROM materials WHERE name = 'Castile Soap Base' LIMIT 1),
jojoba_oil AS (SELECT id FROM materials WHERE name = 'Jojoba Oil' LIMIT 1)
INSERT INTO formula_materials (formula_id, material_id, quantity, unit, created_at)
SELECT 
    (SELECT id FROM formula6),
    (SELECT id FROM olive_oil),
    500,
    'mL',
    NOW() - INTERVAL '12 days'
UNION ALL
SELECT 
    (SELECT id FROM formula6),
    (SELECT id FROM castile_base),
    1500,
    'g',
    NOW() - INTERVAL '12 days'
UNION ALL
SELECT 
    (SELECT id FROM formula6),
    (SELECT id FROM jojoba_oil),
    50,
    'mL',
    NOW() - INTERVAL '12 days';

-- Formula 7: Rose Luxury Soap
WITH formula7 AS (
    INSERT INTO formulas (id, name, batch_size, min_stock, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Rose Luxury Soap',
        15,
        7,
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '1 day'
    )
    RETURNING id
),
shea_butter AS (SELECT id FROM materials WHERE name = 'Shea Butter' LIMIT 1),
almond_oil AS (SELECT id FROM materials WHERE name = 'Almond Oil' LIMIT 1),
rose_oil AS (SELECT id FROM materials WHERE name = 'Rose Essential Oil' LIMIT 1),
jojoba_oil AS (SELECT id FROM materials WHERE name = 'Jojoba Oil' LIMIT 1)
INSERT INTO formula_materials (formula_id, material_id, quantity, unit, created_at)
SELECT 
    (SELECT id FROM formula7),
    (SELECT id FROM shea_butter),
    1400,
    'g',
    NOW() - INTERVAL '10 days'
UNION ALL
SELECT 
    (SELECT id FROM formula7),
    (SELECT id FROM almond_oil),
    250,
    'mL',
    NOW() - INTERVAL '10 days'
UNION ALL
SELECT 
    (SELECT id FROM formula7),
    (SELECT id FROM rose_oil),
    8,
    'mL',
    NOW() - INTERVAL '10 days'
UNION ALL
SELECT 
    (SELECT id FROM formula7),
    (SELECT id FROM jojoba_oil),
    100,
    'mL',
    NOW() - INTERVAL '10 days';

-- ===== Insert Sample Products (Production Batches) =====

-- Product 1: Lavender Soap Bar Batch 1
INSERT INTO products (formula_id, produced, sold, stock, production_date, created_at, updated_at)
SELECT 
    f.id,
    20,  -- Produced 20 bars
    8,   -- Sold 8 bars
    12,  -- Stock: 20 - 8 = 12 bars
    CURRENT_DATE - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '2 days'
FROM formulas f
WHERE f.name = 'Lavender Soap Bar'
LIMIT 1;

-- Product 2: Lavender Soap Bar Batch 2
INSERT INTO products (formula_id, produced, sold, stock, production_date, created_at, updated_at)
SELECT 
    f.id,
    20,  -- Produced 20 bars
    12,  -- Sold 12 bars
    8,   -- Stock: 20 - 12 = 8 bars
    CURRENT_DATE - INTERVAL '12 days',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '8 days'
FROM formulas f
WHERE f.name = 'Lavender Soap Bar'
LIMIT 1;

-- Product 3: Eucalyptus Mint Soap Batch
INSERT INTO products (formula_id, produced, sold, stock, production_date, created_at, updated_at)
SELECT 
    f.id,
    15,  -- Produced 15 bars
    5,   -- Sold 5 bars
    10,  -- Stock: 15 - 5 = 10 bars
    CURRENT_DATE - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day'
FROM formulas f
WHERE f.name = 'Eucalyptus Mint Soap'
LIMIT 1;

-- Product 4: Classic Almond Soap Batch 1
INSERT INTO products (formula_id, produced, sold, stock, production_date, created_at, updated_at)
SELECT 
    f.id,
    25,  -- Produced 25 bars
    15,  -- Sold 15 bars
    10,  -- Stock: 25 - 15 = 10 bars
    CURRENT_DATE - INTERVAL '7 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '4 days'
FROM formulas f
WHERE f.name = 'Classic Almond Soap'
LIMIT 1;

-- Product 5: Classic Almond Soap Batch 2
INSERT INTO products (formula_id, produced, sold, stock, production_date, created_at, updated_at)
SELECT 
    f.id,
    25,  -- Produced 25 bars
    25,  -- Sold 25 bars (sold out!)
    0,   -- Stock: 0 bars
    CURRENT_DATE - INTERVAL '14 days',
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '10 days'
FROM formulas f
WHERE f.name = 'Classic Almond Soap'
LIMIT 1;

-- Product 6: Pure Lavender Soap Batch
INSERT INTO products (formula_id, produced, sold, stock, production_date, created_at, updated_at)
SELECT 
    f.id,
    18,  -- Produced 18 bars
    0,   -- Not sold yet
    18,  -- Stock: 18 bars
    CURRENT_DATE - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
FROM formulas f
WHERE f.name = 'Pure Lavender Soap'
LIMIT 1;

-- Product 7: Coconut Delight Soap Batch 1
INSERT INTO products (formula_id, produced, sold, stock, production_date, created_at, updated_at)
SELECT 
    f.id,
    22,  -- Produced 22 bars
    12,  -- Sold 12 bars
    10,  -- Stock: 22 - 12 = 10 bars
    CURRENT_DATE - INTERVAL '10 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '6 days'
FROM formulas f
WHERE f.name = 'Coconut Delight Soap'
LIMIT 1;

-- Product 8: Coconut Delight Soap Batch 2
INSERT INTO products (formula_id, produced, sold, stock, production_date, created_at, updated_at)
SELECT 
    f.id,
    22,  -- Produced 22 bars
    8,   -- Sold 8 bars
    14,  -- Stock: 22 - 8 = 14 bars
    CURRENT_DATE - INTERVAL '18 days',
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '14 days'
FROM formulas f
WHERE f.name = 'Coconut Delight Soap'
LIMIT 1;

-- Product 9: Mediterranean Olive Soap Batch
INSERT INTO products (formula_id, produced, sold, stock, production_date, created_at, updated_at)
SELECT 
    f.id,
    20,  -- Produced 20 bars
    6,   -- Sold 6 bars
    14,  -- Stock: 20 - 6 = 14 bars
    CURRENT_DATE - INTERVAL '6 days',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '3 days'
FROM formulas f
WHERE f.name = 'Mediterranean Olive Soap'
LIMIT 1;

-- Product 10: Rose Luxury Soap Batch
INSERT INTO products (formula_id, produced, sold, stock, production_date, created_at, updated_at)
SELECT 
    f.id,
    15,  -- Produced 15 bars
    3,   -- Sold 3 bars
    12,  -- Stock: 15 - 3 = 12 bars
    CURRENT_DATE - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    NOW()
FROM formulas f
WHERE f.name = 'Rose Luxury Soap'
LIMIT 1;

-- ===== Verification Queries =====
-- Uncomment these to verify the data was inserted correctly

-- Check Materials
-- SELECT 
--     m.name as material_name,
--     m.quantity,
--     m.unit,
--     m.cost_per_unit,
--     m.supplier,
--     m.min_stock,
--     m.used
-- FROM materials m
-- ORDER BY m.name;

-- Check Formulas with Material Counts
-- SELECT 
--     f.name as formula_name,
--     f.batch_size,
--     f.min_stock,
--     COUNT(fm.id) as material_count
-- FROM formulas f
-- LEFT JOIN formula_materials fm ON f.id = fm.formula_id
-- GROUP BY f.id, f.name, f.batch_size, f.min_stock
-- ORDER BY f.name;

-- Check Formula Materials Details
-- SELECT 
--     f.name as formula_name,
--     m.name as material_name,
--     fm.quantity,
--     fm.unit
-- FROM formula_materials fm
-- JOIN formulas f ON fm.formula_id = f.id
-- JOIN materials m ON fm.material_id = m.id
-- ORDER BY f.name, m.name;

-- Check Products
-- SELECT 
--     p.id,
--     f.name as formula_name,
--     p.produced,
--     p.sold,
--     p.stock,
--     p.production_date,
--     CASE 
--         WHEN p.stock = 0 THEN 'Out of Stock'
--         WHEN p.stock <= f.min_stock THEN 'Low Stock'
--         ELSE 'In Stock'
--     END as status
-- FROM products p
-- JOIN formulas f ON p.formula_id = f.id
-- ORDER BY p.production_date DESC;

-- Summary Statistics
-- SELECT 
--     'Materials' as table_name,
--     COUNT(*) as total_records
-- FROM materials
-- UNION ALL
-- SELECT 
--     'Formulas' as table_name,
--     COUNT(*) as total_records
-- FROM formulas
-- UNION ALL
-- SELECT 
--     'Formula Materials' as table_name,
--     COUNT(*) as total_records
-- FROM formula_materials
-- UNION ALL
-- SELECT 
--     'Products' as table_name,
--     COUNT(*) as total_records
-- FROM products;
