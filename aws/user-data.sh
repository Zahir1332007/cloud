#!/bin/bash
# ==============================================================================
# AWS EC2 User Data Bootstrap Script - CloudStore E-Commerce
# Compatible with Ubuntu 22.04 LTS / 24.04 LTS on EC2 t2.micro or t3.micro (Free Tier)
# ==============================================================================

set -e
export DEBIAN_FRONTEND=noninteractive

echo "===> [1/6] Configurando SWAP de 2GB para evitar Out-Of-Memory en t2.micro..."
if ! grep -q "swapfile" /etc/fstab; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "vm.swappiness=10" >> /etc/sysctl.conf
    sysctl -p
fi

echo "===> [2/6] Actualizando paquetes del sistema..."
apt-get update -y
apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg lsb-release git ufw

echo "===> [3/6] Instalando Docker Engine y Docker Compose..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

echo "===> [4/6] Configurando Firewall UFW para AWS..."
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP Web'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

echo "===> [5/6] Preparando directorio de despliegue de CloudStore..."
DEPLOY_DIR="/home/ubuntu/cloudstore"
mkdir -p "$DEPLOY_DIR"
chown -R ubuntu:ubuntu "$DEPLOY_DIR"

echo "===> [6/6] Bootstrap completado exitosamente!"
echo "Para desplegar: sube los archivos a $DEPLOY_DIR y ejecuta: sudo docker compose up -d --build"
