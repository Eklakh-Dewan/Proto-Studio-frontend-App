# Overview

This is a full-stack travel companion application that helps users discover personalized travel recommendations based on their unique "Travel DNA." The app features an onboarding quiz that analyzes user preferences, generates personalized recommendations, provides AI-powered chat assistance, and creates custom itineraries. Built as a mobile-first progressive web application with a modern React frontend and Express.js backend.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for travel data state and TanStack Query for server state management
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **Mobile-First Design**: Bottom navigation, floating action buttons, and responsive layouts optimized for mobile devices

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Type Safety**: TypeScript throughout the entire stack with shared types between frontend and backend
- **API Design**: RESTful API with endpoints for quiz responses, recommendations, chat messages, and itinerary management
- **Development Setup**: Vite integration for hot module replacement in development mode

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL for production deployment
- **Development Storage**: In-memory storage implementation for development and demo purposes

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store using connect-pg-simple
- **User Management**: Basic user creation and profile management with travel DNA preferences storage

## External Dependencies
- **Database**: Neon Database (@neondatabase/serverless) for serverless PostgreSQL
- **UI Framework**: Comprehensive Radix UI component set for accessible, unstyled components
- **Styling**: Tailwind CSS with custom design system including color variables and theming
- **Development Tools**: Replit-specific plugins for runtime error handling and development environment integration
- **Type Validation**: Zod for runtime type validation and Drizzle-Zod for database schema validation

The application follows a clean separation of concerns with shared TypeScript interfaces, modular component architecture, and a scalable backend structure that can easily transition from development mock data to production database operations.