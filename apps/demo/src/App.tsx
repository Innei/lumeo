import { ThemeToggle } from './components/ThemeToggle'
import { Album } from './sections/Album'
import { Features } from './sections/Features'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Quickstart } from './sections/Quickstart'
import { Theming } from './sections/Theming'

export function App() {
  return (
    <div className="page">
      <header className="nav">
        <div className="container nav-inner">
          <a href="#top" className="brand" aria-label="lumeo home">
            lumeo
          </a>
          <nav className="nav-links">
            <a className="nav-link hide-sm" href="#quickstart">
              Quickstart
            </a>
            <a className="nav-link hide-sm" href="#album">
              Album
            </a>
            <a className="nav-link hide-sm" href="#theming">
              Theming
            </a>
            <a
              className="nav-link"
              href="https://github.com/Innei/lumeo"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main>
        <Hero />
        <Quickstart />
        <Album />
        <Theming />
        <Features />
      </main>

      <Footer />
    </div>
  )
}
