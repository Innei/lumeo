import { globalStyle } from '@vanilla-extract/css'

const SPRING = 'cubic-bezier(0.32, 0.72, 0, 1)'

globalStyle(':root', {
  vars: {
    '--lumeo-overlay-bg': '#ffffff',
    '--lumeo-ink': 'rgba(0, 0, 0, 0.85)',
    '--lumeo-ink-subtle': 'rgba(0, 0, 0, 0.55)',
    '--lumeo-accent': '#33A6B8',
    '--lumeo-shadow': '0 14px 36px rgba(0, 0, 0, 0.18)',
    '--lumeo-font-serif':
      "'EB Garamond', 'GT Sectra', Georgia, 'Songti SC', serif",
  },
})

globalStyle('.medium-zoom-overlay', {
  position: 'fixed',
  inset: 0,
  zIndex: 9998,
  background: 'var(--lumeo-overlay-bg, #ffffff)',
  opacity: 0,
  transition: `opacity 380ms ${SPRING}`,
  willChange: 'opacity',
})

globalStyle('.medium-zoom--opened .medium-zoom-overlay', {
  cursor: 'zoom-out',
  opacity: 0.96,
})

globalStyle('.medium-zoom-image', {
  cursor: 'zoom-in',
  transition: `transform 380ms ${SPRING}`,
})

globalStyle('.medium-zoom-image--hidden', {
  visibility: 'hidden',
})

globalStyle('.medium-zoom-image--opened', {
  position: 'relative',
  zIndex: 9999,
  cursor: 'zoom-out',
  willChange: 'transform',
  borderRadius: '3px',
})

// Box-shadow lives on a sibling div so its appearance can fade via
// `opacity` (compositor) instead of animating `box-shadow` (paint-bound).
globalStyle('.medium-zoom-shadow', {
  position: 'absolute',
  zIndex: 9998,
  pointerEvents: 'none',
  borderRadius: '3px',
  boxShadow: 'var(--lumeo-shadow)',
  opacity: 0,
  willChange: 'transform, opacity',
  transition: `transform 380ms ${SPRING}, opacity 380ms ${SPRING}`,
})

globalStyle('.medium-zoom--opened .medium-zoom-shadow', {
  opacity: 1,
})
