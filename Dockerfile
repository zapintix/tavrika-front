FROM node:20-alpine AS dev

WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
