import { style } from '@vanilla-extract/css'

const INK = 'var(--lumeo-ink, rgba(0, 0, 0, 0.85))'
const INK_SUBTLE = 'var(--lumeo-ink-subtle, rgba(0, 0, 0, 0.55))'
const ACCENT = 'var(--lumeo-accent, #33A6B8)'
const PAPER = 'var(--lumeo-overlay-bg, #ffffff)'

export const controls = style({
  position: 'fixed',
  inset: 0,
  zIndex: 101,
  pointerEvents: 'none',
})

export const closeButton = style({
  position: 'fixed',
  top: '14px',
  right: '18px',
  zIndex: 102,
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  margin: 0,
  border: 'none',
  background: 'transparent',
  color: INK_SUBTLE,
  cursor: 'pointer',
  pointerEvents: 'auto',
  font: '200 22px/1 var(--lumeo-font-sans, ui-sans-serif, system-ui, sans-serif)',
  transition: `color 200ms ease, transform 200ms ease`,
  selectors: {
    '&:hover': { color: INK, transform: 'scale(1.05)' },
    '&:focus-visible': { outline: 'none', color: INK },
  },
})

const chevBase = style({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '36px',
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  margin: 0,
  border: 'none',
  background: 'transparent',
  color: INK_SUBTLE,
  cursor: 'pointer',
  pointerEvents: 'auto',
  font: '300 32px/1 var(--lumeo-font-serif, "EB Garamond", Georgia, serif)',
  transition: 'color 200ms ease',
  selectors: {
    '&:hover': { color: INK },
    '&:focus-visible': { outline: 'none', color: INK },
  },
})

export const prevButton = style([
  chevBase,
  {
    left: '6px',
  },
])

export const nextButton = style([
  chevBase,
  {
    right: '6px',
  },
])

export const counter = style({
  position: 'absolute',
  top: '18px',
  left: '50%',
  transform: 'translateX(-50%)',
  color: INK_SUBTLE,
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: 1,
  letterSpacing: '0.08em',
  fontVariantNumeric: 'tabular-nums',
  pointerEvents: 'none',
})

export const strip = style({
  position: 'absolute',
  bottom: '16px',
  left: '50%',
  transform: 'translateX(-50%)',
  maxWidth: '80vw',
  display: 'flex',
  gap: '4px',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  pointerEvents: 'auto',
  selectors: {
    '&::-webkit-scrollbar': { display: 'none' },
  },
})

export const thumb = style({
  flex: '0 0 auto',
  width: '28px',
  height: '28px',
  borderRadius: '2px',
  objectFit: 'cover',
  cursor: 'pointer',
  opacity: 0.45,
  transition: 'opacity 200ms ease, box-shadow 200ms ease',
  selectors: {
    '&:hover': { opacity: 0.85 },
  },
})

export const thumbActive = style({
  opacity: 1,
  boxShadow: `0 0 0 1.5px ${ACCENT}, 0 0 0 2.5px ${PAPER}`,
})

export const hidden = style({
  opacity: 0,
  pointerEvents: 'none',
})
