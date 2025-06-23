# Dockerfile pour déploiement Render
FROM node:20-alpine

# Installer les dépendances système
RUN apk add --no-cache python3 make g++

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build l'application
RUN npm run build

# Exposer le port
EXPOSE 10000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=10000

# Commande de démarrage
CMD ["npm", "start"]