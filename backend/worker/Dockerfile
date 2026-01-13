FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY backend ./backend

RUN npm install --workspaces

WORKDIR /app/backend/worker

CMD ["npm", "start"]
