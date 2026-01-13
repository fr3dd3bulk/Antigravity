FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages ./packages
COPY services/scheduler ./services/scheduler

RUN npm install --workspaces

WORKDIR /app/services/scheduler

CMD ["npm", "start"]
