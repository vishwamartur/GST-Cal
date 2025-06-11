# GST Calculator Deployment Guide

This document provides instructions for deploying the GST Calculator application to various platforms.

## 🚀 Current Deployment Status

### Live Web Application
- **URL**: https://vishwamartur.github.io/GST-Cal/
- **Status**: ✅ Live and Active
- **Platform**: GitHub Pages
- **Last Deployed**: June 11, 2025
- **Features**: Full GST calculator with CGST/SGST separation

## Web Deployment

### Local Testing

1. Build the web version:
   ```
   npm run build:web
   ```

2. Run the local server:
   ```
   node simple-server.js
   ```

3. Open your browser and navigate to http://localhost:3000

### Deploy to GitHub Pages

1. The deployment script is already configured for this repository.

2. Run the deployment script:
   ```
   npm run deploy:gh-pages
   ```
   or
   ```
   ./deploy-gh-pages.sh
   ```

3. Your application will be available at: https://vishwamartur.github.io/GST-Cal/

### Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize your project (if not already done):
   ```
   firebase init
   ```

4. Update the `.firebaserc` file with your Firebase project ID.

5. Deploy to Firebase:
   ```
   firebase deploy
   ```

6. Your application will be available at `https://[project-id].web.app`

## Mobile App Deployment

### Setup Expo Application Services (EAS)

1. Install EAS CLI:
   ```
   npm install -g eas-cli
   ```

2. Login to your Expo account:
   ```
   eas login
   ```

3. Configure your app:
   ```
   eas build:configure
   ```

### Build for Android

1. Build an Android APK for internal distribution:
   ```
   eas build -p android --profile preview
   ```

2. Build for Google Play Store:
   ```
   eas build -p android --profile production
   ```

### Build for iOS

1. Build for TestFlight:
   ```
   eas build -p ios --profile preview
   ```

2. Build for App Store:
   ```
   eas build -p ios --profile production
   ```

### Submit to App Stores

1. Submit to Google Play Store:
   ```
   eas submit -p android
   ```

2. Submit to Apple App Store:
   ```
   eas submit -p ios
   ```

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
