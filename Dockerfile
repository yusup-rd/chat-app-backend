FROM node:20-alpine

WORKDIR /usr/src/app

# Install deps first
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 5000
CMD ["npm", "run", "start:dev"]
