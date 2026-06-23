# Git Commit & History Cleanup Guide

## 📝 Step 1: Commit Security Fixes

All security fixes have been prepared. Commit them with these commands:

### Commit the security updates (no force push needed):
```bash
cd c:\Freelance\Portfolio

# Stage all security-related changes
git add .env.example .gitignore api/contact.js README.md SECURITY.md SECURITY_REPORT.md

# Verify the changes
git status

# Commit with a clear message
git commit -m "🔒 Security: Remove exposed Resend API key and implement secret management

- Replace exposed API key in .env.example with placeholder
- Enhance .gitignore with explicit secret file patterns
- Improve error validation for missing environment variables
- Add comprehensive SECURITY.md documentation
- Update README.md with environment setup instructions
- Create SECURITY_REPORT.md with audit findings

Resolves GitGuardian alert: Exposed Resend API key"

# Push to remote
git push origin main
```

---

## ⚠️ Step 2: Clean Git History (Optional but Recommended)

The exposed API key exists in commit `0aada7a` in the Git history. To remove it completely:

### Option A: Using git-filter-repo (Recommended - Safer)

```bash
# Step 1: Install git-filter-repo
# Windows (with Chocolatey installed):
choco install git-filter-repo

# OR on Windows (with pip):
pip install git-filter-repo

# macOS:
brew install git-filter-repo

# Linux:
pip install git-filter-repo

# Step 2: Navigate to your repository
cd c:\Freelance\Portfolio

# Step 3: Create a backup of your repository (IMPORTANT!)
git clone --bare . ./Portfolio.git.backup
echo "Backup created at ./Portfolio.git.backup"

# Step 4: Remove the exposed key from all Git history
git filter-repo --replace-text <(echo "re_bm5RBXiy_5pZKh9n5iCyMJEt1DZfconLy==>re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx")

# Step 5: Verify the key is removed
git log --all -S "re_bm5RBXiy"  # Should return nothing

# Step 6: Force push the cleaned history to GitHub
# WARNING: This rewrites Git history for everyone
git push --force-with-lease origin main
```

### Option B: Using git filter-branch (Alternative)

```bash
cd c:\Freelance\Portfolio

# Create a backup first
git clone --bare . ./Portfolio.git.backup

# Remove the key from history
git filter-branch --tree-filter 'sed -i "s/re_bm5RBXiy_5pZKh9n5iCyMJEt1DZfconLy/re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx/g" .env.example' -f -- --all

# Verify removal
git log --all -S "re_bm5RBXiy"

# Force push
git push --force-with-lease origin main
```

### Option C: Using BFG Repo-Cleaner (Fast Alternative)

```bash
# Install BFG (if not already installed)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Create backup
git clone --bare . ./Portfolio.git.backup

# Remove the exposed key
bfg --replace-text <(echo "re_bm5RBXiy_5pZKh9n5iCyMJEt1DZfconLy==>re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx") .

# Reclaim unused space
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force-with-lease origin main
```

---

## 🔑 Step 3: Regenerate and Update Resend API Key

The exposed key must be invalidated immediately:

```bash
# 1. Go to Resend API Keys page
# https://resend.com/api-keys

# 2. Revoke the exposed key:
# - Click the exposed key: re_bm5RBXiy_5pZKh9n5iCyMJEt1DZfconLy
# - Click "Revoke"
# - Confirm revocation

# 3. Generate a new API key
# - On the Resend dashboard, click "Create API Key"
# - Copy the new key

# 4. Update Vercel environment variables
# Go to: https://vercel.com/dashboard
# - Select your project
# - Go to Settings → Environment Variables
# - Update RESEND_API_KEY with the new value
# - Apply to Production, Preview, and Development
# - Redeploy the project
```

---

## 👥 Step 4: Notify Collaborators (If applicable)

If you force-push the history, collaborators need to be informed:

```bash
# Send this message to your team:
"""
⚠️  IMPORTANT: Git history has been rewritten

We've removed an exposed API key from the Git history for security reasons.

If you have a local clone, please do one of the following:

Option 1: Fresh clone
  rm -rf Portfolio
  git clone <repository-url>

Option 2: Merge with new history
  git fetch origin
  git checkout main
  git reset --hard origin/main

Option 3: Rebase your branches
  git rebase --root
  git push --force-with-lease origin <your-branch>

Please update your .env file with the new RESEND_API_KEY from Vercel.

Questions? Read SECURITY.md for guidelines.
"""
```

---

## 📋 Verification Checklist

After completing these steps, verify everything is secure:

```bash
cd c:\Freelance\Portfolio

# 1. Verify no exposed key in current files
grep -r "re_bm5RBXiy" .env* src/ api/ 2>/dev/null || echo "✓ No exposed key found in current files"

# 2. Verify no exposed key in Git history
git log --all -S "re_bm5RBXiy" --oneline || echo "✓ No exposed key found in Git history"

# 3. Verify .env is in .gitignore
grep "^\.env" .gitignore && echo "✓ .env is in .gitignore"

# 4. Verify .env is not tracked
git ls-files | grep "^\.env$" && echo "❌ .env is tracked!" || echo "✓ .env is not tracked"

# 5. Verify no .env file is staged
git status | grep "\.env" && echo "❌ .env might be staged!" || echo "✓ .env is not staged"

# 6. Build the project to verify everything still works
npm run build && echo "✓ Project builds successfully"
```

---

## 🚨 If You Made a Mistake

### Undo the commit (before pushing):
```bash
git reset --soft HEAD~1      # Undo commit, keep changes staged
git reset HEAD               # Unstage changes
git restore .               # Discard all changes
```

### Undo the force push (if it was already pushed):
```bash
# Recover the previous state
git reflog
# Find the commit before the filter-repo
git reset --hard <commit-hash>
git push --force-with-lease origin main

# Contact GitHub support if needed
```

---

## ✅ Security Best Practices Going Forward

1. **Before every commit:**
   ```bash
   git status  # Verify .env is not staged
   ```

2. **Set up pre-commit hooks:**
   ```bash
   # Create .git/hooks/pre-commit
   #!/bin/bash
   if git diff --cached | grep -E "(RESEND_API_KEY|password|secret|token)" > /dev/null; then
     echo "❌ ERROR: Attempting to commit a secret!"
     exit 1
   fi
   
   chmod +x .git/hooks/pre-commit
   ```

3. **Enable GitHub secret scanning:**
   - Go to your repository
   - Settings → Security & analysis
   - Enable "Secret scanning"

4. **Use git-secrets:**
   ```bash
   # Install
   brew install git-secrets
   
   # Initialize
   git secrets --install
   git secrets --register-aws
   
   # Scan
   git secrets --scan
   ```

5. **Use pre-commit framework:**
   ```bash
   # Install pre-commit
   pip install pre-commit
   
   # Create .pre-commit-config.yaml
   repos:
     - repo: https://github.com/Yelp/detect-secrets
       rev: v1.4.0
       hooks:
         - id: detect-secrets
   
   # Install the hook
   pre-commit install
   ```

---

## 📞 Commands Summary

### Quick reference - Copy and paste:

```bash
# Commit security fixes
cd c:\Freelance\Portfolio
git add .env.example .gitignore api/contact.js README.md SECURITY.md SECURITY_REPORT.md
git commit -m "🔒 Security: Remove exposed Resend API key and implement secret management"
git push origin main

# Clean Git history (optional - choose ONE option)
# Option A: git-filter-repo
git filter-repo --replace-text <(echo "re_bm5RBXiy_5pZKh9n5iCyMJEt1DZfconLy==>re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx")
git push --force-with-lease origin main

# Verify everything
git log --all -S "re_bm5RBXiy" --oneline || echo "✓ Clean!"
npm run build && echo "✓ Build passes!"
```

---

## 📚 Additional Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [git-filter-repo Documentation](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [git-secrets](https://github.com/awslabs/git-secrets)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Last Updated:** June 23, 2026  
**Status:** Ready for deployment
