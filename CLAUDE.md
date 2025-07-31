# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Next.js 15 personal website/wiki system that processes MDX content from an Obsidian vault and serves it as a web application with a unique Windows 95-inspired UI.

## Development Commands

```bash
# Development
pnpm dev          # Start development server on http://localhost:3000

# Build and Production
pnpm build        # Build for production
pnpm start        # Start production server

# Content Generation (IMPORTANT: Run before building)
pnpm generate:content    # Process Obsidian vault and generate content files

# Linting
pnpm lint         # Run Next.js linter
```

## Architecture Overview

### Content Pipeline
The site uses a unique content generation system that processes files from an Obsidian vault:

1. **Source**: Obsidian vault at `/Users/jmill/Documents/obsidian/nhx3b`
2. **Processing**: `src/scripts/generate-content.ts` script that:
   - Filters for markdown files with `publish: true` in frontmatter
   - Converts Obsidian-style `[[wikilinks]]` to Next.js Link components
   - Processes image attachments and copies them to public directory
   - Generates metadata files for navigation and search
   - Creates tag mappings for categorization

3. **Output**: 
   - MDX files in `/content/` directory
   - Images in `/public/images/`
   - Metadata in `/src/config/` (pages.json, metadata.json, tags.json, entities.json)

### Frontend Architecture

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with custom Windows 95-inspired theme
- **MDX Processing**: Uses `next-mdx-remote` for runtime MDX compilation
- **UI Components**: Custom component library in `/src/components/ui/`
- **Search/Navigation**: Quick switcher component using kbar library
- **3D Animation**: Three.js sphere animation on homepage

### Key Features

1. **Dynamic Wiki Pages**: Content served from `/c/[slug]` routes
2. **Tag System**: Tag-based navigation at `/t/[tag]` routes  
3. **Quick Switcher**: CMD+K search interface for rapid navigation
4. **Vector Desktop**: Interactive desktop-style navigation with hexagon grid
5. **Wiki Windows**: Draggable windows for wiki content exploration

### Path Aliases

- `@/*` maps to `./src/*` (configured in tsconfig.json)

## Working with Content

When modifying content generation:
1. The source Obsidian vault is hardcoded in `generate-content.ts`
2. Only files with `publish: true` in frontmatter are processed
3. Wikilinks are validated against existing content to prevent broken links
4. Images are copied to both `/content/Images/` and `/public/images/`

## Important Notes

- Always run `pnpm generate:content` before building to ensure content is up-to-date
- The site uses React 19 and Next.js 15 - ensure compatibility when adding dependencies
- MDX content automatically imports Next.js Link component when needed
- The Windows 95 aesthetic is intentional - maintain consistency in UI additions