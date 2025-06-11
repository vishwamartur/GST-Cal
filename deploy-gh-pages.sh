#!/bin/bash

# Build the project
npm run build:web

# Create a temporary directory for deployment
mkdir -p gh-pages-deploy
cp -r dist/* gh-pages-deploy/

# Initialize git in the deployment directory
cd gh-pages-deploy
git init
git add .
git commit -m "Deploy to GitHub Pages"

# Push to the gh-pages branch
git push --force https://github.com/vishwamartur/GST-Cal.git master:gh-pages

# Clean up
cd ..
rm -rf gh-pages-deploy

echo "Deployed to GitHub Pages!"
