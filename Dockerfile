FROM node:22.11.0

# WORKDIR /app
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm config set strict-ssl false

RUN npm install

RUN npm config set strict-ssl true
COPY . .

# COPY .env ./
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

