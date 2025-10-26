# ✅ LMS API Xavfsizlik Checklist

## 🚨 HOZIR QILISH KERAK (Zarur):

### 1. Firewall Yoqish (5 daqiqa)
```bash
sudo apt install ufw -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. PostgreSQL Portini Yopish (2 daqiqa)
```bash
cd ~/lmsdb
nano docker-compose.yml

# Bu qatorlarni comment qiling:
# ports:
#   - "5432:5432"

# Qo'shing:
expose:
  - "5432"

# Restart
docker compose down && docker compose up -d
```

### 3. Admin Parolini O'zgartirish (1 daqiqa)
```bash
nano .env

# O'zgartiring:
INIT_ADMIN_PASSWORD=KuchlıParol123!@#

# Restart
docker compose restart api
```

**JAMİ: ~10 daqiqa** ✅

---

## 🛡️ KEYINGI (Tavsiya Etiladi):

### 4. Nginx + SSL O'rnatish (20 daqiqa)
```bash
# Nginx o'rnatish
sudo apt install nginx certbot python3-certbot-nginx -y

# Konfiguratsiya
sudo nano /etc/nginx/sites-available/lms-api
# (nginx-lms-api.conf dan nusxalang)

# Faollashtirish
sudo ln -s /etc/nginx/sites-available/lms-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL (agar domeningiz bo'lsa)
sudo certbot --nginx -d your-domain.com
```

### 5. Database Parolini O'zgartirish (10 daqiqa)
```bash
# PostgreSQL ga kirish
docker exec -it lmsdb-db-1 psql -U postgres

# Yangi user yaratish
CREATE USER lms_user WITH PASSWORD 'SuperKuchliParol!2024';
GRANT ALL PRIVILEGES ON DATABASE lmsdb TO lms_user;
GRANT ALL ON SCHEMA public TO lms_user;
\q

# .env da DATABASE_URL ni yangilash
nano .env
# DATABASE_URL="postgresql://lms_user:SuperKuchliParol!2024@db:5432/lmsdb?schema=public"

# Restart
docker compose down && docker compose up -d
```

---

## 📊 TEKSHIRISH:

### Portlarni Tekshirish
```bash
# Tashqaridan ochiq portlar
sudo netstat -tulpn | grep LISTEN

# To'g'ri natija:
# 0.0.0.0:80    (nginx)
# 0.0.0.0:443   (nginx)
# 0.0.0.0:22    (ssh)
# 127.0.0.1:8080 (api - faqat local!)
```

### Firewall Holati
```bash
sudo ufw status

# Natija:
# Status: active
# To         Action      From
# --         ------      ----
# 22/tcp     ALLOW       Anywhere
# 80/tcp     ALLOW       Anywhere
# 443/tcp    ALLOW       Anywhere
```

### Docker Containerlar
```bash
docker ps

# 2 ta container ishlashi kerak:
# - lms-api (port: 127.0.0.1:8080)
# - lmsdb-db-1 (portlar yopiq)
```

---

## 🎯 TEZKOR SCRIPT:

Hammasini avtomatik bajarish uchun:

```bash
# 1. Script ni yuklab oling
chmod +x secure-setup.sh

# 2. Ishga tushiring (root)
sudo ./secure-setup.sh

# 3. Parollarni qo'lda o'zgartiring
nano ~/lmsdb/.env
```

---

## ⚠️ XAVFLI HOLAT (Hozirgi):

- ❌ PostgreSQL porti ochiq (5432) - **YOPING!**
- ❌ Firewall o'chirilgan - **YOQING!**
- ❌ Zaif parollar - **O'ZGARTIRING!**
- ❌ HTTPS yo'q - **SSL O'RNATING!**

## ✅ XAVFSIZ HOLAT (Maqsad):

- ✅ Faqat 22, 80, 443 portlar ochiq
- ✅ Firewall faol
- ✅ Kuchli parollar
- ✅ Nginx + SSL ishlamoqda
- ✅ Database internal

---

## 📞 YORDAM:

Muammo bo'lsa:
1. Loglarni tekshiring: `docker compose logs -f`
2. Firewall holatini ko'ring: `sudo ufw status verbose`
3. Portlarni tekshiring: `sudo netstat -tulpn`

**ESLATMA:** SSH portini (22) yopishni unutmang, aks holda serverga kira olmaysiz! 🚨
