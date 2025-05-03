const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Function to create a PNG icon
function createPlayStoreIcon() {
  const width = 512;
  const height = 512;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#1A237E';
  ctx.fillRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${Math.floor(height/5)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GST', width/2, height/2);
  
  // Save to file
  const imagesDir = path.join(__dirname, 'assets', 'images');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(imagesDir, 'play-store-icon.png'), buffer);
  console.log('Play Store icon (512x512) created successfully!');
}

createPlayStoreIcon();
