// ===== Unit Conversion System =====

// Conversion factors to base units (grams for weight, milliliters for volume)
const UNIT_CONVERSIONS = {
    // Weight conversions (to grams)
    'g': 1,
    'kg': 1000,
    'oz': 28.3495,
    'lb': 453.592,
    
    // Volume conversions (to milliliters)
    'mL': 1,
    'L': 1000,
    
    // For units that don't need conversion (same unit)
    'units': 1,
    'pieces': 1
};

// Convert from one unit to another
function convertUnit(value, fromUnit, toUnit) {
    // If same unit, no conversion needed
    if (fromUnit === toUnit) {
        return value;
    }
    
    // Get conversion factors
    const fromFactor = UNIT_CONVERSIONS[fromUnit] || 1;
    const toFactor = UNIT_CONVERSIONS[toUnit] || 1;
    
    // Convert to base unit, then to target unit
    const baseValue = value * fromFactor;
    return baseValue / toFactor;
}

// Check if two units are compatible (same type - weight, volume, or other)
function areUnitsCompatible(unit1, unit2) {
    const weightUnits = ['g', 'kg', 'oz', 'lb'];
    const volumeUnits = ['mL', 'L'];
    
    const isWeight1 = weightUnits.includes(unit1);
    const isWeight2 = weightUnits.includes(unit2);
    const isVolume1 = volumeUnits.includes(unit1);
    const isVolume2 = volumeUnits.includes(unit2);
    
    // Same type or both are "other" type
    return (isWeight1 && isWeight2) || (isVolume1 && isVolume2) || (!isWeight1 && !isWeight2 && !isVolume1 && !isVolume2);
}

// Get all available units
function getAllUnits() {
    return Object.keys(UNIT_CONVERSIONS);
}

// Export for use in other files
window.unitConverter = {
    convert: convertUnit,
    areCompatible: areUnitsCompatible,
    getAllUnits: getAllUnits
};

