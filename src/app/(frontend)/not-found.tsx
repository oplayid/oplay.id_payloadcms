import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">404</p>
      <h1 className="font-heading text-3xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="max-w-md text-sm text-neutral-500">
        Alamat ini tidak terdaftar pada tenant mana pun, atau halaman belum dipublikasikan.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium hover:bg-neutral-100"
      >
        Kembali ke beranda
      </Link>
    </main>
  )
}
