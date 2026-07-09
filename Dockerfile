# ============================================
# Stage 1: Build da aplicação Angular
# ============================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration production

# ============================================
# Stage 2: Servir com Nginx
# ============================================
FROM nginx:alpine AS production

# Remove config padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia config customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos buildados do Angular
# O output path no angular.json é "dist/outros-creditos-debitos"
# Angular 17 com builder "application" gera dentro de /browser
COPY --from=build /app/dist/outros-creditos-debitos/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
