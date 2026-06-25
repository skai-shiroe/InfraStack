

#  InfraStack

Plateforme moderne de gestion des stocks, ventes et utilisateurs — **Frontend React + API FastAPI**, entièrement conteneurisée avec **Docker Compose**, monitoring complet **Prometheus/Grafana/Alertmanager**, tests automatisés **pytest-cov ≥ 70%** et documentation **OpenAPI/Swagger** interactive.

![Stack](https://img.shields.io/badge/stack-FastAPI%20%2B%20React%20%2B%20PostgreSQL%20%2B%20Redis-blue)
![Tests](https://img.shields.io/badge/tests-pytest--cov%20%E2%89%A5%2070%25-brightgreen)
![Docker](https://img.shields.io/badge/docker-compose%20up-brightgreen)
![Licence](https://img.shields.io/badge/licence-MIT-green)

---

##  Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Démarrage Rapide](#-démarrage-rapide)
- [URLs d'Accès](#-urls-daccès)
- [Architecture](#-architecture)
- [Tests Automatisés](#-tests-automatisés)
- [Documentation API](#-documentation-api)
- [Monitoring & Alertes](#-monitoring--alertes)
- [Base de Données](#-base-de-données)
- [Structure du Projet](#-structure-du-projet)
- [Commandes Utiles](#-commandes-utiles)
- [Développement](#-développement)
- [Licence](#-licence)

---

##  Fonctionnalités

###  Authentification & Utilisateurs
-  Inscription avec validation (nom, email, mot de passe ≥ 6 caractères)
-  Connexion JWT sécurisée (token valide 24h)
-  CRUD utilisateurs complet
-  Statut actif/inactif avec badges visuels
-  Avatar avec initiales générées automatiquement

###  Gestion des Stocks
-  CRUD produits (nom, description, quantité, prix, catégorie, fournisseur)
-  Mouvements de stock (entrée/sortie) avec traçabilité et raison
-  Catégories de produits hiérarchisées
-  Indicateurs visuels de stock : 🟢 Élevé (>10), 🟡 Faible (1-10), 🔴 Rupture (0)

###  Fournisseurs & Clients
-  CRUD fournisseurs (nom, contact, email, téléphone, adresse)
-  CRUD clients avec avatar personnalisé
-  Barres de recherche sur toutes les listes

###  Ventes & Reçus
-  Création de vente avec panier multi-produits
-  Sélection client ou vente au comptoir (walk-in)
-  Modes de paiement : espèces, carte, virement
-  Calcul automatique du total et sous-totaux
-  Reçu imprimable en 1 clic (nouvelle fenêtre)
-  Mise à jour automatique du stock en temps réel

###  Interface Utilisateur
-  **Design moderne** : cartes glassmorphism, gradients, animations fluides
-  **Dark mode / Light mode** avec toggle persistant
-  **30+ icônes Lucide React** (plus d'emojis)
-  **Sidebar responsive** : collapse desktop, menu hamburger mobile
-  **Dashboard** : 6 cartes stats + 3 graphiques SVG (barres, donut, sparkline)
-  **Animations** : loader spinner, slide-in formulaires, hover scale

###  Tests Automatisés
-  **pytest** avec mode asyncio automatique
-  **pytest-cov** avec seuil minimal ≥ 70%
-  Tests unitaires : auth, stock, sales, users
-  Rapport HTML interactif (`htmlcov/index.html`)
-  Exécution : `pytest tests/ -v --cov=app --cov-fail-under=70`

###  Documentation API
-  **Swagger UI** : https://localhost/docs
-  **ReDoc** : https://localhost/redoc
-  Schémas avec exemples de requêtes/réponses
-  Descriptions détaillées de chaque endpoint
-  Codes de réponse documentés (200, 201, 400, 401, 404)
-  Tags organisés : auth, users, stock, dashboard

###  Monitoring & Alertes
-  **Prometheus** : métriques HTTP, CPU, mémoire, GC Python
-  **7 règles d'alerte** : API/PostgreSQL/Redis DOWN, erreurs 5xx, latence, mémoire
-  **Alertmanager** : groupement par sévérité (critical/warning)
-  **Grafana** : dashboards prêts à l'emploi
-  **Exporters** : PostgreSQL Exporter + Redis Exporter

---

## 🔧 Stack Technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Frontend** | React + TypeScript + Tailwind CSS + Vite | 19 / 8 |
| **Icônes** | Lucide React | latest |
| **Backend API** | FastAPI + SQLAlchemy 2.0 (async) + Pydantic v2 | 0.115 |
| **Base de données** | PostgreSQL | 17 |
| **Cache** | Redis Alpine | 7 |
| **Reverse Proxy** | Nginx Alpine (HTTPS, HTTP/2, gzip) | 1.27 |
| **Monitoring** | Prometheus + Grafana + Alertmanager | latest |
| **Exporters** | PostgreSQL Exporter + Redis Exporter | latest |
| **Tests** | pytest + pytest-asyncio + pytest-cov + httpx | ≥ 8.0 |
| **Conteneurisation** | Docker + Docker Compose | latest |

---

##  Démarrage Rapide

### Prérequis
- **Docker Desktop** (Windows/Mac/Linux)
- **PowerShell** (Windows) ou **Bash** (Linux/Mac)
- **Node.js 18+** (pour le build frontend)

### Installation en 4 étapes

```powershell
# 1. Cloner le projet
git clone <votre-repo-url>
cd InfraStack

# 2. Générer les certificats TLS (première fois uniquement)
New-Item -ItemType Directory -Force -Path nginx/certs
docker run --rm -v "${PWD}/nginx/certs:/certs" alpine:3.18 sh -c "apk add --no-cache openssl && openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/inventra.key -out /certs/inventra.crt -subj '/CN=localhost/O=Inventra/C=FR'"

# 3. Builder le frontend React
cd frontend
npm install
npm run build
cd ..

# 4. Lancer la stack complète
docker-compose up -d --build

# 5. Vérifier que tout fonctionne
Start-Sleep -Seconds 15
curl.exe -k https://localhost/health
# → {"status":"healthy","service":"InfraStack API"}


**Premier lancement** : ~3 minutes (build Docker)  
**Lancements suivants** : ~30 secondes

---

##  URLs d'Accès

| Outil | URL | Identifiants |
|-------|-----|--------------|
| **Application** | https://localhost | Créer un compte |
| **Swagger UI** | https://localhost/docs | - |
| **ReDoc** | https://localhost/redoc | - |
| **Health Check** | https://localhost/health | - |
| **Métriques Prometheus** | https://localhost/metrics | - |
| **Prometheus** | http://localhost:9090 | - |
| **Prometheus Targets** | http://localhost:9090/targets | - |
| **Prometheus Alerts** | http://localhost:9090/alerts | - |
| **Alertmanager** | http://localhost:9093 | - |
| **Grafana** | http://localhost:3000 | `admin` / `admin` |
| **Redis Exporter** | http://localhost:9121/metrics | - |
| **PostgreSQL Exporter** | http://localhost:9187/metrics | - |

---

##  Architecture

### Conteneurs Docker

| Service | Conteneur | Port(s) | Rôle |
|---------|-----------|---------|------|
| **api** | `inventra-api` | 80, 443, 8000 | FastAPI + Nginx interne (HTTPS) |
| **postgres** | `inventra-postgres` | 5432 | Base de données SQL |
| **redis** | `inventra-redis` | 6379 | Cache et file d'attente |
| **prometheus** | `inventra-prometheus` | 9090 | Collecte métriques + règles d'alertes |
| **alertmanager** | `inventra-alertmanager` | 9093 | Gestion et routage des alertes |
| **grafana** | `inventra-grafana` | 3000 | Dashboards et visualisations |
| **postgres-exporter** | `inventra-postgres-exporter` | 9187 | Métriques PostgreSQL |
| **redis-exporter** | `inventra-redis-exporter` | 9121 | Métriques Redis |

### Flux de données

```
Navigateur → Nginx (HTTPS) → FastAPI (Uvicorn) → PostgreSQL/Redis
                                  ↓
                          Prometheus (scrape /metrics)
                                  ↓
                     Alertmanager (alertes configurées)
                                  ↓
                     Grafana (dashboards pré-importés)
```

---

##  Tests Automatisés

### Installation des dépendances

```powershell
pip install pytest pytest-asyncio pytest-cov httpx
```

### Configuration

Fichier `pytest.ini` (déjà présent à la racine) :
```ini
[pytest]
testpaths = tests
python_files = test_*.py
asyncio_mode = auto
addopts = -v --cov=app --cov-report=html --cov-report=term-missing --cov-fail-under=70
```

### Tests disponibles

| Fichier | Contenu | Nombre de tests |
|---------|---------|-----------------|
| `tests/test_auth.py` | Register, login, me, erreurs | 6 |
| `tests/test_stock.py` | CRUD produits, catégories, mouvements | 6 |
| `tests/test_sales.py` | Création vente, stock insuffisant, liste | 3 |
| `tests/test_users.py` | CRUD utilisateurs (admin) | 4 |

### Lancer les tests

```powershell
# Tous les tests avec couverture
pytest tests/ -v --cov=app --cov-report=html --cov-report=term

# Tests unitaires uniquement
pytest tests/ -v -m "unit"

# Test spécifique
pytest tests/test_auth.py::test_login_success -v

# Rapport HTML de couverture
start htmlcov/index.html
```

### Résultat attendu

```
======================================== test session starts ========================================
collected 19 items

tests/test_auth.py::test_register_success PASSED                                              [ 5%]
tests/test_auth.py::test_register_duplicate_email PASSED                                      [10%]
tests/test_auth.py::test_login_success PASSED                                                 [15%]
tests/test_auth.py::test_login_wrong_password PASSED                                          [21%]
tests/test_auth.py::test_get_current_user PASSED                                              [26%]
tests/test_auth.py::test_get_current_user_no_token PASSED                                     [31%]
tests/test_stock.py::test_create_product PASSED                                               [36%]
tests/test_stock.py::test_list_products PASSED                                                [42%]
tests/test_stock.py::test_create_product_no_auth PASSED                                       [47%]
tests/test_stock.py::test_create_category PASSED                                              [52%]
tests/test_stock.py::test_stock_movement PASSED                                               [57%]
tests/test_stock.py::test_health_check PASSED                                                 [63%]
tests/test_sales.py::test_create_sale PASSED                                                  [68%]
tests/test_sales.py::test_sale_insufficient_stock PASSED                                      [73%]
tests/test_sales.py::test_list_sales PASSED                                                   [78%]
tests/test_users.py::test_list_users PASSED                                                   [84%]
tests/test_users.py::test_update_user PASSED                                                  [89%]
tests/test_users.py::test_delete_user PASSED                                                  [94%]
tests/test_users.py::test_create_user_admin PASSED                                           [100%]

======================================= 19 passed in 8.52s =========================================

---------- coverage: platform win32, python 3.12.3 ----------
Name                     Stmts   Miss  Cover   Missing
----------------------------------------------------------
app/__init__.py              0      0   100%
app/main.py                 35      2    94%   45-46
app/models.py               85      0   100%
app/schemas.py             120      5    95%   89, 120-122
app/routes/auth.py          45      3    93%   67, 89, 102
app/routes/stock.py        180     25    86%   145-150, 210-220, 300-310
app/services/stock.py       95     12    87%   55-60, 120-128
app/metrics.py              30      2    93%   18, 25
----------------------------------------------------------
TOTAL                      590     49    83%
Required test coverage of 70% reached. 
```

---

##  Documentation API

### Swagger UI

Accessible sur **https://localhost/docs** avec :
-  **Authentification interactive** : bouton "Authorize" pour entrer le token JWT
-  **Try it out** : tester chaque endpoint directement depuis le navigateur
-  **Schémas complets** : modèles de requêtes et réponses
-  **Exemples intégrés** : chaque endpoint montre un exemple fonctionnel
-  **Codes d'erreur documentés** : 400, 401, 404, 500

### Tags disponibles

| Tag | Description | Endpoints |
|-----|-------------|-----------|
| **auth** | Authentification et inscription | POST /auth/register, POST /auth/login, GET /auth/me |
| **users** | Gestion des utilisateurs | GET/POST/PUT/DELETE /users |
| **stock** | Produits, mouvements, catégories | 15+ endpoints |
| **dashboard** | Statistiques et métriques | GET /dashboard/stats |

### Exemple de documentation

```json
// POST /auth/register - Créer un compte
// Request body :
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}

// Response 201 :
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}

// Response 400 :
{
  "detail": "Email already registered"
}
```

---

##  Monitoring & Alertes

### Règles d'alerte configurées

| Alerte | Condition | Sévérité | Délai | Description |
|--------|-----------|----------|-------|-------------|
| **APIDown** | `up{job="infrastack-api"} == 0` | 🔴 Critical | 30s | API ne répond plus |
| **PostgreSQLDown** | `pg_up == 0` | 🔴 Critical | 30s | Base inaccessible |
| **RedisDown** | `redis_up == 0` | 🟡 Warning | 30s | Cache inaccessible |
| **HighErrorRate** | `rate(5xx) > 0.1/s` | 🟡 Warning | 1m | Erreurs serveur |
| **HighLatency** | `p95 > 1s` | 🟡 Warning | 2m | Performance dégradée |
| **HighMemory** | `> 200 MB` | 🟡 Warning | 2m | Consommation mémoire |
| **TooManyPGConnections** | `> 50 connexions` | 🟡 Warning | 2m | Saturation PG |

### Tester une alerte

```powershell
# Arrêter Redis
docker stop inventra-redis

# Attendre 40 secondes
Start-Sleep -Seconds 40

# Vérifier l'alerte
start http://localhost:9090/alerts
# → RedisDown doit être en "FIRING" (rouge)

# Redémarrer Redis
docker start inventra-redis
# → L'alerte repasse en "INACTIVE" (vert)
```

### Métriques PromQL utiles

```promql
# Services UP/DOWN
up{job=~"infrastack-api|postgres|redis|prometheus"}

# Requêtes par seconde
rate(http_requests_total[1m])

# Latence p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Taux d'erreurs
rate(http_requests_total{status=~"4..|5.."}[1m])

# Mémoire (MB)
process_resident_memory_bytes / 1024 / 1024

# PostgreSQL connexions
pg_stat_database_numbackends

# Redis commandes/s
rate(redis_commands_processed_total[1m])
```

---

## 🗄 Base de Données

### Connexion directe

```powershell
# Via terminal Docker
docker exec -it inventra-postgres psql -U postgres -d inventra
```

### Via outil graphique (DBeaver, pgAdmin, TablePlus)

| Paramètre | Valeur |
|-----------|--------|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `inventra` |
| **Username** | `postgres` |
| **Password** | `skai` |

### Requêtes utiles

```sql
-- Voir les tables
\dt

-- Statistiques
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM sales;
SELECT COUNT(*) FROM users;

-- Ventes du jour
SELECT * FROM sales WHERE created_at::date = CURRENT_DATE;

-- Produits en rupture de stock
SELECT * FROM products WHERE quantity = 0;

-- Top 10 produits les plus vendus
SELECT p.name, SUM(si.quantity) as total_sold
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
├── app/                        # Backend FastAPI
│   ├── __init__.py
│   ├── main.py                 # Point d'entrée + config OpenAPI
│   ├── models.py               # Modèles SQLAlchemy (User, Product, Sale...)
│   ├── schemas.py              # Schémas Pydantic v2 avec exemples
│   ├── metrics.py              # Métriques Prometheus
│   ├── routes/
│   │   ├── auth.py             # /auth/register, /auth/login, /auth/me
│   │   ├── users.py            # CRUD /users
│   │   ├── stock.py            # /stock/products, /stock/movements...
│   │   └── dashboard.py        # /dashboard/stats
│   └── services/
│       └── stock.py            # Logique métier CRUD
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── main.tsx            # Entry point React
│   │   ├── App.tsx              # Routes + AuthProvider
│   │   ├── pages/
│   │   │   ├── Login.tsx        # Page de connexion
│   │   │   ├── Register.tsx     # Page d'inscription
│   │   │   ├── Dashboard.tsx    # Dashboard avec graphiques SVG
│   │   │   ├── Stock.tsx        # Gestion des stocks
│   │   │   ├── Categories.tsx   # Gestion des catégories
│   │   │   ├── Suppliers.tsx    # Gestion des fournisseurs
│   │   │   ├── Clients.tsx      # Gestion des clients
│   │   │   ├── Sales.tsx        # Ventes et reçus
│   │   │   └── Users.tsx        # Gestion des utilisateurs
│   │   ├── components/
│   │   │   └── Layout.tsx       # Sidebar + header responsive
│   │   ├── context/
│   │   │   ├── AuthContext.tsx   # Contexte auth JWT
│   │   │   └── ThemeContext.tsx  # Contexte dark/light mode
│   │   └── services/
│   │       └── api.ts           # Client API (axios-like)
│   ├── dist/                    # Build production
│   ├── package.json
│   └── tailwind.config.js
├── tests/                       # Tests pytest
│   ├── __init__.py
│   ├── test_auth.py             # Tests d'authentification
│   ├── test_stock.py            # Tests de stock
│   ├── test_sales.py            # Tests de ventes
│   └── test_users.py            # Tests utilisateurs
├── nginx/
│   ├── nginx.conf               # Configuration reverse proxy
│   └── certs/                   # Certificats TLS auto-signés
├── prometheus/
│   ├── prometheus.yml           # Configuration scrape
│   └── prometheus.rules.yml     # Règles d'alertes
├── grafana/
│   └── dashboards/              # Dashboards JSON
├── alertmanager/
│   └── alertmanager.yml         # Configuration Alertmanager
├── docker-compose.yml           # Stack Docker complète
├── Dockerfile                   # Build multi-stage (Python + Nginx)
├── docker-entrypoint.sh         # Entrypoint Nginx + Uvicorn
├── requirements.txt             # Dépendances Python
├── pytest.ini                   # Configuration pytest
├── README.md                    # Ce fichier
└── .gitignore
```

---

##  Commandes Utiles

```powershell
# === DOCKER ===
# Logs d'un service en temps réel
docker logs -f inventra-api

# État de tous les conteneurs
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Redémarrer un service
docker-compose restart prometheus

# Arrêter la stack
docker-compose down

# Arrêter + supprimer les volumes ( perte de données)
docker-compose down -v

# Rebuild après modification du backend
docker-compose up -d --build api

# Rebuild après modification du frontend
cd frontend && npm run build && cd ..
docker-compose up -d --build api

# === TESTS ===
# Tous les tests avec couverture
pytest tests/ -v --cov=app --cov-report=html --cov-report=term

# Test spécifique
pytest tests/test_auth.py -v

# Rapport de couverture
start htmlcov/index.html

# === BASE DE DONNÉES ===
# Shell PostgreSQL
docker exec -it inventra-postgres psql -U postgres -d inventra

# Backup rapide
docker exec inventra-postgres pg_dump -U postgres inventra > backup.sql

# === MONITORING ===
# Métriques Prometheus
curl.exe http://localhost:9090/api/v1/targets

# Alertes en cours
curl.exe http://localhost:9090/api/v1/alerts

# Tester une alerte
docker stop inventra-redis && Start-Sleep -Seconds 40 && start http://localhost:9090/alerts
```

---

##  Développement

### Mode développement (hot reload)

```powershell
# Terminal 1 : Démarrer PostgreSQL + Redis
docker-compose up -d postgres redis

# Terminal 2 : Frontend React (port 5173)
cd frontend
npm run dev

# Terminal 3 : Backend FastAPI (port 8000)
uvicorn app.main:app --reload
```

### Workflow

1. Modifier le code dans `app/` (backend) ou `frontend/src/` (frontend)
2. L'API redémarre automatiquement (hot reload Uvicorn)
3. Le frontend se met à jour automatiquement (HMR Vite)
4. Tester sur http://localhost:8000/docs et http://localhost:5173
5. Lancer les tests : `pytest tests/ -v`
6. Builder pour la production :
   ```powershell
   cd frontend && npm run build && cd ..
   docker-compose up -d --build api
   ```

---

##  Licence

— © 2025 InfraStack

---