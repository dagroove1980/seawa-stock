// ===== Products Management =====

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize view preference
    initViewPreference('products', 'products-container');
    
    await refreshCache();
    loadProducts();
    loadFormulaOptions();
    updateStats();
});

function loadProducts() {
    const products = getProducts();
    const container = document.getElementById('products-container');
    const emptyState = document.getElementById('empty-state');

    if (products.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';

    container.innerHTML = products.map(product => createProductCard(product)).join('');
    updateSaleModalOptions();
}

function createProductCard(product) {
    const formula = findFormula(product.formulaId);
    const formulaName = formula ? formula.name : 'Unknown Formula';
    const cost = formula ? calculateFormulaCost(formula) : 0;
    const costPerUnit = formula ? (cost / formula.batchSize).toFixed(2) : '0.00';
    const stockValue = (product.stock || 0) * parseFloat(costPerUnit);
    
    // Check if stock is low based on formula's minStock setting
    const currentStock = product.stock || 0;
    const minStock = formula && formula.minStock ? formula.minStock : null;
    const isLowStock = minStock !== null && currentStock <= minStock;
    const isOutOfStock = currentStock === 0;

    return `
        <div class="product-card ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : ''}" data-id="${product.id}">
            <div class="product-header">
                <div>
                    <div class="formula-name">${escapeHtml(formulaName)}</div>
                    <div class="formula-batch">Created: ${formatDate(product.productionDate)}</div>
                </div>
                <div class="material-actions">
                    <button class="btn-icon" onclick="deleteProduct('${product.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="product-stats">
                <div class="stat-item">
                    <div class="stat-number">${product.produced || 0}</div>
                    <div class="stat-label">Produced</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${product.sold || 0}</div>
                    <div class="stat-label">Sold</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number ${isOutOfStock ? 'stock-badge out' : isLowStock ? 'stock-badge low' : ''}">${currentStock}</div>
                    <div class="stat-label">In Stock</div>
                </div>
            </div>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--border-color);">
                <div class="info-row">
                    <span class="info-label">Cost per Unit</span>
                    <span class="info-value">₪${costPerUnit}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Stock Value</span>
                    <span class="info-value">₪${stockValue.toFixed(2)}</span>
                </div>
                ${minStock !== null ? `
                <div class="info-row">
                    <span class="info-label">Minimum Stock</span>
                    <span class="info-value">${minStock}</span>
                </div>
                ` : ''}
                ${isOutOfStock ? `
                <div style="margin-top: 0.75rem; padding: 0.75rem; background: rgba(220, 53, 69, 0.1); border-radius: 8px; color: var(--danger);">
                    ⚠️ Out of Stock: This product needs to be produced
                </div>
                ` : isLowStock ? `
                <div style="margin-top: 0.75rem; padding: 0.75rem; background: rgba(255, 193, 7, 0.1); border-radius: 8px; color: #b8860b;">
                    ⚠️ Low Stock Alert: Stock (${currentStock}) is below minimum (${minStock}). Consider producing more.
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function loadFormulaOptions() {
    const formulas = getFormulas();
    const select = document.getElementById('product-formula');
    
    select.innerHTML = '<option value="">Choose a formula...</option>' +
        formulas.map(f => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('');
}

function updateProductionDetails() {
    const formulaId = document.getElementById('product-formula').value;
    if (formulaId) {
        const formula = findFormula(formulaId);
        if (formula) {
            // Could show formula details here
        }
    }
}

function openProductModal() {
    loadFormulaOptions();
    document.getElementById('product-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('product-modal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
    document.getElementById('product-form').reset();
}

async function saveProduction(event) {
    event.preventDefault();

    const formulaId = document.getElementById('product-formula').value;
    const quantity = parseInt(document.getElementById('product-quantity').value);
    const productionDate = document.getElementById('product-date').value;

    // Validate quantity
    if (!quantity || quantity <= 0) {
        showAlert('warning', 'Invalid Quantity', 'Please enter a valid quantity (greater than 0).');
        document.getElementById('product-quantity').focus();
        return;
    }

    const formula = findFormula(formulaId);
    if (!formula) {
        showAlert('danger', 'Error', 'Please select a valid formula.');
        return;
    }

    // Calculate material usage
    const batchMultiplier = quantity / formula.batchSize;
    const materialUsage = calculateMaterialUsage(formula, batchMultiplier);

    // Check if enough materials are available
    const insufficientMaterials = [];
    for (const [materialId, quantityNeeded] of Object.entries(materialUsage)) {
        const material = findMaterial(materialId);
        if (material && material.quantity < quantityNeeded) {
            insufficientMaterials.push({
                name: material.name,
                needed: quantityNeeded,
                available: material.quantity
            });
        }
    }

    if (insufficientMaterials.length > 0) {
        const message = insufficientMaterials.map(m => 
            `${m.name}: need ${m.needed.toFixed(2)}, have ${m.available.toFixed(2)}`
        ).join('\n');
        showAlert('warning', 'Insufficient Materials', message);
        return;
    }

    // Deduct materials from inventory
    for (const [materialId, quantityUsed] of Object.entries(materialUsage)) {
        await updateMaterialStock(materialId, quantityUsed);
    }

    // Create or update product
    const products = getProducts();
    const existingProduct = products.find(p => 
        p.formulaId === formulaId && 
        p.productionDate === productionDate
    );

    if (existingProduct) {
        existingProduct.produced = (existingProduct.produced || 0) + quantity;
        existingProduct.stock = (existingProduct.stock || 0) + quantity;
        existingProduct.updatedAt = new Date().toISOString();
    } else {
        const product = {
            id: generateId(),
            formulaId: formulaId,
            produced: quantity,
            sold: 0,
            stock: quantity,
            productionDate: productionDate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        products.push(product);
    }

    await saveProducts(products);
    loadProducts();
    updateStats();
    closeProductModal();
    
    showAlert('success', 'Production Recorded', 
        `Successfully recorded production of ${quantity} units. Materials have been deducted from inventory.`);
    
    // Check for low stock alerts
    setTimeout(() => checkAllMaterialAlerts(), 500);
}

function openSaleModal() {
    updateSaleModalOptions();
    document.getElementById('sale-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('sale-modal').classList.add('active');
}

function closeSaleModal() {
    document.getElementById('sale-modal').classList.remove('active');
    document.getElementById('sale-form').reset();
}

function updateSaleModalOptions() {
    const products = getProducts();
    const select = document.getElementById('sale-product');
    
    select.innerHTML = '<option value="">Choose a product...</option>' +
        products.map(p => {
            const formula = findFormula(p.formulaId);
            const formulaName = formula ? formula.name : 'Unknown';
            const stock = p.stock || 0;
            return `<option value="${p.id}" ${stock === 0 ? 'disabled' : ''}>
                ${escapeHtml(formulaName)} - ${stock} in stock (Created: ${formatDate(p.productionDate)})
            </option>`;
        }).join('');
}

async function recordSale(event) {
    event.preventDefault();

    const productId = document.getElementById('sale-product').value;
    const quantity = parseInt(document.getElementById('sale-quantity').value);
    const saleDate = document.getElementById('sale-date').value;

    const products = getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) {
        showAlert('danger', 'Error', 'Product not found.');
        return;
    }

    if (product.stock < quantity) {
        showAlert('warning', 'Insufficient Stock', 
            `Only ${product.stock} units available in stock.`);
        return;
    }

    product.sold = (product.sold || 0) + quantity;
    product.stock = Math.max(0, product.stock - quantity);
    product.updatedAt = new Date().toISOString();

    await saveProducts(products);
    loadProducts();
    updateStats();
    closeSaleModal();

    const formula = findFormula(product.formulaId);
    const formulaName = formula ? formula.name : 'Product';
    showAlert('success', 'Sale Recorded', 
        `Successfully recorded sale of ${quantity} units of ${formulaName}.`);

    // Check for low stock alerts based on formula's minStock setting
    if (formula && formula.minStock !== null && formula.minStock !== undefined) {
        if (product.stock === 0) {
            setTimeout(() => {
                showAlert('danger', 'Out of Stock', 
                    `${formulaName} is now out of stock. Please produce more.`);
            }, 500);
        } else if (product.stock <= formula.minStock) {
            setTimeout(() => {
                showAlert('warning', 'Low Stock Alert', 
                    `${formulaName} is running low (${product.stock} units remaining, minimum: ${formula.minStock}). Consider producing more.`);
            }, 500);
        }
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product record? This action cannot be undone.')) {
        return;
    }

    const products = getProducts();
    const product = products.find(p => p.id === id);
    const filtered = products.filter(p => p.id !== id);
    
    await saveProducts(filtered);
    loadProducts();
    updateStats();
    
    const formula = findFormula(product.formulaId);
    const formulaName = formula ? formula.name : 'Product';
    showAlert('info', 'Product Deleted', `${formulaName} record has been deleted.`);
}

function updateStats() {
    const stats = calculateProductStats();
    
    document.getElementById('total-products').textContent = stats.totalProducts;
    document.getElementById('total-in-stock').textContent = stats.totalInStock;
    document.getElementById('total-value').textContent = `₪${stats.totalValue.toFixed(2)}`;
    const lowStockEl = document.getElementById('low-stock-count');
    if (lowStockEl) {
        lowStockEl.textContent = stats.lowStockCount;
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach(card => {
        const name = card.querySelector('.formula-name').textContent.toLowerCase();
        if (name.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// escapeHtml is defined in app.js - use global version


