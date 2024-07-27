# Use an official Node.js runtime as a parent image
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8888

CMD ["node", "dist/index.js"]
