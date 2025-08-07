#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const COVERS_DIR = path.join(__dirname, '../public/project-covers');
const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.gif'];

async function optimizeImages() {
  try {
    const files = await fs.readdir(COVERS_DIR);
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      
      if (SUPPORTED_FORMATS.includes(ext) && ext !== '.gif') {
        const inputPath = path.join(COVERS_DIR, file);
        const outputPath = path.join(COVERS_DIR, `${path.basename(file, ext)}.webp`);
        
        // Check if webp version already exists
        try {
          await fs.access(outputPath);
          console.log(`✓ WebP version already exists for ${file}`);
          continue;
        } catch {
          // File doesn't exist, proceed with conversion
        }
        
        console.log(`Converting ${file} to WebP...`);
        
        await sharp(inputPath)
          .webp({ quality: 85 })
          .toFile(outputPath);
          
        console.log(`✓ Created ${path.basename(outputPath)}`);
      }
    }
    
    console.log('\n✨ Image optimization complete!');
  } catch (error) {
    console.error('Error optimizing images:', error);
    process.exit(1);
  }
}

optimizeImages();