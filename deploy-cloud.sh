#!/bin/bash

# GST Calculator - Cloud Deployment Script
# This script helps you deploy your app to the cloud using EAS

set -e

echo "🚀 GST Calculator - Cloud Deployment"
echo "===================================="

# Check if user is logged in to Expo
echo "📋 Checking Expo authentication..."
if ! npx expo whoami > /dev/null 2>&1; then
    echo "❌ You are not logged in to Expo."
    echo "Please run: npx expo login"
    exit 1
fi

USER=$(npx expo whoami)
echo "✅ Logged in as: $USER"

# Function to show menu
show_menu() {
    echo ""
    echo "What would you like to do?"
    echo "1) Build Android (Preview APK)"
    echo "2) Build Android (Production AAB)"
    echo "3) Build Android (Production APK)"
    echo "4) Build iOS (Preview)"
    echo "5) Build iOS (Production)"
    echo "6) Build All Platforms (Preview)"
    echo "7) Build All Platforms (Production)"
    echo "8) Build and Deploy Web"
    echo "9) Submit to App Stores"
    echo "10) View Build Status"
    echo "0) Exit"
    echo ""
    read -p "Enter your choice (0-10): " choice
}

# Function to build Android
build_android() {
    local profile=$1
    local type=$2
    echo "🤖 Building Android ($type)..."
    
    if [ "$profile" = "production-apk" ]; then
        npm run build:android:apk
    elif [ "$profile" = "production" ]; then
        npm run build:android:prod
    else
        npm run build:android:preview
    fi
}

# Function to build iOS
build_ios() {
    local profile=$1
    echo "🍎 Building iOS ($profile)..."
    
    if [ "$profile" = "production" ]; then
        npm run build:ios:prod
    else
        npm run build:ios:preview
    fi
}

# Function to build all platforms
build_all() {
    local profile=$1
    echo "🌍 Building all platforms ($profile)..."
    
    if [ "$profile" = "production" ]; then
        npm run build:all:prod
    else
        npm run build:all:preview
    fi
}

# Function to build and deploy web
build_web() {
    echo "🌐 Building and deploying web..."
    npm run build:web
    
    echo "Choose deployment target:"
    echo "1) Expo Hosting"
    echo "2) Firebase"
    echo "3) GitHub Pages"
    read -p "Enter choice (1-3): " web_choice
    
    case $web_choice in
        1)
            echo "Deploying to Expo Hosting..."
            npm run deploy:expo
            ;;
        2)
            echo "Deploying to Firebase..."
            npm run deploy:firebase
            ;;
        3)
            echo "Deploying to GitHub Pages..."
            npm run deploy:gh-pages
            ;;
        *)
            echo "Invalid choice"
            ;;
    esac
}

# Function to submit to app stores
submit_apps() {
    echo "📱 App Store Submission"
    echo "1) Submit to Google Play Store"
    echo "2) Submit to Apple App Store"
    echo "3) Submit to Both"
    read -p "Enter choice (1-3): " submit_choice
    
    case $submit_choice in
        1)
            echo "Submitting to Google Play Store..."
            npm run submit:android
            ;;
        2)
            echo "Submitting to Apple App Store..."
            npm run submit:ios
            ;;
        3)
            echo "Submitting to both stores..."
            npm run submit:android
            npm run submit:ios
            ;;
        *)
            echo "Invalid choice"
            ;;
    esac
}

# Function to view build status
view_builds() {
    echo "📊 Viewing build status..."
    npx eas build:list
}

# Main menu loop
while true; do
    show_menu
    
    case $choice in
        1)
            build_android "preview" "Preview APK"
            ;;
        2)
            build_android "production" "Production AAB"
            ;;
        3)
            build_android "production-apk" "Production APK"
            ;;
        4)
            build_ios "preview" "Preview"
            ;;
        5)
            build_ios "production" "Production"
            ;;
        6)
            build_all "preview"
            ;;
        7)
            build_all "production"
            ;;
        8)
            build_web
            ;;
        9)
            submit_apps
            ;;
        10)
            view_builds
            ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please try again."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
