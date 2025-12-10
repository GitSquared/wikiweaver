# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WikiWeaver is an AI-powered web application that creates an "infinite, LLM-hallucinated Wikipedia" allowing users to browse wikis of parallel universes. Built with Next.js 15 and React 19, it dynamically generates fictional encyclopedia articles using OpenAI's GPT-5-mini.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Code linting and formatting (uses Biome)
npm run lint

# Type checking
npm run typecheck

# Run tests
npm run test

# Database schema updates
npm run push-db
```

## Architecture

**Tech Stack:**
- Next.js 16.0.8 with App Router (Turbopack default)
- React 19.2.1 with TypeScript 5.9.3
- PostgreSQL with Drizzle ORM
- OpenAI GPT-5-mini for content generation
- Tailwind CSS 4 for styling
- Biome for linting/formatting

**Key Directories:**
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable UI components
- `src/db/schema/` - Database schema definitions
- `src/lib/` - Utility functions and core logic
- `src/ai/` - AI model configuration
- `drizzle/` - Database migration files

**Database Schema:**
- Universes: Container contexts for articles
- Articles: Generated content with universe relationships
- Paragraphs: Granular content storage for streaming

**Core Functionality:**
- Server-side article generation using AI SDK
- Real-time content streaming for better UX
- Search functionality across generated content
- Universe-based content contextualization

## Code Conventions

- Uses tab indentation (configured in Biome)
- Single quotes for JavaScript strings
- Self-closing JSX elements where possible
- Organize imports automatically
- Type-safe database queries with Drizzle
- Server Actions for form handling

## Development Notes

- Articles are generated on-demand and cached in the database
- Search maintains consistency across AI-generated content
- Universe contexts guide article generation for coherence
- All generated content is streamed to improve perceived performance
- Database migrations are handled through Drizzle Kit