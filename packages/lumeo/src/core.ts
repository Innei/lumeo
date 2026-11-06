import './core.css'

import { createAlbum } from './album'
import { closeButton } from './album.css'
import { animate } from './animate'
import { createGestures } from './gestures'
import {
  EXIT_DURATION_MS,
  onTransformEnd,
  OPEN_DURATION_MS,
} from './transition'
import type {
  Zoom,
  ZoomActive,
  ZoomOpenOptions,
  ZoomOptions,
  ZoomSelector,
} from './types'
import {
  cloneTarget,
  createCustomEvent,
  createOverlay,
  createShadow,
  getImagesFromSelector,
  getScrollTop,
  isNode,
  isOptionsObject,
} from './utils'

interface ZoomEventListener {
  listener: EventListenerOrEventListenerObject
  options: boolean | AddEventListenerOptions
  type: string
}

const DEFAULT_OPTIONS: ZoomOptions = {
  margin: 0,
  scrollOffset: 40,
  container: null,
  template: null,
}

const SPRING_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'
const CLOSE_GLYPH = '×'

const createCloseButton = (
  onClose: () => void,
): { element: HTMLButtonElement; destroy: () => void } => {
  const element = document.createElement('button')
  element.type = 'button'
  element.className = closeButton
  element.setAttribute('aria-label', 'Close')
  element.textContent = CLOSE_GLYPH

  const handleClick = (event: MouseEvent): void => {
    event.stopPropagation()
    onClose()
  }
  element.addEventListener('click', handleClick)

  return {
    element,
    destroy() {
      element.removeEventListener('click', handleClick)
      element.remove()
    },
  }
}

const mediumZoom = (
  selector?: ZoomSelector | ZoomOptions,
  options: ZoomOptions = {},
): Zoom => {
  let images: HTMLImageElement[] = []
  let eventListeners: ZoomEventListener[] = []
  let isAnimating = false
  let opening: Promise<Zoom> | null = null
  let closing: Promise<Zoom> | null = null
  let cancelHdLoad: (() => void) | null = null
  let scrollTop = 0
  let zoomOptions: ZoomOptions = options
  let closeBtn: { element: HTMLButtonElement; destroy: () => void } | null =
    null

  const active: ZoomActive = {
    original: null,
    zoomed: null,
    zoomedHd: null,
    template: null,
    shadow: null,
  }

  const _handleClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement

    if (target === overlay) {
      close()
      return
    }

    if (!images.includes(target as HTMLImageElement)) {
      return
    }

    toggle({ target })
  }

  const _handleScroll = (): void => {
    if (isAnimating || !active.original) {
      return
    }

    const currentScroll = getScrollTop()

    if (Math.abs(scrollTop - currentScroll) > (zoomOptions.scrollOffset ?? 0)) {
      setTimeout(close, 150)
    }
  }

  const _handleKeyUp = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' || event.key === 'Esc') {
      close()
    } else if (event.key === 'ArrowLeft') {
      album.goto(-1)
    } else if (event.key === 'ArrowRight') {
      album.goto(1)
    }
  }

  const update = (updateOptions: ZoomOptions = {}): Zoom => {
    const newOptions: ZoomOptions = { ...updateOptions }

    if (updateOptions.background) {
      overlay.style.background = updateOptions.background
    }

    if (updateOptions.container && updateOptions.container instanceof Object) {
      newOptions.container = {
        ...(zoomOptions.container as object),
        ...(updateOptions.container as object),
      }
    }

    if (updateOptions.template) {
      const template = isNode(updateOptions.template)
        ? (updateOptions.template as HTMLTemplateElement)
        : document.querySelector<HTMLTemplateElement>(updateOptions.template)
      newOptions.template = template ?? undefined
    }

    zoomOptions = { ...zoomOptions, ...newOptions }

    images.forEach((image) => {
      image.dispatchEvent(
        createCustomEvent('medium-zoom:update', { detail: { zoom } }),
      )
    })

    return zoom
  }

  const clone = (cloneOptions: ZoomOptions = {}): Zoom =>
    mediumZoom({ ...zoomOptions, ...cloneOptions })

  const createListenerSync = () => {
    let unregister: (() => void) | undefined

    return (enabled: boolean, register: () => () => void): void => {
      if (enabled) {
        if (!unregister) {
          unregister = register()
        }
        return
      }

      if (unregister) {
        unregister()
        unregister = undefined
      }
    }
  }

  const _syncClickListener = createListenerSync()
  const _updateClickListener = (): void =>
    _syncClickListener(images.length > 0, () => {
      document.addEventListener('click', _handleClick)
      return () => {
        document.removeEventListener('click', _handleClick)
      }
    })

  const attach = (...selectors: ZoomSelector[]): Zoom => {
    const newImages = selectors.reduce<HTMLImageElement[]>(
      (acc, selector) => [...acc, ...getImagesFromSelector(selector)],
      [],
    )

    newImages
      .filter((newImage) => !images.includes(newImage))
      .forEach((newImage) => {
        images.push(newImage)
        newImage.classList.add('medium-zoom-image')
      })

    eventListeners.forEach(({ type, listener, options: listenerOptions }) => {
      newImages.forEach((image) => {
        image.addEventListener(type, listener, listenerOptions)
      })
    })

    _updateClickListener()
    return zoom
  }

  const detach = (...selectors: ZoomSelector[]): Zoom => {
    if (active.zoomed) {
      close()
    }

    const imagesToDetach =
      selectors.length > 0
        ? selectors.reduce<HTMLImageElement[]>(
            (acc, selector) => [...acc, ...getImagesFromSelector(selector)],
            [],
          )
        : images

    imagesToDetach.forEach((image) => {
      image.classList.remove('medium-zoom-image')
      image.dispatchEvent(
        createCustomEvent('medium-zoom:detach', { detail: { zoom } }),
      )
    })

    images = images.filter((image) => !imagesToDetach.includes(image))
    _updateClickListener()
    return zoom
  }

  const on = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    listenerOptions: boolean | AddEventListenerOptions = {},
  ): Zoom => {
    images.forEach((image) => {
      image.addEventListener(`medium-zoom:${type}`, listener, listenerOptions)
    })
    eventListeners.push({
      type: `medium-zoom:${type}`,
      listener,
      options: listenerOptions,
    })
    return zoom
  }

  const off = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    listenerOptions: boolean | AddEventListenerOptions = {},
  ): Zoom => {
    images.forEach((image) => {
      image.removeEventListener(
        `medium-zoom:${type}`,
        listener,
        listenerOptions,
      )
    })
    eventListeners = eventListeners.filter(
      (eventListener) =>
        !(
          eventListener.type === `medium-zoom:${type}` &&
          eventListener.listener.toString() === listener.toString()
        ),
    )
    return zoom
  }

  const _syncGlobalEvents = createListenerSync()
  const _updateGlobalEvents = (enabled: boolean): void =>
    _syncGlobalEvents(enabled, () => {
      document.addEventListener('keyup', _handleKeyUp)
      document.addEventListener('scroll', _handleScroll)
      window.addEventListener('resize', close)
      return () => {
        document.removeEventListener('keyup', _handleKeyUp)
        document.removeEventListener('scroll', _handleScroll)
        window.removeEventListener('resize', close)
      }
    })

  const open = ({ target }: ZoomOpenOptions = {}): Promise<Zoom> => {
    if (target && !images.includes(target as HTMLImageElement)) {
      return Promise.resolve(zoom)
    }
    if (active.zoomed) {
      return opening ?? Promise.resolve(zoom)
    }

    if (target) {
      active.original = target as HTMLImageElement
    } else if (images.length > 0) {
      active.original = images[0]!
    } else {
      return Promise.resolve(zoom)
    }

    let resolveOpen!: (zoom: Zoom) => void
    const result = new Promise<Zoom>((resolve) => {
      resolveOpen = resolve
    })
    opening = result

    const _handleOpenEnd = (): void => {
      isAnimating = false
      opening = null
      active.original?.dispatchEvent(
        createCustomEvent('medium-zoom:opened', { detail: { zoom } }),
      )
      resolveOpen(zoom)
    }

    _updateGlobalEvents(true)
    active.original.dispatchEvent(
      createCustomEvent('medium-zoom:open', { detail: { zoom } }),
    )

    scrollTop = getScrollTop()
    isAnimating = true
    active.zoomed = cloneTarget(active.original)
    const zoomed = active.zoomed
    active.shadow = createShadow(active.original)

    document.body.appendChild(overlay)
    document.body.appendChild(active.shadow)

    if (zoomOptions.template) {
      const template = isNode(zoomOptions.template)
        ? (zoomOptions.template as HTMLTemplateElement)
        : document.querySelector<HTMLTemplateElement>(zoomOptions.template)
      if (template) {
        active.template = document.createElement('div')
        active.template.appendChild(template.content.cloneNode(true))
        document.body.appendChild(active.template)
      }
    }

    // If the <img> is inside a <picture>, use the currently-applied source
    // as the cloned `src` (these may differ, or `src` may be unset).
    if (
      active.original.parentElement?.tagName === 'PICTURE' &&
      active.original.currentSrc
    ) {
      active.zoomed.src = active.original.currentSrc
    }

    document.body.appendChild(active.zoomed)

    window.requestAnimationFrame(() => {
      if (active.zoomed === zoomed && !closing) {
        document.body.classList.add('medium-zoom--opened')
      }
    })

    active.original.classList.add('medium-zoom-image--hidden')
    active.zoomed.classList.add('medium-zoom-image--opened')
    active.zoomed.addEventListener('click', close)
    onTransformEnd(zoomed, OPEN_DURATION_MS, _handleOpenEnd)

    // Opening must not wait for a network response. Upgrade to HD only while
    // this exact clone is still active; closing cancels pending callbacks.
    animate(zoomOptions, active)

    const zoomSrc = active.original.getAttribute('data-zoom-src')

    if (zoomSrc || active.original.hasAttribute('srcset')) {
      const hd = zoomed.cloneNode() as HTMLImageElement
      active.zoomedHd = hd
      // animate() measures this clone before applying the zoom transform.
      hd.style.transform = ''
      hd.removeAttribute('sizes')
      hd.removeAttribute('loading')
      let pending = true
      const cleanup = (): void => {
        pending = false
        hd.removeEventListener('load', onLoad)
        hd.removeEventListener('error', onError)
        cancelHdLoad = null
      }
      const isCurrent = (): boolean =>
        pending &&
        active.zoomed === zoomed &&
        active.zoomedHd === hd &&
        !closing
      const onLoad = (): void => {
        if (!isCurrent()) return
        cleanup()
        hd.addEventListener('click', close)
        document.body.appendChild(hd)
        animate(zoomOptions, active)
      }
      const onError = (): void => {
        if (!isCurrent()) return
        cleanup()
        active.zoomedHd = null
        animate(zoomOptions, active)
      }
      cancelHdLoad = (): void => {
        cleanup()
        if (active.zoomedHd === hd) active.zoomedHd = null
      }
      hd.addEventListener('load', onLoad)
      hd.addEventListener('error', onError)
      if (zoomSrc) {
        hd.removeAttribute('srcset')
        hd.src = zoomSrc
      }
      if (hd.complete) {
        if (hd.naturalWidth > 0) onLoad()
        else onError()
      }
    }

    gestures.attach(overlay)
    album.setup()

    closeBtn = createCloseButton(close)
    document.body.appendChild(closeBtn.element)
    return result
  }

  const close = (): Promise<Zoom> => {
    if (opening) return opening.then(() => close())
    if (closing) return closing
    if (!active.original) return Promise.resolve(zoom)
    closing = new Promise((resolve) => {
      const _handleCloseEnd = (): void => {
        const original = active.original
        original?.classList.remove('medium-zoom-image--hidden')
        active.zoomed?.remove()
        active.zoomedHd?.remove()
        active.shadow?.remove()
        overlay.remove()
        active.template?.remove()
        isAnimating = false
        closing = null

        active.original = null
        active.zoomed = null
        active.zoomedHd = null
        active.template = null
        active.shadow = null

        _updateGlobalEvents(false)
        original?.dispatchEvent(
          createCustomEvent('medium-zoom:closed', { detail: { zoom } }),
        )
        resolve(zoom)
      }

      isAnimating = true
      cancelHdLoad?.()

      // Set the shadow's close-time transition BEFORE removing the body
      // class — the body class drives shadow opacity via the CSS cascade,
      // so the inline timing must be in effect when the class drops or
      // the opacity fade runs at the entrance timing.
      const exitTransitionShadow = `transform ${EXIT_DURATION_MS}ms ${SPRING_EASING}, opacity ${EXIT_DURATION_MS}ms ${SPRING_EASING}`
      if (active.shadow) {
        active.shadow.style.transition = exitTransitionShadow
      }

      document.body.classList.remove('medium-zoom--opened')
      album.teardown()
      gestures.detach()
      closeBtn?.destroy()
      closeBtn = null

      // Drop swap-time inline transition (set by album.swap) and use the
      // shorter exit timing so close is snappier than open.
      const exitTransition = `transform ${EXIT_DURATION_MS}ms ${SPRING_EASING}`
      if (active.zoomed) {
        active.zoomed.style.transition = exitTransition
        active.zoomed.style.transform = ''
        active.zoomed.style.translate = ''
        active.zoomed.style.opacity = ''
      }
      if (active.zoomedHd) {
        active.zoomedHd.style.transition = exitTransition
        active.zoomedHd.style.transform = ''
      }
      if (active.shadow) {
        active.shadow.style.transform = ''
      }

      // Fade the template out so the close is not too abrupt.
      if (active.template) {
        active.template.style.transition = 'opacity 150ms'
        active.template.style.opacity = '0'
      }

      active.original!.dispatchEvent(
        createCustomEvent('medium-zoom:close', { detail: { zoom } }),
      )

      onTransformEnd(active.zoomed!, EXIT_DURATION_MS, _handleCloseEnd)
    })
    return closing
  }

  const album = createAlbum({
    active,
    getImages: () => images,
    getOptions: () => zoomOptions,
    isAnimating: () => isAnimating,
    cloneTarget,
    createShadow,
    animate,
    close,
  })

  const gestures = createGestures({
    active,
    close,
    isAnimating: () => isAnimating,
  })

  const toggle = ({ target }: ZoomOpenOptions = {}): Promise<Zoom> => {
    if (active.original) {
      return close()
    }
    return open({ target })
  }

  const getOptions = (): ZoomOptions => zoomOptions
  const getImages = (): HTMLImageElement[] => images
  const getZoomedImage = (): HTMLImageElement | null => active.original

  const zoom: Zoom = {
    open,
    close,
    toggle,
    update,
    clone,
    attach,
    detach,
    on,
    off,
    getOptions,
    getImages,
    getZoomedImage,
  }

  // When the selector is omitted, the first argument carries the options.
  if (isOptionsObject(selector)) {
    zoomOptions = selector
  } else if (selector !== undefined && selector !== null) {
    attach(selector)
  }

  zoomOptions = { ...DEFAULT_OPTIONS, ...zoomOptions }

  const overlay = createOverlay(zoomOptions.background ?? '')

  return zoom
}

export default mediumZoom
export { mediumZoom }
