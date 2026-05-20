import { useEffect, useRef, useState } from 'react'
import mediumZoom, { type Zoom } from 'lumeo'

import { Code } from '../components/Code'
import { THEMING_IMAGE } from '../data/images'

interface Preset {
  id: string
  label: string
  accent: string
  overlay: string
  ink: string
  inkSubtle: string
}

const PRESETS: Preset[] = [
  {
    id: 'sea',
    label: 'Sea',
    accent: '#1f8694',
    overlay: '#faf9f6',
    ink: 'rgba(17, 19, 21, 0.92)',
    inkSubtle: 'rgba(17, 19, 21, 0.55)',
  },
  {
    id: 'plum',
    label: 'Plum',
    accent: '#a3457a',
    overlay: '#f6efe9',
    ink: 'rgba(34, 18, 28, 0.92)',
    inkSubtle: 'rgba(34, 18, 28, 0.55)',
  },
  {
    id: 'olive',
    label: 'Olive',
    accent: '#6b7a3a',
    overlay: '#f4efe1',
    ink: 'rgba(22, 24, 14, 0.92)',
    inkSubtle: 'rgba(22, 24, 14, 0.55)',
  },
  {
    id: 'ink',
    label: 'Ink',
    accent: '#aaa',
    overlay: '#0c0d10',
    ink: 'rgba(240, 238, 231, 0.92)',
    inkSubtle: 'rgba(240, 238, 231, 0.55)',
  },
]

function applyPreset(p: Preset) {
  const root = document.documentElement
  root.style.setProperty('--lumeo-accent', p.accent)
  root.style.setProperty('--lumeo-overlay-bg', p.overlay)
  root.style.setProperty('--lumeo-ink', p.ink)
  root.style.setProperty('--lumeo-ink-subtle', p.inkSubtle)
}

export function Theming() {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const zoomRef = useRef<Zoom | null>(null)
  const [active, setActive] = useState<string>('sea')

  useEffect(() => {
    if (!imgRef.current) return
    const zoom = mediumZoom(imgRef.current, { margin: 32 })
    zoomRef.current = zoom
    return () => {
      zoom.detach()
    }
  }, [])

  const onPick = (p: Preset) => {
    applyPreset(p)
    setActive(p.id)
  }

  return (
    <section id="theming">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">03 · Themable</span>
          <h2 style={{ marginTop: 16 }}>
            Rebind a few CSS variables. The viewer follows.
          </h2>
          <p className="lead" style={{ marginTop: 16 }}>
            All visual tokens live on <code>:root</code>. Pick a palette below
            and reopen the image — overlay, accent, and ink all rebind live.
          </p>
        </div>

        <div className="theming">
          <div>
            <figure className="theming-preview">
              <img
                ref={imgRef}
                src={THEMING_IMAGE.src}
                data-zoom-src={THEMING_IMAGE.full}
                alt={THEMING_IMAGE.alt}
              />
            </figure>
            <div className="swatches" role="radiogroup" aria-label="Theme accent">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  className="swatch"
                  data-active={active === p.id}
                  role="radio"
                  aria-checked={active === p.id}
                  aria-label={p.label}
                  style={{
                    background: `linear-gradient(135deg, ${p.accent} 0%, ${p.overlay} 100%)`,
                  }}
                  onClick={() => onPick(p)}
                />
              ))}
            </div>
          </div>

          <Code lang="css">{`:root {
  --lumeo-overlay-bg: #faf9f6;
  --lumeo-accent: #1f8694;
  --lumeo-ink: rgba(17, 19, 21, 0.92);
  --lumeo-ink-subtle: rgba(17, 19, 21, 0.55);
  --lumeo-shadow: 0 18px 60px rgba(15, 17, 21, 0.22);
}

.dark {
  --lumeo-overlay-bg: #0b0c10;
  --lumeo-ink: rgba(240, 238, 231, 0.92);
}`}</Code>
        </div>
      </div>
    </section>
  )
}
