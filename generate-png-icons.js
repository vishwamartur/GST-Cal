const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Function to create a PNG icon
function createPngIcon(filename, width, height, backgroundColor, text) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${Math.floor(height/5)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width/2, height/2);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
}

// Create the icons directory if it doesn't exist
const imagesDir = path.join(__dirname, 'assets', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create app icon (1024x1024)
createPngIcon(
  path.join(imagesDir, 'icon.png'),
  1024,
  1024,
  '#1A237E',
  'GST'
);

// Create adaptive icon foreground (1024x1024)
createPngIcon(
  path.join(imagesDir, 'adaptive-icon.png'),
  1024,
  1024,
  '#1A237E',
  'GST'
);

// Create favicon (64x64)
createPngIcon(
  path.join(imagesDir, 'favicon.png'),
  64,
  64,
  '#1A237E',
  'GST'
);

console.log('All PNG icons generated successfully!');
