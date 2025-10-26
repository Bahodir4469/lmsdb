#!/bin/sh
set -e

echo "🚀 LMS API ishga tushirilmoqda..."
echo "=================================="
echo ""

# Ranglar
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Database kutish
echo "${YELLOW}⏳ Database tayyor bo'lishi kutilmoqda...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0

until nc -z db 5432 || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Urinish $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "${RED}❌ Database ga ulanishda xato!${NC}"
    exit 1
fi

echo "${GREEN}✓ Database tayyor${NC}"
echo ""

# 2. Prisma Client generate (agar kerak bo'lsa)
echo "${YELLOW}📦 Prisma Client tekshirilmoqda...${NC}"
if [ ! -d "node_modules/.prisma/client" ]; then
    echo "   Prisma Client generate qilinmoqda..."
    npx prisma generate
    echo "${GREEN}✓ Prisma Client yaratildi${NC}"
else
    echo "${GREEN}✓ Prisma Client mavjud${NC}"
fi
echo ""

# 3. Migrationlar
echo "${YELLOW}🔄 Database migrationlari bajarilmoqda...${NC}"
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "${GREEN}✓ Migrationlar muvaffaqiyatli bajarildi${NC}"
else
    echo "${RED}❌ Migration da xato!${NC}"
    echo "   Davom ettirilmoqda..."
fi
echo ""

# 4. Database seed (agar kerak bo'lsa)
if [ -f "prisma/seed.js" ] || [ -f "prisma/seed.ts" ]; then
    echo "${YELLOW}🌱 Database seed bajarilmoqda...${NC}"
    npx prisma db seed || echo "${YELLOW}⚠️  Seed mavjud emas yoki xato${NC}"
    echo ""
fi

# 5. Uploads papka yaratish
echo "${YELLOW}📁 Uploads papka tekshirilmoqda...${NC}"
if [ ! -d "/app/uploads" ]; then
    mkdir -p /app/uploads
    chmod 755 /app/uploads
    echo "${GREEN}✓ Uploads papka yaratildi${NC}"
else
    echo "${GREEN}✓ Uploads papka mavjud${NC}"
fi
echo ""

# 6. Environment o'zgaruvchilarni tekshirish
echo "${YELLOW}🔍 Environment sozlamalarini tekshirish...${NC}"

check_env() {
    if [ -z "${!1}" ]; then
        echo "${RED}   ❌ $1 o'rnatilmagan!${NC}"
        return 1
    else
        echo "${GREEN}   ✓ $1 o'rnatilgan${NC}"
        return 0
    fi
}

check_env "DATABASE_URL"
check_env "JWT_SECRET"
check_env "PORT"
echo ""

# 7. Health check endpoint
echo "${YELLOW}🏥 Health check sozlanmoqda...${NC}"
echo "${GREEN}✓ Health endpoint: http://localhost:${PORT}/api/health${NC}"
echo ""

# 8. Info
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}✅ SETUP YAKUNLANDI!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Ma'lumotlar:"
echo "   Port: ${PORT:-8080}"
echo "   Database: PostgreSQL"
echo "   Node versiya: $(node --version)"
echo "   Environment: ${NODE_ENV:-production}"
echo ""
echo "🚀 Application ishga tushirilmoqda..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 9. Applicationni ishga tushirish
exec "$@"
