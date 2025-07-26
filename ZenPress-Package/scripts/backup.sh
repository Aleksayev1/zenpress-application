#!/bin/bash

BACKUP_DIR="backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="zenpress_backup_${DATE}.tar.gz"

echo "💾 Criando backup do ZenPress..."

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco MongoDB
docker-compose exec -T mongodb mongodump --archive | gzip > "$BACKUP_DIR/mongodb_${DATE}.gz"

# Backup dos uploads (se existir)
if [ -d "backend/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_${DATE}.tar.gz" backend/uploads/
fi

# Backup completo do projeto
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    --exclude=node_modules \
    --exclude=__pycache__ \
    --exclude=.git \
    --exclude=backups \
    .

echo "✅ Backup criado: $BACKUP_DIR/$BACKUP_FILE"