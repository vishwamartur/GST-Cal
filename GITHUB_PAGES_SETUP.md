# 🚀 GitHub Pages Deployment Setup

This guide will help you deploy your privacy policy to GitHub Pages using the automated CI/CD workflow.

## 📋 Prerequisites

- GitHub repository for your GST Calculator project
- Admin access to the repository

## 🛠 Setup Steps

### 1. Push Files to GitHub

First, commit and push all the new files to your GitHub repository:

```bash
git add .
git commit -m "Add privacy policy and GitHub Pages deployment workflow"
git push origin main
```

### 2. Enable GitHub Pages

1. Go to your GitHub repository: `https://github.com/vishwamartur/GST-Cal`
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

### 3. Trigger Deployment

The deployment will automatically trigger when you push the files. You can also manually trigger it:

1. Go to **Actions** tab in your repository
2. Select **Deploy Privacy Policy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select the main branch and click **Run workflow**

### 4. Check Deployment Status

1. Go to **Actions** tab
2. Click on the running workflow to see progress
3. Wait for all steps to complete (usually 2-3 minutes)

### 5. Access Your Privacy Policy

Once deployed, your privacy policy will be available at:
```
https://vishwamartur.github.io/GST-Cal/
```

## 📁 File Structure Created

```
.github/
└── workflows/
    └── deploy-privacy-policy.yml    # CI/CD workflow
docs/
├── index.html                      # Main styled privacy policy page
├── privacy-policy.txt              # Raw text version
└── README.md                       # Documentation
PRIVACY_POLICY.txt                  # Source privacy policy
GITHUB_PAGES_SETUP.md              # This setup guide
```

## 🔄 Automatic Updates

The privacy policy will automatically redeploy when you:
- Update `PRIVACY_POLICY.txt`
- Modify files in the `docs/` directory
- Update the GitHub Actions workflow

## 📱 For Google Play Store

Use this URL in your Google Play Store listing:
```
https://vishwamartur.github.io/GST-Cal/
```

## 🎨 Available Formats

Your privacy policy will be available in multiple formats:
- **Styled HTML:** `https://vishwamartur.github.io/GST-Cal/` (recommended)
- **Raw Text:** `https://vishwamartur.github.io/GST-Cal/privacy-policy.txt`

## 🔧 Troubleshooting

### Deployment Failed
1. Check the **Actions** tab for error details
2. Ensure GitHub Pages is enabled in repository settings
3. Verify the workflow file syntax

### Page Not Loading
1. Wait 5-10 minutes after first deployment
2. Check if GitHub Pages is set to "GitHub Actions" source
3. Verify the repository is public or you have GitHub Pro

### Update Not Reflecting
1. Clear browser cache
2. Check if the workflow ran successfully
3. Verify changes were committed to the main branch

## ✅ Verification

To verify everything is working:
1. Visit your privacy policy URL
2. Check that the content matches your `PRIVACY_POLICY.txt`
3. Verify the page loads properly on mobile devices
4. Test all format links work correctly

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs for detailed error messages
2. Verify repository permissions and settings
3. Ensure all files are properly committed and pushed

Your privacy policy is now ready for Google Play Store submission! 🎉
