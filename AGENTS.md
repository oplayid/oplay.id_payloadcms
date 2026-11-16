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
- `Templates`: Starter site content (pages, navbar, footer, theme) that superadmin can copy into a tenant.
- `Redirects`: Old path -> new path, created automatically on page rename. Resolved in `src/lib/redirects.ts`.
- `Posts`: Articles with rich-text body, served at `/artikel/<slug>` (aliases `blog`, `news` redirect to canonical). Registered in `src/lib/routableCollections.ts` so detail routing, sitemap, and rename redirects are automatic.

### Logic Flow
1. **Request**: User visits a URL.
2. **Resolution (`src/lib/site.ts`, `src/lib/urls.ts`)**: System resolves the `tenant` and `locale` context from the host/path.
3. **Fetching (`src/lib/pageBuilder.ts`)**: System fetches the corresponding `Page` document from the database using the tenant context.
4. **Rendering (`src/components/CanvasRenderer.tsx`)**: Data (canvasBlocks) is passed to `CanvasRenderer`, which iterates and renders the appropriate components from the registry.

### Routable Content (artikel dan koleksi lain)
Collections that need their own public URL are registered in `src/lib/routableCollections.ts`. The catch-all route serves `/<prefix>/<slug>` **only after** page lookup fails, so pages always win on path collisions. Adding a new collection (projects, events, ...) requires:
1. Create the collection (`src/collections/`), add slug/publishedAt hooks and redirect sync like `Posts`.
2. Register it in `ROUTABLE_COLLECTIONS` (`prefixes`, `slugField`, `titleField`, `cacheTag`, `defaultSort`).
3. Register the collection in `src/payload.config.ts` (collections + `seoPlugin` + `multiTenantPlugin`).
4. Add a detail renderer in `src/components/content/RoutableDetail.tsx` and a listing block (registry + `customFieldMap`).
5. Run `pnpm generate:types`.
