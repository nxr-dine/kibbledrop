# Kibbledrop Documentation

## Available Documentation Files (Local Only)

For security reasons, the following documentation files are kept locally and not committed to the repository:

### 📋 Client Documentation

- `ADMIN_DOCUMENTATION.md` - Complete admin panel guide
- `CLIENT_SETUP_GUIDE.md` - Quick start guide for client
- `CLIENT_EMAIL_TEMPLATE.md` - Ready-to-send email template
- `ADMIN_VERIFICATION.md` - Admin account verification details

### 🔧 Admin Setup

- `scripts/create-admin.ts` - Script to create admin users

## 🔐 Security Notes

These files contain sensitive information including:

- Admin login credentials
- Database access details
- Setup instructions with passwords

**Important:** These files are excluded from git tracking via `.gitignore` to prevent accidentally exposing credentials in the public repository.

## 📧 Client Handoff

To provide documentation to your client:

1. Use the files available locally
2. Send them privately (email, secure file transfer)
3. Do not commit them to any public repository
4. Consider creating sanitized versions without credentials for public documentation

## 🔧 Creating Admin Users

To create additional admin users, run:

```bash
npm run create-admin
```

This script is also kept local for security.

---

**Note:** All documentation files remain available in your local workspace for client delivery.
