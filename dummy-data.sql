-- Dummy Data for SEAWA SOAP Stock Manager
-- Run this in Supabase SQL Editor to populate with sample data

-- ===== Insert 5 Base Materials =====

-- Material 1: Shea Butter
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, cost_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Shea Butter',
    10.5,
    'kg',
    45.00,
    'kg',
    'Natural Supplies Co.',
    'https://example.com/supplier1',
    2.0,
    0,
    NOW(),
    NOW()
);

-- Material 2: Almond Oil
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, cost_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Almond Oil',
    5.0,
    'L',
    35.00,
    'L',
    'Organic Oils Ltd',
    'https://example.com/supplier2',
    1.0,
    0,
    NOW(),
    NOW()
);

-- Material 3: Lavender Essential Oil
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, cost_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Lavender Essential Oil',
    0.5,
    'L',
    120.00,
    'L',
    'Essential Essences',
    'https://example.com/supplier3',
    0.1,
    0,
    NOW(),
    NOW()
);

-- Material 4: Coconut Oil
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, cost_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Coconut Oil',
    8.0,
    'kg',
    28.00,
    'kg',
    'Tropical Oils Inc',
    'https://example.com/supplier4',
    2.0,
    0,
    NOW(),
    NOW()
);

-- Material 5: Eucalyptus Essential Oil
INSERT INTO materials (id, name, quantity, unit, cost_per_unit, cost_unit, supplier, supplier_link, min_stock, used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Eucalyptus Essential Oil',
    0.3,
    'L',
    95.00,
    'L',
    'Essential Essences',
    'https://example.com/supplier3',
    0.1,
    0,
    NOW(),
    NOW()
);

-- ===== Insert 5 Formulas =====

-- Formula 1: Lavender Soap Bar
WITH formula1 AS (
    INSERT INTO formulas (id, name, batch_size, min_stock, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Lavender Soap Bar',
        20,
        10,
        NOW(),
        NOW()
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
    NOW()
UNION ALL
SELECT 
    (SELECT id FROM formula1),
    (SELECT id FROM almond_oil),
    200,
    'mL',
    NOW()
UNION ALL
SELECT 
    (SELECT id FROM formula1),
    (SELECT id FROM lavender_oil),
    15,
    'mL',
    NOW();

-- Formula 2: Eucalyptus Mint Soap
WITH formula2 AS (
    INSERT INTO formulas (id, name, batch_size, min_stock, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Eucalyptus Mint Soap',
        15,
        8,
        NOW(),
        NOW()
    )
    RETURNING id
),
shea_butter AS (SELECT id FROM materials WHERE name = 'Shea Butter' LIMIT 1),
coconut_oil AS (SELECT id FROM materials WHERE name = 'Coconut Oil' LIMIT 1),
eucalyptus_oil AS (SELECT id FROM materials WHERE name = 'Eucalyptus Essential Oil' LIMIT 1)
INSERT INTO formula_materials (formula_id, material_id, quantity, unit, created_at)
SELECT 
    (SELECT id FROM formula2),
    (SELECT id FROM shea_butter),
    1200,
    'g',
    NOW()
UNION ALL
SELECT 
    (SELECT id FROM formula2),
    (SELECT id FROM coconut_oil),
    800,
    'g',
    NOW()
UNION ALL
SELECT 
    (SELECT id FROM formula2),
    (SELECT id FROM eucalyptus_oil),
    12,
    'mL',
    NOW();

-- Formula 3: Classic Almond Soap
WITH formula3 AS (
    INSERT INTO formulas (id, name, batch_size, min_stock, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Classic Almond Soap',
        25,
        12,
        NOW(),
        NOW()
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
    NOW()
UNION ALL
SELECT 
    (SELECT id FROM formula3),
    (SELECT id FROM almond_oil),
    300,
    'mL',
    NOW()
UNION ALL
SELECT 
    (SELECT id FROM formula3),
    (SELECT id FROM coconut_oil),
    500,
    'g',
    NOW();

-- Formula 4: Pure Lavender Soap
WITH formula4 AS (
    INSERT INTO formulas (id, name, batch_size, min_stock, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Pure Lavender Soap',
        18,
        9,
        NOW(),
        NOW()
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
    NOW()
UNION ALL
SELECT 
    (SELECT id FROM formula4),
    (SELECT id FROM lavender_oil),
    20,
    'mL',
    NOW();

-- Formula 5: Coconut Delight Soap
WITH formula5 AS (
    INSERT INTO formulas (id, name, batch_size, min_stock, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Coconut Delight Soap',
        22,
        11,
        NOW(),
        NOW()
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
    NOW()
UNION ALL
SELECT 
    (SELECT id FROM formula5),
    (SELECT id FROM coconut_oil),
    1000,
    'g',
    NOW()
UNION ALL
SELECT 
    (SELECT id FROM formula5),
    (SELECT id FROM almond_oil),
    150,
    'mL',
    NOW();

-- ===== Verification Query =====
-- Run this to verify the data was inserted correctly

-- SELECT 
--     m.name as material_name,
--     m.quantity,
--     m.unit,
--     m.cost_per_unit,
--     m.cost_unit
-- FROM materials m
-- ORDER BY m.name;

-- SELECT 
--     f.name as formula_name,
--     f.batch_size,
--     f.min_stock,
--     COUNT(fm.id) as material_count
-- FROM formulas f
-- LEFT JOIN formula_materials fm ON f.id = fm.formula_id
-- GROUP BY f.id, f.name, f.batch_size, f.min_stock
-- ORDER BY f.name;

