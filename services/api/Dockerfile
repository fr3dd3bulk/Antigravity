FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages ./packages
COPY services/api ./services/api

RUN npm install --workspaces

WORKDIR /app/services/api

EXPOSE 3000

CMD ["npm", "start"]
