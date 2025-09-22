#!/bin/bash
# KFSQUARE Database Backup Script

set -e

BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="kfsquare_backup_$DATE"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🗄️ Creating backup: $BACKUP_NAME"

# MongoDB backup
if [ -n "$MONGODB_URI" ]; then
    mongodump --uri "$MONGODB_URI" --out "$BACKUP_DIR/$BACKUP_NAME"
    echo "✅ MongoDB backup completed"
else
    echo "⚠️ MONGODB_URI not set, skipping database backup"
fi

# Compress backup
if [ -d "$BACKUP_DIR/$BACKUP_NAME" ]; then
    tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"
    rm -rf "$BACKUP_DIR/$BACKUP_NAME"
    echo "✅ Backup compressed: $BACKUP_NAME.tar.gz"
fi

# Clean old backups (keep last 30 days)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup process completed"
