import { useEffect, useRef } from 'react'
import mediumZoom, { type Zoom } from 'lumeo'

import { GALLERY } from '../data/images'

const GROUP = 'lumeo-demo-gallery'

export function Album() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const zoomRef = useRef<Zoom | null>(null)

  useEffect(() => {
    if (!rootRef.current) return
    const imgs = rootRef.current.querySelectorAll<HTMLImageElement>('img')
    imgs.forEach((img) => {
      img.dataset.zoomGroup = GROUP
    })
    const zoom = mediumZoom(imgs, { margin: 28 })
    zoomRef.current = zoom
    return () => {
      zoom.detach()
    }
  }, [])

  return (
    <section id="album">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">02 · Album mode</span>
          <h2 style={{ marginTop: 16 }}>Click any image. Then ← → swipe.</h2>
          <p className="lead" style={{ marginTop: 16 }}>
            Group images with{' '}
            <code>data-zoom-group</code> and lumeo wires up navigation, keyboard
            shortcuts, touch gestures, and a thumbnail strip — automatically.
          </p>
        </div>

        <div className="gallery-grid" ref={rootRef}>
          {GALLERY.map((img) => (
            <figure key={img.id} className="gallery-cell">
              <img
                src={img.src}
                data-zoom-src={img.full}
                alt={img.alt}
                loading="lazy"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
