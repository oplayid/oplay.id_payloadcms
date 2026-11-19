import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { RoutableContentData } from '@/lib/routableContent'
import { getRoutableListingPath } from '@/lib/routableCollections'
import { buildThemeVariables } from '@/lib/themeStyle'
import { mediaAlt, mediaSrcSet, mediaUrl, type MediaLike } from '@/lib/mediaUrl'
import { getServerURL, siteHref } from '@/lib/urls'

function safeJsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

export default function MemberDetail({ data }: { data: RoutableContentData }) {
  const doc = data.doc
  const locale = data.locale
  const name = String(doc.name || data.title || '')
  const position = asString(doc.position)
  const status = asString(doc.status)
  const excerpt = asString(doc.excerpt)
  const email = asString(doc.email)
  const phone = asString(doc.phone)
  const website = asString(doc.website)
  const address = asString(doc.address)

  const categories = Array.isArray(doc.categories)
    ? doc.categories.filter((item: unknown): item is string => typeof item === 'string')
    : []

  const skills = Array.isArray(doc.skills)
    ? doc.skills.filter((item: unknown): item is string => typeof item === 'string')
    : []

  const socialLinks = Array.isArray(doc.socialLinks) ? doc.socialLinks : []
  const experience = Array.isArray(doc.experience) ? doc.experience : []
  const education = Array.isArray(doc.education) ? doc.education : []
  const certifications = Array.isArray(doc.certifications) ? doc.certifications : []

  const cover = doc.cover as MediaLike
  const photoUrl = mediaUrl(cover, 'card')
  const listingHref = siteHref(
    getRoutableListingPath(data.collection),
    data.basePath,
    locale,
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle: position || undefined,
    description: excerpt || data.meta.description || undefined,
    image: photoUrl ? [new URL(photoUrl, getServerURL()).toString()] : undefined,
    email: email || undefined,
    telephone: phone || undefined,
    url: data.canonicalURL,
  }

  return (
    <main
      style={buildThemeVariables(data.theme)}
      className="w-full min-h-screen bg-(--theme-bg) text-(--theme-text) pt-16 md:pt-28 pb-20 transition-colors duration-300"
    >
      <article className="mx-auto w-full max-w-4xl px-4 md:px-6">
        <a
          href={listingHref}
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-(--theme-muted) hover:text-(--theme-primary) transition-colors"
        >
          <span aria-hidden="true">←</span>
          Semua {data.config.label.toLowerCase()}
        </a>

        <header className="mt-6 flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          {photoUrl ? (
            <div className="w-36 h-44 md:w-48 md:h-60 shrink-0">
              <img
                src={photoUrl}
                srcSet={mediaSrcSet(cover, ['card', 'hero'])}
                alt={mediaAlt(cover, name)}
                className="w-full h-full object-cover border border-(--theme-border)"
                style={{ borderRadius: 'var(--theme-radius-box)' }}
              />
            </div>
          ) : null}

          <div className="flex-1 min-w-0">
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-3">
                {categories.map((category) => (
                  <span
                    key={category}
                    style={{ borderRadius: 'var(--theme-radius-btn)' }}
                    className="px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-(--theme-muted) bg-white/5 border border-(--theme-border)"
                  >
                    {category}
                  </span>
                ))}
              </div>
            ) : null}

            <h1 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight">
              {name}
            </h1>

            {(position || status) ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm md:text-base">
                {position ? (
                  <span className="text-(--theme-muted) font-medium">{position}</span>
                ) : null}
                {position && status ? (
                  <span className="text-(--theme-muted)" aria-hidden="true">
                    ·
                  </span>
                ) : null}
                {status ? (
                  <span
                    style={{ borderRadius: 'var(--theme-radius-btn)' }}
                    className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide border border-(--theme-border) bg-(--theme-surface) text-(--theme-text)"
                  >
                    {status}
                  </span>
                ) : null}
              </div>
            ) : null}

            {excerpt ? (
              <p className="font-sub text-sm md:text-base text-(--theme-muted) mt-4 font-light">
                {excerpt}
              </p>
            ) : null}

            {(email || phone || website || address || socialLinks.length > 0) ? (
              <div className="mt-5 space-y-1 text-sm text-(--theme-muted)">
                {email ? (
                  <div>
                    <span className="font-medium text-(--theme-text)">Email: </span>
                    <a href={`mailto:${email}`} className="hover:text-(--theme-primary)">
                      {email}
                    </a>
                  </div>
                ) : null}
                {phone ? (
                  <div>
                    <span className="font-medium text-(--theme-text)">Telepon: </span>
                    <a href={`tel:${phone}`} className="hover:text-(--theme-primary)">
                      {phone}
                    </a>
                  </div>
                ) : null}
                {website ? (
                  <div>
                    <span className="font-medium text-(--theme-text)">Tautan: </span>
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-(--theme-primary) break-all"
                    >
                      {website}
                    </a>
                  </div>
                ) : null}
                {address ? (
                  <div>
                    <span className="font-medium text-(--theme-text)">Alamat: </span>
                    <span>{address}</span>
                  </div>
                ) : null}
                {socialLinks.length > 0 ? (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    {socialLinks.map((item: any, idx: number) => {
                      const label = asString(item?.platform)
                      const url = asString(item?.url)
                      if (!label || !url) return null
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-(--theme-primary) hover:underline"
                        >
                          {label}
                        </a>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </header>

        {doc.bio ? (
          <section className="mt-10">
            <h2 className="font-heading text-lg md:text-xl font-semibold text-(--theme-text) mb-3">
              Profil
            </h2>
            <div className="article-body">
              <RichText data={doc.bio as never} />
            </div>
          </section>
        ) : null}

        {experience.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-heading text-lg md:text-xl font-semibold text-(--theme-text) mb-4">
              Pengalaman
            </h2>
            <div className="space-y-6">
              {experience.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="border-l-2 border-(--theme-border) pl-4 md:pl-5"
                >
                  <h3 className="font-heading text-base md:text-lg font-semibold text-(--theme-text)">
                    {asString(item?.role) || 'Peran'}
                  </h3>
                  <p className="text-sm text-(--theme-muted) mt-0.5">
                    {[asString(item?.organization), asString(item?.location)]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {asString(item?.period) ? (
                    <p className="text-xs text-(--theme-muted) mt-1">
                      {asString(item?.period)}
                    </p>
                  ) : null}
                  {asString(item?.description) ? (
                    <p className="text-sm text-(--theme-text)/90 mt-2 whitespace-pre-line">
                      {asString(item?.description)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {education.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-heading text-lg md:text-xl font-semibold text-(--theme-text) mb-4">
              Pendidikan
            </h2>
            <div className="space-y-5">
              {education.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="border-l-2 border-(--theme-border) pl-4 md:pl-5"
                >
                  <h3 className="font-heading text-base md:text-lg font-semibold text-(--theme-text)">
                    {asString(item?.institution) || 'Institusi'}
                  </h3>
                  <p className="text-sm text-(--theme-muted) mt-0.5">
                    {[asString(item?.degree), asString(item?.field)]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {asString(item?.period) ? (
                    <p className="text-xs text-(--theme-muted) mt-1">
                      {asString(item?.period)}
                    </p>
                  ) : null}
                  {asString(item?.description) ? (
                    <p className="text-sm text-(--theme-text)/90 mt-2 whitespace-pre-line">
                      {asString(item?.description)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {skills.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-heading text-lg md:text-xl font-semibold text-(--theme-text) mb-3">
              Keahlian
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  style={{ borderRadius: 'var(--theme-radius-btn)' }}
                  className="px-3 py-1 text-xs font-medium border border-(--theme-border) bg-(--theme-surface) text-(--theme-text)"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {certifications.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-heading text-lg md:text-xl font-semibold text-(--theme-text) mb-3">
              Sertifikasi & Penghargaan
            </h2>
            <ul className="space-y-3">
              {certifications.map((item: any, idx: number) => (
                <li key={idx} className="text-sm">
                  <p className="font-medium text-(--theme-text)">
                    {asString(item?.name) || 'Sertifikasi'}
                  </p>
                  <p className="text-(--theme-muted)">
                    {[asString(item?.issuer), asString(item?.year)]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
    </main>
  )
}
