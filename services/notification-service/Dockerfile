# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install curl (Alpine uses apk)
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 4000

# Start the app
CMD ["node", "server.js"]
