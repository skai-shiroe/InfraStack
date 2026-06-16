# 🏗️ InfraStack

Stack complète conteneurisée avec orchestration Docker Compose.

**Stack :** FastAPI • PostgreSQL • Redis • ARQ • Nginx • Prometheus • Grafana

---

## ✅ Étape 1 — Structure FastAPI

- [x] Arborescence du projet
- [x] `app/main.py` avec endpoints `/` et `/health`
- [x] Environnement virtuel `.venv`
- [x] FastAPI + Uvicorn installés

## ✅ Étape 2 — PostgreSQL

- [x] Service PostgreSQL 17 dans `docker-compose.yml`
- [x] Base `infrastack`, user `postgres`
- [x] Port `5432` exposé
- [x] Volume persistant `postgres_data`

## ✅ Étape 3 — Connexion FastAPI ↔ PostgreSQL

- [x] `app/core/database.py` — moteur SQLAlchemy async, session, `check_db_connection()`
- [x] `app/models/__init__.py` — modèle `User`
- [x] `app/schemas/__init__.py` — schémas Pydantic (`UserCreate`, `UserUpdate`, `UserResponse`)
- [x] `.env` avec `DATABASE_URL`
- [x] Endpoint `/db-check`

## ✅ Étape 4 — API CRUD Users

- [x] `app/services/users.py` — couche métier (create, list, get, update, delete)
- [x] `app/api/users.py` — routes REST :
  - `POST /users` — Créer un utilisateur
  - `GET /users` — Lister les utilisateurs
  - `GET /users/{id}` — Récupérer un utilisateur
  - `PUT /users/{id}` — Modifier un utilisateur
  - `DELETE /users/{id}` — Supprimer un utilisateur

---

## 🚀 Lancer l'application

### 1. Démarrer PostgreSQL

```powershell
docker compose up -d postgres
```

### 2. Activer l'environnement virtuel

```powershell
.venv\Scripts\activate
```

### 3. Lancer l'API

```powershell
uvicorn app.main:app --reload
```

### 4. Tester

| Endpoint | URL |
|----------|-----|
| API | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| Health | http://localhost:8000/health |
| DB Check | http://localhost:8000/db-check |
| Users CRUD | http://localhost:8000/users |

---

## 📦 Dépendances

```powershell
.venv\Scripts\pip install -r requirements.txt