interface Item {
  glyph: string
  title: string
  body: string
}

const ITEMS: Item[] = [
  {
    glyph: '◐',
    title: 'Tiny & dependency-free',
    body: 'Pure DOM API. ~4.8 kB gzipped. No React or Vue lock-in.',
  },
  {
    glyph: '↔',
    title: 'Album navigation',
    body: 'Group images with one attribute. Prev / next, keyboard, swipe, thumbs.',
  },
  {
    glyph: '◧',
    title: 'Themable',
    body: 'Five CSS variables; rebind in your stylesheet — dark mode included.',
  },
  {
    glyph: '◇',
    title: 'TypeScript-first',
    body: 'Strict types out of the box. ESM-only, source-mapped, tree-shakable.',
  },
]

export function Features() {
  return (
    <section id="features">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">04 · Why lumeo</span>
          <h2 style={{ marginTop: 16 }}>A viewer that gets out of the way.</h2>
        </div>

        <div className="features">
          {ITEMS.map((it) => (
            <article key={it.title} className="feature">
              <span className="feature-icon" aria-hidden>
                {it.glyph}
              </span>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
