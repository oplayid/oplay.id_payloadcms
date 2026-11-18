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
- `Events`: Invitation events (`admin.group: 'Undangan'`). Holds date/venue/rundown/gifts/gallery and points to a `Pages` document used as the invitation design.
- `Guests`: Invited guests, one personal URL each. Private data (no public read), created under an event.

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

### Undangan (personal guest invitations)

Guests get a personal URL: `/undangan/<linkSlug>` where `linkSlug` is `<nama-tamu>-<kode>` (e.g. `budi-santoso-ms8xqd`). Both `linkSlug` and `invitationCode` are generated once on create (`src/lib/invitationLink.ts`) and never change, even when the guest name is edited, so links already sent via WhatsApp keep working. `invitationCode` (6 chars, no ambiguous letters) is also accepted as a URL alias: `/undangan/ms8xqd` 308-redirects to the canonical `linkSlug`, and is intended for QR/check-in.

Resolution order in `src/app/(frontend)/[[...segments]]/page.tsx`: page → invitation → routable content → redirect → 404. An invitation is served only when `Events._status` is `published` and the guest is not `disabled`; otherwise 404. Invitations are always `noindex, nofollow` and never appear in `sitemap.xml`.

Design comes from a `Pages` document referenced by `Events.invitationPage`, rendered per guest with `CanvasRenderer` and an `invitation` context (`src/lib/invitationContext.ts`). Available blocks (`src/collections/blocks/`, registered in `componentRegistry.ts` + `customFieldMap`):
- `InvitationCover`: guest name/salutation/pax/personal note, event title, date, optional countdown, "Buka Undangan". Variants: photo, gradient, split.
- `EventHero`: opening hero for the detail page (`hero-arch`, full, split), the only block that renders its own "back to cover" button.
- `Countdown`: live countdown to the event date.
- `InvitationGallery`: grid/masonry/carousel gallery with accessible lightbox (keyboard + Escape).
- `EventDetails`: date/time/timezone, venue + Maps button, dress code, host contact, rundown.
- `RsvpForm`: attendance + seat count + message, deadline aware.
- `GiftInfo`: bank accounts from the event, copy button, gift address.

**Cover gate → detail**: the page is one URL with two stages (`InvitationExperience`, client). If the **first** block is `InvitationCover`, it becomes the full-screen gate and the remaining blocks are the detail page; opening it pushes `#acara`, Escape/browser back/native back button return to the cover, and the body scroll locks while the cover is shown. If the first block is anything else, every block is rendered as a normal page with no gate. Only the guest identity (name, salutation, pax, personal note, RSVP status) differs between guests — the design is shared.

All invitation blocks must stay theme-aware (use `--theme-*` tokens, never hardcoded colors) and read event/gallery data from the `invitation` context, not from props snapshots. `Events.gallery` feeds `InvitationGallery` (`{ image, caption }`).

If `invitationPage` is empty, `src/components/content/InvitationDetail.tsx` renders the fallback layout (cover + hero + details + RSVP + gifts built in code).

The event "Pelantikan Direktur" in the `umkm` tenant is intentionally kept as a live example: its `Pages` document contains the full block set above, so admins have a reference to copy. Keep it published (`queryInvitationPage` uses `findByID` without `draft`).

Guest data is fetched with `overrideAccess` in `src/lib/invitations.ts` so public invitation URLs work while the collection itself has no public read. Access to the collections is authenticated and tenant-scoped (`tenantContentScope`), because guest records contain PII.

APIs:
- `POST /api/invitations/rsvp`: validates key, event status, `allowRsvp`, deadline (`isRsvpOpen`, event timezone), and clamps seats to the guest `pax`. Rate limited.
- `POST /api/invitations/view`: increments `viewCount`/`lastViewedAt` once per browser session. Never returns guest data.

When touching relationship fields used by these collections, remember `filterOptions` runs even with `overrideAccess: true`. Returning `false` for anonymous requests makes Local API / public-endpoint updates fail validation ("invalid selections"), so the filters only constrain authenticated users and return `true` when `req.user` is absent.

Admin share panel: `src/components/admin/InvitationShareField.tsx` (UI field `invitationShare`) builds the absolute URL from the tenant host and offers copy + WhatsApp. Link/URL helpers live in `src/lib/invitationShare.ts` (also used by the import result CSV).

### Impor tamu (spreadsheet)

Guests are usually prepared in Excel/Google Sheets, so the admin has a dedicated wizard at `/admin/collections/guests/import` (`src/components/admin/GuestImportView.tsx`, linked from the list banner + "..." menu). Flow: choose event → upload CSV/TSV or paste a table → preview/duplicate check → import → summary + downloadable CSV with each guest's invitation link.

- `src/lib/guestImport.ts` is shared by browser and server: delimiter detection (`,` `;` tab), BOM/quoted fields/CRLF, ID+EN header aliases, WhatsApp normalization to `62…`, pax/email validation, dedupe keys, CSV template and export (formula-injection safe). Column set: nama, sapaan, kategori, whatsapp, email, kursi, pesan.
- `src/endpoints/guestsImport.ts` serves `POST /api/guests/import` (authenticated, tenant taken from the **event**, never from the file). Batches of 50 rows are written (`GUEST_IMPORT_IMPORT_BATCH`), 200 rows for dry-run (`GUEST_IMPORT_PREVIEW_BATCH`), max 5.000 rows / 2 MB per file, 30 write batches per user per minute.
- Dedupe: by normalized WhatsApp when the row has a number, otherwise by normalized name; duplicates inside the file are imported once (first row wins). Mode is chosen at import time: `skip` (default) or `update`. Update only touches name/salutation/category/phone/email/pax/personalNote — `linkSlug`, `invitationCode`, RSVP fields, `checkedInAt`, `sentAt`, `viewCount`, and `disabled` are preserved.
- `linkSlug`/`invitationCode` for a batch are pre-generated in `assignInvitationCodes` and accepted by the `Guests.beforeValidate` hook only when `context.fromGuestImport` is set; `afterChange` skips per-document cache invalidation during import (the endpoint invalidates `CACHE_TAGS.invitations` once per batch).
- After adding/changing admin components here, run `pnpm generate:importmap`.
