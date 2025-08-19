# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build the application for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview the built application

## Architecture Overview

This is a **Nuxt 3 timetracking application** that integrates with Jira via OAuth2 for time logging functionality. The app uses a custom authentication system with automatic token refresh and session management.

### Key Technologies
- **Nuxt 3** with Vue 3 Composition API
- **Pinia** for state management with persistence
- **TailwindCSS + DaisyUI** for styling with custom "dmf" theme
- **Jira.js** client for Atlassian API integration
- **OAuth2 PKCE** flow for secure authentication

### Authentication System

The app implements a comprehensive OAuth2 authentication flow:
- **Server-side OAuth handler**: `/server/api/auth/[...].ts` handles login, callback, refresh, session endpoints
- **Client plugin**: `/plugins/auth.ts` manages session state, automatic token refresh, and expiry handling
- **Auth middleware**: `/middleware/auth.ts` protects routes and handles redirect logic
- **Composables**: `useAuth()` and `useJiraClient()` provide auth and API access

**Key features**:
- PKCE code challenge for security
- Automatic token refresh 5 minutes before expiry
- Session persistence via HTTP-only cookies
- Refresh token storage in localStorage
- Window focus event triggers token check

### State Management

**Pinia stores** with localStorage persistence:
- `issues.js` - Manages time tracking entries with UUID generation
- `bookmarks.js` - Stores frequently used Jira issues
- `break.js` - Handles break time tracking

### Environment Configuration

Required environment variables in `.env`:
```
JIRA_CLIENT_ID=your_client_id
JIRA_CLIENT_SECRET=your_client_secret
JIRA_RESOURCE_NAME=your_jira_instance_name
AUTH_ORIGIN=https://your-domain.com  # for production
```

### Component Structure

- **TheTopBar** - Main navigation with user info and theme switcher
- **TheIssueList** - Displays and manages tracked issues
- **Issue** - Individual issue time tracking component
- **Search/IssuePicker** - Jira issue search and selection
- **IssuesAssignedToMe** - Quick access to assigned issues
- **TheBreak** - Break time tracking functionality
- **ConfirmationModal** - Reusable confirmation dialog

### Styling System

Uses **TailwindCSS** with **DaisyUI** components:
- Custom "dmf" theme with specific color palette
- Dark theme support with theme switching
- Open Sans font family
- SCSS entry point at `assets/scss/main.scss`

### API Integration

The app uses `jira.js` Version3Client with:
- Dynamic host configuration based on Jira resource
- OAuth2 bearer token authentication
- Automatic error handling with token refresh on 401 errors
- Middleware for request/response intercepting

### Development Notes

- Uses 4-space indentation consistently
- TypeScript composables with Vue 3 Composition API
- Server routes use Nuxt 3 file-based routing
- Components auto-imported via Nuxt configuration
- Middleware runs on route changes for auth protection