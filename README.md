
#  InfraStack — Inventra

**Plateforme moderne de gestion des stocks, ventes et utilisateurs.**
Frontend React 19 + API FastAPI + PostgreSQL 17 + Redis 7 + Nginx HTTPS.
Conteneurisée avec Docker Compose, monitoring Prometheus/Grafana/Alertmanager,
tests automatisés pytest-cov ≥ 70%, CI/CD GitHub Actions et documentation OpenAPI.

---

![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions)
![Tests](https://img.shields.io/badge/tests-pytest--cov_≥70%-brightgreen)
![Docker](https://img.shields.io/badge/docker-compose_up-blue?logo=docker)
![Python](https://img.shields.io/badge/python-3.12-3776AB?logo=python)
![React](https://img.shields.io/badge/react-19-61DAFB?logo=react)
![Licence](https://img.shields.io/badge/licence-MIT-green)

---

##  Table des matières

1. [Fonctionnalités](#-fonctionnalités)
2. [Stack Technique](#-stack-technique)
3. [Démarrage Rapide](#-démarrage-rapide)
4. [URLs d'Accès](#-urls-daccès)
5. [Architecture](#-architecture)
6. [Tests Automatisés](#-tests-automatisés)
7. [Documentation API](#-documentation-api)
8. [Monitoring & Alertes](#-monitoring--alertes)
9. [CI/CD Pipeline](#-cicd-pipeline)
10. [Base de Données](#-base-de-données)
11. [Structure du Projet](#-structure-du-projet)
12. [Commandes Utiles](#-commandes-utiles)
13. [Développement](#-développement)
14. [Licence](#-licence)

---

##  Fonctionnalités

###  Authentification & Utilisateurs

- Inscription avec validation (nom, email, mot de passe ≥ 6 caractères)
- Connexion JWT sécurisée (token valide 24h)
- CRUD utilisateurs complet avec statut actif/inactif
- Avatar automatique avec initiales

###  Gestion des Stocks

- CRUD produits (nom, description, quantité, prix, catégorie, fournisseur)
- Mouvements de stock (entrée/sortie) avec traçabilité et raison
- Catégories de produits
- Indicateurs visuels : 🟢 >10, 🟡 1-10, 🔴 rupture

###  Fournisseurs & 👥 Clients

- CRUD fournisseurs (nom, contact, email, téléphone, adresse)
- CRUD clients avec avatar personnalisé
- Barres de recherche sur toutes les listes

###  Ventes & Reçus

- Création de vente avec panier multi-produits
- Client au choix ou vente au comptoir
- Modes de paiement : espèces, carte, virement
- Calcul automatique du total
- Reçu imprimable en 1 clic
- Mise à jour automatique du stock

###  Interface Utilisateur

- Design moderne : glassmorphism, gradients, animations
- Dark mode / Light mode avec toggle
- 30+ icônes Lucide React
- Sidebar responsive (collapse desktop, hamburger mobile)
- Dashboard avec 6 cartes stats + 3 graphiques SVG
- Loader spinner, animations slide-in

---

##  Stack Technique

| Couche               | Technologie                          |
| -------------------- | ------------------------------------ |
| **Frontend**         | React 19 + TypeScript + Tailwind + Vite 8 |
| **Icônes**           | Lucide React                         |
| **Backend API**      | FastAPI + SQLAlchemy 2.0 (async) + Pydantic v2 |
| **Base de données**  | PostgreSQL 17                        |
| **Cache**            | Redis 7 Alpine                       |
| **Reverse Proxy**    | Nginx 1.27 Alpine (HTTPS/HTTP2/gzip) |
| **Monitoring**       | Prometheus + Grafana + Alertmanager  |
| **Exporters**        | PostgreSQL Exporter + Redis Exporter |
| **Tests**            | pytest + pytest-asyncio + pytest-cov + httpx |
| **CI/CD**            | GitHub Actions                       |
| **Conteneurisation** | Docker + Docker Compose              |

---

##  Démarrage Rapide

### Prérequis

- **Docker Desktop**
- **Node.js 18+** (pour build frontend)
- **PowerShell** (Windows) ou **Bash** (Linux/Mac)

### Installation

```powershell
# 1. Cloner le projet
git clone <votre-repo-url>
cd InfraStack

# 2. Générer les certificats TLS (première fois)
New-Item -ItemType Directory -Force -Path nginx/certs
docker run --rm -v "${PWD}/nginx/certs:/certs" alpine:3.18 sh -c "apk add --no-cache openssl && openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/inventra.key -out /certs/inventra.crt -subj '/CN=localhost/O=Inventra/C=FR'"

# 3. Builder le frontend
cd frontend
npm install
npm run build
cd ..

# 4. Lancer la stack
docker-compose up -d --build

# 5. Vérifier
Start-Sleep -Seconds 15
curl.exe -k https://localhost/health
# → {"status":"healthy","service":"InfraStack API"}
```

> Premier lancement : ~3 min (build). Suivants : ~30 secondes.

---

##  URLs d'Accès

| Outil                   | URL                                | Identifiants    |
| ----------------------- | ---------------------------------- | --------------- |
| **Application**         | https://localhost                  | Créer un compte |
| **Swagger UI**          | https://localhost/docs             | —               |
| **ReDoc**               | https://localhost/redoc            | —               |
| **Health Check**        | https://localhost/health           | —               |
| **Métriques**           | https://localhost/metrics          | —               |
| **Prometheus**          | http://localhost:9090              | —               |
| **Alertmanager**        | http://localhost:9093              | —               |
| **Grafana**             | http://localhost:3000              | admin / admin   |
| **Redis Exporter**      | http://localhost:9121/metrics      | —               |
| **PostgreSQL Exporter** | http://localhost:9187/metrics      | —               |

---

##  Architecture

### Conteneurs

| Service               | Conteneur                     | Port(s)           |
| --------------------- | ----------------------------- | ----------------- |
| **api**               | `inventra-api`                | 80, 443, 8000     |
| **postgres**          | `inventra-postgres`           | 5432              |
| **redis**             | `inventra-redis`              | 6379              |
| **prometheus**        | `inventra-prometheus`         | 9090              |
| **alertmanager**      | `inventra-alertmanager`       | 9093              |
| **grafana**           | `inventra-grafana`            | 3000              |
| **postgres-exporter** | `inventra-postgres-exporter`  | 9187              |
| **redis-exporter**    | `inventra-redis-exporter`     | 9121              |

### Flux

```
Navigateur → Nginx (HTTPS) → FastAPI → PostgreSQL / Redis
                                    ↓
                            Prometheus (scrape /metrics)
                                    ↓
                           Alertmanager (alertes)
                                    ↓
                           Grafana (dashboards)
```

---

##  Tests Automatisés

### Installation

```powershell
pip install pytest pytest-asyncio pytest-cov httpx
```

### Configuration (`pytest.ini`)

```ini
[pytest]
testpaths = tests
asyncio_mode = auto
addopts = -v --cov=app --cov-report=html --cov-report=term-missing --cov-fail-under=70
```

### Exécution

```powershell
# Tous les tests avec couverture
pytest tests/ -v --cov=app --cov-report=html --cov-report=term

# Test spécifique
pytest tests/test_auth.py::test_login_success -v

# Rapport HTML
start htmlcov/index.html
```

### Résultat attendu

```
tests/test_auth.py::test_register_success PASSED
tests/test_auth.py::test_login_success PASSED
tests/test_stock.py::test_create_product PASSED
tests/test_sales.py::test_create_sale PASSED
...

---------- coverage ----------
TOTAL                 590     49    83%
Required test coverage of 70% reached. ✅
```

---

##  Documentation API

### Swagger UI → https://localhost/docs

- **Try it out** : tester chaque endpoint dans le navigateur
- **Authorize** : entrer le token JWT pour les routes protégées
- **Exemples** intégrés dans chaque schéma
- **Codes d'erreur** documentés (400, 401, 404, 500)

### Tags

| Tag           | Endpoints                                      |
| ------------- | ---------------------------------------------- |
| **auth**      | `POST /auth/register`, `/auth/login`, `GET /auth/me` |
| **users**     | CRUD `/users`                                   |
| **stock**     | 15+ endpoints produits, mouvements, catégories  |
| **dashboard** | `GET /dashboard/stats`                          |

---

##  Monitoring & Alertes

### Règles d'alerte

| Alerte                     | Condition                      | Sévérité    | Délai |
| -------------------------- | ------------------------------ | ----------- | ----- |
| **APIDown**                | API ne répond plus             | 🔴 Critical | 30s   |
| **PostgreSQLDown**         | Base inaccessible              | 🔴 Critical | 30s   |
| **RedisDown**              | Cache inaccessible             | 🟡 Warning  | 30s   |
| **HighErrorRate**          | Erreurs 5xx > 0.1 req/s       | 🟡 Warning  | 1m    |
| **HighLatency**            | Latence p95 > 1s               | 🟡 Warning  | 2m    |
| **HighMemory**             | Mémoire > 200 MB               | 🟡 Warning  | 2m    |
| **TooManyPGConnections**   | Connexions PG > 50             | 🟡 Warning  | 2m    |

### Tester une alerte

```powershell
docker stop inventra-redis
Start-Sleep -Seconds 40
start http://localhost:9090/alerts   # → RedisDown FIRING
docker start inventra-redis          # → Retour INACTIVE
```

### Métriques PromQL utiles

```promql
# Services UP/DOWN
up{job=~"infrastack-api|postgres|redis|prometheus"}

# Requêtes par seconde
rate(http_requests_total[1m])

# Latence p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Mémoire (MB)
process_resident_memory_bytes / 1024 / 1024

# PostgreSQL connexions
pg_stat_database_numbackends

# Redis commandes/s
rate(redis_commands_processed_total[1m])
```

---

##  CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)

```
PUSH / PR
    │
    ├── JOB 1 : Lint + Tests
    │   ├── flake8, black, isort
    │   └── pytest --cov-fail-under=70
    │
    ├── JOB 2 : Build Frontend (parallèle)
    │   └── npm run build
    │
    └── JOB 3 : Build & Push Docker (main seulement)
        ├── docker build
        ├── docker push → ghcr.io
        └── JOB 4 : Security Scan (Trivy)
```

### Badges

![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF)
![Docker](https://img.shields.io/badge/docker-ghcr.io-blue)

---

##  Base de Données

### Connexion

```powershell
# Terminal Docker
docker exec -it inventra-postgres psql -U postgres -d inventra
```

### Outil graphique (DBeaver, pgAdmin, TablePlus)

| Paramètre    | Valeur        |
| ------------ | ------------- |
| **Host**     | `localhost`   |
| **Port**     | `5432`        |
| **Database** | `inventra`    |
| **Username** | `postgres`    |
| **Password** | `skai`        |

### Requêtes utiles

```sql
-- Tables
\dt

-- Stats
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM sales;
SELECT COUNT(*) FROM users;

-- Ventes du jour
SELECT * FROM sales WHERE created_at::date = CURRENT_DATE;

-- Produits en rupture
SELECT * FROM products WHERE quantity = 0;

-- Top 10 ventes
SELECT p.name, SUM(si.quantity) AS total_sold
FROM sale_items si
JOIN products p ON p.id = si.product_id
GROUP BY p.name
ORDER BY total_sold DESC
LIMIT 10;
```

---

##  Structure du Projet

```
InfraStack/
├── .github/workflows/ci.yml      # Pipeline CI/CD
├── app/                           # Backend FastAPI
│   ├── main.py                    # Point d'entrée + config OpenAPI
│   ├── models.py                  # Modèles SQLAlchemy
│   ├── schemas.py                 # Schémas Pydantic v2 avec exemples
│   ├── metrics.py                 # Métriques Prometheus
│   ├── routes/
│   │   ├── auth.py               # /auth/*
│   │   ├── users.py              # /users/*
│   │   ├── stock.py              # /stock/*
│   │   └── dashboard.py          # /dashboard/*
│   └── services/
│       └── stock.py              # Logique métier
├── frontend/                      # Frontend React
│   ├── src/
│   │   ├── pages/                # Login, Register, Dashboard, Stock...
│   │   ├── components/           # Layout, Sidebar
│   │   ├── context/              # AuthContext, ThemeContext
│   │   └── services/             # Client API
│   └── dist/                     # Build production
├── tests/                         # Tests pytest
│   ├── test_auth.py
│   ├── test_stock.py
│   ├── test_sales.py
│   └── test_users.py
├── nginx/
│   ├── nginx.conf
│   └── certs/
├── prometheus/
│   ├── prometheus.yml
│   └── prometheus.rules.yml
├── grafana/dashboards/
├── alertmanager/alertmanager.yml
├── docker-compose.yml
├── Dockerfile
├── docker-entrypoint.sh
├── requirements.txt
├── pytest.ini
└── README.md
```

---

##  Commandes Utiles

```powershell
# === DOCKER ===
docker logs -f inventra-api                        # Logs API
docker ps --format "table {{.Names}}\t{{.Status}}" # État conteneurs
docker-compose restart prometheus                  # Redémarrer un service
docker-compose down                                # Arrêter la stack
docker-compose down -v                             #  Arrêter + supprimer données

# === REBUILD ===
# Backend
docker-compose up -d --build api
# Frontend + Backend
cd frontend && npm run build && cd .. && docker-compose up -d --build api

# === TESTS ===
pytest tests/ -v --cov=app --cov-report=html --cov-report=term
start htmlcov/index.html

# === BASE DE DONNÉES ===
docker exec -it inventra-postgres psql -U postgres -d inventra
docker exec inventra-postgres pg_dump -U postgres inventra > backup.sql

# === MONITORING ===
curl.exe http://localhost:9090/api/v1/targets     # Cibles Prometheus
curl.exe http://localhost:9090/api/v1/alerts      # Alertes en cours
start http://localhost:3000                        # Grafana
```

---

##  Développement

### Mode hot reload

```powershell
# Terminal 1 : Infra
docker-compose up -d postgres redis

# Terminal 2 : Frontend (http://localhost:5173)
cd frontend && npm run dev

# Terminal 3 : Backend (http://localhost:8000)
uvicorn app.main:app --reload
```

---

##  Licence

— KOMBATE GARIBA Moubarak, MONTCHO Nancy, SENOU Kokou© 2025 InfraStack
```

