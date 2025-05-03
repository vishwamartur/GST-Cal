const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create a feature graphic (1024x500 px)
function createFeatureGraphic() {
  const width = 1024;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1A237E');
  gradient.addColorStop(1, '#3949AB');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // App name
  ctx.fillStyle = 'white';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GST Calculator', width/2, height/2 - 50);
  
  // Tagline
  ctx.fillStyle = '#E8EAF6';
  ctx.font = '40px Arial';
  ctx.fillText('Simple, Fast & Accurate', width/2, height/2 + 50);
  
  // Save to file
  const imagesDir = path.join(__dirname, 'assets', 'images');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(imagesDir, 'feature-graphic.png'), buffer);
  console.log('Feature graphic created successfully!');
}

createFeatureGraphic();
