# 🚀 Quick Start: Cloud Deployment for GST Calculator

## ✅ What's Already Set Up

Your project is now configured with:

- ✅ **EAS CLI** installed locally
- ✅ **Enhanced build profiles** in `eas.json`
- ✅ **Additional npm scripts** for easy deployment
- ✅ **GitHub Actions workflow** for CI/CD
- ✅ **Interactive deployment script** (`deploy-cloud.sh`)
- ✅ **Dependencies updated** for Expo SDK 52

## 🎯 Next Steps (You Need to Do These)

### 1. Login to Expo (Required)

```bash
npx expo login
```

Enter your Expo account credentials when prompted.

### 2. Start Building on Cloud

#### Option A: Use the Interactive Script (Recommended)
```bash
./deploy-cloud.sh
```

This will show you a menu with all available options.

#### Option B: Use Direct Commands

**Build Android Preview (APK for testing):**
```bash
npm run build:android:preview
```

**Build iOS Preview (Simulator):**
```bash
npm run build:ios:preview
```

**Build Web and Deploy:**
```bash
npm run build:web
npm run deploy:expo
```

### 3. Monitor Your Builds

Visit your project dashboard:
https://expo.dev/accounts/vishwamartur/projects/gst-calculator

## 📱 Available Build Commands

| Command | Description |
|---------|-------------|
| `npm run build:android:preview` | Android APK for testing |
| `npm run build:android:prod` | Android AAB for Play Store |
| `npm run build:android:apk` | Android APK for production |
| `npm run build:ios:preview` | iOS build for simulator |
| `npm run build:ios:prod` | iOS build for App Store |
| `npm run build:all:preview` | Both platforms (preview) |
| `npm run build:all:prod` | Both platforms (production) |
| `npm run build:web` | Web build |
| `npm run deploy:expo` | Deploy web to Expo hosting |

## 🔄 Automatic Builds with GitHub Actions

### Setup (One-time):

1. Go to your GitHub repository settings
2. Navigate to **Secrets and variables** → **Actions**
3. Add a new secret named `EXPO_TOKEN`
4. Get your token from: https://expo.dev/accounts/settings/access-tokens
5. Paste the token value

### What it does:
- ✅ Builds web version on every push to main
- ✅ Creates preview builds for all platforms
- ✅ Manual builds via GitHub Actions interface

## 🌐 Web Deployment Options

Your app can be deployed to multiple platforms:

1. **Expo Hosting** (Recommended)
   ```bash
   npm run deploy:expo
   ```

2. **Firebase Hosting**
   ```bash
   npm run deploy:firebase
   ```

3. **GitHub Pages**
   ```bash
   npm run deploy:gh-pages
   ```

## 📊 Monitoring and Management

**Check build status:**
```bash
npx eas build:list
```

**View project info:**
```bash
npx expo whoami
```

**Check for issues:**
```bash
npx expo-doctor
```

## 🏪 App Store Submission

After successful production builds:

**Google Play Store:**
```bash
npm run submit:android
```

**Apple App Store:**
```bash
npm run submit:ios
```

## 🆘 Troubleshooting

### Common Issues:

1. **"Not logged in" error**
   ```bash
   npx expo logout
   npx expo login
   ```

2. **Build fails**
   - Check build logs in Expo dashboard
   - Ensure all dependencies are compatible

3. **Version conflicts**
   ```bash
   npm run update
   ```

### Get Help:
- 📖 [Expo Documentation](https://docs.expo.dev/)
- 🏗️ [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- 💬 [Community Forum](https://forums.expo.dev/)

## 🎉 Ready to Deploy!

Your GST Calculator is now ready for cloud deployment. Start with:

```bash
npx expo login
./deploy-cloud.sh
```

Choose option 1 or 6 for your first build to test everything works correctly!

---

**Project Dashboard:** https://expo.dev/accounts/vishwamartur/projects/gst-calculator
