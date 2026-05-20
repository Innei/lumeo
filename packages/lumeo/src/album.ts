import {
  controls as controlsClass,
  counter,
  hidden,
  nextButton,
  prevButton,
  strip,
  thumb,
  thumbActive,
} from './album.css'
import type { ZoomActive, ZoomOptions } from './types'

const SPRING = 'cubic-bezier(0.32, 0.72, 0, 1)'
const SWAP_DURATION_MS = 280
const SWAP_OFFSET_PX = 28

const CHEVRON_LEFT = '‹'
const CHEVRON_RIGHT = '›'

interface AlbumControls {
  destroy(): void
  element: HTMLElement
  update(index: number, total: number): void
}

const createAlbumControls = (
  albumImages: HTMLImageElement[],
  onPrev: () => void,
  onNext: () => void,
  onJump: (index: number) => void,
): AlbumControls => {
  const element = document.createElement('div')
  element.className = controlsClass

  const prev = document.createElement('button')
  prev.type = 'button'
  prev.className = prevButton
  prev.setAttribute('aria-label', 'Previous image')
  prev.textContent = CHEVRON_LEFT

  const next = document.createElement('button')
  next.type = 'button'
  next.className = nextButton
  next.setAttribute('aria-label', 'Next image')
  next.textContent = CHEVRON_RIGHT

  const counterEl = document.createElement('div')
  counterEl.className = counter

  const stripEl = document.createElement('div')
  stripEl.className = strip

  const thumbEls: HTMLImageElement[] = []
  albumImages.forEach((image, i) => {
    const thumbEl = document.createElement('img')
    thumbEl.src = image.currentSrc || image.src
    thumbEl.className = thumb
    thumbEl.alt = ''
    thumbEl.addEventListener('click', (event) => {
      event.stopPropagation()
      onJump(i)
    })
    stripEl.appendChild(thumbEl)
    thumbEls.push(thumbEl)
  })

  const handlePrev = (event: MouseEvent): void => {
    event.stopPropagation()
    onPrev()
  }
  const handleNext = (event: MouseEvent): void => {
    event.stopPropagation()
    onNext()
  }

  prev.addEventListener('click', handlePrev)
  next.addEventListener('click', handleNext)

  element.append(prev, next, counterEl, stripEl)

  return {
    element,
    update(index, total) {
      counterEl.textContent = `${index + 1} / ${total}`
      prev.classList.toggle(hidden, index <= 0)
      next.classList.toggle(hidden, index >= total - 1)
      thumbEls.forEach((thumbEl, i) => {
        thumbEl.classList.toggle(thumbActive, i === index)
      })
      const active = thumbEls[index]
      if (active) {
        active.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    },
    destroy() {
      prev.removeEventListener('click', handlePrev)
      next.removeEventListener('click', handleNext)
      element.remove()
    },
  }
}

interface AlbumDeps {
  active: ZoomActive
  animate: (options: ZoomOptions, active: ZoomActive) => void
  cloneTarget: (image: HTMLImageElement) => HTMLImageElement
  close: () => void
  getImages: () => HTMLImageElement[]
  getOptions: () => ZoomOptions
  isAnimating: () => boolean
}

export interface Album {
  goto(delta: number): void
  setup(): void
  teardown(): void
}

const waitTransitionEnd = (
  element: HTMLElement,
  property: string,
  timeoutMs: number,
): Promise<void> =>
  new Promise((resolve) => {
    let done = false
    const finish = (): void => {
      if (done) return
      done = true
      element.removeEventListener('transitionend', onEnd)
      resolve()
    }
    const onEnd = (event: TransitionEvent): void => {
      if (event.target !== element || event.propertyName !== property) return
      finish()
    }
    element.addEventListener('transitionend', onEnd)
    setTimeout(finish, timeoutMs)
  })

export const createAlbum = (deps: AlbumDeps): Album => {
  let images: HTMLImageElement[] = []
  let index = -1
  let controls: AlbumControls | null = null
  let isSwapping = false

  const swap = (nextIndex: number): void => {
    const { active } = deps
    if (!active.original || isSwapping) {
      return
    }
    const nextImage = images[nextIndex]
    if (!nextImage) {
      return
    }

    const direction = nextIndex > index ? 1 : -1
    const outgoing = active.zoomed
    const outgoingHd = active.zoomedHd
    isSwapping = true

    const fadeOutgoing = (): Promise<void> => {
      if (!outgoing) return Promise.resolve()
      const baseTransform = outgoing.style.transform
      outgoing.style.transition = `transform ${SWAP_DURATION_MS}ms ${SPRING}, opacity ${SWAP_DURATION_MS}ms ${SPRING}`
      outgoing.style.transform = `${baseTransform} translateX(${-direction * SWAP_OFFSET_PX}px)`
      outgoing.style.opacity = '0'
      if (outgoingHd) {
        outgoingHd.style.transition = outgoing.style.transition
        outgoingHd.style.transform = `${outgoingHd.style.transform} translateX(${-direction * SWAP_OFFSET_PX}px)`
        outgoingHd.style.opacity = '0'
      }
      return waitTransitionEnd(outgoing, 'opacity', SWAP_DURATION_MS + 80)
    }

    void fadeOutgoing().then(() => {
      if (!active.original) {
        isSwapping = false
        return
      }

      active.original.classList.remove('medium-zoom-image--hidden')
      outgoing?.remove()
      outgoingHd?.remove()
      active.zoomedHd = null

      // Clone before marking the new original as hidden — cloneNode() copies
      // the classList, so the clone would inherit `medium-zoom-image--hidden`
      // (visibility: hidden) and be invisible after swap.
      const nextClone = deps.cloneTarget(nextImage)
      // Snap the clone into the zoomed position (no transition), then animate
      // from a translateX(±28px) + opacity:0 entrance state to the resting
      // position; the entrance offset rides on top of the zoom transform.
      nextClone.style.transition = 'none'

      index = nextIndex
      active.original = nextImage
      nextImage.classList.add('medium-zoom-image--hidden')

      active.zoomed = nextClone
      active.zoomed.classList.add('medium-zoom-image--opened')
      active.zoomed.addEventListener('click', deps.close)
      document.body.appendChild(active.zoomed)

      deps.animate(deps.getOptions(), active)

      const baseTransform = active.zoomed.style.transform
      active.zoomed.style.transform = `${baseTransform} translateX(${direction * SWAP_OFFSET_PX}px)`
      active.zoomed.style.opacity = '0'

      requestAnimationFrame(() => {
        if (!active.zoomed) {
          isSwapping = false
          return
        }
        active.zoomed.style.transition = `transform ${SWAP_DURATION_MS}ms ${SPRING}, opacity ${SWAP_DURATION_MS}ms ${SPRING}`
        active.zoomed.style.transform = baseTransform
        active.zoomed.style.opacity = '1'

        const settled = active.zoomed
        waitTransitionEnd(settled, 'opacity', SWAP_DURATION_MS + 80).then(
          () => {
            // Restore the package default transition so click-to-close uses the
            // entrance/exit easing rather than this swap-specific override.
            settled.style.transition = ''
            settled.style.opacity = ''
            isSwapping = false
          },
        )
      })

      controls?.update(index, images.length)
    })
  }

  const goto = (delta: number): void => {
    if (deps.isAnimating() || isSwapping || images.length < 2) {
      return
    }
    const target = index + delta
    if (target < 0 || target >= images.length) {
      return
    }
    swap(target)
  }

  return {
    goto,
    setup() {
      const original = deps.active.original
      const group = original?.dataset.zoomGroup
      if (!group || !original) {
        return
      }

      images = deps
        .getImages()
        .filter((image) => image.dataset.zoomGroup === group)
      index = images.indexOf(original)

      if (images.length > 1) {
        controls = createAlbumControls(
          images,
          () => goto(-1),
          () => goto(1),
          (target) => {
            if (deps.isAnimating() || isSwapping || target === index) {
              return
            }
            swap(target)
          },
        )
        document.body.appendChild(controls.element)
        controls.update(index, images.length)
      }
    },
    teardown() {
      controls?.destroy()
      controls = null
      images = []
      index = -1
      isSwapping = false
    },
  }
}
