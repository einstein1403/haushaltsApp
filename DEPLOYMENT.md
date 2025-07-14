# 🚀 Deployment Guide

## Container Images

This app is available as pre-built container images:

- **Frontend**: `ghcr.io/DEIN-USERNAME/household-tasks-app-frontend:latest`
- **Backend**: `ghcr.io/DEIN-USERNAME/household-tasks-app-backend:latest`

## Quick Deploy with Docker Compose

### 1. Create Environment File
```bash
cat > .env << 'EOF'
DB_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret-key
EOF
```

### 2. Download Docker Compose File
```bash
wget https://raw.githubusercontent.com/DEIN-USERNAME/household-tasks-app/main/docker-compose.registry.yml
```

### 3. Start Services
```bash
docker-compose -f docker-compose.registry.yml up -d
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## Unraid Deployment

### Option 1: Community Applications
1. Install **Community Applications** plugin
2. Search for "Household Tasks"
3. Install both **HouseholdTasks-Backend** and **HouseholdTasks** containers
4. Configure database credentials

### Option 2: Manual Template Installation
1. Download templates:
   - [Backend Template](https://raw.githubusercontent.com/DEIN-USERNAME/household-tasks-app/main/unraid-backend-template.xml)
   - [Frontend Template](https://raw.githubusercontent.com/DEIN-USERNAME/household-tasks-app/main/unraid-template.xml)
2. Import via **Docker** → **Add Container** → **Template**

### Option 3: Docker Compose (Recommended)
```bash
# SSH to Unraid
ssh root@unraid-ip

# Create directory
mkdir -p /mnt/user/appdata/household-tasks
cd /mnt/user/appdata/household-tasks

# Download compose file
wget https://raw.githubusercontent.com/DEIN-USERNAME/household-tasks-app/main/docker-compose.registry.yml

# Create secure environment
echo "DB_PASSWORD=$(openssl rand -base64 20)" > .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env

# Start services
docker-compose -f docker-compose.registry.yml up -d
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_PASSWORD` | PostgreSQL password | Yes | `changeme` |
| `JWT_SECRET` | JWT signing secret | Yes | `changeme-please` |
| `NODE_ENV` | Node environment | No | `production` |
| `DATABASE_URL` | Full database URL | No | Auto-generated |

## Health Checks

- **Backend**: `GET /api/health`
- **Frontend**: `GET /` (returns 200 if healthy)

## Persistent Data

### Important Directories
- **Database**: `/var/lib/postgresql/data`
- **Logs**: Container logs via `docker logs`

### Backup Strategy
```bash
# Backup database
docker exec household-db pg_dump -U postgres household_tasks > backup.sql

# Backup complete data directory
tar -czf backup-$(date +%Y%m%d).tar.gz /mnt/user/appdata/household-tasks/data/
```

## Updates

### Automatic Updates (Watchtower)
```yaml
# Add to docker-compose.yml
watchtower:
  image: containrrr/watchtower
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
  command: --interval 30 --cleanup
```

### Manual Updates
```bash
# Pull latest images
docker-compose -f docker-compose.registry.yml pull

# Restart with new images
docker-compose -f docker-compose.registry.yml up -d
```

## Troubleshooting

### Check Container Status
```bash
docker-compose -f docker-compose.registry.yml ps
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.registry.yml logs -f

# Specific service
docker-compose -f docker-compose.registry.yml logs -f backend
```

### Database Connection Issues
```bash
# Test database connection
docker exec -it household-db psql -U postgres -d household_tasks -c "SELECT NOW();"
```

### Reset Application
```bash
# Stop services
docker-compose -f docker-compose.registry.yml down

# Remove database (WARNING: This deletes all data!)
docker volume rm household-tasks_postgres_data

# Restart
docker-compose -f docker-compose.registry.yml up -d
```

## Security Considerations

1. **Change default passwords** in `.env` file
2. **Use strong JWT secrets** (32+ characters)
3. **Enable firewall** rules for your server
4. **Regular backups** of database
5. **Keep images updated** with Watchtower or manual updates

## Performance Tuning

### For High Usage
```yaml
# Add to backend service in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

### Database Optimization
```yaml
# Add to database service
environment:
  - POSTGRES_SHARED_PRELOAD_LIBRARIES=pg_stat_statements
  - POSTGRES_MAX_CONNECTIONS=100
```