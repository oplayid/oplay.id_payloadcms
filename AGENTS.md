# Agents

This project uses the Payload CMS skill at `.agents/skills/payload/`.
Start with `.agents/skills/payload/SKILL.md` for a quick reference, then see `.agents/skills/payload/reference/` for detailed docs.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Overview

### Folder Structure
- `src/app/`: Next.js App Router (Frontend `(frontend)`, Payload Dashboard `(payload)`).
- `src/collections/`: Payload CMS collection definitions.
- `src/components/`: React components, including `CanvasRenderer` and block-specific UI.
- `src/lib/`: Core application logic (tenant resolution, URL helpers, page orchestration).
- `src/access/`: Authentication and RBAC logic.

### Collections
- `Pages`: Defines page content, blocks, and SEO metadata.
- `Tenants`: Configures multi-tenant settings, domains, and themes.
- `Users`: Application user management.
- `Media`: Asset and image management.
- `Themes`: Visual theme presets.

### Logic Flow
1. **Request**: User visits a URL.
2. **Resolution (`src/lib/site.ts`, `src/lib/urls.ts`)**: System resolves the `tenant` and `locale` context from the host/path.
3. **Fetching (`src/lib/pageBuilder.ts`)**: System fetches the corresponding `Page` document from the database using the tenant context.
4. **Rendering (`src/components/CanvasRenderer.tsx`)**: Data (canvasBlocks) is passed to `CanvasRenderer`, which iterates and renders the appropriate components from the registry.
