# SEAWA SOAP Stock Management System

A beautiful, modern web application for managing your soap business inventory, formulas, and production tracking.

## Features

### 📦 Materials Management
- Track raw materials (Shea butter, Almond oil, Lavender essential oil, etc.)
- Monitor quantities and costs per unit
- Set minimum stock levels for automatic alerts
- Store supplier information and links for easy reordering
- Track total usage of each material

### 🧪 Formula Management
- Create and manage product formulas
- Define batch sizes and material requirements
- Automatic cost calculation per batch and per unit
- Visual display of all materials needed for each product

### 📊 Products Inventory
- Track production batches
- Record sales
- Monitor current stock levels
- Automatic material deduction when products are created
- Low stock alerts for products
- Calculate total inventory value

### ⚡ Smart Automation
- **Automatic Material Deduction**: When you create a product, materials are automatically deducted based on the formula
- **Low Stock Alerts**: Get notified when materials or products are running low
- **Supplier Links**: Quick access to supplier websites for reordering
- **Cost Calculations**: Automatic calculation of product costs based on material costs and formulas
- **Utilization Tracking**: See how much of each material you've used

## Getting Started

1. **Open the Application**
   - Simply open `index.html` in your web browser
   - No installation or server required - it runs entirely in your browser

2. **Add Your Materials**
   - Navigate to the "Materials" page
   - Click "Add New Material"
   - Enter material name, quantity, unit, cost, and supplier information
   - Set minimum stock levels to receive alerts

3. **Create Formulas**
   - Go to the "Formulas" page
   - Click "Create New Formula"
   - Enter product name and batch size
   - Add materials and their required quantities
   - The system will calculate costs automatically

4. **Track Production**
   - Navigate to "Products"
   - Click "Add Production Batch"
   - Select a formula and enter quantity produced
   - Materials will be automatically deducted from inventory

5. **Record Sales**
   - On the Products page, click "Record Sale"
   - Select the product and enter quantity sold
   - Stock levels update automatically

## Data Storage

All data is stored locally in your browser using localStorage. This means:
- ✅ Your data stays private on your computer
- ✅ No internet connection required after initial load
- ✅ Fast and responsive
- ⚠️ Data is browser-specific (use the same browser to access your data)
- ⚠️ Clearing browser data will delete your inventory

## Tips

- **Set Minimum Stock Levels**: Add minimum stock levels to materials to get automatic alerts
- **Add Supplier Links**: Include supplier website links for quick reordering when stock is low
- **Regular Updates**: Update production and sales regularly for accurate inventory tracking
- **Backup**: Consider exporting your data periodically (browser DevTools > Application > Local Storage)

## Browser Compatibility

Works best in modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Color Scheme

The design uses a natural, organic color palette perfect for a soap business:
- **Primary Green**: Represents nature and natural ingredients
- **Earth Tones**: Warm browns and beiges for a natural feel
- **Clean Whites**: For a fresh, clean appearance

## Support

For issues or questions, check the browser console (F12) for any error messages. All functionality is client-side, so there are no server-side errors to worry about.

---

**Made with ❤️ for SEAWA SOAP**


