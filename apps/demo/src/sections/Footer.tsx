export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          Crafted by{' '}
          <a href="https://innei.in" target="_blank" rel="noreferrer">
            Innei
          </a>
          . Based on{' '}
          <a
            href="https://github.com/francoischalifour/medium-zoom"
            target="_blank"
            rel="noreferrer"
          >
            medium-zoom
          </a>
          .
        </div>
        <div style={{ display: 'inline-flex', gap: 18 }}>
          <a
            href="https://github.com/Innei/lumeo"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/lumeo"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </a>
          <a
            href="https://github.com/Innei/lumeo/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            MIT
          </a>
        </div>
      </div>
    </footer>
  )
}
