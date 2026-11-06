import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import mediumZoom from './core'
import type { Zoom } from './types'

let zoom: Zoom

const image = (): HTMLImageElement => {
  const img = document.createElement('img')
  img.src = 'photo.png'
  img.getBoundingClientRect = () =>
    ({ top: 20, left: 20, width: 240, height: 160 }) as DOMRect
  document.body.appendChild(img)
  return img
}

const transition = (element: Element, propertyName = 'transform'): void => {
  const event = new Event('transitionend', { bubbles: true })
  Object.defineProperty(event, 'propertyName', { value: propertyName })
  element.dispatchEvent(event)
}

const clone = (): HTMLImageElement =>
  document.querySelector('.medium-zoom-image--opened')!

beforeEach(() => {
  vi.useFakeTimers()
  zoom = mediumZoom()
})

afterEach(async () => {
  zoom.detach()
  await vi.advanceTimersByTimeAsync(2000)
  document.body.replaceChildren()
  document.body.className = ''
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('zoom lifecycle', () => {
  it('keeps transition styles after a lazy renderer replaces the original class', async () => {
    const first = image()
    const lazy = image()
    zoom.attach(first, lazy)
    void zoom.open({ target: first })
    transition(clone())
    void zoom.close()
    transition(clone())

    lazy.className = 'loaded'
    void zoom.open({ target: lazy })
    expect(clone().classList.contains('medium-zoom-image')).toBe(true)
    transition(clone())
    void zoom.close()
    transition(clone())
    expect(zoom.getZoomedImage()).toBeNull()
  })

  it('ignores drag starts during opening and honors an early overlay click', async () => {
    zoom.attach(image())
    void zoom.open()
    const overlay = document.querySelector('.medium-zoom-overlay')!
    overlay.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }))
    expect(clone().style.transition).not.toBe('none')
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(2000)
    expect(zoom.getZoomedImage()).toBeNull()
    expect(document.querySelector('.medium-zoom-overlay')).toBeNull()
  })

  it('settles opening and closing without transitionend, including repeated cycles', async () => {
    const img = image()
    zoom.attach(img)
    const opened = vi.fn()
    const closed = vi.fn()
    zoom.on('opened', opened).on('closed', closed)
    for (let i = 0; i < 3; i++) {
      const opening = zoom.open()
      clone().style.transition = 'none'
      await vi.advanceTimersByTimeAsync(1000)
      await expect(opening).resolves.toBe(zoom)
      const closing = zoom.close()
      await vi.advanceTimersByTimeAsync(1000)
      await expect(closing).resolves.toBe(zoom)
      expect(zoom.getZoomedImage()).toBeNull()
      expect(img.classList.contains('medium-zoom-image--hidden')).toBe(false)
    }
    expect(opened).toHaveBeenCalledTimes(3)
    expect(closed).toHaveBeenCalledTimes(3)
  })

  it('settles exactly once, and only for the image transform', async () => {
    zoom.attach(image())
    const opened = vi.fn()
    const closed = vi.fn()
    zoom.on('opened', opened).on('closed', closed)
    void zoom.open()
    transition(clone(), 'opacity')
    expect(opened).not.toHaveBeenCalled()
    transition(clone())
    transition(clone())
    await vi.advanceTimersByTimeAsync(1000)
    expect(opened).toHaveBeenCalledTimes(1)
    void zoom.close()
    transition(clone())
    await vi.advanceTimersByTimeAsync(1000)
    expect(closed).toHaveBeenCalledTimes(1)
  })

  it('cleans up safely when an overlay or image was already removed', async () => {
    zoom.attach(image())
    void zoom.open()
    transition(clone())
    const zoomed = clone()
    zoomed.remove()
    document.querySelector('.medium-zoom-overlay')!.remove()
    void zoom.close()
    transition(zoomed)
    await vi.advanceTimersByTimeAsync(1000)
    expect(zoom.getZoomedImage()).toBeNull()
  })

  it.each(['srcset', 'data-zoom-src'])(
    'upgrades a loaded %s image from its original geometry',
    async (attribute) => {
      const img = image()
      img.setAttribute(
        attribute,
        attribute === 'srcset' ? 'hd.png 2x' : 'hd.png',
      )
      const clones = vi.spyOn(HTMLImageElement.prototype, 'cloneNode')
      zoom.attach(img)
      void zoom.open()
      const hd = clones.mock.results[1]!.value as HTMLImageElement
      expect(hd.style.transform).toBe('')
      hd.dispatchEvent(new Event('load'))
      expect(hd.isConnected).toBe(true)
      expect(hd.style.transform).not.toBe('')
      await vi.advanceTimersByTimeAsync(1000)
      void zoom.close()
      await vi.advanceTimersByTimeAsync(1000)
      expect(hd.isConnected).toBe(false)
    },
  )

  it.each(['srcset', 'data-zoom-src'])(
    'falls back when %s fails to load',
    async (attribute) => {
      const img = image()
      img.setAttribute(
        attribute,
        attribute === 'srcset' ? 'hd.png 2x' : 'hd.png',
      )
      const clones = vi.spyOn(HTMLImageElement.prototype, 'cloneNode')
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      zoom.attach(img)
      const opening = zoom.open()
      const hd = clones.mock.results[1]!.value as HTMLImageElement
      hd.dispatchEvent(new Event('error'))
      await vi.advanceTimersByTimeAsync(1000)
      await expect(opening).resolves.toBe(zoom)
      expect(hd.isConnected).toBe(false)
      expect(clone().style.transform).not.toContain('NaN')
      const closing = zoom.close()
      await vi.advanceTimersByTimeAsync(1000)
      await expect(closing).resolves.toBe(zoom)
      expect(zoom.getZoomedImage()).toBeNull()
    },
  )

  it.each(['srcset', 'data-zoom-src'])(
    'discards a pending %s image and ignores its load after reopening',
    async (attribute) => {
      const img = image()
      img.setAttribute(
        attribute,
        attribute === 'srcset' ? 'hd.png 2x' : 'hd.png',
      )
      const clones = vi.spyOn(HTMLImageElement.prototype, 'cloneNode')
      zoom.attach(img)
      void zoom.open()
      const staleHd = clones.mock.results[1]!.value as HTMLImageElement
      transition(clone())
      void zoom.close()
      transition(clone())
      expect(zoom.getZoomedImage()).toBeNull()
      void zoom.open()
      staleHd.dispatchEvent(new Event('load'))
      staleHd.dispatchEvent(new Event('error'))
      expect(staleHd.isConnected).toBe(false)
      expect(
        document.querySelectorAll('.medium-zoom-image--opened'),
      ).toHaveLength(1)
      await vi.advanceTimersByTimeAsync(1000)
      void zoom.close()
      await vi.advanceTimersByTimeAsync(1000)
      expect(zoom.getZoomedImage()).toBeNull()
    },
  )
})
