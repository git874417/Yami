#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== INICIANDO DESPLIEGUE ===${NC}"

# Create network if it doesn't exist
docker network create sisinf-network 2>/dev/null || true

# Detener y eliminar contenedores existentes
echo -e "${YELLOW}1. Deteniendo y eliminando contenedores antiguos...${NC}"
docker-compose down

# Construir las imágenes
# Usamos --no-cache para asegurar que los cambios de código se apliquen
echo -e "${YELLOW}2. Construyendo imágenes (sin caché)...${NC}"
docker-compose build --no-cache

# Iniciar los contenedores
# El orden de arranque lo gestiona docker-compose gracias a 'depends_on'
echo -e "${YELLOW}3. Iniciando contenedores...${NC}"
docker-compose up -d

echo -e "${GREEN}=== DESPLIEGUE COMPLETADO ===${NC}"
echo "Frontend disponible en: http://localhost:3000"
echo "Backend (vía Proxy) en: http://localhost:3000/api/docs"