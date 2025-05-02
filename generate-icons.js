const fs = require('fs');
const path = require('path');

// Create a simple 1024x1024 SVG icon with text "GST"
const iconSvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#1A237E"/>
  <text x="512" y="512" font-family="Arial" font-size="200" text-anchor="middle" fill="white" dominant-baseline="middle">GST</text>
</svg>`;

// Create a simple adaptive icon foreground
const adaptiveIconSvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <circle cx="512" cy="512" r="450" fill="#1A237E"/>
  <text x="512" y="512" font-family="Arial" font-size="200" text-anchor="middle" fill="white" dominant-baseline="middle">GST</text>
</svg>`;

// Create a simple favicon
const faviconSvg = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="#1A237E"/>
  <text x="32" y="32" font-family="Arial" font-size="20" text-anchor="middle" fill="white" dominant-baseline="middle">GST</text>
</svg>`;

// Paths for the icons
const iconPath = path.join(__dirname, 'assets', 'images', 'icon.png');
const adaptiveIconPath = path.join(__dirname, 'assets', 'images', 'adaptive-icon.png');
const faviconPath = path.join(__dirname, 'assets', 'images', 'favicon.png');

// Write the SVG files
fs.writeFileSync(iconPath.replace('.png', '.svg'), iconSvg);
fs.writeFileSync(adaptiveIconPath.replace('.png', '.svg'), adaptiveIconSvg);
fs.writeFileSync(faviconPath.replace('.png', '.svg'), faviconSvg);

console.log('SVG icons generated successfully!');
console.log('Note: For production, you should convert these SVGs to PNGs using a tool like Inkscape or SVGEXPORT.');
console.log('For now, you can rename the app.json to use .svg files instead of .png files.');
