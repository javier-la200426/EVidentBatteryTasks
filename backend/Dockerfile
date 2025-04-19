# Use slim version instead of alpine to avoid native binary issues
FROM node:18-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Run with nodemon in development
CMD ["npm", "run", "dev"]
