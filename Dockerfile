# Node.js image
FROM node:20-alpine

# Ish joyini yaratamiz
WORKDIR /app

# package.json va lock faylni nusxalaymiz
COPY package*.json ./

# Dependensiyalarni o‘rnatamiz
RUN npm install

# Qolgan fayllarni konteynerga nusxalaymiz
COPY . .

# Prisma client generatsiya
RUN npx prisma generate

# Portni ochamiz
EXPOSE 8080

# Dastur ishga tushirish buyrug‘i
CMD ["npm", "run", "start"]
