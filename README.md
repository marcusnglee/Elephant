# Elephant - Knowledge Base Project

Elephant is an intimate, self-contained, and conversational knowledge-base between two peers. It captures the hidden relationships and meanings within an on-going exchange of media and thoughts. All media, state, and conversation is private and stored locally.

## Phase 1 Complete ✅

The core infrastructure for Elephant is now set up and ready for development.

### What's Been Implemented

- ✅ Docker environment with docker-compose
- ✅ TypeScript project structure (backend + frontend)
- ✅ Sequential file numbering system with counter.json
- ✅ File-based storage utilities for JSON operations
- ✅ Express TypeScript server with health checks
- ✅ Hardcoded two-user authentication system

### Getting Started

1. **Install backend dependencies:**
   ```bash
   cd backend && npm install
   ```

2. **Start the development server:**
   ```bash
   cd backend && npm run dev
   ```

3. **Test the APIs:**
   - Health check: `GET http://localhost:3000/health`
   - API status: `GET http://localhost:3000/api/status`
   - Available users: `GET http://localhost:3000/api/auth/users`
   - Login: `POST http://localhost:3000/api/auth/login`

### Default Users

- **friend1** / password: `friend1password`
- **friend2** / password: `friend2password`

### Project Structure

```
elephant/
├── backend/          # TypeScript Express server
│   ├── api/         # API route handlers
│   ├── services/    # Business logic
│   └── utils/       # Helper functions
├── frontend/        # Svelte + SvelteKit (ready for Phase 2)
├── data/           # File-based storage
│   ├── metadata.json
│   ├── auth.json
│   ├── counter.json
│   └── media/
└── docker-compose.yml
```

### Next: Phase 2

Ready to implement media management features:
- Multi-format file upload API
- Context capture interface
- Timeline view of recent uploads
