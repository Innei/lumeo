export interface DemoImage {
  id: string
  /** thumbnail / inline render */
  src: string
  /** full-resolution variant served on zoom */
  full?: string
  alt: string
}

const u = (id: number, w: number) =>
  `https://picsum.photos/id/${id}/${w}/${Math.round(w * 1.25)}`

export const HERO_IMAGE: DemoImage = {
  id: 'hero',
  src: u(1015, 1100),
  full: u(1015, 2200),
  alt: 'A landscape catching the last hour of sun.',
}

export const GALLERY: DemoImage[] = [
  { id: 'g1', src: u(1018, 720), full: u(1018, 1800), alt: 'Mountain range' },
  { id: 'g2', src: u(1043, 720), full: u(1043, 1800), alt: 'Sunlit ridge' },
  { id: 'g3', src: u(1024, 720), full: u(1024, 1800), alt: 'Forest path' },
  { id: 'g4', src: u(1019, 720), full: u(1019, 1800), alt: 'Lavender field' },
  { id: 'g5', src: u(1039, 720), full: u(1039, 1800), alt: 'Distant peaks' },
  { id: 'g6', src: u(1062, 720), full: u(1062, 1800), alt: 'Quiet harbor' },
  { id: 'g7', src: u(1057, 720), full: u(1057, 1800), alt: 'Coastal cliff' },
  { id: 'g8', src: u(1044, 720), full: u(1044, 1800), alt: 'Old stone bridge' },
]

export const THEMING_IMAGE: DemoImage = {
  id: 'theming',
  src: u(110, 1000),
  full: u(110, 1800),
  alt: 'A still composition for theming.',
}
