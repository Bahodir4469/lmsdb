# 🔐 LMS API Xavfsizlik Sozlamalari

## ❗ MUHIM: Hozirgi Xavfsizlik Muammolari

Sizning serveringiz hozir ishlamoqda, lekin **xavfsizlik kamchiliklari** bor:

### 1. ❌ PostgreSQL porti ochiq (5432)
- Hamma internetdan ma'lumotlar bazasiga kirish imkoniyati bor
- Parol juda oddiy: `postgres:postgres`

### 2. ❌ API to'g'ridan-to'g'ri internet orqali ochiq (8080)
- HTTPS yo'q (SSL sertifikat kerak)
- Firewall sozlamalari yo'q

### 3. ❌ Zaif parollar
- Database: `postgres:postgres`
- Admin: `admin123`
- JWT Secret ochiq

---

## ✅ Tavsiya Etilgan Sozlamalar

### 1️⃣ PostgreSQL Portini Yopish

Database faqat internal network orqali ishlashi kerak:

```yaml
# docker-compose.yml - YANGILANGAN
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: lmsdb
    # ❌ Bu qatorni OLIB TASHLANG:
    # ports:
    #   - "5432:5432"
    
    # ✅ Faqat docker network ichida ishlaydi
    expose:
      - "5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build: .
    container_name: lms-api
    restart: always
    env_file: .env
    ports:
      - "8080:8080"  # Bu ham yopiladi, nginx orqali ishlatiladi
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:
```

---

### 2️⃣ Nginx + SSL (HTTPS) O'rnatish

API ni to'g'ridan-to'g'ri ochiq qoldirmasdan, Nginx orqali ishlating:

#### a) Nginx o'rnatish:
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

#### b) Nginx konfiguratsiya:
```nginx
# /etc/nginx/sites-available/lms-api
server {
    listen 80;
    server_name your-domain.com;  # O'z domeningizni yozing

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### c) Faollashtirish:
```bash
sudo ln -s /etc/nginx/sites-available/lms-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### d) SSL sertifikat (HTTPS):
```bash
sudo certbot --nginx -d your-domain.com
```

---

### 3️⃣ Firewall Sozlash (UFW)

Faqat kerakli portlarni ochish:

```bash
# UFW o'rnatish
sudo apt install ufw -y

# Barcha portlarni yopish (default)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH portini ochish (server bilan aloqa uchun)
sudo ufw allow 22/tcp

# HTTP va HTTPS portlarini ochish (Nginx uchun)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# UFW ni yoqish
sudo ufw enable

# Holatni tekshirish
sudo ufw status
```

**Natija:**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

### 4️⃣ Parollarni O'zgartirish

#### .env faylini yangilash:
```bash
# .env
DATABASE_URL="postgresql://lms_user:KUCHLI_PAROL_123!@db:5432/lmsdb?schema=public"
JWT_SECRET=$(openssl rand -hex 32)  # Yangi random secret
PORT=8080

# Admin parolini o'zgartirish
INIT_ADMIN_PASSWORD=Kuchli_Parol_2024!
```

#### Database user yaratish:
```bash
# PostgreSQL containeriga kirish
docker exec -it lmsdb-db-1 psql -U postgres

# Yangi user yaratish
CREATE USER lms_user WITH PASSWORD 'KUCHLI_PAROL_123!';
GRANT ALL PRIVILEGES ON DATABASE lmsdb TO lms_user;
GRANT ALL ON SCHEMA public TO lms_user;
\q

# Keyin .env da DATABASE_URL ni yangilash kerak
```

---

### 5️⃣ Docker Compose - Xavfsiz Versiya

```yaml
# docker-compose-secure.yml
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: lms_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # .env dan olinadi
      POSTGRES_DB: lmsdb
    expose:
      - "5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - lms-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lms_user"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build: .
    container_name: lms-api
    restart: always
    env_file: .env
    expose:
      - "8080"
    ports:
      - "127.0.0.1:8080:8080"  # Faqat localhost dan
    depends_on:
      db:
        condition: service_healthy
    networks:
      - lms-network

volumes:
  pgdata:

networks:
  lms-network:
    driver: bridge
```

---

## 📋 Qadamma-Qadam Qo'llanma

### Hozir Qilish Kerak Bo'lgan Ishlar:

```bash
# 1. Serverni to'xtatish
cd ~/lmsdb
docker compose down

# 2. Firewall sozlash
sudo apt install ufw -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 3. Docker compose ni yangilash
# (PostgreSQL portini yopish)
nano docker-compose.yml
# ports qatorini comment qiling yoki olib tashlang

# 4. Parollarni o'zgartirish
nano .env
# INIT_ADMIN_PASSWORD ni o'zgartiring
# JWT_SECRET ni yangilang

# 5. Qayta ishga tushirish
docker compose up -d

# 6. Nginx o'rnatish (ixtiyoriy, lekin tavsiya etiladi)
sudo apt install nginx -y
# Nginx konfiguratsiya qilish
```

---

## 🎯 Minimal Xavfsizlik (Tezkor)

Agar vaqt yo'q bo'lsa, kamida buni qiling:

```bash
# 1. Firewall yoqish
sudo ufw enable
sudo ufw allow 22,80,443/tcp

# 2. PostgreSQL portini yopish
# docker-compose.yml da:
# "5432:5432" ni o'chirib tashlang

# 3. Restart
docker compose down && docker compose up -d

# 4. Tekshirish
sudo ufw status
docker ps
```

---

## ✅ Xavfsizlikni Tekshirish

```bash
# 1. Portlarni tekshirish (tashqaridan)
sudo netstat -tulpn | grep LISTEN

# Natija (to'g'ri):
# 0.0.0.0:80    (nginx)
# 0.0.0.0:443   (nginx) 
# 127.0.0.1:8080 (api - faqat local)
# 0.0.0.0:22    (ssh)

# 2. Firewall holati
sudo ufw status verbose

# 3. Docker network
docker network inspect lmsdb_default
```

---

## 🚨 XAVFLI Holatlar

### ❌ BU HOLATDA QOLDIRMANG:
- PostgreSQL porti ochiq (5432)
- API to'g'ridan-to'g'ri ochiq (8080) va HTTPS yo'q
- Firewall o'chirilgan
- Default parollar

### ✅ TO'G'RI HOLAT:
- Faqat 80, 443, 22 portlar ochiq
- Nginx + SSL ishlamoqda
- Database faqat internal
- Kuchli parollar

---

## 📞 Qo'shimcha

Agar domen bo'lsa:
1. SSL sertifikat oling (Let's Encrypt bepul)
2. Nginx orqali HTTPS sozlang
3. API ni localhost ga o'zgartiring

Agar domen yo'q bo'lsa:
1. Kamida firewall yoqing
2. PostgreSQL portini yoping
3. Parollarni o'zgartiring
