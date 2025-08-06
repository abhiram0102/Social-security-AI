# Architecture Overview

## Overview

This repository contains a full-stack web application focused on cybersecurity visualization and interaction. The application appears to be a pentest/security scanning tool with a cyberpunk-themed interface that includes 3D visualizations, a terminal interface, and threat monitoring capabilities.

The project uses a modern web stack with React for the frontend, Express for the backend, Drizzle ORM for database interactions, and Three.js for 3D visualizations.

## System Architecture

The application follows a client-server architecture with the following main components:

1. **Frontend**: React-based Single Page Application (SPA) with Three.js for 3D visualization
2. **Backend**: Express.js server providing API endpoints and serving the frontend
3. **Database**: PostgreSQL accessed through Drizzle ORM for data storage
4. **Vite**: Used for development and production build processes

### Architecture Diagram

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│                   │     │                   │     │                   │
│   React Frontend  │◄────┤   Express Server  │◄────┤   PostgreSQL DB   │
│   (Three.js, UI)  │     │   (API Routes)    │     │   (Drizzle ORM)   │
│                   │     │                   │     │                   │
└───────────────────┘     └───────────────────┘     └───────────────────┘
        ▲                          ▲
        │                          │
        │                          │
        │                          │
┌───────────────────┐     ┌───────────────────┐
│                   │     │                   │
│   Shader Support  │     │   External APIs   │
│   (GLSL Files)    │     │   (if any)        │
│                   │     │                   │
└───────────────────┘     └───────────────────┘
```

## Key Components

### Frontend

1. **React Application**
   - Located in the `client/src` directory
   - Entry point is `client/src/main.tsx`
   - Uses modern React patterns with hooks and functional components

2. **3D Visualization**
   - Uses React Three Fiber (`@react-three/fiber`) and Drei (`@react-three/drei`)
   - Custom components include `CyberScene`, `Globe`, `FloatingCube`, and `ParticleNetwork`
   - Supports shaders via GLSL files in the `client/src/lib/shaders` directory

3. **UI Components**
   - Extensive UI component library using Radix UI primitives
   - Located in `client/src/components/ui`
   - Custom cyberpunk-themed components like `Terminal`, `HudInterface`, and `ThreatVisualizer`

4. **State Management**
   - Uses Zustand for global state management
   - Key stores include `useAudio`, `useGame`, and `useSettings`
   - TanStack Query for API data fetching and caching

5. **Styling**
   - Tailwind CSS for styling (configured in `tailwind.config.ts`)
   - Custom CSS variables for theming

### Backend

1. **Express Server**
   - Located in the `server` directory
   - Main entry point is `server/index.ts`
   - Provides API endpoints and serves the frontend

2. **API Routes**
   - Defined in `server/routes.ts`
   - RESTful API design for data access
   - Sample endpoints for user authentication and threat data

3. **Database Interface**
   - Uses Drizzle ORM for database access
   - Schema defined in `shared/schema.ts`
   - Current implementation includes a memory storage fallback (`MemStorage`)

### Database Schema

The database schema is defined in `shared/schema.ts` using Drizzle ORM and includes:

1. **Users Table**
   - Stores user credentials and metadata
   - Includes authentication information

2. **Scans Table**
   - Stores information about security scans
   - References users via foreign key

3. **Vulnerabilities Table**
   - Stores vulnerability information discovered during scans
   - References scans via foreign key

## Data Flow

1. **Authentication Flow**
   - User credentials are validated against the users table
   - Session management is implied but not fully implemented in the current codebase

2. **Scan Execution Flow**
   - User initiates a scan through the UI
   - Backend creates a scan record and executes the appropriate scanning logic
   - Results are stored in the vulnerabilities table
   - Frontend displays results through the ThreatVisualizer component

3. **Visualization Flow**
   - 3D scenes are rendered client-side using Three.js
   - Data from the backend is visualized in real-time
   - Interactive elements allow user exploration of security data

## External Dependencies

### Frontend Dependencies

1. **React Ecosystem**
   - React, React DOM
   - TanStack Query for data fetching
   - Zustand for state management

2. **UI Libraries**
   - Radix UI components
   - Tailwind CSS
   - Framer Motion for animations

3. **3D Visualization**
   - Three.js
   - React Three Fiber
   - React Three Drei
   - GLSL shader support

### Backend Dependencies

1. **Server Framework**
   - Express.js

2. **Database**
   - Drizzle ORM
   - PostgreSQL connector (`@neondatabase/serverless`)

3. **Utilities**
   - Zod for schema validation
   - TypeScript for type safety

## Deployment Strategy

The application is configured for deployment in multiple environments:

1. **Development Mode**
   - Uses Vite's development server with HMR
   - Command: `npm run dev`

2. **Production Build**
   - Builds optimized frontend assets and bundles the server
   - Commands: 
     - `npm run build` - Creates production-ready assets
     - `npm run start` - Runs the production server

3. **Replit Deployment**
   - Configuration in `.replit` suggests deployment to Replit's platform
   - Includes custom workflows for running the application

4. **Database Migrations**
   - Supports Drizzle Kit for schema migrations
   - Command: `npm run db:push`

## Security Considerations

1. **Authentication**
   - Password management appears to be implemented but without visible hashing in the current code
   - Session management is implied but not fully visible in the codebase

2. **API Security**
   - Routes include validation using Zod schemas
   - Error handling middleware implemented in the Express server

3. **Frontend Security**
   - CSRF protection via credentials inclusion in fetch requests
   - API responses are validated before use

## Future Considerations

1. **Scaling**
   - The current architecture could be extended to support microservices
   - Database access could be optimized for higher loads

2. **Additional Features**
   - Real-time notification system
   - Enhanced visualization capabilities
   - Integration with external security tools

3. **Testing**
   - Implementation of comprehensive test suites
   - End-to-end testing framework