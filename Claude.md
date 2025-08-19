# Elephant - Knowledge Base Project

## Project Overview

Elephant is a self-contained knowledge base application for maintaining and visualizing relationships between two friends through media sharing. It runs as a Docker container on a mini computer and emphasizes complete data sovereignty.

### Core Concept
- Two friends share media (text, documents, images, video, audio, weblinks)
- Every upload gets a sequential number (1.jpg, 2.txt, 3.mp3)
- Users create ad-hoc bidirectional relationships between media
- AI clusters similar relationships for visualization
- Graph view shows the entire knowledge network

## Technical Stack

### Backend
- **Runtime**: Node.js with Express
- **Storage**: File-based JSON (no database)
- **Authentication**: Hardcoded two-user system (friend1/friend2)
- **AI**: Local lightweight embedding model (sentence-transformers)
- **Real-time**: WebSocket for collaboration

### Frontend
- **Framework**: Svelte + SvelteKit
- **Styling**: TailwindCSS
- **Visualization**: D3.js for graph networks
- **Build**: Vite

### Deployment
- **Container**: Docker with docker-compose
- **Platform**: Mini computer (ARM or x86)
- **Data**: All stored locally in ./data directory

## Project Structure

```
elephant/
├── data/                    # All persistent data (mounted volume)
│   ├── metadata.json        # Global app metadata
│   ├── auth.json           # Hardcoded two-user credentials
│   ├── counter.json        # Sequential ID counter
│   ├── media/              # Sequential media files (1.jpg, 2.txt, etc.)
│   ├── items/              # Media metadata JSON files
│   ├── relationships/      # Graph and relationship data
│   │   ├── graph.json
│   │   ├── ai_clusters.json
│   │   └── links/          # Individual relationship files
│   └── ai/                 # AI model and embeddings cache
├── backend/
│   ├── server.ts           # Main Express server
│   ├── api/                # API route handlers
│   ├── services/           # Business logic
│   ├── ai/                 # AI processing modules
│   └── utils/              # Helper functions
├── frontend/
│   ├── src/
│   │   ├── routes/         # SvelteKit pages
│   │   ├── components/     # Reusable UI components
│   │   └── stores/         # Svelte state management
│   └── static/
├── Dockerfile
├── docker-compose.yml
└── .env
```

## Key Data Schemas

### Media Item (items/N.json)
```json
{
  "id": 1,
  "filename": "1.jpg",
  "originalName": "sunset_beach.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 2048576,
  "uploadedBy": "user1",
  "uploadedAt": "2025-07-23T10:30:00Z",
  "title": "Sunset at Malibu Beach",
  "description": "Amazing golden hour lighting",
  "uploadThoughts": "This moment felt so peaceful",
  "tags": ["beach", "sunset", "peaceful"],
  "temporalContext": {
    "dayOfWeek": "Saturday",
    "timeOfDay": "evening",
    "season": "summer"
  }
}
```

### Relationship (relationships/links/X-Y.json)
```json
{
  "itemA": 1,
  "itemB": 5,
  "relationshipType": "reminds me of the colors in",
  "description": "Both have that warm golden hour lighting",
  "strength": 0.8,
  "createdBy": "user2",
  "createdAt": "2025-07-23T11:15:00Z",
  "bidirectional": true,
  "tags": ["visual_similarity", "lighting"],
  "aiCluster": "visual_aesthetics"
}
```

## Development Phases

### Phase 1: Core Infrastructure ✅
- [ ] Docker environment setup
- [ ] Basic project structure
- [ ] Removed unnecessary CORS (same-machine deployment)
- [ ] Sequential file numbering system
- [ ] File-based storage utilities
- [ ] Basic Express server with health checks
- [ ] Hardcoded two-user authentication system

### Phase 2: Media Management (CURRENT)
- [ ] Multi-format file upload API
- [ ] Context capture (title, description, thoughts)
- [ ] Media metadata storage and retrieval
- [ ] Basic Svelte frontend with upload interface
- [ ] Timeline view of recent uploads

### Phase 3: Relationships
- [ ] Relationship creation API
- [ ] Bidirectional link management
- [ ] Relationship visualization interface
- [ ] Media detail pages with relationship display

### Phase 4: AI & Graph Visualization
- [ ] Local AI model integration
- [ ] Text embedding and similarity clustering
- [ ] D3.js graph visualization
- [ ] Temporal pattern recognition
- [ ] AI-suggested relationship clusters

## Coding Guidelines

### File Organization
- Use TypeScript with ES6 modules throughout
- Keep API routes in separate files by feature
- Use descriptive, consistent naming
- Comment complex algorithms and AI logic

### Data Management
- **Sequential IDs**: Always use the counter.json system
- **File-based**: All data stored as JSON files, no database
- **Immutable media**: Once uploaded, media files never change
- **Atomic operations**: Write to temp files, then rename

### Error Handling
- Graceful degradation for AI features
- Comprehensive input validation
- Meaningful error messages for users
- Log errors but don't expose internals

### Performance
- Lazy load large media files
- Cache AI embeddings aggressively
- Use efficient JSON parsing
- Optimize for mini computer constraints

### Security
- Validate all file uploads
- Sanitize user input
- Simple but secure authentication
- No external API dependencies

## Key Features to Implement

### Upload Flow
1. Drag/drop or browse files
2. Show preview immediately
3. Optional context capture (title, description, thoughts)
4. Sequential numbering assignment
5. Metadata extraction and storage
6. Timeline update

### Relationship Creation
1. Select two media items
2. Define relationship type (ad-hoc text)
3. Optional description/notes
4. Bidirectional linking
5. AI clustering suggestions

### Graph Visualization
1. Force-directed layout with D3.js
2. Node types based on media type
3. Edge styling based on relationship strength
4. Clustering visualization
5. Interactive zoom/pan/selection

### AI Processing
1. Text embedding generation
2. Similarity calculation
3. Relationship clustering
4. Temporal pattern recognition
5. Suggestion generation

## Environment Variables

```env
NODE_ENV=development
PORT=3000
MAX_FILE_SIZE=100MB
JWT_SECRET=your-secret-key
AI_MODEL_PATH=./data/ai/model
```

## Docker Commands

```bash
# Development
docker-compose up --build

# Production
docker-compose -f docker-compose.prod.yml up -d

# Logs
docker-compose logs -f

# Cleanup
docker-compose down --volumes
```

## Current Priority

Focus on Phase 2: Media Management
- Implement the sequential file numbering system
- Build robust file upload handling
- Create the context capture interface
- Establish the timeline view foundation

## Notes for Claude Code

- **Data sovereignty** is crucial - everything stays local
- **Simplicity over complexity** - prefer file-based solutions
- **Two-user focus** - don't over-engineer for scale
- **AI enhancement** - AI should enhance, not replace, human curation
- **Mini computer constraints** - optimize for ARM/low-power systems
- **Sequential numbering** - this is core to the entire system design

## Questions to Ask

Before implementing major features, consider:
1. Does this maintain data sovereignty?
2. Will this work well on a mini computer?
3. Does this enhance the relationship discovery experience?
4. Is this simple enough for two non-technical users?
5. Can this degrade gracefully if AI features fail?

## Getting Started

1. Run the setup script to create project structure
2. Start with sequential file numbering implementation
3. Build the upload API with context capture
4. Create basic Svelte frontend for uploads
5. Implement timeline view with media previews

Remember: The goal is to build a meaningful knowledge base for human relationships, not just a technical showcase.