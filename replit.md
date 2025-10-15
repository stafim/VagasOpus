# Overview

This is a job management system (VagasPro) built with React and Express, designed for companies to manage job postings, applications, and recruitment workflows. The application provides a comprehensive dashboard for tracking hiring metrics, managing companies and cost centers, and analyzing recruitment performance through various reports and visualizations.

**CURRENT STATE**: Authentication bypass mode is enabled for direct access without login/password requirements. Users can access the full application immediately without creating accounts.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Extensive use of shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state and data fetching
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation using @hookform/resolvers

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with JSON responses
- **Middleware**: Custom logging, JSON parsing, and error handling middleware
- **Development Server**: Custom Vite integration for hot reloading in development

## Database & ORM
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Schema**: Comprehensive relational schema with users, companies, cost centers, jobs, and applications
- **Connection**: Neon serverless client with WebSocket support for serverless environments

## Authentication & Authorization
- **CURRENT**: Simple local authentication system with bypass mode enabled
- **Bypass Mode**: AUTH_BYPASS is active - provides immediate access as demo admin user
- **Session Management**: Express sessions with in-memory store for development
- **Security**: BCrypt password hashing, HTTP-only cookies, secure sessions
- **Note**: Authentication can be re-enabled by removing the temporary bypass flag

## Data Layer Design
- **Storage Pattern**: Repository pattern with IStorage interface
- **Type Safety**: Full TypeScript integration with Drizzle schema types
- **Validation**: Zod schemas for API input validation and type inference
- **Relationships**: Well-defined foreign key relationships between entities
- **Parametrized Systems**: Work scales and benefits are now fully parametrized and managed via Settings page

## UI/UX Architecture
- **Design System**: Consistent component library with shadcn/ui
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Charts & Visualization**: Recharts library for dashboard analytics
- **Icons**: Font Awesome for iconography
- **Loading States**: Skeleton components and loading indicators throughout

## Development Workflow
- **Build Process**: Separate client (Vite) and server (esbuild) builds
- **Development**: Integrated development server with HMR support
- **Code Quality**: TypeScript strict mode, ESLint integration
- **Path Aliases**: Configured path mapping for clean imports (@/, @shared/, etc.)

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time database connections via ws library

## Authentication Services
- **Replit Auth**: OpenID Connect authentication provider
- **Session Storage**: PostgreSQL-backed session persistence

## UI & Styling Libraries
- **Radix UI**: Headless UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for UI elements
- **Font Awesome**: Additional icon library
- **Google Fonts**: Inter font family for typography

## Development & Build Tools
- **Vite**: Frontend build tool with plugins for React and development features
- **TypeScript**: Type checking and compilation
- **PostCSS**: CSS processing with Tailwind CSS
- **ESBuild**: Fast JavaScript bundler for server-side code

## Data Visualization
- **Recharts**: React charting library for dashboard analytics
- **Chart.js**: Alternative charting capabilities

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional CSS class utilities
- **class-variance-authority**: Component variant management
- **cmdk**: Command palette functionality
- **memoizee**: Function memoization for performance optimization