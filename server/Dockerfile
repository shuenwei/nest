# Use official Node.js LTS image
FROM node:20

# Create and set working directory
WORKDIR /usr/src/app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the port Cloud Run will use
EXPOSE 8080

# Run the compiled JS (from dist)
CMD [ "node", "dist/index.js" ]
