// ===== Materials Management =====

let editingMaterialId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize view preference
    initViewPreference('materials', 'materials-container');
    
    // Update toggle buttons based on current preference
    const currentView = getViewPreference('materials');
    const cardsBtn = document.querySelector('.view-toggle-materials button[data-view="cards"]');
    const listBtn = document.querySelector('.view-toggle-materials button[data-view="list"]');
    if (cardsBtn && listBtn) {
        if (currentView === 'list') {
            listBtn.classList.add('active');
            cardsBtn.classList.remove('active');
        } else {
            cardsBtn.classList.add('active');
            listBtn.classList.remove('active');
        }
    }
    
    // Wait for Supabase to initialize if needed
    const waitForSupabase = () => {
        return new Promise((resolve) => {
            // Check if Supabase is already initialized
            if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
                // Wait a bit for the client to be set up
                setTimeout(resolve, 500);
                return;
            }
            
            // Wait for Supabase script to load
            let attempts = 0;
            const maxAttempts = 20; // 10 seconds total
            
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
                    clearInterval(checkInterval);
                    setTimeout(resolve, 500);
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    resolve(); // Continue anyway, will use localStorage
                }
            }, 500);
        });
    };
    
    // Wait for Supabase, then load materials
    await waitForSupabase();
    
    // Refresh cache and load materials
    await refreshCache();
    const materials = getMaterials();
    console.log('Materials loaded:', materials.length);
    
    // Load materials display
    loadMaterials();
    
    // If no materials and Supabase is available, try one more time after a delay
    if (materials.length === 0 && window.supabaseStorage) {
        setTimeout(async () => {
            await refreshCache();
            loadMaterials();
        }, 2000);
    }
});

function loadMaterials() {
    const materials = getMaterials();
    const container = document.getElementById('materials-container');
    const emptyState = document.getElementById('empty-state');

    console.log('loadMaterials called, materials count:', materials.length);
    console.log('Materials data:', materials);

    if (!container) {
        console.error('Materials container not found!');
        return;
    }

    if (materials.length === 0) {
        container.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        return;
    }

    // Check view preference
    const view = getViewPreference('materials');
    console.log('Current view preference:', view);
    
    if (view === 'list') {
        console.log('Rendering list view');
        container.classList.add('list-view');
        container.style.display = 'table';
        container.innerHTML = createListHeader() + materials.map(material => createMaterialListRow(material)).join('');
    } else {
        console.log('Rendering card view');
        container.classList.remove('list-view');
        container.style.display = 'grid';
        container.innerHTML = materials.map(material => createMaterialCard(material)).join('');
    }
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    console.log('Materials rendered:', materials.length);
}

function createListHeader() {
    return `
        <div class="list-header">
            <div class="list-cell list-cell-name">Material Name</div>
            <div class="list-cell list-cell-quantity">Quantity</div>
            <div class="list-cell list-cell-unit">Unit</div>
            <div class="list-cell list-cell-cost">Cost/Unit</div>
            <div class="list-cell list-cell-value">Total Value</div>
            <div class="list-cell list-cell-supplier">Supplier</div>
            <div class="list-cell list-cell-actions">Actions</div>
        </div>
    `;
}

function createMaterialListRow(material) {
    const stockStatus = getStockStatus(material);
    const statusClass = stockStatus === 'out' ? 'out-of-stock' : stockStatus === 'low' ? 'low-stock' : '';
    const totalValue = (material.quantity * material.costPerUnit).toFixed(2);
    
    return `
        <div class="material-list-row ${statusClass}" data-id="${material.id}">
            <div class="list-cell list-cell-name">
                <span class="material-name-text">${escapeHtml(material.name)}</span>
                <span class="stock-badge ${stockStatus}">${getStockStatusText(stockStatus)}</span>
            </div>
            <div class="list-cell list-cell-quantity">
                <input type="number" 
                       class="inline-edit" 
                       step="0.01" 
                       value="${material.quantity}" 
                       data-field="quantity"
                       data-material-id="${material.id}"
                       onblur="saveInlineEdit('${material.id}', 'quantity', this.value)"
                       onkeypress="if(event.key==='Enter') { this.blur(); }">
            </div>
            <div class="list-cell list-cell-unit">${material.unit || 'units'}</div>
            <div class="list-cell list-cell-cost">
                <input type="number" 
                       class="inline-edit" 
                       step="0.01" 
                       value="${material.costPerUnit}" 
                       data-field="costPerUnit"
                       data-material-id="${material.id}"
                       onblur="saveInlineEdit('${material.id}', 'costPerUnit', this.value)"
                       onkeypress="if(event.key==='Enter') { this.blur(); }">
                <span class="unit-label">/${material.costUnit || material.unit}</span>
            </div>
            <div class="list-cell list-cell-value">₪${totalValue}</div>
            <div class="list-cell list-cell-supplier">
                ${material.supplier ? escapeHtml(material.supplier) : '-'}
                ${material.supplierLink ? `<a href="${material.supplierLink}" target="_blank" class="supplier-link-small" title="Order">🔗</a>` : ''}
            </div>
            <div class="list-cell list-cell-actions">
                <button class="btn-icon" onclick="editMaterial('${material.id}')" title="Edit All">✏️</button>
                <button class="btn-icon" onclick="deleteMaterial('${material.id}')" title="Delete">🗑️</button>
            </div>
        </div>
    `;
}

function createMaterialCard(material) {
    const stockStatus = getStockStatus(material);
    const statusClass = stockStatus === 'out' ? 'out-of-stock' : stockStatus === 'low' ? 'low-stock' : '';
    
    return `
        <div class="material-card ${statusClass}" data-id="${material.id}">
            <div class="material-header">
                <div class="material-name">${escapeHtml(material.name)}</div>
                <div class="material-actions">
                    <button class="btn-icon" onclick="editMaterial('${material.id}')" title="Edit">✏️</button>
                    <button class="btn-icon" onclick="deleteMaterial('${material.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="material-info">
                <div class="info-row">
                    <span class="info-label">Current Stock</span>
                    <span class="info-value">
                        ${material.quantity} ${material.unit || 'units'}
                        <span class="stock-badge ${stockStatus}">${getStockStatusText(stockStatus)}</span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Cost per ${material.costUnit || material.unit}</span>
                    <span class="info-value">₪${material.costPerUnit.toFixed(2)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Total Value</span>
                    <span class="info-value">₪${(material.quantity * material.costPerUnit).toFixed(2)}</span>
                </div>
                ${material.used ? `
                <div class="info-row">
                    <span class="info-label">Total Used</span>
                    <span class="info-value">${material.used} ${material.unit || 'units'}</span>
                </div>
                ` : ''}
                ${material.supplier ? `
                <div class="info-row">
                    <span class="info-label">Supplier</span>
                    <span class="info-value">${escapeHtml(material.supplier)}</span>
                </div>
                ` : ''}
                ${material.supplierLink ? `
                <div class="info-row">
                    <span class="info-label"></span>
                    <a href="${material.supplierLink}" target="_blank" class="supplier-link">
                        🔗 Order from Supplier
                    </a>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function getStockStatus(material) {
    if (material.quantity <= 0) return 'out';
    if (material.minStock && material.quantity <= material.minStock) return 'low';
    return 'good';
}

function getStockStatusText(status) {
    const statusMap = {
        'good': 'Good',
        'low': 'Low',
        'out': 'Out'
    };
    return statusMap[status] || 'Good';
}

function openMaterialModal(materialId = null) {
    editingMaterialId = materialId;
    const modal = document.getElementById('material-modal');
    const form = document.getElementById('material-form');
    const title = document.getElementById('modal-title');

    if (materialId) {
        const material = findMaterial(materialId);
        if (material) {
            title.textContent = 'Edit Material';
            document.getElementById('material-name').value = material.name;
            document.getElementById('material-quantity').value = material.quantity;
            document.getElementById('material-unit').value = material.unit || 'kg';
            document.getElementById('material-cost').value = material.costPerUnit;
            document.getElementById('material-cost-unit').value = material.costUnit || material.unit || 'kg';
            document.getElementById('material-supplier').value = material.supplier || '';
            document.getElementById('material-supplier-link').value = material.supplierLink || '';
            document.getElementById('material-min-stock').value = material.minStock || '';
        }
    } else {
        title.textContent = 'Add New Material';
        form.reset();
        document.getElementById('material-unit').value = 'kg';
        document.getElementById('material-cost-unit').value = 'kg';
    }

    modal.classList.add('active');
}

function closeMaterialModal() {
    const modal = document.getElementById('material-modal');
    modal.classList.remove('active');
    editingMaterialId = null;
    document.getElementById('material-form').reset();
}

async function saveMaterial(event) {
    event.preventDefault();

    const material = {
        id: editingMaterialId || generateId(),
        name: document.getElementById('material-name').value.trim(),
        quantity: parseFloat(document.getElementById('material-quantity').value),
        unit: document.getElementById('material-unit').value,
        costPerUnit: parseFloat(document.getElementById('material-cost').value),
        costUnit: document.getElementById('material-cost-unit').value || document.getElementById('material-unit').value,
        supplier: document.getElementById('material-supplier').value.trim(),
        supplierLink: document.getElementById('material-supplier-link').value.trim(),
        minStock: parseFloat(document.getElementById('material-min-stock').value) || null,
        used: 0,
        createdAt: editingMaterialId ? findMaterial(editingMaterialId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const materials = getMaterials();
    
    if (editingMaterialId) {
        const index = materials.findIndex(m => m.id === editingMaterialId);
        if (index !== -1) {
            materials[index] = material;
        }
        showAlert('success', 'Material Updated', `${material.name} has been updated successfully.`);
    } else {
        materials.push(material);
        showAlert('success', 'Material Added', `${material.name} has been added successfully.`);
    }

    await saveMaterials(materials);
    loadMaterials();
    closeMaterialModal();
    checkMaterialAlerts(material);
}

function editMaterial(id) {
    openMaterialModal(id);
}

async function deleteMaterial(id) {
    if (!confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
        return;
    }

    const materials = getMaterials();
    const material = materials.find(m => m.id === id);
    const filtered = materials.filter(m => m.id !== id);
    
    await saveMaterials(filtered);
    loadMaterials();
    showAlert('info', 'Material Deleted', `${material.name} has been deleted.`);
}

async function saveInlineEdit(materialId, field, value) {
    const materials = getMaterials();
    const material = materials.find(m => m.id === materialId);
    
    if (!material) {
        showAlert('danger', 'Error', 'Material not found.');
        return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
        showAlert('warning', 'Invalid Value', 'Please enter a valid number.');
        // Reload to reset the input
        loadMaterials();
        return;
    }
    
    // Update the material
    if (field === 'quantity') {
        material.quantity = numValue;
    } else if (field === 'costPerUnit') {
        material.costPerUnit = numValue;
    }
    
    material.updatedAt = new Date().toISOString();
    
    // Update total value in the UI immediately
    const row = document.querySelector(`.material-list-row[data-id="${materialId}"]`);
    if (row) {
        const valueCell = row.querySelector('.list-cell-value');
        if (valueCell) {
            const newTotalValue = (material.quantity * material.costPerUnit).toFixed(2);
            valueCell.textContent = `₪${newTotalValue}`;
        }
    }
    
    // Save and reload
    await saveMaterials(materials);
    
    // Check alerts
    checkMaterialAlerts(material);
    
    // Show brief success indicator
    if (row) {
        row.classList.add('saved-indicator');
        setTimeout(() => row.classList.remove('saved-indicator'), 1000);
    }
}

function filterMaterials() {
    const searchTerm = document.getElementById('material-search').value.toLowerCase();
    const view = getViewPreference('materials');
    
    if (view === 'list') {
        const rows = document.querySelectorAll('.material-list-row');
        rows.forEach(row => {
            const name = row.querySelector('.material-name-text').textContent.toLowerCase();
            if (name.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    } else {
        const cards = document.querySelectorAll('.material-card');
        cards.forEach(card => {
            const name = card.querySelector('.material-name').textContent.toLowerCase();
            if (name.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// generateId and escapeHtml are defined in app.js - use global versions


