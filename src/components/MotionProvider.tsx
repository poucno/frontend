import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { MotionContext } from '../hooks/useMotion'

const STORAGE_KEY = 'otok-znanja.motion-paused.v2'

function readPaused(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export default function MotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(readPaused)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    function handleChange(event: MediaQueryListEvent) {
      setReducedMotion(event.matches)
    }
    preference.addEventListener('change', handleChange)
    return () => preference.removeEventListener('change', handleChange)
  }, [])

  const value = useMemo(() => ({
    paused,
    reducedMotion,
    motionEnabled: !paused,
    togglePaused: () => {
      const next = !paused
      setPaused(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        // The preference simply is not remembered.
      }
    },
  }), [paused, reducedMotion])

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}
