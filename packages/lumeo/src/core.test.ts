import { describe, expect, it } from 'vitest'

import mediumZoom from './core'
import type { Zoom } from './types'

const makeImg = (src = 'a.png'): HTMLImageElement => {
  const img = document.createElement('img')
  img.src = src
  document.body.appendChild(img)
  return img
}

const API: (keyof Zoom)[] = [
  'open',
  'close',
  'toggle',
  'update',
  'clone',
  'attach',
  'detach',
  'on',
  'off',
  'getOptions',
  'getImages',
  'getZoomedImage',
]

describe('mediumZoom', () => {
  it('creates a zoom exposing the full API', () => {
    const zoom = mediumZoom()
    for (const method of API) {
      expect(typeof zoom[method]).toBe('function')
    }
  })

  it('applies default options', () => {
    expect(mediumZoom().getOptions()).toMatchObject({
      margin: 0,
      scrollOffset: 40,
      container: null,
      template: null,
    })
  })

  it('leaves background unset so the CSS variable can theme the overlay', () => {
    expect(mediumZoom().getOptions().background).toBeUndefined()
  })

  it('treats a leading options object as options', () => {
    expect(mediumZoom({ margin: 24 }).getOptions().margin).toBe(24)
  })

  it('attach adds the image and the marker class', () => {
    const img = makeImg()
    const zoom = mediumZoom()
    zoom.attach(img)
    expect(zoom.getImages()).toContain(img)
    expect(img.classList.contains('medium-zoom-image')).toBe(true)
  })

  it('attach is idempotent', () => {
    const img = makeImg()
    const zoom = mediumZoom()
    zoom.attach(img)
    zoom.attach(img)
    expect(zoom.getImages().filter((image) => image === img)).toHaveLength(1)
  })

  it('attach accepts a CSS selector string', () => {
    const img = makeImg('sel.png')
    img.id = 'sel-target'
    const zoom = mediumZoom()
    zoom.attach('#sel-target')
    expect(zoom.getImages()).toContain(img)
  })

  it('detach removes the image and the marker class', () => {
    const img = makeImg()
    const zoom = mediumZoom()
    zoom.attach(img)
    zoom.detach(img)
    expect(zoom.getImages()).not.toContain(img)
    expect(img.classList.contains('medium-zoom-image')).toBe(false)
  })

  it('update merges options', () => {
    const zoom = mediumZoom()
    zoom.update({ margin: 12, background: '#000' })
    expect(zoom.getOptions()).toMatchObject({ margin: 12, background: '#000' })
  })

  it('clone carries options into a fresh instance', () => {
    const zoom = mediumZoom({ margin: 16 })
    const cloned = zoom.clone()
    expect(cloned).not.toBe(zoom)
    expect(cloned.getOptions().margin).toBe(16)
  })

  it('on/off register and unregister listeners', () => {
    const img = makeImg()
    const zoom = mediumZoom()
    zoom.attach(img)

    let count = 0
    const listener = (): void => {
      count += 1
    }

    zoom.on('open', listener)
    img.dispatchEvent(new CustomEvent('medium-zoom:open'))
    expect(count).toBe(1)

    zoom.off('open', listener)
    img.dispatchEvent(new CustomEvent('medium-zoom:open'))
    expect(count).toBe(1)
  })

  it('ignores non-image nodes', () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const zoom = mediumZoom()
    zoom.attach(div)
    expect(zoom.getImages()).toHaveLength(0)
  })
})
