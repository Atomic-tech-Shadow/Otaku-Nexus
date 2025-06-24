# Dockerfile pour déploiement Render
FROM node:20-alpine

# Installer les dépendances système
RUN apk add --no-cache postgresql-client

# Créer le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer toutes les dépendances (y compris dev pour le build)
RUN npm ci

# Copier le code source
COPY . .

# Build l'application avec script personnalisé
RUN npx vite build --config vite.config.ts
RUN npx esbuild server/index-production.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Pousser le schéma vers la base de données (avec l'URL fournie)
ENV DATABASE_URL=postgresql://neondb_owner:npg_mtSpzriYuV56@ep-round-lake-a8zn7f2c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
RUN npm run db:push

# Créer le dossier public pour les fichiers statiques  
RUN mkdir -p dist/public && cp -r client/dist/* dist/public/ 2>/dev/null || echo "Client dist not found, continuing..."

# Nettoyer les dev dependencies après le build
RUN npm prune --production

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000
ENV API_BASE_URL=https://api-anime-sama.onrender.com

# Commande de démarrage
CMD ["node", "dist/index-production.js"]