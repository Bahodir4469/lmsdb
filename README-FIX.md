# LMS API - Database Migration Fix

## 🔴 Problem

The application crashes with error:
```
PrismaClientKnownRequestError: The table `public.User` does not exist in the current database.
```

**Root Cause:** The Prisma migrations are not being run when the Docker container starts, so the database tables are never created.

---

## ✅ Solutions

### Solution 1: Use Entrypoint Script (Recommended for Production)

This is the **best practice** approach for production deployments.

#### Steps:

1. **Replace your Dockerfile** with the new one that includes the entrypoint:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --omit=dev
   COPY . .
   RUN npx prisma generate
   
   EXPOSE 8080
   
   COPY docker-entrypoint.sh /docker-entrypoint.sh
   RUN chmod +x /docker-entrypoint.sh
   
   ENTRYPOINT ["/docker-entrypoint.sh"]
   CMD ["npm", "start"]
   ```

2. **Create `docker-entrypoint.sh`** in your project root:
   ```bash
   #!/bin/sh
   set -e
   
   echo "Running database migrations..."
   npx prisma migrate deploy
   
   echo "Starting application..."
   exec "$@"
   ```

3. **Rebuild and restart:**
   ```bash
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

**Advantages:**
- ✅ Migrations run automatically on every container start
- ✅ Proper error handling
- ✅ Production-ready
- ✅ Works with container orchestration (Kubernetes, etc.)

---

### Solution 2: Simple CMD Change (Quick Alternative)

Modify only the CMD line in your Dockerfile:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN npx prisma generate
EXPOSE 8080
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

Then rebuild:
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

**Advantages:**
- ✅ Simple one-line change
- ✅ No additional files needed

**Disadvantages:**
- ⚠️ Less flexible for complex startup logic

---

### Solution 3: Manual Fix (No Rebuild Required)

If you want to fix the current deployment **without rebuilding**:

```bash
# Stop containers
docker compose down

# Start only the database
docker compose up -d db

# Wait for database
sleep 5

# Run migrations manually
docker compose run --rm api npx prisma migrate deploy

# Start everything
docker compose up -d
```

Or use the provided script:
```bash
chmod +x fix-and-run.sh
./fix-and-run.sh
```

**Advantages:**
- ✅ Fixes the current setup immediately
- ✅ No rebuild required

**Disadvantages:**
- ⚠️ Must be run manually every time you redeploy
- ⚠️ Not automated

---

## 📋 Complete Setup Guide

### Initial Setup (First Time)

```bash
# 1. Copy environment file
cp _env .env

# 2. Start database
docker compose up -d db

# 3. Wait for database to be ready
sleep 5

# 4. Run migrations
docker compose run --rm api npx prisma migrate deploy

# 5. Start all services
docker compose up -d

# 6. Check logs
docker compose logs -f api
```

### Using npm scripts (Development)

Your `package.json` has an `init` script that should work for local development:

```bash
npm run init
```

This runs: `npm install && npm run docker:up && npx prisma migrate dev && npm run dev`

---

## 🎯 Recommended Approach

**For Production/Deployment:**
- Use **Solution 1** (Entrypoint Script)

**For Development:**
- Use `npm run init` or run migrations manually

**For Quick Fix:**
- Use **Solution 3** (Manual Migration)

---

## 🔍 Verify It Works

After applying any solution, verify the database tables were created:

```bash
# Connect to the database container
docker exec -it $(docker ps -qf "name=db") psql -U postgres -d lmsdb

# List all tables
\dt

# Should show tables like: User, Lesson, Test, etc.
```

---

## 📝 Why This Happens

1. **Prisma Generate** (in Dockerfile) creates the Prisma Client code
2. **Prisma Migrate** (missing) actually creates the database tables
3. The app tries to query tables that don't exist → crash!

The fix ensures migrations run **before** the app starts.

---

## 🆘 Troubleshooting

### If migrations fail:

```bash
# Check database is running
docker compose ps

# Check database logs
docker compose logs db

# Check if DATABASE_URL is correct in .env
cat .env | grep DATABASE_URL

# Verify connection
docker compose run --rm api npx prisma db pull
```

### If you need to reset everything:

```bash
docker compose down -v  # ⚠️ This deletes all data!
docker compose up -d db
sleep 5
docker compose run --rm api npx prisma migrate deploy
docker compose up -d
```

---

## 📚 Additional Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
