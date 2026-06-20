# InfraStack

API REST FastAPI avec PostgreSQL, Redis, Nginx, Prometheus, Grafana et Alertmanager — conteneurisée avec Docker Compose.

## Étapes de développement

| Étape | Description | Statut |
|-------|-------------|--------|
| 1 | Project structure + arborescence + Git | ✅ |
| 2 | Modèles SQLAlchemy + Pydantic schemas | ✅ |
| 3 | CRUD Users complet (create, read, update, delete) | ✅ |
| 4 | Authentification JWT (inscription, login, protection des routes) | ✅ |
| 5 | Tâches async avec ARQ + Redis (notification email) | ✅ |
| 6 | Nginx reverse proxy + TLS auto-signé + headers sécurité + gzip | ✅ |
| 7 | Prometheus + métriques FastAPI (`/metrics`) | ✅ |
| 8 | Grafana + dashboard pré-provisionné "InfraStack API" | ✅ |
| 9 | Backups automatiques PostgreSQL + Redis | ✅ |
| 10 | Résilience / RTO (reload Nginx, rollback) | ✅ |
| 11 | Alerting (Alertmanager + règles d'alerte) | ✅ |

##  Démarrage rapide (après un clone)

```powershell
# 1. Copier la config
copy .env.example .env

# 2. Générer les certificats TLS pour Nginx
mkdir nginx\certs
docker run --rm -v "%cd%\nginx\certs:/certs" alpine:3.18 sh -c "apk add --no-cache openssl && openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/infrastack.key -out /certs/infrastack.crt -subj '/CN=localhost/O=InfraStack/C=FR'"

# 3. Lancer toute la stack
docker compose up -d

# 4. Attendre 20 secondes que les services démarrent
Start-Sleep -Seconds 20

# 5. Tester
curl -sk https://localhost/health
curl -sk https://localhost/users/
```

Premier lancement : le build de l'image FastAPI prend ~2 minutes. Les lancements suivants sont immédiats.

##  Architecture

| Service | Image | Ports | Rôle |
|---------|-------|-------|------|
| FastAPI | Python 3.13 Alpine | 8000 | API REST CRUD + async tasks |
| PostgreSQL | 17 | 5432 | Base de données SQL |
| Redis | 7 Alpine | 6379 | Cache + file de tâches ARQ |
| Nginx | 1.27 Alpine | 80, 443 | Reverse proxy + TLS + gzip + headers sécurité |
| Prometheus | v2.55.0 | 9090 | Métriques temps réel + alertes |
| Alertmanager | v0.28.0 | 9093 | Gestion des alertes |
| Grafana | 11.4.0 | 3000 | Dashboards pré-provisionnés |
| Cron (backup) | Alpine 3.18 | - | Backup automatique PostgreSQL + Redis |

##  Structure du projet

```
infrastack/
├── app/
│   ├── api/           # Routes REST users
│   ├── core/          # Database + lifespan
│   ├── models/        # SQLAlchemy models
│   ├── schemas/       # Pydantic schemas
│   ├── services/      # Business logic
│   └── tasks/         # ARQ worker + email task
├── nginx/
│   ├── nginx.conf     # Reverse proxy TLS
│   ├── nginx-reload.ps1 # Reload sécurisé + rollback
│   └── certs/         # Certificat self-signed
├── prometheus/
│   ├── prometheus.yml # Scrape config + alerting
│   └── prometheus.rules.yml # Règles d'alerte
├── alertmanager/
│   └── alertmanager.yml # Configuration Alertmanager
├── grafana/
│   ├── datasources/   # Datasource Prometheus
│   └── dashboards/    # Dashboard pré-provisionné
├── tests/             # Tests unitaires + d'intégration
├── backup/
│   ├── backup.ps1     # Script backup Windows
│   ├── backup.sh      # Script backup Linux + cron Docker
│   └── restore.ps1    # Script de restauration
├── Dockerfile         # Multi-stage (141MB)
├── docker-compose.yml # 8 services
└── requirements.txt   # 27 packages
```

##  URLs importantes

| Outil | URL | Identifiants |
|-------|-----|--------------|
| **API (via Nginx HTTPS)** | https://localhost | - |
| **Swagger UI / Docs** | https://localhost/docs | - |
| **Health Check** | https://localhost/health | - |
| **Prometheus** | http://localhost:9090 | - |
| **Alertmanager** | http://localhost:9093 | - |
| **Grafana** | http://localhost:3000 | admin / admin |

##  Sécurité

- **TLS 1.2 / 1.3** — Certificat auto-signé (CN=localhost)
- **Headers de sécurité** — HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- **Compression gzip** activée sur Nginx
- **Reload Nginx sécurisé** — script avec test de config + rollback automatique

> En production, remplacer le certificat auto-signé par un vrai certificat Let's Encrypt.

##  Monitoring

- **Prometheus** scrape les métriques FastAPI (`/metrics`) toutes les 10 secondes
- **Grafana** est pré-provisionné avec un dashboard "InfraStack API"
- **Alertmanager** gère les alertes (disponible sur http://localhost:9093)

### Règles d'alerte configurées

- API FastAPI down
- Nginx indisponible
- PostgreSQL indisponible
- Redis indisponible
- Taux d'erreurs 5xx élevé

### Requêtes Prometheus utiles

```
# Taux de requêtes par seconde
rate(http_requests_total[1m])

# Durée des requêtes (p50, p95, p99)
histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[1m]))
```

##  Commandes utiles

```powershell
# Voir les logs d'un service
docker compose logs -f [service]

# Voir l'état des conteneurs
docker ps

# Redémarrer un service
docker compose restart [service]

# Backup manuel
.\backup\backup.ps1

# Restaurer depuis un backup
.\backup\restore.ps1 -PgDumpFile .\backup\postgresql-20250620-020000.sql -RedisDumpFile .\backup\redis-20250620-020000.rdb

# Recharger Nginx en toute sécurité
.\nginx\nginx-reload.ps1

# Arrêter la stack
docker compose down

# Arrêter la stack + supprimer les volumes (ATTENTION: perte de données)
docker compose down -v
```

##  Tests

```powershell
# Tests unitaires
pytest tests/unit -v

# Tests d'intégration (nécessitent la stack lancée)
pytest tests/integration -v
```

##  Installation manuelle (sans Docker)

```powershell
# 1. Créer un environnement virtuel
python -m venv .venv
.venv\Scripts\activate

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Lancer PostgreSQL + Redis (avec Docker)
docker compose up -d postgres redis

# 4. Lancer l'API
uvicorn app.main:app --reload
```

##  Workflow de développement

1. Modifier le code dans `app/`
2. L'API redémarre automatiquement (hot reload)
3. Tester sur http://localhost:8000/docs
4. Rebuild l'image Docker pour la production :
   ```powershell
   docker compose build api
   docker compose up -d api
   ```

##  TODO / Roadmap

- [x] Projet FastAPI + PostgreSQL
- [x] Auth JWT + CRUD users
- [x] Tâches async (ARQ + Redis)
- [x] Nginx reverse proxy + TLS
- [x] Prometheus + métriques
- [x] Grafana + dashboard
- [x] Backups automatiques (pg_dump, Redis RDB/AOF)
- [x] Résilience / RTO (reload Nginx, rollback)
- [x] Alerting (Prometheus + Alertmanager)
- [ ] Tests unitaires et d'intégration
- [ ] CI/CD (GitHub Actions)

##  Licence

MIT