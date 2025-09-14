# CivicMoncho - Civic Engagement Platform

## Overview

CivicMoncho is a bilingual (Bengali/English) civic engagement platform that enables democratic participation through project showcasing and community polling. The application serves as a bridge between citizens and local government initiatives, providing transparency in public projects and facilitating community feedback through voting mechanisms.

The platform features a modern, responsive design with comprehensive internationalization support, allowing users to seamlessly switch between Bengali and English languages. It displays government projects with detailed information and budgets, while providing an interactive polling system where citizens can vote on community issues.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern component development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn/ui components for accessible, customizable interface elements
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for consistent type safety across the stack
- **API Pattern**: RESTful API design with structured JSON responses
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Logging**: Request/response logging with performance metrics

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **Connection**: Neon Database serverless PostgreSQL for scalable cloud hosting
- **Fallback Storage**: In-memory storage implementation for development and testing scenarios

The database schema includes three main entities:
- Users table for authentication and user management
- Projects table storing bilingual project information with status tracking
- Polls table for community voting with vote count aggregation

### Authentication and Authorization
- **Current Implementation**: Basic user schema with username/password structure
- **Session Management**: Prepared for session-based authentication with PostgreSQL session storage
- **Future Extensions**: Designed to accommodate additional authentication methods and role-based access control

### Development and Build Process
- **Development Server**: Express server with Vite middleware integration for hot module replacement
- **Production Build**: Separate client and server bundling with esbuild for server-side code
- **Type Checking**: Shared TypeScript configuration across client, server, and shared modules
- **Code Organization**: Monorepo structure with clearly separated client, server, and shared code

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect support

### UI and Component Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives including dialogs, dropdowns, navigation, and form components
- **Lucide React**: Icon library providing consistent, customizable SVG icons
- **Embla Carousel**: Touch-friendly carousel implementation for content sliders

### Development and Build Tools
- **Vite**: Frontend build tool with TypeScript support and development server
- **ESBuild**: Fast JavaScript/TypeScript bundler for production server builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer plugins

### Utility Libraries
- **TanStack Query**: Server state management with caching, background updates, and optimistic updates
- **React Hook Form**: Performant form handling with validation support
- **Date-fns**: Date utility library for formatting and manipulation
- **Class Variance Authority**: Utility for creating type-safe component variants
- **Zod**: Schema validation library integrated with Drizzle for type-safe database operations

### Replit Integration
- **Replit Plugins**: Custom Vite plugins for development environment integration and error handling
- **Development Banner**: Automatic development mode detection and user guidance