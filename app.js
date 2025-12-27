// ===== Core Application Logic =====

// Storage keys
const STORAGE_KEYS = {
    MATERIALS: 'seawa_materials',
    FORMULAS: 'seawa_formulas',
    PRODUCTS: 'seawa_products'
};

// ===== Storage Functions =====
// These will use Supabase if available, otherwise fall back to localStorage
async function getStorage(key) {
    if (window.supabaseStorage && window.supabaseStorage.getStorage) {
        return await window.supabaseStorage.getStorage(key);
    }
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

async function setStorage(key, data) {
    if (window.supabaseStorage && window.supabaseStorage.setStorage) {
        await window.supabaseStorage.setStorage(key, data);
    } else {
        localStorage.setItem(key, JSON.stringify(data));
    }
}

// Synchronous wrappers for backward compatibility (will use cached data)
let storageCache = {
    materials: [],
    formulas: [],
    products: []
};

async function refreshCache() {
    try {
        storageCache.materials = await getStorage(STORAGE_KEYS.MATERIALS);
        storageCache.formulas = await getStorage(STORAGE_KEYS.FORMULAS);
        storageCache.products = await getStorage(STORAGE_KEYS.PRODUCTS);
        console.log('Cache refreshed:', {
            materials: storageCache.materials.length,
            formulas: storageCache.formulas.length,
            products: storageCache.products.length
        });
    } catch (error) {
        console.error('Error refreshing cache:', error);
    }
}

// Make refreshCache available globally
window.refreshCache = refreshCache;

function getMaterials() {
    return storageCache.materials || [];
}

async function saveMaterials(materials) {
    storageCache.materials = materials;
    await setStorage(STORAGE_KEYS.MATERIALS, materials);
    // Refresh cache after save to ensure consistency
    await refreshCache();
}

function getFormulas() {
    return storageCache.formulas || [];
}

async function saveFormulas(formulas) {
    storageCache.formulas = formulas;
    await setStorage(STORAGE_KEYS.FORMULAS, formulas);
    // Refresh cache after save to ensure consistency
    await refreshCache();
}

function getProducts() {
    return storageCache.products || [];
}

async function saveProducts(products) {
    storageCache.products = products;
    await setStorage(STORAGE_KEYS.PRODUCTS, products);
    // Refresh cache after save to ensure consistency
    await refreshCache();
}

// ===== Alert System =====
function showAlert(type, title, message, duration = 5000) {
    const container = document.getElementById('alert-container');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    
    alert.innerHTML = `
        <div class="alert-content">
            <div class="alert-title">${title}</div>
            <div class="alert-message">${message}</div>
        </div>
        <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(alert);

    // Auto remove after duration
    setTimeout(() => {
        if (alert.parentElement) {
            alert.style.animation = 'alertSlideIn 0.3s ease reverse';
            setTimeout(() => alert.remove(), 300);
        }
    }, duration);
}

// ===== Material Utilities =====
function findMaterial(id) {
    const materials = getMaterials();
    return materials.find(m => m.id === id);
}

async function updateMaterialStock(materialId, quantityUsed) {
    const materials = getMaterials();
    const material = materials.find(m => m.id === materialId);
    
    if (material) {
        material.quantity = Math.max(0, material.quantity - quantityUsed);
        material.used = (material.used || 0) + quantityUsed;
        await saveMaterials(materials);
        checkMaterialAlerts(material);
        return true;
    }
    return false;
}

function checkMaterialAlerts(material) {
    if (!material.minStock) return;

    if (material.quantity <= 0) {
        showAlert('danger', 'Out of Stock!', 
            `${material.name} is out of stock. Please reorder immediately.`, 10000);
    } else if (material.quantity <= material.minStock) {
        const supplierInfo = material.supplierLink 
            ? `<a href="${material.supplierLink}" target="_blank" style="color: inherit; text-decoration: underline;">Order from ${material.supplier || 'supplier'}</a>`
            : '';
        showAlert('warning', 'Low Stock Alert', 
            `${material.name} is running low (${material.quantity} ${material.unit} remaining). ${supplierInfo}`, 10000);
    }
}

function checkAllMaterialAlerts() {
    const materials = getMaterials();
    materials.forEach(material => checkMaterialAlerts(material));
}

// ===== Formula Utilities =====
function findFormula(id) {
    const formulas = getFormulas();
    return formulas.find(f => f.id === id);
}

function calculateMaterialUsage(formula, batchMultiplier = 1) {
    const usage = {};
    formula.materials.forEach(mat => {
        const material = findMaterial(mat.materialId);
        if (material) {
            const formulaUnit = mat.unit || material.unit;
            const materialUnit = material.unit;
            
            // Convert formula quantity to material's storage unit
            let quantityInMaterialUnit = mat.quantity * batchMultiplier;
            if (formulaUnit !== materialUnit && window.unitConverter) {
                quantityInMaterialUnit = window.unitConverter.convert(mat.quantity * batchMultiplier, formulaUnit, materialUnit);
            }
            
            usage[mat.materialId] = (usage[mat.materialId] || 0) + quantityInMaterialUnit;
        }
    });
    return usage;
}

// ===== Product Utilities =====
function findProduct(id) {
    const products = getProducts();
    return products.find(p => p.id === id);
}

function calculateProductStats() {
    const products = getProducts();
    const stats = {
        totalProducts: products.length,
        totalInStock: 0,
        totalValue: 0,
        lowStockCount: 0
    };

    products.forEach(product => {
        stats.totalInStock += product.stock || 0;
        // Calculate value based on formula cost
        const formula = findFormula(product.formulaId);
        if (formula) {
            const cost = calculateFormulaCost(formula);
            stats.totalValue += (product.stock || 0) * (cost / formula.batchSize);
            
            // Check low stock based on formula's minStock setting
            if (formula.minStock !== null && formula.minStock !== undefined) {
                const currentStock = product.stock || 0;
                if (currentStock <= formula.minStock) {
                    stats.lowStockCount++;
                }
            }
        }
    });

    return stats;
}

function calculateFormulaCost(formula) {
    let totalCost = 0;
    formula.materials.forEach(mat => {
        const material = findMaterial(mat.materialId);
        if (material) {
            // Get the unit used in formula (default to material's unit if not specified)
            const formulaUnit = mat.unit || material.unit;
            const costUnit = material.costUnit || material.unit;
            
            // Convert formula quantity to cost unit
            let quantityInCostUnit = mat.quantity;
            if (formulaUnit !== costUnit && window.unitConverter) {
                quantityInCostUnit = window.unitConverter.convert(mat.quantity, formulaUnit, costUnit);
            }
            
            totalCost += quantityInCostUnit * material.costPerUnit;
        }
    });
    return totalCost;
}

// ===== Utility Functions =====
function generateId() {
    // If Supabase is available, generate a UUID-compatible ID
    // Otherwise use the simple string ID for localStorage
    if (window.supabaseStorage && window.supabaseStorage.isSupabaseAvailable && typeof window.supabaseStorage.isSupabaseAvailable === 'function' && window.supabaseStorage.isSupabaseAvailable()) {
        // Generate UUID v4 format
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== View Toggle Functions =====
function getViewPreference(page) {
    return localStorage.getItem(`view_${page}`) || 'cards';
}

function setViewPreference(page, view) {
    localStorage.setItem(`view_${page}`, view);
}

function toggleView(page, containerId) {
    const container = document.getElementById(containerId);
    const currentView = getViewPreference(page);
    const newView = currentView === 'cards' ? 'list' : 'cards';
    
    console.log(`Toggling view: ${currentView} -> ${newView}`);
    
    setViewPreference(page, newView);
    
    if (newView === 'list') {
        container.classList.add('list-view');
    } else {
        container.classList.remove('list-view');
    }
    
    // Update toggle buttons
    const toggleButtons = document.querySelectorAll(`.view-toggle-${page} button`);
    toggleButtons.forEach(btn => {
        if (btn.dataset.view === newView) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Reload the page content
    if (page === 'materials' && typeof loadMaterials === 'function') {
        console.log('Calling loadMaterials after toggle');
        loadMaterials();
    } else if (page === 'formulas' && typeof loadFormulas === 'function') {
        loadFormulas();
    } else if (page === 'products' && typeof loadProducts === 'function') {
        loadProducts();
    }
}

// Initialize view preference on page load
function initViewPreference(page, containerId) {
    const container = document.getElementById(containerId);
    const view = getViewPreference(page);
    
    if (view === 'list') {
        container.classList.add('list-view');
    } else {
        container.classList.remove('list-view');
    }
    
    // Update toggle buttons
    const toggleButtons = document.querySelectorAll(`.view-toggle-${page} button`);
    toggleButtons.forEach(btn => {
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', async function() {
    // Refresh cache from storage (Supabase or localStorage)
    await refreshCache();
    
    // Set today's date as default for date inputs
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });

    // Check for alerts on page load
    setTimeout(() => {
        checkAllMaterialAlerts();
    }, 1000);
});


