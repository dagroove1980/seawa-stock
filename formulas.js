// ===== Formulas Management =====

let editingFormulaId = null;
let materialRows = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    await refreshCache();
    loadFormulas();
    loadMaterialOptions();
});

function loadFormulas() {
    const formulas = getFormulas();
    const container = document.getElementById('formulas-container');
    const emptyState = document.getElementById('empty-state');

    if (formulas.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';

    container.innerHTML = formulas.map(formula => createFormulaCard(formula)).join('');
}

function createFormulaCard(formula) {
    const cost = calculateFormulaCost(formula);
    const costPerUnit = (cost / formula.batchSize).toFixed(2);
    
    return `
        <div class="formula-card" data-id="${formula.id}">
            <div class="formula-header">
                <div>
                    <div class="formula-name">${escapeHtml(formula.name)}</div>
                    <div class="formula-batch">Batch Size: ${formula.batchSize} units</div>
                </div>
                <div class="material-actions">
                    <button class="btn-icon" onclick="editFormula('${formula.id}')" title="Edit">✏️</button>
                    <button class="btn-icon" onclick="deleteFormula('${formula.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="formula-materials">
                <h4 style="margin-bottom: 0.75rem; color: var(--text-secondary); font-size: 0.9rem;">Materials Required:</h4>
                ${formula.materials.map(mat => {
                    const material = findMaterial(mat.materialId);
                    const displayUnit = mat.unit || (material ? material.unit : 'units');
                    return `
                        <div class="material-item">
                            <span>${material ? escapeHtml(material.name) : 'Unknown Material'}</span>
                            <span><strong>${mat.quantity} ${displayUnit}</strong></span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--border-color);">
                <div class="info-row">
                    <span class="info-label">Total Cost per Batch</span>
                    <span class="info-value">₪${cost.toFixed(2)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Cost per Unit</span>
                    <span class="info-value">₪${costPerUnit}</span>
                </div>
                ${formula.minStock !== null && formula.minStock !== undefined ? `
                <div class="info-row">
                    <span class="info-label">Minimum Stock Alert</span>
                    <span class="info-value">${formula.minStock} units</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function loadMaterialOptions() {
    const materials = getMaterials();
    const selects = document.querySelectorAll('.material-select');
    
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select Material...</option>' +
            materials.map(m => `<option value="${m.id}">${m.name} (${m.unit})</option>`).join('');
    });
}

function openFormulaModal(formulaId = null) {
    editingFormulaId = formulaId;
    const modal = document.getElementById('formula-modal');
    const form = document.getElementById('formula-form');
    const title = document.getElementById('formula-modal-title');
    const saveBtn = document.getElementById('save-formula-btn');

    if (formulaId) {
        const formula = findFormula(formulaId);
        if (formula) {
            title.textContent = 'Edit Formula';
            document.getElementById('formula-name').value = formula.name;
            document.getElementById('formula-batch-size').value = formula.batchSize;
            document.getElementById('formula-min-stock').value = formula.minStock || '';
            materialRows = formula.materials.map(mat => {
                const material = findMaterial(mat.materialId);
                return {
                    materialId: mat.materialId,
                    quantity: mat.quantity,
                    unit: mat.unit || (material ? getDefaultFormulaUnit(material) : 'g')
                };
            });
        }
    } else {
        title.textContent = 'Create New Formula';
        if (form) {
            form.reset();
        }
        materialRows = [];
    }

    // Ensure button is enabled and clickable
    if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.style.pointerEvents = 'auto';
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.opacity = '1';
    }

    renderMaterialRows();
    
    if (modal) {
        modal.classList.add('active');
    }
    
    // Ensure form is accessible
    if (form) {
        form.style.pointerEvents = 'auto';
    }
    
    // Focus on product name input
    setTimeout(() => {
        const nameInput = document.getElementById('formula-name');
        if (nameInput) {
            nameInput.focus();
        }
    }, 100);
}

function closeFormulaModal() {
    const modal = document.getElementById('formula-modal');
    modal.classList.remove('active');
    editingFormulaId = null;
    materialRows = [];
    document.getElementById('formula-form').reset();
}

function getAvailableUnitsForMaterial(material) {
    const weightUnits = ['g', 'kg', 'oz', 'lb'];
    const volumeUnits = ['mL', 'L'];
    
    // Check if material unit is weight or volume
    if (weightUnits.includes(material.unit)) {
        return weightUnits;
    } else if (volumeUnits.includes(material.unit)) {
        return volumeUnits;
    }
    return [material.unit || 'units'];
}

function getDefaultFormulaUnit(material) {
    const weightUnits = ['g', 'kg', 'oz', 'lb'];
    const volumeUnits = ['mL', 'L'];
    
    // For weight materials stored in kg, default to grams in formulas
    if (material.unit === 'kg') {
        return 'g';
    }
    // For volume materials stored in L, default to mL in formulas
    if (material.unit === 'L') {
        return 'mL';
    }
    // For other units, use the same unit
    return material.unit || 'g';
}

function addMaterialRow() {
    materialRows.push({
        materialId: '',
        quantity: 0,
        unit: '' // Will be set based on selected material
    });
    renderMaterialRows();
    // Focus on the newly added material select
    setTimeout(() => {
        const selects = document.querySelectorAll('.material-select');
        if (selects.length > 0) {
            selects[selects.length - 1].focus();
        }
    }, 100);
}

function removeMaterialRow(index) {
    materialRows.splice(index, 1);
    renderMaterialRows();
}

function renderMaterialRows() {
    const container = document.getElementById('formula-materials-list');
    const materials = getMaterials();

    if (materialRows.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No materials added yet. Click "Add Material" to get started.</p>';
        return;
    }

    container.innerHTML = materialRows.map((row, index) => {
        const selectedMaterial = materials.find(m => m.id === row.materialId);
        const availableUnits = selectedMaterial ? getAvailableUnitsForMaterial(selectedMaterial) : ['g', 'kg', 'mL', 'L', 'units'];
        // Default unit: use existing row unit, or get default for material, or 'g'
        const defaultUnit = row.unit || (selectedMaterial ? getDefaultFormulaUnit(selectedMaterial) : 'g');
        
        return `
        <div class="material-row">
            <select class="material-select" onchange="updateMaterialRow(${index}, 'materialId', this.value); updateMaterialRow(${index}, 'unit', ''); renderMaterialRows();" required>
                <option value="">Select Material...</option>
                ${materials.map(m => 
                    `<option value="${m.id}" ${row.materialId === m.id ? 'selected' : ''}>${escapeHtml(m.name)} (stock: ${m.unit})</option>`
                ).join('')}
            </select>
            <input type="number" step="0.01" placeholder="Quantity" 
                   value="${row.quantity || ''}" 
                   onchange="updateMaterialRow(${index}, 'quantity', parseFloat(this.value) || 0)" 
                   required min="0.01">
            <select class="formula-unit-select" onchange="updateMaterialRow(${index}, 'unit', this.value)" required>
                ${availableUnits.map(u => 
                    `<option value="${u}" ${defaultUnit === u ? 'selected' : ''}>${u}</option>`
                ).join('')}
            </select>
            <button type="button" class="material-row-remove" onclick="removeMaterialRow(${index})">Remove</button>
        </div>
    `;
    }).join('');
}

function updateMaterialRow(index, field, value) {
    if (materialRows[index]) {
        materialRows[index][field] = value;
    }
}

function handleSaveFormula() {
    console.log('handleSaveFormula called');
    console.log('materialRows:', materialRows);
    console.log('editingFormulaId:', editingFormulaId);
    
    // Check if required functions exist
    if (typeof saveFormula === 'undefined') {
        console.error('saveFormula function not found!');
        showAlert('danger', 'Error', 'Save function not loaded. Please refresh the page.');
        return;
    }
    
    if (typeof generateId === 'undefined') {
        console.error('generateId function not found!');
        showAlert('danger', 'Error', 'Utility functions not loaded. Please refresh the page.');
        return;
    }
    
    try {
        // Create a synthetic event and call saveFormula
        const event = { preventDefault: () => {}, stopPropagation: () => {} };
        saveFormula(event);
    } catch (error) {
        console.error('Error in handleSaveFormula:', error);
        console.error('Error stack:', error.stack);
        showAlert('danger', 'Error', `An error occurred: ${error.message}. Please check the console.`);
    }
}

async function saveFormula(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Validate form fields
    const formulaNameEl = document.getElementById('formula-name');
    const batchSizeEl = document.getElementById('formula-batch-size');
    
    if (!formulaNameEl || !batchSizeEl) {
        showAlert('danger', 'Error', 'Form elements not found. Please refresh the page.');
        return;
    }

    const formulaName = formulaNameEl.value.trim();
    const batchSize = parseInt(batchSizeEl.value);

    if (!formulaName) {
        showAlert('warning', 'Missing Information', 'Please enter a product name.');
        formulaNameEl.focus();
        return;
    }

    if (!batchSize || batchSize < 1) {
        showAlert('warning', 'Invalid Batch Size', 'Please enter a valid batch size (at least 1).');
        batchSizeEl.focus();
        return;
    }

    // Read material values directly from DOM to ensure we have latest values
    const materialSelects = document.querySelectorAll('#formula-materials-list .material-select');
    const materialInputs = document.querySelectorAll('#formula-materials-list input[type="number"]');
    
    if (materialSelects.length === 0 || materialInputs.length === 0) {
        showAlert('warning', 'No Materials', 'Please add at least one material to the formula. Click "Add Material" to get started.');
        return;
    }

    // Build materials array from DOM
    const materials = [];
    const unitSelects = document.querySelectorAll('#formula-materials-list .formula-unit-select');
    
    for (let i = 0; i < materialSelects.length; i++) {
        const materialId = materialSelects[i].value;
        const quantity = parseFloat(materialInputs[i].value);
        const unit = unitSelects[i] ? unitSelects[i].value : 'g';
        
        if (!materialId) {
            showAlert('warning', 'Invalid Materials', `Please select a material for row ${i + 1}.`);
            materialSelects[i].focus();
            return;
        }
        
        if (!quantity || quantity <= 0) {
            showAlert('warning', 'Invalid Quantity', `Please enter a valid quantity (greater than 0) for row ${i + 1}.`);
            materialInputs[i].focus();
            return;
        }
        
        materials.push({
            materialId: materialId,
            quantity: quantity,
            unit: unit
        });
    }

    const minStockEl = document.getElementById('formula-min-stock');
    const minStock = minStockEl ? (parseInt(minStockEl.value) || null) : null;

    const formula = {
        id: editingFormulaId || generateId(),
        name: formulaName,
        batchSize: batchSize,
        minStock: minStock,
        materials: materials,
        createdAt: editingFormulaId ? findFormula(editingFormulaId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    try {
        const formulas = getFormulas();
        
        if (editingFormulaId) {
            const index = formulas.findIndex(f => f.id === editingFormulaId);
            if (index !== -1) {
                formulas[index] = formula;
            }
            showAlert('success', 'Formula Updated', `${formula.name} has been updated successfully.`);
        } else {
            formulas.push(formula);
            showAlert('success', 'Formula Created', `${formula.name} has been created successfully.`);
        }

        await saveFormulas(formulas);
        loadFormulas();
        closeFormulaModal();
    } catch (error) {
        console.error('Error saving formula:', error);
        showAlert('danger', 'Error', 'Failed to save formula. Please check the console for details.');
    }
}

function editFormula(id) {
    openFormulaModal(id);
}

async function deleteFormula(id) {
    if (!confirm('Are you sure you want to delete this formula? This action cannot be undone.')) {
        return;
    }

    const formulas = getFormulas();
    const formula = formulas.find(f => f.id === id);
    const filtered = formulas.filter(f => f.id !== id);
    
    await saveFormulas(filtered);
    loadFormulas();
    showAlert('info', 'Formula Deleted', `${formula.name} has been deleted.`);
}

function filterFormulas() {
    const searchTerm = document.getElementById('formula-search').value.toLowerCase();
    const cards = document.querySelectorAll('.formula-card');
    
    cards.forEach(card => {
        const name = card.querySelector('.formula-name').textContent.toLowerCase();
        if (name.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

