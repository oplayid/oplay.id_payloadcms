# To use this Dockerfile, you have to set `output: 'standalone'` in your next.config.ts file.
# From https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
#
# Image ini dipakai Coolify. Build dilakukan oleh GitHub Actions
# (lihat .github/workflows/docker.yml), bukan di server produksi.

FROM node:22.23.4-alpine AS base
ENV PNPM_VERSION=11.22.0
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# next/image SEO/canonical dan callback SSO memakai NEXT_PUBLIC_SERVER_URL yang
# di-inline saat build. CI mengirim nilai produksi lewat build-arg; default
# localhost hanya untuk build lokal. Runtime tetap bisa ditimpa lewat
# SERVER_URL di .env Coolify (lihat lib/urls.ts).
ARG NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}

# Dibutuhkan next.config.ts untuk images.remotePatterns. Isi dengan origin R2
# publik yang sama seperti di .env produksi.
ARG R2_PUBLIC_URL=https://storage.assets.oplay.id
ENV R2_PUBLIC_URL=${R2_PUBLIC_URL}

RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Folder upload Media. Di Coolify, mount volume persisten ke /app/media.
RUN mkdir -p /app/media && chown nextjs:nodejs /app/media

# Set the correct permission for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Health check dipakai Coolify/Traefik untuk mengetahui container siap menerima
# trafik. Node 22 memiliki fetch global, jadi tidak butuh curl/wget di image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
