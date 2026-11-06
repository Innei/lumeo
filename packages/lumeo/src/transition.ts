export const OPEN_DURATION_MS = 380
export const EXIT_DURATION_MS = 280

// A transition can be cancelled, disabled by user CSS, or have no change in
// value. In all of those cases the browser may never emit transitionend.
export const onTransformEnd = (
  element: HTMLElement,
  fallbackDuration: number,
  callback: () => void,
): void => {
  const style = getComputedStyle(element)
  const milliseconds = (value: string): number =>
    Number.parseFloat(value) * (value.trim().endsWith('ms') ? 1 : 1000)
  const durations = style.transitionDuration.split(',').map(milliseconds)
  const delays = style.transitionDelay.split(',').map(milliseconds)
  const duration = Math.max(
    0,
    ...style.transitionProperty.split(',').map((property, i) => {
      if (property.trim() !== 'transform' && property.trim() !== 'all') return 0
      return durations[i % durations.length]! + (delays[i % delays.length] || 0)
    }),
  )
  let finished = false
  const finish = (): void => {
    if (finished) return
    finished = true
    clearTimeout(timer)
    element.removeEventListener('transitionend', onEnd)
    callback()
  }
  const onEnd = (event: TransitionEvent): void => {
    if (event.target === element && event.propertyName === 'transform') finish()
  }
  const timer = setTimeout(
    finish,
    (Number.isFinite(duration) && style.transitionDuration
      ? duration
      : fallbackDuration) + 80,
  )
  element.addEventListener('transitionend', onEnd)
}
