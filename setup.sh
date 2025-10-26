#!/bin/bash

# ===========================================
# LMS API - Bir Buyruqda To'liq O'rnatish
# ===========================================
# ./setup.sh

set -e

echo "🚀 LMS API - TO'LIQ SETUP"
echo "========================="
echo ""

# Ranglar
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function: Print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Root check
if [ "$EUID" -eq 0 ]; then 
    print_warning "Root sifatida ishlamoqdasiz"
fi

# 1. Check Docker
echo -e "${BLUE}1️⃣  Docker tekshirilmoqda...${NC}"
if command -v docker &> /dev/null && command -v docker compose &> /dev/null; then
    print_success "Docker va Docker Compose o'rnatilgan"
else
    print_error "Docker yoki Docker Compose topilmadi!"
    echo ""
    echo "Docker o'rnatish:"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sh get-docker.sh"
    exit 1
fi
echo ""

# 2. Check .env file
echo -e "${BLUE}2️⃣  Environment file tekshirilmoqda...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_warning ".env topilmadi, .env.example dan nusxalanmoqda..."
        cp .env.example .env
        print_success ".env fayli yaratildi"
        echo ""
        print_warning "DIQQAT: .env faylida parollarni o'zgartiring!"
        echo ""
        read -p "Hozir .env ni tahrirlashni xohlaysizmi? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env
        fi
    else
        print_error ".env.example topilmadi!"
        exit 1
    fi
else
    print_success ".env fayli mavjud"
fi
echo ""

# 3. Generate secrets
echo -e "${BLUE}3️⃣  Sirlarni generatsiya qilish...${NC}"
if grep -q "your-super-secret-jwt-key-change-this-in-production" .env; then
    print_warning "Default JWT_SECRET topildi"
    
    # JWT_SECRET ni avtomatik generatsiya qilish
    NEW_JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
    
    if [ -n "$NEW_JWT_SECRET" ]; then
        sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$NEW_JWT_SECRET/" .env
        print_success "Yangi JWT_SECRET yaratildi"
    else
        print_warning "JWT_SECRET ni qo'lda o'zgartiring!"
    fi
fi

if grep -q "INIT_ADMIN_PASSWORD=admin123" .env; then
    print_warning "Default admin paroli topildi"
    print_info "Admin parolini .env da o'zgartiring: INIT_ADMIN_PASSWORD"
fi
echo ""

# 4. Create necessary directories
echo -e "${BLUE}4️⃣  Papkalar yaratilmoqda...${NC}"
mkdir -p uploads logs
chmod 755 uploads logs
print_success "uploads/ va logs/ papkalar yaratildi"
echo ""

# 5. Stop existing containers
echo -e "${BLUE}5️⃣  Eski containerlar to'xtatilmoqda...${NC}"
docker compose down 2>/dev/null || true
print_success "Eski containerlar to'xtatildi"
echo ""

# 6. Build images
echo -e "${BLUE}6️⃣  Docker images build qilinmoqda...${NC}"
echo "   Bu bir necha daqiqa davom etishi mumkin..."
docker compose build --no-cache
print_success "Docker images tayyor"
echo ""

# 7. Start services
echo -e "${BLUE}7️⃣  Servislar ishga tushirilmoqda...${NC}"
docker compose up -d
print_success "Servislar ishga tushdi"
echo ""

# 8. Wait for services
echo -e "${BLUE}8️⃣  Servislar tayyor bo'lishi kutilmoqda...${NC}"
echo "   Database va API ishga tushishi kutilmoqda..."
sleep 15

# Check if services are running
if docker compose ps | grep -q "Up"; then
    print_success "Servislar ishlayapti"
else
    print_error "Servislar ishga tushmadi!"
    echo ""
    echo "Loglarni ko'rish:"
    echo "  docker compose logs"
    exit 1
fi
echo ""

# 9. Health check
echo -e "${BLUE}9️⃣  Health check...${NC}"
PORT=$(grep -E "^PORT=" .env | cut -d '=' -f2 || echo "8080")
HEALTH_URL="http://localhost:${PORT}/api/health"

sleep 5

if command -v curl &> /dev/null; then
    if curl -s -f "$HEALTH_URL" > /dev/null 2>&1; then
        print_success "API health check passed"
    else
        print_warning "API health check failed (bu normal bo'lishi mumkin, API hali ishga tushmoqda)"
    fi
else
    print_info "curl topilmadi, health check o'tkazib yuborildi"
fi
echo ""

# 10. Show status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ SETUP MUVAFFAQIYATLI YAKUNLANDI!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 SERVIS MA'LUMOTLARI:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose ps
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 API MANZILLARI:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Health:  http://localhost:${PORT}/api/health"
echo "   Auth:    http://localhost:${PORT}/api/auth/login"
echo "   API:     http://localhost:${PORT}/api"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 ADMIN MA'LUMOTLARI:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ADMIN_LOGIN=$(grep -E "^INIT_ADMIN_LOGIN=" .env | cut -d '=' -f2 || echo "admin")
ADMIN_PASSWORD=$(grep -E "^INIT_ADMIN_PASSWORD=" .env | cut -d '=' -f2 || echo "admin123")
echo "   Login:    $ADMIN_LOGIN"
echo "   Password: $ADMIN_PASSWORD"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 FOYDALI BUYRUQLAR:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Loglarni ko'rish:        docker compose logs -f"
echo "   To'xtatish:              docker compose down"
echo "   Qayta ishga tushirish:   docker compose restart"
echo "   Status:                  docker compose ps"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 11. Show logs
read -p "Loglarni hozir ko'rishni xohlaysizmi? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Loglar (Ctrl+C bilan chiqish):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker compose logs -f
fi
