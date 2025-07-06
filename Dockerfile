# Node image
FROM node:20.18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# NGINX image
FROM nginx:1.27-alpine-slim

# Install wget for health checks (lighter than curl)
RUN apk add --no-cache wget

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/fe-plongjar/browser /usr/share/nginx/html

EXPOSE 80