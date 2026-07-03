#!/usr/bin/env bash
set -euo pipefail

OLD_BACKUP_DIR="${OLD_BACKUP_DIR:-/root/old-site-backup-$(date +%Y%m%d-%H%M%S)}"

mkdir -p "$OLD_BACKUP_DIR"
cp -a /var/www "$OLD_BACKUP_DIR/var-www" 2>/dev/null || true
cp -a /etc/nginx "$OLD_BACKUP_DIR/nginx" 2>/dev/null || true
docker ps -a > "$OLD_BACKUP_DIR/docker-ps.txt" 2>/dev/null || true
pm2 list > "$OLD_BACKUP_DIR/pm2-list.txt" 2>/dev/null || true
crontab -l > "$OLD_BACKUP_DIR/crontab.txt" 2>/dev/null || true

docker stop $(docker ps -q) 2>/dev/null || true
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true

mkdir -p /root/nginx-old-disabled
mv /etc/nginx/sites-enabled/* /root/nginx-old-disabled/ 2>/dev/null || true
mv /etc/nginx/conf.d/*.conf /root/nginx-old-disabled/ 2>/dev/null || true

echo "Old site backed up to: $OLD_BACKUP_DIR"
