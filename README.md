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

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | ya | MongoDB connection string |
| `PAYLOAD_SECRET` | ya | Secret untuk JWT/session |
| `NEXT_PUBLIC_SERVER_URL` | ya | `https://oplay.id` di produksi |
| `PLATFORM_DOMAIN` | ya | `oplay.id` (tanpa protokol) |
| `SUPERADMIN_EMAILS` | tidak | Daftar email superadmin, dipisah koma |
| `PLATFORM_AUTO_SEED` | tidak | `false` untuk mematikan pembuatan tenant platform |
| `MEDIA_DIR` | tidak | Lokasi upload media, default `media` |
| `OIDC_*` | tidak | Login SSO PocketID |

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
3. Set environment variable sesuai tabel di atas.
4. Mount volume persisten ke `/app/media` agar upload tidak hilang saat redeploy.
5. Tambahkan domain `oplay.id` dan custom domain tenant di reverse proxy
   Coolify (TLS ditangani otomatis). Custom domain tetap harus dicatat di
   koleksi Tenants agar dikenali aplikasi.
6. Setelah deploy pertama, jalankan migrasi dari mesin yang memiliki repo
   (image runtime hanya berisi standalone build, tanpa CLI Payload):

   ```bash
   DATABASE_URL='mongodb://...' \
   PAYLOAD_SECRET='...' \
   NEXT_PUBLIC_SERVER_URL='https://oplay.id' \
   PLATFORM_DOMAIN='oplay.id' \
   pnpm migrate:site
   ```

Build produksi memakai `output: 'standalone'`, sehingga image hanya berisi
`server.js`, `.next/static`, `public/`, dan `media/`.
