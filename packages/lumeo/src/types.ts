export type ZoomSelector = string | HTMLElement | HTMLElement[] | NodeList

export interface ZoomContainer {
  bottom?: number
  height?: number
  left?: number
  right?: number
  top?: number
  width?: number
}

export interface ZoomOptions {
  /**
   * Background of the overlay (any CSS color). When omitted, the overlay
   * inherits from the `--lumeo-overlay-bg` CSS variable, which the
   * package declares with a `#ffffff` fallback and the consumer can rebind
   * to a theme token. When set, the value is written as inline style and
   * overrides the variable.
   */
  background?: string
  /** Viewport to render the zoom in. @default null */
  container?: string | HTMLElement | ZoomContainer | null
  /** Space outside the zoomed image. @default 0 */
  margin?: number
  /** Pixels scrolled before the zoom closes. @default 40 */
  scrollOffset?: number
  /** Template element displayed on zoom. @default null */
  template?: string | HTMLTemplateElement | null
}

export interface ZoomOpenOptions {
  /** Target of the zoom; defaults to the first attached image. */
  target?: HTMLElement
}

export interface ZoomActive {
  original: HTMLImageElement | null
  template: HTMLElement | null
  zoomed: HTMLImageElement | null
  zoomedHd: HTMLImageElement | null
  shadow: HTMLDivElement | null
}

export interface Zoom {
  attach(...selectors: ZoomSelector[]): Zoom
  clone(options?: ZoomOptions): Zoom
  close(): Promise<Zoom>
  detach(...selectors: ZoomSelector[]): Zoom
  getImages(): HTMLImageElement[]
  getOptions(): ZoomOptions
  getZoomedImage(): HTMLImageElement | null
  off(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): Zoom
  on(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): Zoom
  open(options?: ZoomOpenOptions): Promise<Zoom>
  toggle(options?: ZoomOpenOptions): Promise<Zoom>
  update(options: ZoomOptions): Zoom
}
