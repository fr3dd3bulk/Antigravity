FROM node:22-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY frontend ./frontend

WORKDIR /app/frontend

RUN npm install
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
