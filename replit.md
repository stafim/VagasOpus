# Overview

This is a job management system (VagasPro) built with React and Express, designed for companies to manage job postings, applications, and recruitment workflows. The application provides a comprehensive dashboard for tracking hiring metrics, managing companies and cost centers, and analyzing recruitment performance through various reports and visualizations.

**CURRENT STATE**: Authentication bypass mode is enabled for direct access without login/password requirements. Users can access the full application immediately without creating accounts.

# Recent Changes (October 17, 2025)

## Kanban - Botão de Notas nos Cards de Candidatos
- **Enhanced**: Melhorado o botão de visualização/edição de notas nos cards de candidatos
- **Features**:
  - Botão de largura total em cada card para maior visibilidade
  - Texto descritivo: "Ver Notas" quando há notas, "Adicionar Notas" quando não há
  - Visual diferenciado: botão azul (default) quando tem notas, outline quando não tem
  - Ícone FileText ao lado do texto para fácil identificação
  - Localizado no rodapé do card, abaixo da data de aplicação
- **UX**: Acesso rápido e intuitivo às notas do candidato diretamente do Kanban

## Dashboard - Vagas em Recrutamento por Usuário Chart
- **Modified**: Changed "Vagas por Criador" chart to show only jobs in recruitment status
- **Changes**:
  - Chart title updated to "Vagas em Recrutamento por Usuário"
  - Chart description updated to "Top 5 usuários com mais vagas em recrutamento"
  - Backend query filters jobs with `status = 'em_recrutamento'` only
  - Applied to both regular and monthly filtered views
- **Technical**: Modified `getJobsByCreator()` in storage.ts to add WHERE clause filtering by status

## Kanban Job Filter Fix
- **Fixed**: Kanban now correctly opens with the selected job from the Jobs page
- **Issue**: Previously, clicking the Kanban button on a specific job (e.g., VG008) would open the Kanban with a different job
- **Solution**: 
  - Changed URL parameter parsing to use `window.location.search` instead of wouter's `location`
  - Updated useEffect dependencies to properly react to location changes
  - Now correctly filters applications for the selected job when navigating from Jobs page

## Dashboard - Card Title Update
- **Changed**: "Vagas Totais" renamed to "Vagas abertas no mês"
- **Description**: Updated to "Vagas abertas no período selecionado"
- **Context**: Better reflects the metric being displayed based on the selected time period

## Dashboard - Vagas Abertas por Empresa Chart
- **Modified**: Changed "Vagas por Empresa" chart to show only open jobs (status "aberto")
- **Changes**:
  - Chart title updated to "Vagas Abertas por Empresa"
  - Chart description updated to "Top 5 empresas com mais vagas abertas"
  - Backend query filters jobs with `status = 'aberto'` only
  - Applied to both regular and monthly filtered views
- **Technical**: Modified `getJobsByCompany()` in storage.ts to add WHERE clause filtering by status

## Job Notes Feature
- **Added**: Campo de notas nas vagas para observações e anotações
- **Features**:
  - Botão "Criar Nota" / "Editar Nota" no modal de detalhes
  - Campo de texto para digitar observações sobre a vaga
  - Notas exibidas nas informações adicionais do modal
  - Persistência das notas no banco de dados
- **Backend**: 
  - Nova rota `PATCH /api/jobs/:id/notes` para atualizar notas
  - Campo `notes` (TEXT) adicionado à tabela jobs
- **UX**: Botões "Salvar" e "Cancelar" para gerenciar edição de notas

## Job Details Modal - Timeline View
- **Created**: New modal to display job history and timeline
- **Features**:
  - Accessible via "Ver Detalhes" (eye icon) button in jobs table
  - Timeline format showing:
    - **Abertura**: Who created the job and when (createdBy + createdAt)
    - **Aprovação**: Shows if job status is "aprovada" or beyond with update timestamp
    - **Recrutador**: Displays assigned recruiter information
    - **Fechamento/Cancelamento**: Shows closure/cancellation date if applicable
  - Color-coded icons for each event type (blue, green, purple, gray/red)
  - Additional information section with current status, company, profession
- **Technical**:
  - Component: `JobDetailsModal.tsx`
  - Uses existing job data (creator, recruiter, status, timestamps)
  - Read-only view - editing still done via edit modal
- **Limitation**: Current schema tracks createdBy, recruiterId, status, and timestamps but doesn't have dedicated approval/status change history table

## Job Manager Column - Gestor (Manager)
- **Added**: "Gestor" column in jobs table showing who created each job
- **Features**:
  - Displays full name of job creator (firstName + lastName)
  - Sortable column with click-to-sort functionality
  - Fallback to email if name not available, shows "N/A" if no creator
- **Backend**: Enhanced SQL queries with LEFT JOIN to fetch creator user data
  - Added `creator` field to job responses with user information
  - Updated both `getJobs()` and `getJob()` methods to include creator data
- **Data Assignment**: All open jobs assigned Ricardo Gestor as both creator and recruiter

## Job Modal - Delete Button Integration
- **Moved**: Delete job button from table to job edit modal
- **Location**: Bottom-left corner of modal (when editing)
- **Features**:
  - Red destructive button with trash icon
  - Confirmation dialog before deletion
  - Removes job and all related applications
  - Only visible when editing existing jobs (not when creating new)
  - Automatically closes modal and refreshes list after deletion
- **UX**: Buttons layout - "Excluir Vaga" (left) | "Cancelar" + "Atualizar Vaga" (right)

## Dashboard - Numbered Job Status Display
- **Added**: Numerical prefixes to job status labels in Dashboard
- **Status Order**:
  1. Abertas (aberto)
  2. Aprovadas (aprovada)
  3. Em Recrutamento (em_recrutamento)
  4. Em Documentação (em_documentacao)
  5. DP (dp)
  6. Fechadas (closed)
- **Visual**: Numbers appear in pie chart labels and legends for better organization

## Job Closure Report - Monthly Filter
- **Added**: Monthly filter to Job Closure Report
- **Features**:
  - Dropdown selector with last 12 months in Portuguese format
  - "Todos os meses" option to show all data
  - Clear filter button when a month is selected
  - Real-time filtering of both ranking table and detailed jobs table
  - All metrics cards update automatically based on selected month
- **Backend**: SQL queries filter by `TO_CHAR(j.updated_at, 'YYYY-MM')` when month parameter is provided
- **API Routes**: `/api/reports/job-closure?month=YYYY-MM` and `/api/reports/closed-jobs-by-recruiter?month=YYYY-MM`

## Modern Login Screen Implementation
- **Created**: Beautiful, modern login interface with glassmorphism design
- **Features**: 
  - Gradient background (blue → indigo → purple) with decorative blur elements
  - Two-column layout on desktop: branding information + login form
  - Responsive mobile design with optimized single-column layout
  - Login-only interface (registration removed)
  - Icon-enhanced input fields (Mail, Lock icons)
  - Form validation with real-time error messages
  - Loading states with animated spinners
  - Gradient buttons with smooth hover effects
- **Routes**: 
  - Main login at `/` (when not authenticated)
  - Demo preview at `/login-demo` (accessible anytime)
- **Integration**: Fully integrated with existing authentication system (simpleAuth.ts)
- **Note**: Registration functionality removed - login only

## Job Status Updates
- **Added new statuses**: "dp", "em_mobilizacao", "cancelada"
- **Removed statuses**: "paused", "active" (Ativa), "expired" (Expirada)
- **Status "Fechada" color**: Changed from red (destructive) to green (#10b981)
- **Updated**: All status configurations in shared/constants.ts and frontend components

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
- **Login Page**: Modern, responsive login/registration interface with glassmorphism design
- **Session Management**: Express sessions with in-memory store for development
- **Security**: BCrypt password hashing, HTTP-only cookies, secure sessions
- **Note**: Authentication can be re-enabled by removing the temporary bypass flag
- **Demo Route**: `/login-demo` available to preview the login screen design

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