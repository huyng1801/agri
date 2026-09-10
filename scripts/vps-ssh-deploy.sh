#!/usr/bin/env bash
set -e
export SSHPASS='NhqsbDYL6KM4vcRc4Ugw'
HOST='14.225.206.91'
PORT='22'
USER='root'
LOCAL_SCRIPT='/mnt/c/Users/PC/Documents/Project/agri/scripts/vps-deploy-remote.sh'

if ! command -v sshpass >/dev/null 2>&1; then
  sudo DEBIAN_FRONTEND=noninteractive apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq sshpass
fi

mkdir -p ~/.ssh
ssh-keyscan -H "$HOST" >> ~/.ssh/known_hosts 2>/dev/null || true

sshpass -e scp -P "$PORT" "$LOCAL_SCRIPT" "${USER}@${HOST}:/tmp/vps-deploy-remote.sh"
sshpass -e ssh -p "$PORT" "${USER}@${HOST}" "sed -i 's/\r$//' /tmp/vps-deploy-remote.sh && chmod +x /tmp/vps-deploy-remote.sh && /tmp/vps-deploy-remote.sh"
