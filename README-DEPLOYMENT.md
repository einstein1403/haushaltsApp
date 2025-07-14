# Deployment Guide für haushaltsApp

## 🚀 Quick Start

### Lokale Entwicklung
```bash
# 1. Environment Setup
cp .env.local .env

# 2. Start Services
docker-compose -f docker-compose.local.yml up -d

# 3. Access
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Unraid Deployment
```bash
# 1. Environment Setup
cp .env.unraid .env
nano .env  # Change passwords!

# 2. Start Services
docker-compose -f docker-compose.unraid.yml up -d

# 3. Access
# Frontend: http://UNRAID-IP:3000
```

## 📋 Deployment Files

| File | Purpose |
|------|---------|
| `docker-compose.local.yml` | Local development with builds |
| `docker-compose.unraid.yml` | Production deployment with registry images |
| `.env.local` | Development environment variables |
| `.env.unraid` | Production environment variables template |

## 🔧 Configuration

### Environment Variables
Copy the appropriate `.env` file and customize:

**Local Development (.env.local)**
```bash
DB_PASSWORD=password
JWT_SECRET=dev-secret-key-change-in-production
```

**Production (.env.unraid)**
```bash
DB_PASSWORD=your-secure-password
JWT_SECRET=your-secure-jwt-secret
```

**Generate secure JWT secret:**
```bash
openssl rand -base64 32
```

## 🐳 Container Images

Images are automatically built via GitHub Actions:
- `ghcr.io/einstein1403/haushaltsapp-frontend:latest`
- `ghcr.io/einstein1403/haushaltsapp-backend:latest`

## 🛡️ User Management

### First User Setup
1. Register first user → automatically becomes Admin
2. Subsequent users need admin approval
3. Admin can manage users via `/admin` route

### Ports
- **Frontend:** 3000 (HTTP)
- **Backend:** 3001 (API)  
- **Database:** 5432 (PostgreSQL)

## 💾 Data Persistence

### Local Development
- Data stored in Docker volume: `postgres_data`

### Unraid
- Data stored in: `/mnt/user/appdata/household-tasks/data/postgres`

## 🔄 Updates

### Local Development
```bash
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml build
docker-compose -f docker-compose.local.yml up -d
```

### Unraid
```bash
docker-compose -f docker-compose.unraid.yml pull
docker-compose -f docker-compose.unraid.yml up -d
```

## 🐛 Troubleshooting

### Common Issues
1. **Database connection failed:** Check `DB_PASSWORD` in `.env`
2. **Port already in use:** Change ports in compose file
3. **Permission denied:** Ensure Docker has access to mount paths

### Logs
```bash
# All services
docker-compose -f docker-compose.unraid.yml logs

# Specific service
docker-compose -f docker-compose.unraid.yml logs backend
```