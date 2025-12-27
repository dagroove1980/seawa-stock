// ===== Supabase Client Setup =====

// Initialize Supabase client
// These will be set via environment variables in Vercel
const SUPABASE_URL = window.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';

console.log('Supabase initialization check:');
console.log('SUPABASE_URL:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : 'EMPTY');
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 30)}...` : 'EMPTY');
console.log('window.SUPABASE_URL type:', typeof window.SUPABASE_URL);
console.log('window.SUPABASE_URL value:', window.SUPABASE_URL);

let supabaseClient = null;

// Check if placeholders weren't replaced (build issue)
const hasPlaceholders = SUPABASE_URL.includes('%VITE_') || SUPABASE_ANON_KEY.includes('%VITE_');

// Initialize Supabase if credentials are available
if (SUPABASE_URL && SUPABASE_ANON_KEY && !hasPlaceholders) {
    // Load Supabase client library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.onload = function() {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized');
        
        // Trigger refresh cache after Supabase is ready
        if (window.refreshCache) {
            window.refreshCache().then(() => {
                // Reload materials if on materials page
                if (typeof loadMaterials === 'function') {
                    loadMaterials();
                }
                // Reload formulas if on formulas page
                if (typeof loadFormulas === 'function') {
                    loadFormulas();
                    loadMaterialOptions();
                }
                // Reload products if on products page
                if (typeof loadProducts === 'function') {
                    loadProducts();
                    loadFormulaOptions();
                    updateStats();
                }
            });
        }
        
        // Migrate localStorage data to Supabase on first load
        migrateLocalStorageToSupabase();
    };
    document.head.appendChild(script);
} else {
    if (hasPlaceholders) {
        console.error('ERROR: Environment variable placeholders not replaced!');
        console.error('This means the build script did not run correctly.');
        console.error('SUPABASE_URL:', SUPABASE_URL);
        console.error('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    } else {
        console.warn('Supabase credentials not found. Falling back to localStorage.');
        console.warn('SUPABASE_URL:', SUPABASE_URL || 'empty');
        console.warn('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'set' : 'empty');
    }
}

// ===== Storage Functions with Supabase Fallback =====

async function getStorage(key) {
    if (supabaseClient) {
        try {
            const tableName = getTableName(key);
            console.log(`Fetching ${key} from Supabase table: ${tableName}`);
            
            const { data, error } = await supabaseClient
                .from(tableName)
                .select('*')
                .order('created_at', { ascending: true });
            
            if (error) {
                console.error('Supabase error:', error);
                return getLocalStorage(key);
            }
            
            console.log(`Fetched ${data ? data.length : 0} records from ${tableName}`);
            const transformed = await transformFromSupabase(data || [], key);
            console.log(`Transformed to ${transformed.length} items`);
            return transformed;
        } catch (error) {
            console.error('Error fetching from Supabase:', error);
            return getLocalStorage(key);
        }
    }
    console.log(`Supabase client not available, using localStorage for ${key}`);
    return getLocalStorage(key);
}

async function setStorage(key, data) {
    if (supabaseClient) {
        try {
            const tableName = getTableName(key);
            
            if (key === 'seawa_formulas') {
                // Handle formulas specially due to many-to-many relationship
                await saveFormulasToSupabase(data);
            } else {
                const transformed = transformToSupabase(data, key);
                
                // Delete all existing records and insert new ones
                await supabaseClient.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');
                
                if (transformed.length > 0) {
                    const { error } = await supabaseClient
                        .from(tableName)
                        .insert(transformed);
                    
                    if (error) {
                        console.error('Supabase insert error:', error);
                        setLocalStorage(key, data);
                    }
                }
            }
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            setLocalStorage(key, data);
        }
    } else {
        setLocalStorage(key, data);
    }
}

async function saveFormulasToSupabase(formulas) {
    // Delete all formula materials first
    await supabaseClient.from('formula_materials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Delete all formulas
    await supabaseClient.from('formulas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert formulas and their materials
    for (const formula of formulas) {
        const { data: insertedFormula, error: formulaError } = await supabaseClient
            .from('formulas')
            .insert({
                id: formula.id || undefined,
                name: formula.name,
                batch_size: formula.batchSize,
                min_stock: formula.minStock || null
            })
            .select()
            .single();
        
        if (formulaError) {
            console.error('Error inserting formula:', formulaError);
            continue;
        }
        
        // Insert formula materials
        if (formula.materials && formula.materials.length > 0) {
            const formulaMaterials = formula.materials.map(m => ({
                formula_id: insertedFormula.id,
                material_id: m.materialId,
                quantity: m.quantity,
                unit: m.unit || null
            }));
            
            const { error: materialsError } = await supabaseClient
                .from('formula_materials')
                .insert(formulaMaterials);
            
            if (materialsError) {
                console.error('Error inserting formula materials:', materialsError);
            }
        }
    }
}

// ===== Helper Functions =====

function getTableName(key) {
    const mapping = {
        'seawa_materials': 'materials',
        'seawa_formulas': 'formulas',
        'seawa_products': 'products'
    };
    return mapping[key] || key;
}

function transformToSupabase(data, key) {
    if (key === 'seawa_materials') {
        return data.map(item => ({
            id: item.id || undefined,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit || 'kg',
            cost_per_unit: item.costPerUnit,
            supplier: item.supplier || null,
            supplier_link: item.supplierLink || null,
            min_stock: item.minStock || null,
            used: item.used || 0
        }));
    } else if (key === 'seawa_formulas') {
        return data.map(item => ({
            id: item.id || undefined,
            name: item.name,
            batch_size: item.batchSize,
            min_stock: item.minStock || null
        }));
    } else if (key === 'seawa_products') {
        return data.map(item => ({
            id: item.id || undefined,
            formula_id: item.formulaId,
            produced: item.produced || 0,
            sold: item.sold || 0,
            stock: item.stock || 0,
            production_date: item.productionDate
        }));
    }
    return data;
}

async function transformFromSupabase(data, key) {
    if (key === 'seawa_materials') {
        return data.map(item => ({
            id: item.id,
            name: item.name,
            quantity: parseFloat(item.quantity),
            unit: item.unit,
            costPerUnit: parseFloat(item.cost_per_unit),
            costUnit: item.cost_unit || item.unit,
            supplier: item.supplier,
            supplierLink: item.supplier_link,
            minStock: item.min_stock ? parseFloat(item.min_stock) : null,
            used: item.used ? parseFloat(item.used) : 0,
            createdAt: item.created_at,
            updatedAt: item.updated_at
        }));
    } else if (key === 'seawa_formulas') {
        const formulas = await Promise.all(data.map(async (item) => {
            // Fetch formula materials
            const { data: materials } = await supabaseClient
                .from('formula_materials')
                .select('material_id, quantity, unit')
                .eq('formula_id', item.id);
            
            return {
                id: item.id,
                name: item.name,
                batchSize: item.batch_size,
                minStock: item.min_stock,
                materials: (materials || []).map(m => ({
                    materialId: m.material_id,
                    quantity: parseFloat(m.quantity),
                    unit: m.unit || null
                })),
                createdAt: item.created_at,
                updatedAt: item.updated_at
            };
        }));
        return formulas;
    } else if (key === 'seawa_products') {
        return data.map(item => ({
            id: item.id,
            formulaId: item.formula_id,
            produced: item.produced,
            sold: item.sold,
            stock: item.stock,
            productionDate: item.production_date,
            createdAt: item.created_at,
            updatedAt: item.updated_at
        }));
    }
    return data;
}

// ===== LocalStorage Fallback =====

function getLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ===== Migration Function =====

async function migrateLocalStorageToSupabase() {
    if (!supabaseClient) return;
    
    // Check if migration already done
    if (localStorage.getItem('supabase_migrated') === 'true') return;
    
    try {
        const materials = getLocalStorage('seawa_materials');
        const formulas = getLocalStorage('seawa_formulas');
        const products = getLocalStorage('seawa_products');
        
        if (materials.length > 0 || formulas.length > 0 || products.length > 0) {
            console.log('Migrating localStorage data to Supabase...');
            
            // Migrate materials
            if (materials.length > 0) {
                const transformed = transformToSupabase(materials, 'seawa_materials');
                await supabaseClient.from('materials').insert(transformed);
            }
            
            // Migrate formulas
            if (formulas.length > 0) {
                for (const formula of formulas) {
                    const { data: insertedFormula } = await supabaseClient
                        .from('formulas')
                        .insert({
                            id: formula.id,
                            name: formula.name,
                            batch_size: formula.batchSize,
                            min_stock: formula.minStock || null
                        })
                        .select()
                        .single();
                    
                    // Insert formula materials
                    if (formula.materials && formula.materials.length > 0) {
                        const formulaMaterials = formula.materials.map(m => ({
                            formula_id: insertedFormula.id,
                            material_id: m.materialId,
                            quantity: m.quantity
                        }));
                        await supabaseClient.from('formula_materials').insert(formulaMaterials);
                    }
                }
            }
            
            // Migrate products
            if (products.length > 0) {
                const transformed = transformToSupabase(products, 'seawa_products');
                await supabaseClient.from('products').insert(transformed);
            }
            
            localStorage.setItem('supabase_migrated', 'true');
            console.log('Migration completed successfully!');
            showAlert('success', 'Data Migrated', 'Your local data has been migrated to the cloud.');
        }
    } catch (error) {
        console.error('Migration error:', error);
    }
}

// ===== Override Storage Functions =====

// Make storage functions async-aware
const originalGetMaterials = window.getMaterials;
const originalSaveMaterials = window.saveMaterials;
const originalGetFormulas = window.getFormulas;
const originalSaveFormulas = window.saveFormulas;
const originalGetProducts = window.getProducts;
const originalSaveProducts = window.saveProducts;

// Export for use in other files
window.supabaseStorage = {
    getStorage,
    setStorage,
    migrateLocalStorageToSupabase
};

