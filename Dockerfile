FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173

ENV NODE_ENV=production
ENV PORT=5173

CMD ["node", "server.js"]
