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
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:vite --external:@vitejs/plugin-react --external:@replit/vite-plugin-cartographer --external:@replit/vite-plugin-runtime-error-modal

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
CMD ["npm", "start"]