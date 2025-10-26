#!/bin/bash

# LMS API - Tezkor Yangilash Script
# Serverda ishlatish uchun: ./server-update.sh

echo "🔄 LMS API YANGILASH"
echo "===================="
echo ""

# Rangli output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="$HOME/lmsdb"

# Check if directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Xato: $PROJECT_DIR topilmadi!${NC}"
    echo "Avval repository ni clone qiling:"
    echo "git clone https://github.com/sizning-username/lmsdb.git"
    exit 1
fi

cd "$PROJECT_DIR" || exit 1

echo -e "${YELLOW}1️⃣  GitHub dan o'zgarishlar tortilmoqda...${NC}"
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull muvaffaqiyatsiz!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ GitHub dan tortildi${NC}"
echo ""

# Check if Dockerfile changed
if git diff HEAD@{1} HEAD --name-only | grep -q "Dockerfile\|package.json"; then
    echo -e "${YELLOW}2️⃣  Dockerfile o'zgardi - rebuild qilinmoqda...${NC}"
    docker compose build --no-cache
    REBUILD=true
else
    echo -e "${YELLOW}2️⃣  Dockerfile o'zgarmagan - rebuild o'tkazib yuborildi${NC}"
    REBUILD=false
fi

echo ""
echo -e "${YELLOW}3️⃣  Containerlar to'xtatilmoqda...${NC}"
docker compose down

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Containerlarni to'xtatishda xato!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Containerlar to'xtatildi${NC}"
echo ""

echo -e "${YELLOW}4️⃣  Containerlar ishga tushirilmoqda...${NC}"
docker compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Containerlarni ishga tushirishda xato!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Containerlar ishga tushdi${NC}"
echo ""

# Wait for database
echo -e "${YELLOW}5️⃣  Database tayyor bo'lishi kutilmoqda...${NC}"
sleep 5

# Check if migrations needed
if git diff HEAD@{1} HEAD --name-only | grep -q "prisma/schema.prisma"; then
    echo -e "${YELLOW}6️⃣  Schema o'zgardi - migrationlar bajarilmoqda...${NC}"
    docker compose run --rm api npx prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Migrationlar bajarildi${NC}"
    else
        echo -e "${RED}⚠️  Migration da xato bo'ldi!${NC}"
    fi
else
    echo -e "${YELLOW}6️⃣  Schema o'zgarmagan - migrationlar o'tkazib yuborildi${NC}"
fi

echo ""
echo -e "${YELLOW}7️⃣  Holat tekshirilmoqda...${NC}"
echo ""

# Check container status
docker compose ps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ YANGILASH YAKUNLANDI!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Loglarni ko'rish:"
echo "   docker compose logs -f api"
echo ""
echo "🌐 API manzili:"
echo "   http://localhost:8080"
echo ""
echo "🛑 To'xtatish:"
echo "   docker compose down"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show last few log lines
echo -e "${YELLOW}📋 So'nggi loglar:${NC}"
docker compose logs --tail=20 api
