#!/bin/bash
# Elephant Project Setup Script

echo "🐘 Setting up Elephant project structure..."

# Create main project directory
mkdir elephant
cd elephant

# Create directory structure
mkdir -p data/{media,items,relationships/{links},ai/{model,embeddings}}
mkdir -p backend/{api,services,ai,utils}
mkdir -p frontend/src/{routes/{media/{[id]},graph,upload},components,stores}
mkdir -p frontend/static

# Create initial data files
echo '{}' > data/metadata.json
echo '{"counter": 0}' > data/counter.json
echo '{}' > data/users.json
echo '{"nodes": [], "edges": [], "clusters": {}}' > data/relationships/graph.json
echo '{"clusters": [], "temporalClusters": [], "suggestions": []}' > data/relationships/ai_clusters.json

# Create package.json for backend
cat > backend/package.json << 'EOF'
{
  "name": "elephant-backend",
  "version": "1.0.0",
  "description": "Elephant knowledge base backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "socket.io": "^4.7.2",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# Create package.json for frontend
cat > frontend/package.json << 'EOF'
{
  "name": "elephant-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "vite build",
    "dev": "vite dev",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@sveltejs/adapter-auto": "^2.0.0",
    "@sveltejs/kit": "^1.20.4",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "svelte": "^4.0.5",
    "tailwindcss": "^3.3.0",
    "vite": "^4.4.2"
  },
  "dependencies": {
    "d3": "^7.8.5",
    "@tailwindcss/typography": "^0.5.9"
  }
}
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Install frontend dependencies and build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build frontend
RUN cd frontend && npm run build

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "backend/server.js"]
EOF

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  elephant:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    environment:
      - NODE_ENV=development
      - MAX_FILE_SIZE=100MB
      - AI_MODEL_PATH=/app/data/ai/model
    deploy:
      resources:
        limits:
          memory: 2G
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF

# Create .env file
cat > .env << 'EOF'
# Environment Configuration
NODE_ENV=development
PORT=3000
MAX_FILE_SIZE=100MB

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this

# AI Configuration
AI_MODEL_PATH=./data/ai/model
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*

# Environment
.env.local
.env.production

# Data (optional - you might want to track some structure)
data/media/*
data/items/*
data/relationships/links/*
data/ai/embeddings/*
!data/.gitkeep

# Build outputs
frontend/build/
frontend/.svelte-kit/

# Logs
*.log

# OS
.DS_Store
Thumbs.db
EOF

# Create basic server.js
cat > backend/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes will go here
app.get('/api/test', (req, res) => {
  res.json({ message: 'Elephant backend is running!' });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`🐘 Elephant server running on port ${PORT}`);
});
EOF

# Create placeholder files to maintain directory structure
touch data/.gitkeep
touch backend/api/.gitkeep
touch backend/services/.gitkeep
touch backend/ai/.gitkeep
touch frontend/src/routes/.gitkeep
touch frontend/src/components/.gitkeep
touch frontend/src/stores/.gitkeep

echo "✅ Project structure created!"
echo ""
echo "📁 Directory structure:"
echo "elephant/"
echo "├── data/                    # All persistent data"
echo "├── backend/                 # Node.js backend"
echo "├── frontend/                # Svelte frontend"
echo "├── Dockerfile              # Container definition"
echo "├── docker-compose.yml      # Development setup"
echo "└── .env                    # Environment config"
echo ""
echo "🚀 Next steps:"
echo "1. cd elephant"
echo "2. Review and customize .env file"
echo "3. docker-compose up --build"
echo "4. Visit http://localhost:3000"
echo ""
echo "🔧 Development commands:"
echo "  docker-compose up --build  # Start with rebuild"
echo "  docker-compose down        # Stop containers"
echo "  docker-compose logs        # View logs"