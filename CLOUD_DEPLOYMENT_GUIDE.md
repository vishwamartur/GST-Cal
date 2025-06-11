# GST Calculator - Cloud Deployment Guide

This guide will help you deploy and build your GST Calculator app on the cloud using Expo Application Services (EAS).

## Prerequisites

1. **Expo Account**: Make sure you have an Expo account at https://expo.dev
2. **EAS CLI**: Already installed in this project as a dev dependency
3. **Git**: Ensure your code is committed to git

## Step 1: Login to Expo

First, you need to authenticate with your Expo account:

```bash
npx expo login
```

Enter your Expo credentials when prompted.

## Step 2: Verify Project Configuration

Your project is already configured with:
- ✅ EAS project ID in `app.json`
- ✅ Build profiles in `eas.json`
- ✅ Build scripts in `package.json`

## Step 3: Cloud Builds

### Android Builds

**Preview Build (APK for testing):**
```bash
npm run build:android:preview
```

**Production Build (AAB for Play Store):**
```bash
npm run build:android:prod
```

**Production APK (for direct distribution):**
```bash
npm run build:android:apk
```

### iOS Builds

**Preview Build (Simulator):**
```bash
npm run build:ios:preview
```

**Production Build (App Store):**
```bash
npm run build:ios:prod
```

### Build All Platforms

**Preview builds for both platforms:**
```bash
npm run build:all:preview
```

**Production builds for both platforms:**
```bash
npm run build:all:prod
```

## Step 4: Web Deployment

### Build Web Version
```bash
npm run build:web
```

### Deploy to Expo Hosting
```bash
npm run deploy:expo
```

### Deploy to Firebase (if configured)
```bash
npm run deploy:firebase
```

### Deploy to GitHub Pages
```bash
npm run deploy:gh-pages
```

## Step 5: App Store Submission

After successful production builds, you can submit to app stores:

**Submit to Google Play Store:**
```bash
npm run submit:android
```

**Submit to Apple App Store:**
```bash
npm run submit:ios
```

## Build Profiles Explained

- **development**: Creates development builds with debugging enabled
- **preview**: Creates internal distribution builds for testing
- **production**: Creates optimized builds for app stores
- **production-apk**: Creates production APK files for direct distribution

## Monitoring Builds

1. Visit https://expo.dev/accounts/vishwamartur/projects/gst-calculator
2. Go to the "Builds" section to monitor progress
3. Download completed builds from the dashboard

## Environment Variables

If your app uses environment variables, add them to your build profiles in `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://your-api.com"
      }
    }
  }
}
```

## Troubleshooting

### Common Issues:

1. **Build fails**: Check the build logs in the Expo dashboard
2. **Authentication errors**: Run `npx expo logout` then `npx expo login`
3. **Version conflicts**: Run `npm run update` to fix dependency issues

### Getting Help:

- Expo Documentation: https://docs.expo.dev/
- EAS Build Documentation: https://docs.expo.dev/build/introduction/
- Community Forum: https://forums.expo.dev/

## Next Steps

1. **Set up CI/CD**: Configure GitHub Actions for automatic builds
2. **Add OTA Updates**: Use Expo Updates for over-the-air updates
3. **Analytics**: Add Expo Analytics to track app usage
4. **Crash Reporting**: Integrate crash reporting services

## Quick Commands Reference

```bash
# Login to Expo
npx expo login

# Build for Android (preview)
npm run build:android:preview

# Build for iOS (preview)
npm run build:ios:preview

# Build web version
npm run build:web

# Deploy to Expo hosting
npm run deploy:expo

# Check build status
npx eas build:list

# View project info
npx expo whoami
```
