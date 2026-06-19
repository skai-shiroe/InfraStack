# ============================================================
# Stage 1 : Builder — installe les dépendances et build
# ============================================================
FROM python:3.13-alpine AS builder

WORKDIR /build

# Dépendances système pour psycopg2, greenlet, etc.
RUN apk add --no-cache \
        gcc \
        musl-dev \
        postgresql-dev \
        libffi-dev

# Copie et installation des dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt && \
    find /root/.local -name "*.pyc" -delete

# ============================================================
# Stage 2 : Runtime — image finale ultra-légère
# ============================================================
FROM python:3.13-alpine AS runtime

WORKDIR /app

# libpq (runtime seulement)
RUN apk add --no-cache postgresql-libs

# Copie les packages installés depuis le builder
COPY --from=builder /root/.local /root/.local

# Copie le code de l'application
COPY app/ ./app/

# S'assurer que les binaires locaux sont dans le PATH
ENV PATH=/root/.local/bin:$PATH \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Exposition du port
EXPOSE 8000

# Santé
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Démarrage
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]