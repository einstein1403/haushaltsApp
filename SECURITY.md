# Security Guidelines

## Environment Configuration

### 🚨 CRITICAL: Never commit .env files to Git!

The `.env.example` file shows the required environment variables, but **never commit actual `.env` files with real secrets**.

### Required Environment Variables

For **production deployment**, you MUST set these environment variables:

```bash
# Generate a secure JWT secret (REQUIRED in production)
JWT_SECRET=$(openssl rand -base64 32)

# Database connection (REQUIRED)
DATABASE_URL=postgresql://username:password@host:port/database

# Server configuration
PORT=3001
NODE_ENV=production

# CORS configuration (comma-separated allowed origins)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security settings
BCRYPT_ROUNDS=12
```

### Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Generate a secure JWT secret:**
   ```bash
   openssl rand -base64 32
   ```

3. **Edit `.env` with your actual values**

4. **NEVER commit the `.env` file to Git**

## Security Features Implemented

### ✅ Authentication & Authorization
- JWT tokens with secure secret validation
- User role-based access control (admin/user)
- Account approval system

### ✅ Rate Limiting
- Auth endpoints: 5 attempts per 15 minutes
- General APIs: 100 requests per 15 minutes
- IP-based rate limiting

### ✅ Input Validation
- Joi schema validation on all endpoints
- Password complexity requirements
- SQL injection protection
- XSS protection through input sanitization

### ✅ CORS Protection
- Strict origin validation in production
- Development/production environment separation
- No wildcard origins allowed

### ✅ Error Handling
- Sanitized error messages (no sensitive data exposure)
- Structured error responses
- Proper HTTP status codes

## Deployment Checklist

Before deploying to production:

- [ ] Set strong JWT_SECRET (minimum 32 characters)
- [ ] Configure ALLOWED_ORIGINS with your actual domains
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS in production
- [ ] Set up proper database credentials
- [ ] Configure rate limiting for your use case
- [ ] Enable application logging
- [ ] Set up monitoring and alerting
- [ ] Regular security updates for dependencies

## Reporting Security Issues

If you discover a security vulnerability, please email [your-email] instead of opening a public issue.

## Security Headers (Recommended)

Consider adding these security headers in production:

```javascript
// In your Express app
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```