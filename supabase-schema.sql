-- Supabase Database Schema for SEAWA SOAP Stock Manager

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'kg',
    cost_per_unit DECIMAL(10, 2) NOT NULL,
    supplier TEXT,
    supplier_link TEXT,
    min_stock DECIMAL(10, 2),
    used DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Formulas table
CREATE TABLE IF NOT EXISTS formulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    batch_size INTEGER NOT NULL,
    min_stock INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Formula materials (junction table for many-to-many relationship)
CREATE TABLE IF NOT EXISTS formula_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    formula_id UUID NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) NOT NULL,
    unit TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(formula_id, material_id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    formula_id UUID NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
    produced INTEGER NOT NULL DEFAULT 0,
    sold INTEGER NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    production_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_formula_materials_formula_id ON formula_materials(formula_id);
CREATE INDEX IF NOT EXISTS idx_formula_materials_material_id ON formula_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_products_formula_id ON products(formula_id);
CREATE INDEX IF NOT EXISTS idx_products_production_date ON products(production_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_formulas_updated_at BEFORE UPDATE ON formulas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users
-- For now, we'll allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations" ON materials FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON formulas FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON formula_materials FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);

