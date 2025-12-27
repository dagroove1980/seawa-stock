// Vercel build script to inject environment variables
const fs = require('fs');
const path = require('path');

// Get environment variables and clean them thoroughly
// Remove any literal \n\n sequences, trim whitespace, and remove any trailing newlines
let supabaseUrl = (process.env.VITE_SUPABASE_URL || '').replace(/\\n\\n/g, '').replace(/\n\n/g, '').trim();
let supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY || '').replace(/\\n\\n/g, '').replace(/\n\n/g, '').trim();

console.log('Build script running...');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? `${supabaseKey.substring(0, 30)}...` : 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
    console.error('ERROR: Supabase environment variables not found!');
    console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel.');
    process.exit(1);
}

// Create a config.js file with the Supabase credentials
// Use JSON.stringify to properly escape and avoid any newline issues
const configContent = `// Auto-generated config file - created during build
window.SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
window.SUPABASE_ANON_KEY = ${JSON.stringify(supabaseKey)};
`;

const configPath = path.join(__dirname, 'config.js');
fs.writeFileSync(configPath, configContent, 'utf8');
console.log('✓ Created config.js with Supabase credentials');

// Also update HTML files to remove placeholders and use config.js instead
const htmlFiles = ['index.html', 'materials.html', 'formulas.html', 'products.html'];

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove the inline script with placeholders
        content = content.replace(
            /<script>\s*window\.SUPABASE_URL\s*=.*?<\/script>/s,
            '<script src="config.js"></script>'
        );
        
        // If no config.js script tag exists, add it before supabase.js
        if (!content.includes('config.js')) {
            content = content.replace(
                /<script src="supabase\.js"><\/script>/,
                '<script src="config.js"></script>\n    <script src="supabase.js"></script>'
            );
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Updated ${file}`);
    }
});

console.log('Build script completed.');

