FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY services/frontend ./services/frontend

WORKDIR /app/services/frontend

RUN npm install
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/services/frontend/dist /usr/share/nginx/html
COPY services/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
