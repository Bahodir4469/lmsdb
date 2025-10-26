# ⚡ LMS API - Tezkor Qo'llanma

## 🎯 BIR BUYRUQDA ISHGA TUSHIRISH

```bash
chmod +x setup.sh
./setup.sh
```

**HAMMASI AVTOMATIK!** ✅

---

## 📦 Nima O'rnatiladi?

1. ✅ Database (PostgreSQL)
2. ✅ API (Node.js + Express)
3. ✅ Prisma ORM + Migrationlar
4. ✅ Admin user (avtomatik)
5. ✅ Health check endpoints
6. ✅ File upload sozlamalari

---

## 🚀 Qadamma-Qadam

### 1. Serverda

```bash
# Git clone
git clone https://github.com/sizning-username/lmsdb.git
cd lmsdb

# Setup
chmod +x setup.sh
./setup.sh
```

### 2. Parollarni O'zgartirish (Muhim!)

```bash
nano .env
```

O'zgartiring:
```
INIT_ADMIN_PASSWORD=YangıKuchlıParol123!
```

Restart:
```bash
docker compose restart
```

### 3. Tekshirish

```bash
# Health check
curl http://localhost:8080/api/health

# Status
docker compose ps

# Loglar
docker compose logs -f api
```

---

## 🔄 Yangilash

GitHub dan yengi code tortish:

```bash
git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d
```

Yoki script:
```bash
./server-update.sh
```

---

## 📋 Foydali Buyruqlar

```bash
# Status
docker compose ps

# To'xtatish
docker compose down

# Ishga tushirish
docker compose up -d

# Restart
docker compose restart

# Loglar
docker compose logs -f

# Database
docker exec -it lms-db psql -U postgres -d lmsdb
```

---

## 🌐 API Endpoints

```
Health:     http://localhost:8080/api/health
Login:      http://localhost:8080/api/auth/login
API:        http://localhost:8080/api
```

Default admin:
- Login: `admin`
- Password: `admin123` (o'zgartiring!)

---

## ⚠️ MUHIM

1. **Parollarni o'zgartiring!**
   - `.env` da `INIT_ADMIN_PASSWORD`
   - `.env` da `DB_PASSWORD`

2. **Firewall yoqing!**
   ```bash
   sudo ufw allow 22,80,443/tcp
   sudo ufw enable
   ```

3. **`.env` ni GitHub ga yuklamang!**
   - `.gitignore` da ekanligiga ishonch hosil qiling

---

## 🎉 Tayyor!

Server manzili: `http://your-server-ip:8080`

Admin login:
```bash
curl -X POST http://your-server-ip:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin123"}'
```

---

## 📞 Muammo?

1. Loglarni tekshiring: `docker compose logs -f`
2. Status: `docker compose ps`
3. Health: `curl http://localhost:8080/api/health`

---

**Qo'shimcha:** To'liq qo'llanma uchun `README-AUTO-SETUP.md` ni o'qing
