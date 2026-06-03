# Security Policy

## Reporting Vulnerabilities

Email security@moneymate.com for any security issues.

## Security Features

### Authentication
- ✅ JWT (JSON Web Token) based authentication
- ✅ Bearer token in Authorization header
- ✅ Automatic token refresh
- ✅ Auto-logout on token expiry

### Data Protection
- ✅ HTTPS/TLS encryption (recommended)
- ✅ XSS prevention
- ✅ CSRF token support
- ✅ Input validation
- ✅ Secure token storage

### API Security
- ✅ CORS configured
- ✅ Request timeout (30 seconds)
- ✅ Error handling
- ✅ Rate limiting (via backend)

## Security Headers

Configure on your server:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

## Best Practices

1. **Always use HTTPS** in production
2. **Environment variables** for API URLs
3. **Short token expiry** (15-30 minutes)
4. **Regular security audits**
5. **Update dependencies** regularly

```bash
npm audit
npm audit fix
npm update
```

## Compliance

- ✅ GDPR ready
- ✅ Data privacy focused
- ✅ Secure authentication
