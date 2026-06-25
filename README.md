# Inventra

Plateforme moderne de gestion des stocks, ventes et utilisateurs — Frontend React + API FastAPI, conteneurisée avec Docker Compose, avec monitoring Prometheus/Grafana.

## Fonctionnalités

- Authentification (inscription, login, JWT)
- Gestion des utilisateurs (CRUD)
- Gestion des stocks (produits, mouvements, catégories)
- Gestion des fournisseurs et clients
- Ventes avec génération de reçus et impression
- Interface moderne avec thème sombre/clair
- Monitoring Prometheus + Grafana + Alertmanager
- Backups automatiques PostgreSQL + Redis

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 + TypeScript + Tailwind CSS + Vite |
| Backend API | FastAPI + SQLAlchemy + Pydantic |
| Base de données | PostgreSQL 17 |
| Cache / Tâches | Redis 7 + ARQ |
| Proxy / TLS | Nginx 1.27 (HTTPS auto-signé) |
| Monitoring | Prometheus + Grafana + Alertmanager |

## Démarrage rapide

```powershell
# 1. Configurer l'environnement
copy .env.example .env

# 2. Générer les certificats TLS pour Nginx
mkdir nginx\certs
docker run --rm -v "%cd%\nginx\certs:/certs" alpine:3.18 sh -c "apk add --no-cache openssl && openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/inventra.key -out /certs/inventra.crt -subj '/CN=localhost/O=Inventra/C=FR'"

# 3. Lancer la stack complète
docker compose up -d

# 4. Attendre le démarrage (~20s)
Start-Sleep -Seconds 20

# 5. Vérifier
curl -sk https://localhost/health
curl -sk https://localhost/users/
```

Premier lancement : build FastAPI ~2 minutes. Lancements suivants : immédiats.

## URLs utiles

| Outil | URL | Identifiants |
|-------|-----|--------------|
| API (via Nginx HTTPS) | https://localhost | - |
| Swagger UI / Docs | https://localhost/docs | - |
| Health Check | https://localhost/health | - |
| Prometheus | http://localhost:9090 | - |
| Alertmanager | http://localhost:9093 | - |
| Grafana | http://localhost:3000 | admin / admin |

## Architecture

| Service | Image | Ports | Rôle |
|---------|-------|-------|------|
| FastAPI | Python 3.13 Alpine | 8000 | API REST CRUD + tâches async |
| PostgreSQL | 17 | 5432 | Base SQL |
| Redis | 7 Alpine | 6379 | Cache + file ARQ |
| Nginx | 1.27 Alpine | 80, 443 | Reverse proxy + TLS + gzip + headers sécurité |
| Prometheus | v2.55.0 | 9090 | Métriques temps réel + alertes |
| Alertmanager | v0.28.0 | 9093 | Gestion des alertes |
| Grafana | 11.4.0 | 3000 | Dashboards pré-provisionnés |
| Cron (backup) | Alpine 3.18 | - | Backup auto PostgreSQL + Redis |

## Fonctionnalités détaillées

### Authentification et comptes
- Inscription avec nom, email et mot de passe
- Connexion JWT sécurisée
- Gestion de session

### Gestion des stocks
- CRUD produits (nom, description, quantité, prix, catégorie, fournisseur)
- Mouvements de stock (entrée / sortie) avec traçabilité
- Catégories de produits

### Ventes et clients
- CRUD clients (nom, email, téléphone, adresse)
- Création de ventes avec plusieurs articles
- Reçu de vente avec aperçu et impression (PDF via navigateur)
- Mise à jour automatique du stock lors d'une vente

### Fournisseurs
- CRUD fournisseurs (contact, email, téléphone, adresse)

### Utilisateurs
- CRUD utilisateurs (création, modification, suppression)
- Notifications par email (asynchrone via ARQ + Redis)

### Monitoring
- Métriques FastAPI exposées sur `/metrics`
- Dashboard Grafana pré-provisionné "Inventra API"
- Règles d'alerte : API down, Nginx indisponible, PostgreSQL/Redis down, taux d'erreurs 5xx élevé

## Sécurité

- TLS 1.2 / 1.3 (certificat auto-signé en dev)
- Headers : HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- Compression gzip sur Nginx
- Reload Nginx sécurisé avec rollback automatique

## Commandes utiles

```powershell
# Logs d'un service
docker compose logs -f [service]

# État des conteneurs
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

# Arrêter + supprimer les volumes (ATTENTION: perte de données)
docker compose down -v
```

## Tests

```powershell
# Tests unitaires
pytest tests/unit -v

# Tests d'intégration (nécessitent la stack lancée)
pytest tests/integration -v
```

## Installation manuelle (sans Docker)

```powershell
# 1. Environnement virtuel Python
python -m venv .venv
.venv\Scripts\activate

# 2. Dépendances backend
pip install -r requirements.txt

# 3. Base + cache (avec Docker)
docker compose up -d postgres redis

# 4. Lancer l'API
uvicorn app.main:app --reload
```

Frontend (dans un autre terminal) :
```powershell
cd frontend
npm install
npm run dev
```

## Workflow de développement

1. Modifier le code dans `app/` (backend) ou `frontend/src/` (frontend)
2. L'API redémarre automatiquement (hot reload)
3. Tester sur http://localhost:8000/docs
4. Rebuild l'image Docker pour la production :
   ```powershell
   docker compose build api
   docker compose up -d api
   ```

## TODO / Roadmap

- [x] Projet FastAPI + PostgreSQL
- [x] Auth JWT + CRUD users
- [x] Tâches async (ARQ + Redis)
- [x] Nginx reverse proxy + TLS
- [x] Prometheus + métriques
- [x] Grafana + dashboard
- [x] Backups automatiques (pg_dump, Redis RDB/AOF)
- [x] Résilience / RTO (reload Nginx, rollback)
- [x] Alerting (Prometheus + Alertmanager)
- [x] Frontend React moderne avec dark/light mode
- [x] Interface UX soignée avec emojis natifs
- [x] Gestion complète stocks, ventes, reçus, fournisseurs, clients
- [ ] Tests unitaires et d'intégration complets
- [ ] CI/CD (GitHub Actions)
- [ ] Application mobile (React Native)

## Licence

MIT