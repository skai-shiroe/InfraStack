#!/bin/bash
set -e

BACKUP_DIR="/backups"
KEEP_DAYS=7
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "[INFO] Starting backup at $TIMESTAMP"

# PostgreSQL backup
PG_DUMP_FILE="$BACKUP_DIR/postgresql-$TIMESTAMP.sql"
echo "[INFO] Backing up PostgreSQL to $PG_DUMP_FILE"
docker exec infrastack-postgres pg_dump -U postgres infrastack > "$PG_DUMP_FILE"
echo "[OK] PostgreSQL backup completed"

# Redis backup
REDIS_DUMP_FILE="$BACKUP_DIR/redis-$TIMESTAMP.rdb"
echo "[INFO] Backing up Redis to $REDIS_DUMP_FILE"
docker exec infrastack-redis redis-cli BGSAVE > /dev/null 2>&1 || true
sleep 2
docker cp infrastack-redis:/data/dump.rdb "$REDIS_DUMP_FILE"
echo "[OK] Redis backup completed"

# Rotation
echo "[INFO] Rotating backups (keeping last $KEEP_DAYS days)"
find "$BACKUP_DIR" -name "*.sql" -type f -mtime +$KEEP_DAYS -delete
find "$BACKUP_DIR" -name "*.rdb" -type f -mtime +$KEEP_DAYS -delete

echo "[OK] Backup completed successfully at $(date +%H:%M:%S)"