# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: NO RANDOM ADHOC TESTING BY RUNNING DEV SERVERS

Do not run `pnpm dev` or start development servers just to test changes. Only run development servers when explicitly requested by the user.

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

## App Color Palette

Use these consistent colors throughout the application:

- **Wireframe/Primary**: `#00ffff` (cyan) - Used for window borders, primary UI elements
- **Inner/Accent**: `#ff4800` (orange-red) - Used for links, interactive elements, highlights
- **Success/Status**: `text-green-400` - Used for success states and operational status

## Window Architecture

**IMPORTANT**: All window behavior should be implemented in `BaseWindow.tsx`, NOT in individual window components.

- **BaseWindow**: The core window component that handles positioning, resizing, viewport management, and all common window behaviors
- **Specific Windows** (AboutWindow, WikiWindow, etc.): Should only contain content and pass props through to BaseWindow
- **Avoid Window-Specific Logic**: Never add window-type-specific handling in VectorDesktop or other parent components
- **Responsive Behavior**: BaseWindow should handle all responsive sizing, positioning, and viewport changes automatically
- **Consistency**: This ensures all windows behave identically and reduces maintenance overhead

When adding new window features, always implement them in BaseWindow so all windows benefit from the improvement.

## Creating a New App/Window

To add a new application to the VectorDesktop, follow these steps:

1. **Create the Window Component**: Create a new window component in `/src/components/windows/` that extends BaseWindow
   - Follow the pattern of existing windows (AboutWindow, WikiWindow, etc.)
   - Accept standard window props and pass them to BaseWindow
   - Add your content as children of BaseWindow

2. **Create an Icon**: Create a new icon component in `/src/components/icons/`
   - Use SVG with 48x48 viewBox
   - Use the app color palette (#00ffff for primary, #ff4800 for accents)
   - Export as a React component

3. **Add to VectorDesktop**:
   - Import both the window and icon components
   - Add to the `desktopIcons` array with appropriate grid position
   - Add a window type case in the render logic
   - Handle any special window behavior if needed

4. **Optional**: Add animations or special effects to the icon on hover/click