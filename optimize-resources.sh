#!/bin/bash

# Docker Resource Optimization
# Server resursini tejash uchun

echo "🔧 DOCKER RESURS OPTIMIZATSIYA"
echo "==============================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Hozirgi resurs ko'rish
echo -e "${YELLOW}📊 Hozirgi resurs ishlatilishi:${NC}"
echo ""
docker stats --no-stream
echo ""

# 2. Disk tozalash
echo -e "${YELLOW}🧹 Docker disk tozalash...${NC}"
echo ""

# Unused images
UNUSED_IMAGES=$(docker images -f "dangling=true" -q | wc -l)
echo "Unused images: $UNUSED_IMAGES"

# Stopped containers
STOPPED_CONTAINERS=$(docker ps -aq -f status=exited | wc -l)
echo "Stopped containers: $STOPPED_CONTAINERS"

# Unused volumes
UNUSED_VOLUMES=$(docker volume ls -f dangling=true -q | wc -l)
echo "Unused volumes: $UNUSED_VOLUMES"

echo ""
read -p "Tozalashni davom ettirish? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Tozalanmoqda..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove build cache
    docker builder prune -f
    
    echo -e "${GREEN}✓ Tozalandi!${NC}"
    echo ""
    
    # Show saved space
    echo "Yangi disk holati:"
    df -h /
fi

echo ""
echo "════════════════════════════════"
echo -e "${GREEN}📊 RESURS TAHLILI${NC}"
echo "════════════════════════════════"
echo ""

# 3. Backend + Database resurs
echo "Backend + Database (minimal):"
echo "  RAM:    512 MB - 1 GB"
echo "  CPU:    1 core"
echo "  Disk:   10-20 GB"
echo "  Cost:   ~$5/oy"
echo ""

echo "Backend + Database + Frontend:"
echo "  RAM:    1-2 GB"
echo "  CPU:    1-2 core"
echo "  Disk:   20-40 GB"
echo "  Cost:   ~$15/oy"
echo ""

echo "════════════════════════════════"
echo -e "${GREEN}💡 TAVSIYALAR${NC}"
echo "════════════════════════════════"
echo ""

echo "1. Frontend ni Vercel ga joylashtiring (BEPUL)"
echo "   - Serverda faqat backend qoladi"
echo "   - 512 MB RAM yetadi"
echo ""

echo "2. Docker compose resource limits:"
echo "   - API: 512 MB limit"
echo "   - DB: 256 MB limit"
echo ""

echo "3. PostgreSQL tuning:"
echo "   - shared_buffers = 128MB"
echo "   - max_connections = 50"
echo ""

echo "4. Node.js optimization:"
echo "   - NODE_ENV=production"
echo "   - --max-old-space-size=400"
echo ""

echo "5. Regular cleanup:"
echo "   - Logs rotate"
echo "   - Old uploads delete"
echo "   - Docker prune"
echo ""
