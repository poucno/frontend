import { useEffect, useRef, useState } from 'react'

// Counts up to `target` once the page appears; returns `target` right away when motion is off.
export function useCountUp(target: number, enabled: boolean, duration = 800) {
  const shownRef = useRef(0)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const from = shownRef.current
    const start = performance.now()
    let frame = 0
    function tick(now: number) {
      const progress = Math.min(1, Math.max(0, (now - start) / duration))
      const value = Math.round(from + (target - from) * (1 - (1 - progress) ** 3))
      shownRef.current = value
      setShown(value)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, enabled, duration])

  return enabled ? shown : target
}
