FROM node:18-alpine

WORKDIR /app

# Install dependencies for both backend and frontend
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build frontend
RUN cd frontend && npm run build

# Create data directory structure
RUN mkdir -p /app/data/media /app/data/items /app/data/relationships/links /app/data/ai

# Expose port
EXPOSE 3000

# Start the backend server
CMD ["node", "backend/server.js"]