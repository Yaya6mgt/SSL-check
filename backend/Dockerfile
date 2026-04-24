FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN cp -r src/templates dist/src/templates

FROM node:24-alpine AS production

WORKDIR /app

# Créer le dossier uploads avec les permissions nécessaires pour que l'application puisse y écrire (Multer)
RUN mkdir -p uploads && chmod 777 uploads

COPY --from=build /app/package*.json ./

RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

CMD ["node", "dist/src/index.js"]