# Node image
FROM node:20.18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# NGINX image
FROM nginx:1.27-alpine-slim

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/fe-plongjar/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]