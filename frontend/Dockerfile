# Build de l'application
FROM node:24-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copie du code et build
COPY . .
RUN npm run build

# Serveur Nginx pour la production
FROM nginx:stable-alpine

COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]