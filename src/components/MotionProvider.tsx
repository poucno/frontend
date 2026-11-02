import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { MotionContext } from '../hooks/useMotion'

export default function MotionProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    function handleChange(event: MediaQueryListEvent) {
      setReducedMotion(event.matches)
    }
    preference.addEventListener('change', handleChange)
    return () => preference.removeEventListener('change', handleChange)
  }, [])

  const value = useMemo(() => ({ motionEnabled: !reducedMotion }), [reducedMotion])

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}
