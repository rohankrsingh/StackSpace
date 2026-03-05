# Base image
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package and lock file
COPY package*.json ./

# Install dependencies 
RUN npm install

# Copy source code and config
COPY . .

# Build TypeScript
RUN npm run build

# Port 3001 for Socket.io
EXPOSE 3001

# Production env vars (defaults)
# These should be overridden in ECS Task Definition
ENV PORT=3001
ENV NODE_ENV=production
ENV WORKSPACES_DIR=/workspaces

# Mount your EFS volume to /workspaces in the Task Definition
# ensuring this directory exists
RUN mkdir -p /workspaces

# Run the server
CMD ["npm", "start"]
