import type { ZoomActive, ZoomContainer, ZoomOptions } from './types'
import { isSvg } from './utils'

interface Box {
  bottom: number
  height: number
  left: number
  right: number
  top: number
  width: number
}

export const animate = (zoomOptions: ZoomOptions, active: ZoomActive): void => {
  if (!active.zoomed) {
    return
  }

  const margin = zoomOptions.margin ?? 0
  let container: Box = {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  }
  let viewportWidth: number | undefined
  let viewportHeight: number | undefined

  if (zoomOptions.container) {
    if (zoomOptions.container instanceof Object) {
      container = { ...container, ...(zoomOptions.container as ZoomContainer) }
      viewportWidth =
        container.width - container.left - container.right - margin * 2
      viewportHeight =
        container.height - container.top - container.bottom - margin * 2
    } else {
      const zoomContainer = document.querySelector(zoomOptions.container)
      if (zoomContainer) {
        const { width, height, left, top } =
          zoomContainer.getBoundingClientRect()
        container = { ...container, width, height, left, top }
      }
    }
  }

  viewportWidth = viewportWidth || container.width - margin * 2
  viewportHeight = viewportHeight || container.height - margin * 2

  const zoomTarget = active.zoomedHd || active.original
  if (!zoomTarget) {
    return
  }

  const naturalWidth = isSvg(zoomTarget)
    ? viewportWidth
    : zoomTarget.naturalWidth || viewportWidth
  const naturalHeight = isSvg(zoomTarget)
    ? viewportHeight
    : zoomTarget.naturalHeight || viewportHeight
  const { top, left, width, height } = zoomTarget.getBoundingClientRect()

  const scaleX = Math.min(Math.max(width, naturalWidth), viewportWidth) / width
  const scaleY =
    Math.min(Math.max(height, naturalHeight), viewportHeight) / height
  const scale = Math.min(scaleX, scaleY)
  const translateX =
    (-left + (viewportWidth - width) / 2 + margin + container.left) / scale
  const translateY =
    (-top + (viewportHeight - height) / 2 + margin + container.top) / scale
  const transform = `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`

  active.zoomed.style.transform = transform

  if (active.zoomedHd) {
    active.zoomedHd.style.transform = transform
  }

  if (active.shadow) {
    active.shadow.style.transform = transform
  }
}
