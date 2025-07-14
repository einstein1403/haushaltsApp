# Deployment Guide für haushaltsApp

## GitHub Container Registry Setup

### 1. Repository Setup
Die Konfiguration ist bereits für den GitHub Benutzer `einstein1403` eingerichtet.

### 2. Automatisches Image Building
Die GitHub Actions Workflow (`.github/workflows/docker-build.yml`) baut automatisch Docker Images wenn:
- Code zum `main` oder `develop` Branch gepusht wird
- Pull Requests erstellt werden
- Git Tags erstellt werden (für Versionen)

### 3. Deployment Optionen

#### Option A: Docker Compose mit Registry Images
```bash
# Verwendet vorgefertigte Images von GitHub Container Registry
docker-compose -f docker-compose.registry.yml up -d
```

#### Option B: Docker Compose mit lokalem Build
```bash
# Baut Images lokal
docker-compose up -d
```

#### Option C: Unraid Server
1. Frontend Template: `unraid-template.xml` importieren
2. Backend Template: `unraid-backend-template.xml` importieren
3. PostgreSQL Container separat einrichten
4. Container in richtiger Reihenfolge starten

### 4. Umgebungsvariablen
Erstellen Sie eine `.env` Datei:
```
DB_PASSWORD=sicheres-passwort
JWT_SECRET=sehr-sicherer-jwt-schluessel
```

### 5. Ports
- Frontend: 3000 (HTTP)
- Backend: 3001 (API)
- Database: 5432 (PostgreSQL)

### 6. Persistente Daten
Die PostgreSQL Daten werden in einem Volume gespeichert:
- Docker Compose: `postgres_data` Volume
- Unraid: `/mnt/user/appdata/household-tasks/data/postgres`