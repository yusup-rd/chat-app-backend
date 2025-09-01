FROM node:20-alpine

WORKDIR /usr/src/app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
