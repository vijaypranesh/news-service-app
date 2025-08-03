# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port (assuming your service listens on 4000)
EXPOSE 5000

# Start the app
CMD ["node", "server.js"]
