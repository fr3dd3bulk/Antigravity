FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages ./packages
COPY services/worker ./services/worker

RUN npm install --workspaces

WORKDIR /app/services/worker

CMD ["npm", "start"]
