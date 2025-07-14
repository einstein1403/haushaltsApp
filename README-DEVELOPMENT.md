# Development Setup

## 🔐 Environment Configuration

### First Time Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   cp .env.example server/.env
   ```

2. **Generate a secure JWT secret:**
   ```bash
   # For development, generate a secure key:
   openssl rand -base64 32
   # Copy this into your .env files as JWT_SECRET
   ```

3. **Configure your development database:**
   ```bash
   # Edit server/.env and set:
   DATABASE_URL=postgresql://your-username:your-password@localhost:5432/household_tasks
   ```

## 🚨 Security Reminders

- **.env files are automatically ignored by Git** - never commit them!
- **The .env.example file is safe to commit** - it contains no real secrets
- **Always use strong JWT secrets** in any environment
- **Never share your .env files** via chat, email, or any public channel

## 📁 File Structure

```
├── .env.example          # ✅ Safe template (commit this)
├── .env                  # 🚫 Your local config (never commit)
├── server/.env           # 🚫 Server config (never commit)
├── .gitignore           # ✅ Protects secrets (commit this)
└── SECURITY.md          # ✅ Security guidelines (commit this)
```

## 🛠 Development Commands

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Start only backend
npm run server:dev

# Start only frontend  
npm run client:dev
```

## 🔒 Security Features Active

- ✅ JWT secret validation (min 32 chars)
- ✅ CORS protection with origin whitelist
- ✅ Rate limiting (5 auth attempts/15min)
- ✅ Input validation with Joi schemas
- ✅ Structured error handling
- ✅ Password complexity requirements

## 🧪 Testing Your Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **If you see "FATAL ERROR: JWT_SECRET must be at least 32 characters":**
   - Edit your `server/.env` file
   - Replace `JWT_SECRET` with a value from `openssl rand -base64 32`

3. **Test the security features:**
   - Try logging in with wrong password 6 times (should get rate limited)
   - Try registering with weak password (should be rejected)
   - Try accessing admin routes without admin role (should be forbidden)

## 📋 Pre-commit Checklist

Before committing changes:

- [ ] No .env files in `git status`
- [ ] No hardcoded secrets in code
- [ ] .env.example updated if new variables added
- [ ] Security documentation updated if needed