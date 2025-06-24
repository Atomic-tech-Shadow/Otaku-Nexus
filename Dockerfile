# Dockerfile pour déploiement Render
FROM node:20-alpine

# Installer les dépendances système
RUN apk add --no-cache postgresql-client

# Créer le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build l'application
RUN npm run build

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000
ENV API_BASE_URL=https://api-anime-sama.onrender.com

# Commande de démarrage
CMD ["npm", "start"]