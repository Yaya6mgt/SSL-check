FROM node:24-alpine AS build

WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json ./

RUN npm install

# Copie du code source
COPY . .

RUN npm run build

FROM node:24-alpine AS production

WORKDIR /app

COPY --from=build /app/package*.json ./

RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

CMD ["node", "dist/index.js"]