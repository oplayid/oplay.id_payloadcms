# OPLAY.ID

Platform website builder multi-tenant di atas Payload CMS 3 + Next.js 16.
Satu tenant = satu situs. Situs individu memakai subpath, sedangkan klien
korporasi dapat memakai custom domain.

## Aturan URL

| Jenis | Contoh | Cara akses |
| --- | --- | --- |
| Platform | `oplay.id`, `oplay.id/profil` | Root domain |
| Individu | `oplay.id/faishal`, `oplay.id/faishal/profil` | Subpath `/<handle>` |
| Korporasi | `ylbhsikap.or.id`, `ylbhsikap.or.id/profil` | Custom domain |
| Subdomain platform | `apps.oplay.id` | Dikelola superadmin |

- Bahasa default `id` tidak memakai prefix (`/`, `/profil`).
- Bahasa `en` memakai prefix (`/en`, `/en/profil`).
- Prefix `www.` dan port diabaikan saat mencocokkan host.
- Host yang tidak dikenal akan menghasilkan 404, bukan fallback ke platform.

## Model data

- **Tenants** — `slug` (handle), `type` (`platform|individual|corporate`),
  `status`, `hosts[]` (host, kind, verified, isPrimary), branding, SEO.
  Field `domain` lama disimpan tersembunyi untuk migrasi.
- **Pages** — halaman per tenant dengan `slug`, `parent` (nested docs),
  `breadcrumbs`, blok kanvas, tema, dan SEO. Publik hanya bisa membaca
  halaman `published`.
- **Users** — `role` (`member|superadmin`) + daftar tenant yang di-assign.
  Hanya superadmin yang dapat mengubah slug/tipe/status/host tenant.
- **Media** — file upload, discope per tenant oleh plugin multi-tenant.
- **Themes** — preset tema (`default-theme`, `cyber-neon`, dll).

## Live preview & draft

1. Admin membuka live preview dari koleksi Pages.
2. URL preview: `/preview?path=...&tenant=...&locale=...`.
3. Route tersebut mewajibkan login dan keanggotaan tenant, lalu mengaktifkan
   `draftMode()` dan redirect ke halaman publik.
4. Halaman publik mengecek ulang user. Cookie draft tanpa login tetap
   menghasilkan 404, sehingga draft tidak pernah bocor ke publik.

## Environment

Salin `.env.example` menjadi `.env` lalu isi:

Daftar lengkap ada di `.env.example` / `.env.coolify.example`. Ringkasan:

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | ya | MongoDB connection string |
| `PAYLOAD_SECRET` | ya | Secret acak minimal 32 byte untuk JWT/session |
| `SERVER_URL` | ya (produksi) | Origin **root platform** runtime, mis. `https://oplay.id`; jangan isi subdomain tenant |
| `NEXT_PUBLIC_SERVER_URL` | ya | Harus sama dengan `SERVER_URL`; juga di-set sebagai build-arg |
| `PLATFORM_DOMAIN` | ya | `oplay.id` (tanpa protokol) |
| `PLATFORM_AUTO_SEED` | tidak | `false` untuk mematikan pembuatan tenant platform |
| `PLATFORM_TENANT_SLUG` / `PLATFORM_NAME` | tidak | Default `oplay` / `OPLAY.ID` |
| `R2_*` | tidak | Upload produksi; `R2_PUBLIC_URL` juga build-arg |
| `OIDC_*` | tidak | Login SSO PocketID; kosongkan untuk mematikan |
| `ALLOWED_REDIRECT_HOSTS` | tidak | Daftar host redirect eksternal; kosong = tolak semua |
| `ALLOWED_MAP_EMBED_HOSTS` | tidak | Host iframe peta tambahan |
| `TRUST_X_FORWARDED_FOR` | tidak | `true` hanya jika proxy menimpa header |
| `CONTENT_CACHE` | tidak | Set `off` hanya untuk debugging |
| `APP_VERSION` | tidak | Versi yang dilaporkan `/api/health`, default `1.0.0` |

Superadmin **tidak** lagi diatur lewat email. Beri akses dengan:

```bash
pnpm promote:superadmin --email=admin@example.com
```

## Pengembangan

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Migrasi data lama (idempotent):

```bash
pnpm migrate:site
```

## Deploy (Coolify + GitHub Actions)

1. Push ke `main` → `.github/workflows/docker.yml` membangun image dan
   mendorongnya ke GHCR (`ghcr.io/<owner>/<repo>:latest`).
2. Di Coolify buat resource Docker Image dari GHCR tersebut.
3. Set environment variable dari `.env.coolify.example` di Coolify. Set juga
   Repository Variable GitHub `NEXT_PUBLIC_SERVER_URL` dan `R2_PUBLIC_URL`
   agar image CI tidak mengandung `localhost`/host R2 yang salah.
4. Mount volume persisten ke `/app/media` agar upload tidak hilang saat redeploy.
5. Tambahkan domain `oplay.id` dan custom domain tenant di reverse proxy
   Coolify (TLS ditangani otomatis). Custom domain tetap harus dicatat di
   koleksi Tenants agar dikenali aplikasi.
6. Setelah deploy pertama, jalankan migrasi dari mesin yang memiliki repo
   (image runtime hanya berisi standalone build, tanpa CLI Payload):

   ```bash
   DATABASE_URL='mongodb://...' \
   PAYLOAD_SECRET='...' \
   SERVER_URL='https://oplay.id' \
   NEXT_PUBLIC_SERVER_URL='https://oplay.id' \
   PLATFORM_DOMAIN='oplay.id' \
   pnpm migrate:site
   ```

Build produksi memakai `output: 'standalone'`, sehingga image hanya berisi
`server.js`, `.next/static`, `public/`, dan `media/`.
