# Use Node.js official image
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code and build the project
COPY . .
RUN npm run build

# Expose the default NestJS port
EXPOSE 3000

# Start the application in production mode
CMD ["npm", "run", "start:prod"]
