# Security & Secrets Management

## Overview

This document outlines security best practices for managing sensitive credentials and API keys in this portfolio application.

## 🔐 Protecting Secrets

### Environment Variables

All sensitive information (API keys, tokens, emails) must be stored as environment variables, never hardcoded in source files.

**Required environment variables:**

- `RESEND_API_KEY` - API key for Resend email service
- `CONTACT_FROM_EMAIL` - Email address for sending portfolio contact responses
- `CONTACT_TO_EMAIL` (optional) - Email address to receive form submissions
- `EMAIL_ASSET_BASE_URL` (optional) - Base URL for email template assets
- `EMAIL_FORM_RESPONSE_ASSET_BASE_URL` (optional) - Base URL for form response assets

### Local Development Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your actual secrets to `.env` (NOT tracked by Git):**
   ```bash
   RESEND_API_KEY=re_your_actual_api_key_here
   CONTACT_FROM_EMAIL=your-email@yourdomain.com
   CONTACT_TO_EMAIL=recipient@yourdomain.com
   EMAIL_ASSET_BASE_URL=https://yourdomain.com/email/images
   EMAIL_FORM_RESPONSE_ASSET_BASE_URL=https://yourdomain.com/form_response/images
   NODE_ENV=development
   ```

3. **Verify `.env` is in `.gitignore`:**
   ```bash
   cat .gitignore | grep "^\.env"
   ```

4. **Never commit `.env`:**
   ```bash
   # Check status before committing
   git status
   
   # If .env was accidentally staged, remove it
   git rm --cached .env
   git commit --amend -m "Remove .env from tracking"
   ```

### Production Deployment (Vercel)

1. **Set environment variables in Vercel dashboard:**
   - Go to Project Settings → Environment Variables
   - Add each secret from your `.env` file
   - Apply to Production, Preview, and Development environments

2. **Never hardcode secrets in:**
   - Source code files
   - Configuration files
   - Commit messages
   - GitHub issues or discussions
   - CI/CD pipeline files (unless using platform secrets)

## ✅ Best Practices

### 1. Use Placeholder Values in `.env.example`

The `.env.example` file uses placeholder values to show required variables:

```bash
# ✅ Good - .env.example (tracked in Git)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_FROM_EMAIL=Portfolio <hello@yourdomain.com>

# ❌ Wrong - Never put real keys in .env.example
RESEND_API_KEY=re_bm5RBXiy_5pZKh9n5iCyMJEt1DZfconLy
```

### 2. Validate Required Secrets at Startup

The application validates that required environment variables are present:

```javascript
if (!RESEND_API_KEY) {
  throw new Error(`Missing required environment variable: RESEND_API_KEY`);
}
```

If running in production without required secrets, the server will return a clear error instead of silently failing.

### 3. Development vs Production

The application differentiates between environments:

```javascript
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  // Local development mode - returns mock responses
  return json(res, 200, { ok: true, skipped: true, warning: "..." });
} else {
  // Production mode - returns actual errors
  return json(res, 500, { error: "Email service is not configured" });
}
```

### 4. Git Configuration

Ensure git is configured to prevent accidental commits:

```bash
# Exclude .env from all commits
git config core.excludesfile ~/.gitignore_global

# Add this to ~/.gitignore_global:
# .env
# .env.local
# *.pem
# *.key
```

## 🚨 If You Accidentally Expose a Secret

### Immediate Actions

1. **Invalidate the secret:**
   - Resend: Regenerate API key at https://resend.com/api-keys
   - Update all dependent services with the new key

2. **Check Git history:**
   ```bash
   # Search for the exposed key in commits
   git log -S "re_your_exposed_key" --oneline
   
   # View the commit details
   git show <commit-hash>
   ```

3. **Clean Git history (if needed):**
   
   If the key is in recent commits:
   
   ```bash
   # Install git-filter-repo if not already installed
   pip install git-filter-repo
   
   # Remove the secret from history
   git filter-repo --replace-text <(echo "re_exposed_key==>re_xxxxxxxxxxxx")
   
   # Force push to remote (WARNING: This rewrites history)
   git push --force-with-lease origin main
   ```

### Prevention

- Use pre-commit hooks to catch secrets before they're committed
- Use GitHub's secret scanning features
- Regularly audit Git history with tools like `git-secrets`
- Enable branch protection rules requiring code review

## 🔍 Auditing Secrets

### Check for Exposed Secrets

```bash
# Search Git history for common secret patterns
git log -p | grep -i "api.key\|password\|secret\|token\|re_"

# Use git-secrets to scan
git secrets --scan

# Use truffleHog to find secrets in Git history
truffleHog git file://. --json
```

### Enable Git Hooks

```bash
# Install git-secrets locally
brew install trufflesecurity/truffles/trufflehog

# Add pre-commit hook
echo '#!/bin/bash\ntrufflehog git file://. --only-verified' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## 📋 Checklist for New Developers

- [ ] Copy `.env.example` to `.env`
- [ ] Fill in your actual API keys in `.env`
- [ ] Verify `.env` is in `.gitignore` and not tracked
- [ ] Run `npm install` to install dependencies
- [ ] Test the contact form locally to verify configuration
- [ ] Never commit `.env` or any file containing real secrets
- [ ] Use `git status` before each commit to check for unintended files

## 📞 Contact Form Configuration

The contact form requires these environment variables to function:

| Variable | Required | Purpose |
|----------|----------|---------|
| `RESEND_API_KEY` | Yes | Authenticate with Resend API |
| `CONTACT_FROM_EMAIL` | Yes | Sender email address for responses |
| `CONTACT_TO_EMAIL` | No | Recipient email (defaults to `CONTACT_FROM_EMAIL`) |
| `EMAIL_ASSET_BASE_URL` | No | Base URL for thank-you email assets |
| `EMAIL_FORM_RESPONSE_ASSET_BASE_URL` | No | Base URL for owner notification assets |

### Testing Contact Form Locally

1. Ensure `.env` is configured with your secrets
2. Run `npm run dev` to start the development server
3. The contact form will work with actual email delivery
4. If secrets are missing, the form returns a mock response with a warning

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All required environment variables are set in Vercel dashboard
- [ ] No secrets appear in environment variables endpoint
- [ ] `NODE_ENV` is set to `production` on Vercel
- [ ] Git history is clean (no exposed secrets)
- [ ] Recent commits don't contain hardcoded API keys
- [ ] Third-party secret scanning (GitGuardian, etc.) shows no issues

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [git-secrets](https://github.com/awslabs/git-secrets)

## Questions?

If you find a security issue or have questions about secrets management, please reach out to the project maintainer privately. Do not create GitHub issues containing sensitive information.
