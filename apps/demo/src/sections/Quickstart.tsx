import { Code } from '../components/Code'

const INSTALL = `# Install
pnpm add lumeo
# or: npm i lumeo / yarn add lumeo`

const USAGE = `import mediumZoom from 'lumeo'
import 'lumeo/style.css'

// 1. Single image
mediumZoom('img[data-zoomable]')

// 2. Album group — share a data-zoom-group attribute
//    to wire up prev / next, keyboard, and the thumb strip.
mediumZoom('.gallery img', { margin: 32 })`

export function Quickstart() {
  return (
    <section id="quickstart">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">01 · Quickstart</span>
          <h2 style={{ marginTop: 16 }}>Two imports, one selector.</h2>
          <p className="lead" style={{ marginTop: 16 }}>
            lumeo ships as a tiny ESM module with zero dependencies. Drop in the
            CSS once, then attach images by selector, element, or NodeList.
          </p>
        </div>

        <div className="quickstart">
          <Code lang="sh">{INSTALL}</Code>
          <Code>{USAGE}</Code>
        </div>
      </div>
    </section>
  )
}
