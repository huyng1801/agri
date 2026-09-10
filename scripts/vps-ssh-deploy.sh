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

sleep 8
sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectionAttempts=5 -p "$PORT" "${USER}@${HOST}" "bash -s" < "$LOCAL_SCRIPT"
