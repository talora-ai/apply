FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache bash git

COPY package.json ./
RUN npm ci

COPY . .

EXPOSE 8081 19000 19001 19002

CMD ["npx", "expo", "start", "--lan"]
