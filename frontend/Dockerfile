# Gunakan Node.js versi ringan
FROM node:20-alpine

WORKDIR /app

# Copy daftar library
COPY package*.json ./

# Install library
RUN npm install

# Copy semua kode source frontend
COPY . .

# Build aplikasi Next.js (ubah kode jadi siap tayang)
RUN npm run build

# Buka port 3000
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start", "--", "-H", "0.0.0.0"]

