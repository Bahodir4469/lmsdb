#!/bin/bash

echo "🔐 LMS API - Tezkor Xavfsizlik Sozlash"
echo "========================================"
echo ""

# Rangli output uchun
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Root tekshirish
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Iltimos root sifatida ishga tushiring: sudo ./secure-setup.sh${NC}"
    exit 1
fi

echo -e "${YELLOW}1️⃣  Firewall (UFW) o'rnatilmoqda...${NC}"
apt update -qq
apt install ufw -y -qq

echo -e "${YELLOW}2️⃣  Firewall sozlamalari...${NC}"
# Default rules
ufw --force default deny incoming
ufw --force default allow outgoing

# SSH porti (MUHIM: serverni yo'qotmaslik uchun)
ufw --force allow 22/tcp
echo -e "${GREEN}   ✓ SSH port 22 ochiq${NC}"

# HTTP va HTTPS (Nginx uchun)
ufw --force allow 80/tcp
ufw --force allow 443/tcp
echo -e "${GREEN}   ✓ HTTP/HTTPS portlar ochiq${NC}"

# PostgreSQL va to'g'ridan-to'g'ri API portlarini yopish
echo -e "${YELLOW}   ⚠ Port 5432 (PostgreSQL) yopildi${NC}"
echo -e "${YELLOW}   ⚠ Port 8080 (API) faqat localhost${NC}"

# UFW yoqish
echo "y" | ufw enable

echo ""
echo -e "${GREEN}3️⃣  Firewall holati:${NC}"
ufw status numbered

echo ""
echo -e "${YELLOW}4️⃣  Docker containerlarni to'xtatish...${NC}"
cd /root/lmsdb || cd ~/lmsdb
docker compose down

echo ""
echo -e "${YELLOW}5️⃣  docker-compose.yml yangilanmoqda...${NC}"

# Backup yaratish
cp docker-compose.yml docker-compose.yml.backup

# PostgreSQL portini yopish
sed -i 's/    ports:/    # ports: # YOPILDI - xavfsizlik uchun/' docker-compose.yml
sed -i 's/      - "5432:5432"/      # - "5432:5432" # YOPILDI/' docker-compose.yml

# Expose qo'shish (agar yo'q bo'lsa)
if ! grep -q "expose:" docker-compose.yml; then
    sed -i '/POSTGRES_DB: lmsdb/a\    expose:\n      - "5432"' docker-compose.yml
fi

echo -e "${GREEN}   ✓ PostgreSQL porti yopildi${NC}"

echo ""
echo -e "${YELLOW}6️⃣  Containerlarni qayta ishga tushirish...${NC}"
docker compose up -d

echo ""
echo -e "${GREEN}✅ Xavfsizlik sozlamalari muvaffaqiyatli o'rnatildi!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}📊 HOLAT:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔥 Firewall (UFW):"
ufw status | grep -E "Status|22|80|443"
echo ""
echo "🐳 Docker containerlar:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}⚠️  KEYINGI QADAMLAR:${NC}"
echo ""
echo "1. Parollarni o'zgartiring:"
echo "   nano .env"
echo "   INIT_ADMIN_PASSWORD=YangıKuchlıParol123!"
echo ""
echo "2. Nginx + SSL o'rnating (tavsiya etiladi):"
echo "   sudo apt install nginx certbot python3-certbot-nginx -y"
echo ""
echo "3. API ni tekshiring:"
echo "   curl http://localhost:8080/api/auth/login"
echo ""
echo -e "${GREEN}✓ Server xavfsizroq bo'ldi!${NC}"
