# 🚀 LMS API - Avtomatik Setup

## ⚡ Bir Buyruqda Ishga Tushirish

```bash
./setup.sh
```

Bu script **HAMMA NARSANI** avtomatik qiladi:
- ✅ Environment fayllarni sozlaydi
- ✅ JWT secret yaratadi
- ✅ Papkalarni yaratadi
- ✅ Docker build va run qiladi
- ✅ Database migration bajaradi
- ✅ Admin user yaratadi
- ✅ Health check qiladi

---

## 📋 Tezkor Boshlash

### 1. Repository ni Clone Qilish

```bash
git clone https://github.com/sizning-username/lmsdb.git
cd lmsdb
```

### 2. Setup Ishga Tushirish

```bash
chmod +x setup.sh
./setup.sh
```

### 3. Tayyor! 🎉

API manzili: `http://localhost:8080`

---

## 🔧 Qo'lda Sozlash (Ixtiyoriy)

Agar qo'lda sozlashni xohlasangiz:

### 1. Environment Fayl

```bash
cp .env.example .env
nano .env
```

O'zgartiring:
```env
# Kuchli parollar
DB_PASSWORD=KuchliParol123!
INIT_ADMIN_PASSWORD=AdminParol456!

# JWT Secret (avtomatik generatsiya qilinadi)
JWT_SECRET=$(openssl rand -hex 32)

# Nginx ortida ishlaganda
TRUST_PROXY=1

# CORS (frontend domainlaringiz)
CORS_ORIGINS=https://kognitivbiologiya.uz,https://www.kognitivbiologiya.uz,https://biologiya.vercel.app
```

### 2. Docker Ishga Tushirish

```bash
docker compose -f docker-compose-secure.yml up -d
```

Bu yerda Docker avtomatik:
- ✅ Database tayyor bo'lishini kutadi
- ✅ Prisma Client generate qiladi
- ✅ Migration bajaradi
- ✅ Admin user yaratadi
- ✅ Uploads papka yaratadi

---

## 📊 Holat Tekshirish

### Health Check

```bash
curl http://localhost:8080/api/health
```

Natija:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.45,
  "database": "connected"
}
```

### Containerlar

```bash
docker compose ps
```

### Loglar

```bash
docker compose logs -f api
```

---

## 🎯 API Endpointlar

### Health Endpoints

```bash
# Asosiy health check
GET http://localhost:8080/api/health

# Database health
GET http://localhost:8080/api/health/db

# Readiness probe (Kubernetes)
GET http://localhost:8080/api/health/ready

# Liveness probe
GET http://localhost:8080/api/health/live
```

### Auth

```bash
# Login
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "login": "admin",
  "password": "admin123"
}
```

---

## 🔄 Yangilash (Update)

### GitHub dan Yangilanishlarni Tortish

```bash
git pull origin main
docker compose -f docker-compose-secure.yml down
docker compose -f docker-compose-secure.yml build --no-cache
docker compose -f docker-compose-secure.yml up -d
```

Yoki tez script:

```bash
./server-update.sh
```

---

## 🛠️ Foydali Buyruqlar

### Containerlarni Boshqarish

```bash
# Ishga tushirish
docker compose -f docker-compose-secure.yml up -d

# To'xtatish
docker compose -f docker-compose-secure.yml down

# Restart
docker compose -f docker-compose-secure.yml restart

# Status
docker compose -f docker-compose-secure.yml ps

# Loglar
docker compose -f docker-compose-secure.yml logs -f
docker compose -f docker-compose-secure.yml logs -f api
docker compose -f docker-compose-secure.yml logs -f db
```

### Database

```bash
# PostgreSQL ga kirish
docker exec -it lms-db psql -U postgres -d lmsdb

# Database backup
docker exec lms-db pg_dump -U postgres lmsdb > backup.sql

# Backup restore
docker exec -i lms-db psql -U postgres lmsdb < backup.sql
```

### Prisma

```bash
# Prisma Studio (Database GUI)
docker exec -it lms-api npx prisma studio

# Migration yaratish
docker exec -it lms-api npx prisma migrate dev --name migration_name

# Migration deploy
docker exec -it lms-api npx prisma migrate deploy

# Database reset (⚠️ DIQQAT: Barcha ma'lumotlar o'chadi!)
docker exec -it lms-api npx prisma migrate reset
```

---

## 🔐 Xavfsizlik

### Parollarni O'zgartirish

`.env` faylida:

```env
# Database
DB_PASSWORD=YangıKuchlıParol123!

# Admin
INIT_ADMIN_PASSWORD=AdminParol456!

# JWT
JWT_SECRET=$(openssl rand -hex 32)
```

Keyin restart:

```bash
docker compose restart
```

### Firewall (Production)

```bash
sudo ufw allow 22,80,443/tcp
sudo ufw enable
```

### SSL (Production)

```bash
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📁 Fayl Tuzilishi

```
lmsdb/
├── src/                    # Application source code
│   ├── routes/            # API routes
│   ├── utils/             # Utilities
│   └── app.js             # Main app file
├── prisma/                 # Prisma schema & migrations
│   ├── schema.prisma
│   └── migrations/
├── uploads/                # User uploaded files
├── logs/                   # Application logs
├── docker-compose.yml      # Docker compose config
├── Dockerfile              # Docker build config
├── docker-entrypoint.sh    # Startup script
├── init-db.sh              # Database initialization
├── setup.sh                # One-command setup
├── .env                    # Environment variables (local)
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

---

## 🐛 Muammolarni Hal Qilish

### Container ishga tushmayapti

```bash
# Loglarni tekshirish
docker compose logs api

# Qayta build qilish
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Database ulanmayapti

```bash
# Database containerini tekshirish
docker compose logs db

# Database health check
docker exec lms-db pg_isready -U postgres
```

### Migration xatosi

```bash
# Migration holatini tekshirish
docker exec -it lms-api npx prisma migrate status

# Migration qayta urinish
docker exec -it lms-api npx prisma migrate deploy

# Reset (⚠️ Ma'lumotlar o'chadi)
docker exec -it lms-api npx prisma migrate reset --force
```

### Port band

```bash
# Qaysi process 8080 portida?
sudo lsof -i :8080

# Yoki
sudo netstat -tulpn | grep 8080

# Process ni to'xtatish
sudo kill -9 <PID>
```

---

## 🌐 Production Deploy

### 1. Server Tayyorlash

```bash
# Docker o'rnatish
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Firewall
sudo ufw allow 22,80,443/tcp
sudo ufw enable

# Nginx + SSL
sudo apt install nginx certbot python3-certbot-nginx
```

### 2. Repository Clone

```bash
cd ~
git clone https://github.com/sizning-username/lmsdb.git
cd lmsdb
```

### 3. Environment Sozlash

```bash
cp .env.example .env
nano .env

# Parollarni o'zgartiring!
# JWT_SECRET ni yangilang!
# TRUST_PROXY=1 qiling
# CORS_ORIGINS ga frontend domenlarni yozing
```

### 4. Ishga Tushirish

```bash
chmod +x setup.sh
./setup.sh
```

### 5. Nginx Sozlash

```bash
sudo nano /etc/nginx/sites-available/lms-api
```

Konfiguratsiya:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Faollashtirish:
```bash
sudo ln -s /etc/nginx/sites-available/lms-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📞 Yordam

### Loglar

Agar muammo bo'lsa, avval loglarni tekshiring:

```bash
docker compose -f docker-compose-secure.yml logs -f
```

### Status

```bash
docker compose -f docker-compose-secure.yml ps
docker compose -f docker-compose-secure.yml exec api node -v
docker compose -f docker-compose-secure.yml exec db psql -U postgres -c "SELECT version();"
```

### Test

```bash
# Health check
curl http://localhost:8080/api/health

# Login test
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin123"}'
```

---

## 📝 Eslatmalar

1. ⚠️ `.env` faylini GitHub ga HECH QACHON yuklamang
2. 🔐 Production da parollarni o'zgartiring
3. 🔥 Firewall va SSL o'rnating
4. 💾 Database backupini muntazam oling
5. 📊 Loglarni monitoring qiling

---

## ✅ Checklist

Setup dan oldin:

- [ ] Docker o'rnatilgan
- [ ] `.env` fayli sozlangan
- [ ] Parollar o'zgartirilgan
- [ ] Firewall sozlangan (production)
- [ ] Domain va SSL tayyor (production)

Setup dan keyin:

- [ ] Health check ishlayapti
- [ ] Admin login qilish mumkin
- [ ] Database ulanishi ishlayapti
- [ ] File upload ishlayapti
- [ ] Loglar to'g'ri

---

**🎉 Baxtli Coding!**
