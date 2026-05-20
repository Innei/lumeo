import type { ZoomActive } from './types'

interface GesturesDeps {
  active: ZoomActive
  close: () => void
}

export interface Gestures {
  attach(host: HTMLElement): void
  detach(): void
}

const CLOSE_DISTANCE = 100
const FADE_DISTANCE = 300

export const createGestures = (deps: GesturesDeps): Gestures => {
  let host: HTMLElement | null = null
  let dragging = false
  let startY = 0
  let startX = 0
  let savedTransition = ''
  let visualTarget: HTMLImageElement | null = null

  const restoreVisual = (): void => {
    if (!visualTarget) {
      return
    }
    visualTarget.style.transition = savedTransition
    visualTarget.style.translate = ''
    visualTarget.style.opacity = ''
    visualTarget = null
  }

  const onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) {
      return
    }
    const target = deps.active.zoomed
    if (!target) {
      return
    }
    dragging = true
    visualTarget = target
    startY = event.clientY
    startX = event.clientX
    savedTransition = target.style.transition
    target.style.transition = 'none'
    try {
      host?.setPointerCapture(event.pointerId)
    } catch {
      // The pointer may not be capturable (e.g. mid-flight cancellation).
    }
  }

  const onPointerMove = (event: PointerEvent): void => {
    if (!dragging || !visualTarget) {
      return
    }
    const dy = event.clientY - startY
    const dx = event.clientX - startX
    if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) {
      return
    }
    visualTarget.style.translate = `0 ${dy}px`
    visualTarget.style.opacity = `${Math.max(0, 1 - dy / FADE_DISTANCE)}`
  }

  const onPointerUp = (event: PointerEvent): void => {
    if (!dragging) {
      return
    }
    dragging = false
    const dy = event.clientY - startY
    if (dy > CLOSE_DISTANCE && visualTarget) {
      // Restore the original transition so the close animation runs smoothly.
      visualTarget.style.transition = savedTransition
      visualTarget = null
      deps.close()
    } else {
      restoreVisual()
    }
  }

  const onPointerCancel = (): void => {
    if (!dragging) {
      return
    }
    dragging = false
    restoreVisual()
  }

  return {
    attach(next) {
      host = next
      next.addEventListener('pointerdown', onPointerDown)
      next.addEventListener('pointermove', onPointerMove)
      next.addEventListener('pointerup', onPointerUp)
      next.addEventListener('pointercancel', onPointerCancel)
    },
    detach() {
      if (!host) {
        return
      }
      host.removeEventListener('pointerdown', onPointerDown)
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerup', onPointerUp)
      host.removeEventListener('pointercancel', onPointerCancel)
      host = null
      dragging = false
      visualTarget = null
    },
  }
}
