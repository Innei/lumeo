import type { ZoomOptions, ZoomSelector } from './types'

export const isSupported = (node: Node): node is HTMLImageElement =>
  node.nodeName === 'IMG'

export const isNodeList = (selector: unknown): selector is NodeList =>
  typeof NodeList !== 'undefined' && selector instanceof NodeList

export const isNode = (selector: unknown): selector is HTMLElement =>
  !!selector && (selector as Node).nodeType === 1

export const isOptionsObject = (value: unknown): value is ZoomOptions =>
  Object.prototype.toString.call(value) === '[object Object]'

export const isSvg = (image: HTMLImageElement): boolean => {
  const source = image.currentSrc || image.src
  return source.slice(-4).toLowerCase() === '.svg'
}

export const getScrollTop = (): number =>
  window.scrollY ||
  document.documentElement.scrollTop ||
  document.body.scrollTop ||
  0

export const getImagesFromSelector = (
  selector: ZoomSelector,
): HTMLImageElement[] => {
  try {
    if (Array.isArray(selector)) {
      return selector.filter(isSupported)
    }

    if (isNodeList(selector)) {
      return Array.from(selector).filter(isSupported)
    }

    if (isNode(selector)) {
      return [selector].filter(isSupported)
    }

    if (typeof selector === 'string') {
      return Array.from(document.querySelectorAll(selector)).filter(isSupported)
    }

    return []
  } catch {
    throw new TypeError(
      'The provided selector is invalid.\n' +
        'Expects a CSS selector, a Node element, a NodeList or an array.',
    )
  }
}

export const createOverlay = (background: string): HTMLDivElement => {
  const overlay = document.createElement('div')
  overlay.classList.add('medium-zoom-overlay')
  // Only set inline background when explicitly provided so the
  // package's --lumeo-overlay-bg CSS variable can drive themes.
  if (background) {
    overlay.style.background = background
  }

  return overlay
}

export const cloneTarget = (template: HTMLImageElement): HTMLImageElement => {
  const { top, left, width, height } = template.getBoundingClientRect()
  const clone = template.cloneNode() as HTMLImageElement
  const scrollTop =
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  const scrollLeft =
    window.scrollX ||
    document.documentElement.scrollLeft ||
    document.body.scrollLeft ||
    0

  clone.removeAttribute('id')
  clone.style.position = 'absolute'
  clone.style.top = `${top + scrollTop}px`
  clone.style.left = `${left + scrollLeft}px`
  clone.style.width = `${width}px`
  clone.style.height = `${height}px`
  clone.style.transform = ''

  return clone
}

export const createCustomEvent = (
  type: string,
  params?: CustomEventInit,
): CustomEvent => new CustomEvent(type, params)
