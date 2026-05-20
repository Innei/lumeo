import { useEffect, useRef } from 'react'
import mediumZoom, { type Zoom } from 'lumeo'

import { HERO_IMAGE } from '../data/images'

export function Hero() {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const zoomRef = useRef<Zoom | null>(null)

  useEffect(() => {
    if (!imgRef.current) return
    const zoom = mediumZoom(imgRef.current, { margin: 32 })
    zoomRef.current = zoom
    return () => {
      zoom.detach()
    }
  }, [])

  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">v0.1.0 · MIT</span>
          <h1>
            Image zoom, <em>reimagined</em> for the modern web.
          </h1>
          <p className="lead" style={{ marginTop: 24 }}>
            A tiny TypeScript library that turns any <code>&lt;img&gt;</code>{' '}
            into a calm, full-bleed viewer — with album navigation, keyboard
            control, swipe gestures, and a thumbnail strip.
          </p>
          <div className="hero-actions">
            <a className="btn" href="#quickstart">
              Get started
              <span aria-hidden>→</span>
            </a>
            <a
              className="btn btn-ghost"
              href="https://github.com/Innei/lumeo"
              target="_blank"
              rel="noreferrer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.7.41.36.77 1.07.77 2.16 0 1.56-.02 2.82-.02 3.2 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
              </svg>
              GitHub
            </a>
            <span className="copy-tag" title="Copied install command">
              <span className="dim">$</span>
              <span>pnpm add lumeo</span>
            </span>
          </div>
        </div>

        <div className="hero-art">
          <img
            ref={imgRef}
            src={HERO_IMAGE.src}
            data-zoom-src={HERO_IMAGE.full}
            alt={HERO_IMAGE.alt}
            loading="eager"
          />
        </div>
      </div>
    </section>
  )
}
